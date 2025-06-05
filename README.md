# YouTube Video API

A Flask-based REST API for fetching and storing YouTube video data, including metadata, statistics, and captions.

## Features

- Fetch latest videos from YouTube channels
- Store video metadata, statistics, and captions in PostgreSQL database
- RESTful API endpoints for video data retrieval
- Support for both manual and auto-generated captions
- Pagination and filtering options

## Prerequisites

- Python 3.8+
- PostgreSQL database
- YouTube Data API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the project root with the following variables:
```
PGHOST=localhost
PGPORT=5432
PGDATABASE=videos
PGUSER=your_username
PGPASSWORD=your_password
YOUTUBE_API_KEY=your_youtube_api_key
```

5. Initialize the database:
```bash
python
>>> from app import engine
>>> from models import Base
>>> Base.metadata.create_all(engine)
```

## Usage

1. Start the Flask application:
```bash
python app.py
```

2. API Endpoints:

- Fetch videos from a channel:
```
POST /api/v1/channels/<channel_id>/videos
Query parameters:
- max_results (optional, default: 5)
```

- List videos:
```
GET /api/v1/videos
Query parameters:
- channel_id (optional)
- page (optional, default: 1)
- per_page (optional, default: 10)
```

- Get video details:
```
GET /api/v1/videos/<video_id>
```

- Get video captions:
```
GET /api/v1/videos/<video_id>/captions
```

## Production Deployment

For production deployment:

1. Use gunicorn as the WSGI server:
```bash
gunicorn app:app
```

2. Set up a reverse proxy (e.g., Nginx)

3. Configure SSL/TLS

4. Set appropriate environment variables for production

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 200: Success
- 404: Resource not found
- 500: Server error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 