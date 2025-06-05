import sys
from pathlib import Path

import pytest

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app import app, users
from models import Base, Video, VideoStatistic, Thumbnail, Caption
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Test database URL
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/videos_test"
)

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['DATABASE_URL'] = TEST_DATABASE_URL
    
    # Create test database and tables
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(engine)

    # Reset users dictionary for each test session
    users.clear()
    users.update({
        'test@example.com': {
            'name': 'Test User',
            'password': users.get('test@example.com', {}).get('password')
        }
    })

    with app.test_client() as client:
        yield client
    
    # Clean up: drop all tables after tests
    Base.metadata.drop_all(engine)

@pytest.fixture
def sample_video_data():
    return {
        "id": "test_video_123",
        "snippet": {
            "publishedAt": "2024-03-20T10:00:00Z",
            "title": "Test Video",
            "description": "Test Description",
            "channelId": "test_channel_123",
            "channelTitle": "Test Channel",
            "thumbnails": {
                "default": {
                    "url": "http://example.com/thumb.jpg",
                    "width": 120,
                    "height": 90
                }
            },
            "categoryId": "22"
        },
        "contentDetails": {
            "duration": "PT5M30S"
        },
        "statistics": {
            "viewCount": "1000",
            "likeCount": "100",
            "favoriteCount": "10",
            "commentCount": "50"
        }
    }

def test_list_videos_empty(client):
    """Test listing videos when database is empty."""
    response = client.get('/api/v1/videos')
    assert response.status_code == 200
    data = response.get_json()
    assert data['videos'] == []
    assert data['total'] == 0

def test_get_nonexistent_video(client):
    """Test getting a video that doesn't exist."""
    response = client.get('/api/v1/videos/nonexistent')
    assert response.status_code == 404
    assert response.get_json()['error'] == 'Video not found'

def test_fetch_channel_videos_no_api_key(client):
    """Test fetching channel videos without YouTube API key."""
    response = client.post('/api/v1/channels/test_channel/videos')
    assert response.status_code == 500
    assert 'error' in response.get_json()

def test_list_videos_pagination(client):
    """Test video listing pagination."""
    response = client.get('/api/v1/videos?page=1&per_page=5')
    assert response.status_code == 200
    data = response.get_json()
    assert 'page' in data
    assert 'per_page' in data
    assert 'total' in data

def test_get_video_captions_nonexistent(client):
    """Test getting captions for a nonexistent video."""
    response = client.get('/api/v1/videos/nonexistent/captions')
    assert response.status_code == 404
    assert response.get_json()['error'] == 'No captions found'


def test_login_success(client):
    response = client.post('/api/login', json={
        'email': 'test@example.com',
        'password': 'password'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == 'Login successful'


def test_login_failure(client):
    response = client.post('/api/login', json={
        'email': 'test@example.com',
        'password': 'wrong'
    })
    assert response.status_code == 401
    assert 'error' in response.get_json()


def test_signup_then_login(client):
    response = client.post('/api/signup', json={
        'name': 'New User',
        'email': 'new@example.com',
        'password': 'newpass'
    })
    assert response.status_code == 201
    assert response.get_json()['message'] == 'User created'

    login_resp = client.post('/api/login', json={
        'email': 'new@example.com',
        'password': 'newpass'
    })
    assert login_resp.status_code == 200
    assert login_resp.get_json()['message'] == 'Login successful'
