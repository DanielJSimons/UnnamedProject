from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import create_engine, func, case
from sqlalchemy.orm import sessionmaker, aliased
from sqlalchemy.exc import SQLAlchemyError
from config import DATABASE_URL, YOUTUBE_API_KEY, MAX_RESULTS_PER_CHANNEL
from models import Base, Video, VideoStatistic, Thumbnail, Caption, EntitySentiment
from youtube_service import YouTubeService
import jwt
from datetime import datetime, timedelta
import uuid
from functools import wraps
from dateutil.parser import parse as parse_date
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS at the application level
CORS(app, 
     resources={
         r"/*": {  # Match all routes
             "origins": ["http://localhost:3000", "http://localhost:3001"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True,
             "expose_headers": ["Content-Range", "X-Content-Range"]
         }
     },
     supports_credentials=True
)

# Enable CORS pre-flight requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin", "*"))
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response

# In a real app, these would be in a secure config file and use a proper database
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)  # Short-lived access token
app.config['REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)     # Long-lived refresh token

# In-memory storage (replace with a real database in production)
users = {}
refresh_tokens = {}
blacklisted_tokens = set()

def generate_tokens(user_data):
    """Generate both access and refresh tokens for a user."""
    # Generate access token
    access_token = jwt.encode({
        'email': user_data['email'],
        'exp': datetime.utcnow() + app.config['ACCESS_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'])

    # Generate refresh token
    refresh_token = str(uuid.uuid4())
    refresh_tokens[user_data['email']] = {
        'token': refresh_token,
        'expires': datetime.utcnow() + app.config['REFRESH_TOKEN_EXPIRES']
    }

    return access_token, refresh_token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header:
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        if token in blacklisted_tokens:
            return jsonify({'error': 'Token has been revoked'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users.get(data['email'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

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

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user = users.get(email)
    if user and check_password_hash(user['password'], password):
        access_token, refresh_token = generate_tokens(user)

        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "refreshToken": refresh_token,
            "userId": user['id'],
            "name": user['name']
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        logger.debug(f"Received signup request with data: {data}")
        
        if not data:
            logger.error("No JSON data received in request")
            return jsonify({"error": "No data provided"}), 400

        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        # Validate required fields
        if not email:
            logger.error("Email missing from signup request")
            return jsonify({"error": "Email is required"}), 400
        if not password:
            logger.error("Password missing from signup request")
            return jsonify({"error": "Password is required"}), 400
        if not name:
            logger.error("Name missing from signup request")
            return jsonify({"error": "Name is required"}), 400

        # Check if user already exists
        if email in users:
            logger.warning(f"Signup attempt with existing email: {email}")
            return jsonify({"error": "Email already registered"}), 400

        # Create new user
        try:
            user_id = str(uuid.uuid4())
            users[email] = {
                'id': user_id,
                'email': email,
                'name': name,
                'password': generate_password_hash(password)
            }
            logger.debug(f"Created new user with email: {email}")

            # Generate tokens
            access_token, refresh_token = generate_tokens(users[email])
            logger.debug("Generated tokens for new user")

            return jsonify({
                "message": "User created successfully",
                "token": access_token,
                "refreshToken": refresh_token,
                "userId": user_id,
                "name": name
            }), 201

        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return jsonify({"error": "Error creating user"}), 500

    except Exception as e:
        logger.error(f"Unexpected error in signup: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/verify-token', methods=['GET'])
@token_required
def verify_token(current_user):
    return jsonify({
        "valid": True,
        "userId": current_user['id'],
        "name": current_user['name']
    }), 200

@app.route('/api/refresh-token', methods=['POST'])
def refresh_token():
    data = request.get_json() or {}
    old_refresh_token = data.get('refreshToken')
    email = data.get('email')

    if not old_refresh_token or not email:
        return jsonify({"error": "Missing refresh token or email"}), 400

    stored = refresh_tokens.get(email)
    if not stored or stored['token'] != old_refresh_token:
        return jsonify({"error": "Invalid refresh token"}), 401

    if stored['expires'] < datetime.utcnow():
        refresh_tokens.pop(email, None)
        return jsonify({"error": "Refresh token has expired"}), 401

    user = users.get(email)
    if not user:
        return jsonify({"error": "User not found"}), 401

    # Generate new tokens
    access_token, new_refresh_token = generate_tokens(user)

    return jsonify({
        "token": access_token,
        "refreshToken": new_refresh_token
    }), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    data = request.get_json() or {}
    refresh_token = data.get('refreshToken')
    auth_header = request.headers.get('Authorization')

    if auth_header:
        try:
            access_token = auth_header.split(" ")[1]
            blacklisted_tokens.add(access_token)
        except IndexError:
            pass

    if refresh_token:
        # Remove the refresh token
        for email, token_data in refresh_tokens.items():
            if token_data['token'] == refresh_token:
                refresh_tokens.pop(email)
                break

    return jsonify({"message": "Logged out successfully"}), 200

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

@app.route('/api/dashboard/entity-mentions-over-time', methods=['POST'])
@token_required
def entity_mentions_over_time(current_user):
    data = request.get_json() or {}
    queries = data.get('queries', [])
    start_date_str = data.get('startDate')
    end_date_str = data.get('endDate')
    secondary_metric = data.get('secondaryMetric') # e.g., 'exp_sent', 'valence', 'cont_score'
    
    if not queries:
        return jsonify({})

    try:
        start_date = parse_date(start_date_str) if start_date_str else None
        end_date = parse_date(end_date_str) if end_date_str else None
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    session = Session()
    try:
        results = {}
        for query_obj in queries:
            entity_name = query_obj.get('entity')
            if not entity_name:
                continue

            day = func.date_trunc('day', Video.published_at).label('day')
            mention_count = func.count(EntitySentiment.entity_id).label('mention_count')
            
            q = (
                session.query(day, mention_count)
                .join(Video, EntitySentiment.video_id == Video.video_id)
                .filter(EntitySentiment.entity.ilike(f'%{entity_name}%'))
            )

            if secondary_metric and hasattr(EntitySentiment, secondary_metric):
                q = q.add_columns(func.avg(getattr(EntitySentiment, secondary_metric)).label('secondary_avg'))

            if start_date:
                q = q.filter(Video.published_at >= start_date)
            if end_date:
                q = q.filter(Video.published_at <= end_date)

            series_data = q.group_by(day).order_by(day).all()
            
            processed_data = []
            for r in series_data:
                point = {"date": r.day.isoformat(), "count": r.mention_count}
                if secondary_metric and 'secondary_avg' in r._fields:
                    point[f"{entity_name}_{secondary_metric}"] = r.secondary_avg
                processed_data.append(point)

            results[entity_name] = processed_data
            
        return jsonify(results)
    finally:
        session.close()

@app.route('/api/dashboard/top-entities', methods=['POST'])
@token_required
def top_entities(current_user):
    data = request.get_json() or {}
    start_date_str = data.get('startDate')
    end_date_str = data.get('endDate')
    limit = data.get('limit', 10)

    try:
        start_date = parse_date(start_date_str) if start_date_str else None
        end_date = parse_date(end_date_str) if end_date_str else None
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    session = Session()
    try:
        q = (
            session.query(
                EntitySentiment.entity,
                func.count(EntitySentiment.entity_id).label('mention_count')
            )
            .join(Video, EntitySentiment.video_id == Video.video_id)
        )

        if start_date:
            q = q.filter(Video.published_at >= start_date)
        if end_date:
            q = q.filter(Video.published_at <= end_date)
        
        results = q.group_by(EntitySentiment.entity).order_by(func.count(EntitySentiment.entity_id).desc()).limit(limit).all()

        top_entities_data = [
            {"entity": r.entity, "count": r.mention_count}
            for r in results
        ]
        
        return jsonify(top_entities_data)
    finally:
        session.close()

@app.route('/api/dashboard/sentiment-distribution', methods=['POST'])
@token_required
def sentiment_distribution(current_user):
    data = request.get_json() or {}
    queries = data.get('queries', [])
    start_date_str = data.get('startDate')
    end_date_str = data.get('endDate')

    if not queries:
        return jsonify([])

    try:
        start_date = parse_date(start_date_str) if start_date_str else None
        end_date = parse_date(end_date_str) if end_date_str else None
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    session = Session()
    try:
        entity_names = [q.get('entity') for q in queries if q.get('entity')]
        if not entity_names:
            return jsonify([])

        q = (
            session.query(
                EntitySentiment.sentiment,
                func.count(EntitySentiment.entity_id).label('count')
            )
            .join(Video, EntitySentiment.video_id == Video.video_id)
            .filter(EntitySentiment.entity.in_(entity_names))
        )

        if start_date:
            q = q.filter(Video.published_at >= start_date)
        if end_date:
            q = q.filter(Video.published_at <= end_date)

        results = q.group_by(EntitySentiment.sentiment).all()

        sentiment_data = [{"name": r.sentiment, "value": r.count} for r in results]
        
        return jsonify(sentiment_data)
    finally:
        session.close()

@app.route('/api/dashboard/vad-analysis', methods=['POST'])
@token_required
def vad_analysis(current_user):
    data = request.get_json() or {}
    queries = data.get('queries', [])
    start_date_str = data.get('startDate')
    end_date_str = data.get('endDate')

    if not queries:
        return jsonify([])

    try:
        start_date = parse_date(start_date_str) if start_date_str else None
        end_date = parse_date(end_date_str) if end_date_str else None
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    session = Session()
    try:
        entity_names = [q.get('entity') for q in queries if q.get('entity')]
        if not entity_names:
            return jsonify([])

        q = (
            session.query(
                func.avg(EntitySentiment.valence).label('avg_valence'),
                func.avg(EntitySentiment.arousal).label('avg_arousal'),
                func.avg(EntitySentiment.dominance).label('avg_dominance')
            )
            .join(Video, EntitySentiment.video_id == Video.video_id)
            .filter(EntitySentiment.entity.in_(entity_names))
        )

        if start_date:
            q = q.filter(Video.published_at >= start_date)
        if end_date:
            q = q.filter(Video.published_at <= end_date)

        result = q.one()

        vad_data = [
            {"name": "Valence", "value": result.avg_valence or 0},
            {"name": "Arousal", "value": result.avg_arousal or 0},
            {"name": "Dominance", "value": result.avg_dominance or 0},
        ]
        
        return jsonify(vad_data)
    finally:
        session.close()

@app.route('/api/dashboard/contextual-snippets', methods=['POST'])
@token_required
def contextual_snippets(current_user):
    data = request.get_json() or {}
    queries = data.get('queries', [])
    start_date_str = data.get('startDate')
    end_date_str = data.get('endDate')
    limit = data.get('limit', 10)

    if not queries:
        return jsonify([])

    try:
        start_date = parse_date(start_date_str) if start_date_str else None
        end_date = parse_date(end_date_str) if end_date_str else None
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    session = Session()
    try:
        entity_names = [q.get('entity') for q in queries if q.get('entity')]
        if not entity_names:
            return jsonify([])

        q = (
            session.query(
                EntitySentiment.sentence,
                EntitySentiment.sentiment,
                EntitySentiment.start,
                Video.video_id,
                Video.title
            )
            .join(Video, EntitySentiment.video_id == Video.video_id)
            .filter(EntitySentiment.entity.in_(entity_names))
        )

        if start_date:
            q = q.filter(Video.published_at >= start_date)
        if end_date:
            q = q.filter(Video.published_at <= end_date)

        results = q.order_by(func.random()).limit(limit).all()

        snippets_data = [
            {
                "sentence": r.sentence,
                "sentiment": r.sentiment,
                "start": r.start,
                "videoId": r.video_id,
                "videoTitle": r.title
            }
            for r in results
        ]
        
        return jsonify(snippets_data)
    finally:
        session.close()

if __name__ == '__main__':
    app.run(debug=True, port=5001) 