"""
Application Configuration
Loads environment variables from .env file
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET = os.getenv('JWT_SECRET', 'jwt-secret-key-change-in-production')
    JWT_EXPIRY_HOURS = int(os.getenv('JWT_EXPIRY_HOURS', '24'))

    # MongoDB
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/portfolio')
    MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'portfolio')

    # Email (Gmail SMTP)
    GMAIL_USER = os.getenv('GMAIL_USER', '')
    GMAIL_PASS = os.getenv('GMAIL_PASS', '')
    TO_EMAIL = os.getenv('TO_EMAIL', '')

    # App
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', '5000'))

    # Upload
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload

    # Rate Limiting
    RATE_LIMIT = os.getenv('RATE_LIMIT', '100/hour')
