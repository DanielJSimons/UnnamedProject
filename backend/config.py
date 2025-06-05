import os
from pathlib import Path

# Database configuration
PGHOST = os.environ.get("PGHOST", "localhost")
PGPORT = os.environ.get("PGPORT", "5432")
PGDATABASE = os.environ.get("PGDATABASE", "videos")
PGUSER = os.environ.get("PGUSER", "videos")
PGPASSWORD = os.environ.get("PGPASSWORD", "videos")

DATABASE_URL = f"postgresql+psycopg2://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGDATABASE}"

# YouTube API configuration
YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")
MAX_RESULTS_PER_CHANNEL = 5

# NLP Models configuration
SPACY_MODEL = "en_core_web_sm"
SENTIMENT_MODEL = "tabularisai/robust-sentiment-analysis"
NRC_LEXICON_FILE = Path("NRC-VAD-Lexicon-v2.1.txt")

# API configuration
API_VERSION = "v1" 