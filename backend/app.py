from flask import Flask, request, jsonify
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from config import DATABASE_URL, YOUTUBE_API_KEY, MAX_RESULTS_PER_CHANNEL
from models import Base, Video, VideoStatistic, Thumbnail, Caption
from youtube_service import YouTubeService

app = Flask(__name__)

# Database setup
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

def get_db_session():
    session = Session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

@app.route('/api/v1/channels/<channel_id>/videos', methods=['POST'])
def fetch_channel_videos(channel_id):
    """Fetch and store latest videos from a YouTube channel."""
    try:
        session = Session()
        youtube_service = YouTubeService(YOUTUBE_API_KEY, session)
        
        # Get video IDs
        video_ids = youtube_service.get_latest_video_ids(
            channel_id, 
            max_results=request.args.get('max_results', MAX_RESULTS_PER_CHANNEL, type=int)
        )
        
        if not video_ids:
            return jsonify({"error": "No videos found"}), 404
            
        # Fetch and process videos
        videos_metadata = youtube_service.fetch_video_metadata(video_ids)
        processed_videos = []
        
        for video_data in videos_metadata:
            if youtube_service.process_video(video_data):
                processed_videos.append(video_data["id"])
        
        session.commit()
        return jsonify({
            "message": "Videos processed successfully",
            "processed_videos": processed_videos
        }), 200
        
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@app.route('/api/v1/videos', methods=['GET'])
def list_videos():
    """List videos with optional filtering."""
    try:
        session = Session()
        query = session.query(Video)
        
        # Apply filters
        channel_id = request.args.get('channel_id')
        if channel_id:
            query = query.filter(Video.channel_id == channel_id)
            
        # Add pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        videos = query.limit(per_page).offset((page - 1) * per_page).all()
        
        result = []
        for video in videos:
            video_data = {
                "video_id": video.video_id,
                "title": video.title,
                "channel_title": video.channel_title,
                "published_at": video.published_at.isoformat(),
                "duration": str(video.duration),
                "thumbnails": [
                    {
                        "quality": thumb.quality,
                        "url": thumb.url,
                        "width": thumb.width,
                        "height": thumb.height
                    }
                    for thumb in video.thumbnails
                ],
                "statistics": {
                    "view_count": video.statistics.view_count if video.statistics else 0,
                    "like_count": video.statistics.like_count if video.statistics else 0,
                    "comment_count": video.statistics.comment_count if video.statistics else 0
                } if video.statistics else {}
            }
            result.append(video_data)
            
        return jsonify({
            "videos": result,
            "page": page,
            "per_page": per_page,
            "total": query.count()
        }), 200
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@app.route('/api/v1/videos/<video_id>', methods=['GET'])
def get_video(video_id):
    """Get detailed information about a specific video."""
    try:
        session = Session()
        video = session.query(Video).filter(Video.video_id == video_id).first()
        
        if not video:
            return jsonify({"error": "Video not found"}), 404
            
        video_data = {
            "video_id": video.video_id,
            "title": video.title,
            "description": video.description,
            "channel_id": video.channel_id,
            "channel_title": video.channel_title,
            "published_at": video.published_at.isoformat(),
            "duration": str(video.duration),
            "default_language": video.default_language,
            "category_id": video.category_id,
            "thumbnails": [
                {
                    "quality": thumb.quality,
                    "url": thumb.url,
                    "width": thumb.width,
                    "height": thumb.height
                }
                for thumb in video.thumbnails
            ],
            "statistics": {
                "view_count": video.statistics.view_count,
                "like_count": video.statistics.like_count,
                "favorite_count": video.statistics.favorite_count,
                "comment_count": video.statistics.comment_count
            } if video.statistics else {},
            "captions": [
                {
                    "start": caption.start,
                    "duration": caption.duration,
                    "text": caption.text
                }
                for caption in video.captions
            ]
        }
        
        return jsonify(video_data), 200
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

@app.route('/api/v1/videos/<video_id>/captions', methods=['GET'])
def get_video_captions(video_id):
    """Get captions for a specific video."""
    try:
        session = Session()
        captions = session.query(Caption).filter(Caption.video_id == video_id).all()
        
        if not captions:
            return jsonify({"error": "No captions found"}), 404
            
        result = [
            {
                "start": caption.start,
                "duration": caption.duration,
                "text": caption.text
            }
            for caption in captions
        ]
        
        return jsonify({
            "video_id": video_id,
            "captions": result
        }), 200
        
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

if __name__ == '__main__':
    app.run(debug=True) 