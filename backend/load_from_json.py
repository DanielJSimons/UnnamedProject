# file: load_from_json.py
"""
Batch-imports existing *.json into Postgres.

Usage:
    python load_from_json.py path/to/videos_*.json path/to/entity_sentiment_results/*.json
"""
import glob
import json
import pathlib
from typing import Iterable

import tiktoken  # or your embedding model library
from openai import OpenAI  # replace with your provider

from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from models import (
    Caption,
    EntitySentiment,
    Thumbnail,
    Video,
    VideoStatistic,
    DATABASE_URL,
)

# ───────────────────────────────────────────────────────────
#  Helpers
# ───────────────────────────────────────────────────────────
def embed(texts: Iterable[str]) -> list[list[float]]:
    """
    Vectorise a batch of texts. Replace with your own OSS embedding model if you prefer.
    """
    client = OpenAI()
    response = client.embeddings.create(
        input=texts,
        model="text-embedding-3-small",
    )
    return [d.embedding for d in response.data]


def load_video_json(fp: pathlib.Path) -> list[Video]:
    with fp.open("r", encoding="utf-8") as f:
        raw = json.load(f)

    videos: list[Video] = []
    for item in raw:
        snippet = item["metadata"]["snippet"]
        cd = item["metadata"]["contentDetails"]
        status = item["metadata"]["status"]
        player = item["metadata"]["player"]

        v = Video(
            id=item["video_id"],
            published_at=snippet.get("publishedAt"),
            title=snippet["title"],
            description=snippet["description"],
            channel_id=snippet["channelId"],
            channel_title=snippet["channelTitle"],
            category_id=int(snippet["categoryId"]) if snippet.get("categoryId") else None,
            default_language=snippet.get("defaultAudioLanguage"),
            duration=timedelta(
                seconds=iso8601_duration_as_seconds(cd["duration"])
            ),  # implement iso parser
            raw_snippet=snippet,
            raw_status=status,
            raw_content_details=cd,
            raw_player=player,
            stats=VideoStatistic(
                view_count=int(item["metadata"]["statistics"]["viewCount"]),
                like_count=int(item["metadata"]["statistics"].get("likeCount") or 0),
                favorite_count=int(
                    item["metadata"]["statistics"].get("favoriteCount") or 0
                ),
                comment_count=int(item["metadata"]["statistics"].get("commentCount") or 0),
            ),
            thumbnails=[
                Thumbnail(
                    quality=k,
                    url=v["url"],
                    width=v["width"],
                    height=v["height"],
                )
                for k, v in snippet["thumbnails"].items()
            ],
        )

        # Caption rows
        caption_chunks = item.get("captions", [])
        if caption_chunks:
            texts = [c["text"] for c in caption_chunks]
            vecs = embed(texts)
            for c, vec in zip(caption_chunks, vecs):
                v.captions.append(
                    Caption(
                        start=c["start"],
                        duration=c["duration"],
                        text=c["text"],
                        embedding=vec,
                    )
                )

        videos.append(v)

    return videos


def load_entity_json(fp: pathlib.Path) -> list[EntitySentiment]:
    with fp.open("r", encoding="utf-8") as f:
        rows = json.load(f)

    # embed sentences in batches of 96 for token limits
    sentences = [r["sentence"] for r in rows]
    sentence_vecs = embed(sentences)

    ents: list[EntitySentiment] = []
    for r, vec in zip(rows, sentence_vecs):
        ents.append(
            EntitySentiment(
                video_id=extract_video_id_from_filename(fp.name),  # implement
                caption_id=None,  # can link if you join on (video_id,start)
                entity=r["entity"],
                entity_type=r["type"],
                sentence=r["sentence"],
                sentiment=r["sentiment"],
                class_idx=r["class_idx"],
                signed_value=r["signed_value"],
                score=r["score"],
                exp_sent=r["exp_sent"],
                valence=r["valence"],
                arousal=r["arousal"],
                dominance=r["dominance"],
                cont_score=r["cont_score"],
                start=r["start"],
                duration=r["duration"],
                embedding=vec,
            )
        )
    return ents


def batch_save(objs: list, session: Session, chunk: int = 1_000):
    for i in range(0, len(objs), chunk):
        session.add_all(objs[i : i + chunk])
        session.flush()  # avoids huge pending list
        session.commit()


def main():
    engine = create_engine(DATABASE_URL, echo=False)
    with Session(engine, expire_on_commit=False) as session:
        # 1️⃣ videos + captions
        for fp in glob.glob("videos_with_full_captions_with_timing*.json"):
            print("Loading", fp)
            vids = load_video_json(pathlib.Path(fp))
            batch_save(vids, session)

        # 2️⃣ entity sentiment
        for fp in glob.glob("entity_sentiment_results/*_entities_sentiment.json"):
            print("Loading", fp)
            ents = load_entity_json(pathlib.Path(fp))
            batch_save(ents, session)

    print("Import completed ✅")


if __name__ == "__main__":
    main()
