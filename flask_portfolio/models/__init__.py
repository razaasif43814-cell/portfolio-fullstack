"""
Database Models Package
Initializes MongoDB connection lazily — app starts even if MongoDB is unavailable.
"""
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from config import Config

# ── MongoDB Connection (lazy — 3s timeout) ──────────────
try:
    client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=3000)
    # Test connection
    client.admin.command('ping')
    db = client[Config.MONGO_DB_NAME]
    MONGO_AVAILABLE = True
    print("[DB] [OK] MongoDB connected successfully!")
except Exception as e:
    print("[DB] [WARN] MongoDB not available:", str(e)[:80])
    print("[DB] App will run with fallback data. Start MongoDB to enable full features.")
    MONGO_AVAILABLE = False
    db = None

# ── Collections (safe to use — will error only when accessed if DB is down) ──
class FallbackCollection:
    """Dummy collection that returns empty results when MongoDB is down."""
    def find(self, *a, **kw): return FallbackCursor()
    def find_one(self, *a, **kw): return None
    def insert_one(self, *a, **kw): return type('R', (), {'inserted_id': None})()
    def update_one(self, *a, **kw): return type('R', (), {'modified_count': 0})()
    def delete_one(self, *a, **kw): return type('R', (), {'deleted_count': 0})()
    def count_documents(self, *a, **kw): return 0
    def create_index(self, *a, **kw): pass

class FallbackCursor:
    """Dummy cursor for iteration."""
    def sort(self, *a, **kw): return self
    def skip(self, *a, **kw): return self
    def limit(self, *a, **kw): return self
    def __iter__(self): return iter([])
    def __list__(self): return []

_fallback = FallbackCollection()

if MONGO_AVAILABLE and db is not None:
    users_collection = db['users']
    projects_collection = db['projects']
    skills_collection = db['skills']
    messages_collection = db['messages']
    blogs_collection = db['blogs']
    chat_collection = db['chat_messages']
    notifications_collection = db['notifications']

    # Create indexes (safe — won't crash if already exist)
    try:
        users_collection.create_index('email', unique=True)
        projects_collection.create_index('created_at')
        messages_collection.create_index('created_at')
        blogs_collection.create_index([('created_at', -1)])
        chat_collection.create_index('created_at')
    except Exception:
        pass
else:
    users_collection = _fallback
    projects_collection = _fallback
    skills_collection = _fallback
    messages_collection = _fallback
    blogs_collection = _fallback
    chat_collection = _fallback
    notifications_collection = _fallback
