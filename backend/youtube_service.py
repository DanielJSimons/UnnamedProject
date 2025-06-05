import re
import os
from typing import List, Dict, Tuple, Any
import requests
import yt_dlp
from datetime import datetime, timedelta
from isodate import parse_duration
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, TranscriptsDisabled
from sqlalchemy.orm import Session
from models import Video, VideoStatistic, Thumbnail, Caption

class YouTubeService:
    def __init__(self, api_key: str, session: Session):
        self.api_key = api_key
        self.session = session

    def get_latest_video_ids(self, channel_id: str, max_results: int = 5) -> List[str]:
        """Fetch latest video IDs from a channel."""
        url = (
            "https://www.googleapis.com/youtube/v3/search"
            f"?key={self.api_key}&channelId={channel_id}"
            "&part=snippet&order=date&type=video"
            f"&maxResults={max_results}"
        )
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return [
                item["id"]["videoId"]
                for item in response.json().get("items", [])
                if item.get("id", {}).get("videoId")
            ]
        except requests.exceptions.RequestException as e:
            print(f"Error fetching video IDs for channel {channel_id}: {e}")
            return []

    def fetch_video_metadata(self, video_ids: List[str]) -> List[Dict]:
        """Fetch metadata for a list of videos."""
        if not video_ids:
            return []
        
        all_metadata = []
        for i in range(0, len(video_ids), 50):
            batch = video_ids[i:i + 50]
            parts = "snippet,contentDetails,statistics,status,player"
            url = (
                "https://www.googleapis.com/youtube/v3/videos"
                f"?key={self.api_key}&part={parts}"
                f"&id={','.join(batch)}"
            )
            try:
                response = requests.get(url, timeout=15)
                response.raise_for_status()
                all_metadata.extend(response.json().get("items", []))
            except requests.exceptions.RequestException as e:
                print(f"Error fetching metadata for batch: {e}")
                continue
        return all_metadata

    def fetch_captions(self, video_id: str) -> Tuple[List[Dict], str]:
        """Fetch captions for a video using multiple methods."""
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            target_transcript = None
            try:
                target_transcript = transcript_list.find_manually_created_transcript(['en', 'en-GB', 'en-US'])
            except NoTranscriptFound:
                try:
                    target_transcript = transcript_list.find_generated_transcript(['en', 'en-GB', 'en-US'])
                except NoTranscriptFound:
                    pass

            if target_transcript:
                segments = target_transcript.fetch()
                if self._validate_caption_segments(segments):
                    return segments, "YouTubeTranscriptApi"
        except Exception as e:
            print(f"Error fetching captions via API for {video_id}: {e}")

        return self._fetch_captions_yt_dlp(video_id)

    def _fetch_captions_yt_dlp(self, video_id: str) -> Tuple[List[Dict], str]:
        """Fetch captions using yt-dlp as fallback."""
        base_filename = f"{video_id}_temp_sub"
        opts = {
            "skip_download": True,
            "writesubtitles": True,
            "writeautomaticsub": True,
            "subtitleslangs": ["en"],
            "subtitlesformat": "vtt",
            "outtmpl": f"{base_filename}.%(ext)s",
            "quiet": True,
            "no_warnings": True,
            "ignoreerrors": True
        }

        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
            
            for lang in ['en', 'en-US', 'en-GB']:
                vtt_file = f"{base_filename}.{lang}.vtt"
                if os.path.exists(vtt_file):
                    captions = self._extract_text_from_vtt(vtt_file)
                    os.remove(vtt_file)
                    if captions:
                        return captions, "yt_dlp"
        except Exception as e:
            print(f"Error fetching captions via yt-dlp for {video_id}: {e}")

        return [], "none"

    def _extract_text_from_vtt(self, vtt_path: str) -> List[Dict]:
        """Extract text from VTT file."""
        captions = []
        timestamp_re = re.compile(
            r"(\d+):(\d{2}):(\d{2}\.\d+)\s-->\s(\d+):(\d{2}):(\d{2}\.\d+)"
        )
        
        with open(vtt_path, encoding="utf-8") as f:
            lines = f.readlines()
            
        buffer = []
        current_start = None
        current_end = None
        
        for line in lines:
            line = line.strip()
            if not line or line.startswith(("WEBVTT", "Kind:", "Language:")):
                continue
                
            match = timestamp_re.match(line)
            if match:
                if buffer and current_start is not None and current_end is not None:
                    text = " ".join(buffer).strip()
                    if text:
                        duration = current_end - current_start
                        if duration > 0:
                            captions.append({
                                "text": text,
                                "start": current_start,
                                "duration": duration
                            })
                buffer = []
                h1, m1, s1, h2, m2, s2 = match.groups()
                current_start = int(h1) * 3600 + int(m1) * 60 + float(s1)
                current_end = int(h2) * 3600 + int(m2) * 60 + float(s2)
            else:
                buffer.append(re.sub(r"<.*?>", "", line))
                
        if buffer and current_start is not None and current_end is not None:
            text = " ".join(buffer).strip()
            if text:
                duration = current_end - current_start
                if duration > 0:
                    captions.append({
                        "text": text,
                        "start": current_start,
                        "duration": duration
                    })
                    
        return captions

    def _validate_caption_segments(self, segments: List[Dict]) -> bool:
        """Validate caption segments have required fields."""
        return all(
            isinstance(s, dict) and 
            all(k in s for k in ['text', 'start', 'duration'])
            for s in segments
        )

    def process_video(self, video_data: Dict[str, Any]) -> bool:
        """Process a single video's metadata and captions."""
        try:
            video_id = video_data.get("id")
            if not video_id:
                return False

            snippet = video_data.get("snippet", {})
            content_details = video_data.get("contentDetails", {})
            statistics = video_data.get("statistics", {})
            status = video_data.get("status", {})
            player = video_data.get("player", {})

            # Create or update Video
            video = self.session.get(Video, video_id)
            if not video:
                video = Video(video_id=video_id)
                self.session.add(video)

            # Update video attributes
            published_at = snippet.get("publishedAt")
            if published_at:
                try:
                    if published_at.endswith('Z'):
                        published_at = datetime.fromisoformat(published_at[:-1] + '+00:00')
                    else:
                        published_at = datetime.fromisoformat(published_at)
                except ValueError:
                    published_at = datetime.utcnow()
            else:
                published_at = datetime.utcnow()

            video.published_at = published_at
            video.title = snippet.get("title", "N/A")
            video.description = snippet.get("description", "")
            video.channel_id = snippet.get("channelId")
            video.channel_title = snippet.get("channelTitle")
            video.duration = parse_duration(content_details.get("duration", "PT0S"))
            video.default_language = snippet.get("defaultAudioLanguage")
            video.category_id = int(snippet["categoryId"]) if snippet.get("categoryId") else None
            video.raw_snippet = snippet
            video.raw_content_details = content_details
            video.raw_status = status
            video.raw_player = player

            # Update thumbnails
            self.session.query(Thumbnail).filter(Thumbnail.video_id == video_id).delete()
            for quality, thumb_data in snippet.get("thumbnails", {}).items():
                if isinstance(thumb_data, dict):
                    thumbnail = Thumbnail(
                        video_id=video_id,
                        quality=quality,
                        url=thumb_data["url"],
                        width=thumb_data["width"],
                        height=thumb_data["height"]
                    )
                    self.session.add(thumbnail)

            # Update statistics
            stats = self.session.get(VideoStatistic, video_id)
            if not stats:
                stats = VideoStatistic(video_id=video_id)
                self.session.add(stats)

            stats.view_count = int(statistics.get("viewCount", 0))
            stats.like_count = int(statistics.get("likeCount", 0))
            stats.favorite_count = int(statistics.get("favoriteCount", 0))
            stats.comment_count = int(statistics.get("commentCount", 0))

            # Fetch and process captions
            caption_segments, source = self.fetch_captions(video_id)
            if caption_segments:
                self.session.query(Caption).filter(Caption.video_id == video_id).delete()
                merged_captions = self.merge_caption_segments(caption_segments)
                for cap in merged_captions:
                    caption = Caption(
                        video_id=video_id,
                        start=float(cap["start"]),
                        duration=float(cap["duration"]),
                        text=cap["text"],
                        embedding=None
                    )
                    self.session.add(caption)

            return True

        except Exception as e:
            print(f"Error processing video {video_id}: {e}")
            return False

    def merge_caption_segments(self, segments: List[Dict]) -> List[Dict]:
        """Merge caption segments into sentences."""
        SENTENCE_SPLIT_RE = re.compile(r'(?<=[.!?])\s+')
        MIN_SENTENCE_DURATION = 0.001

        # Convert segments to word timeline
        word_timeline = []
        for seg in segments:
            text = seg['text']
            start = float(seg['start'])
            duration = float(seg['duration'])
            
            words = text.split()
            if not words:
                continue
                
            per_word_duration = duration / len(words) if duration > 0 and words else 0
            current_time = start
            
            for word in words:
                word_timeline.append({
                    'word': word,
                    'start': max(0.0, current_time),
                    'duration': max(0.0, per_word_duration)
                })
                if per_word_duration > 0:
                    current_time += per_word_duration

        if not word_timeline:
            return []

        # Merge words into sentences
        full_text = ' '.join(w['word'] for w in word_timeline)
        sentences = [s.strip() for s in SENTENCE_SPLIT_RE.split(full_text) if s.strip()]
        
        merged_sentences = []
        current_word_idx = 0
        
        for sentence in sentences:
            words_in_sentence = sentence.split()
            num_words = len(words_in_sentence)
            
            if num_words == 0:
                continue
                
            if current_word_idx + num_words > len(word_timeline):
                break
                
            sentence_words = word_timeline[current_word_idx:current_word_idx + num_words]
            if not sentence_words:
                break
                
            sent_start = sentence_words[0]['start']
            sent_duration = sum(w['duration'] for w in sentence_words)
            
            if sent_duration <= 0:
                sent_duration = MIN_SENTENCE_DURATION
                
            merged_sentences.append({
                'text': sentence,
                'start': round(sent_start, 3),
                'duration': round(sent_duration, 3)
            })
            
            current_word_idx += num_words

        return merged_sentences 