"""
Message Model — Stores contact form submissions
"""
from datetime import datetime
from bson import ObjectId
from models import messages_collection


class Message:
    """Contact message model."""

    @staticmethod
    def create(data):
        """Store a new contact message."""
        msg_doc = {
            'from_name': data.get('from_name', ''),
            'from_email': data.get('from_email', ''),
            'subject': data.get('subject', ''),
            'message': data.get('message', ''),
            'is_read': False,
            'created_at': datetime.utcnow(),
        }
        result = messages_collection.insert_one(msg_doc)
        msg_doc['_id'] = result.inserted_id
        return msg_doc

    @staticmethod
    def find_by_id(msg_id):
        """Find message by ID."""
        try:
            return messages_collection.find_one({'_id': ObjectId(msg_id)})
        except Exception:
            return None

    @staticmethod
    def get_all(page=1, per_page=20):
        """Get paginated list of messages (newest first)."""
        skip = (page - 1) * per_page
        cursor = messages_collection.find().sort('created_at', -1).skip(skip).limit(per_page)
        total = messages_collection.count_documents({})
        return list(cursor), total

    @staticmethod
    def mark_read(msg_id):
        """Mark a message as read."""
        messages_collection.update_one(
            {'_id': ObjectId(msg_id)},
            {'$set': {'is_read': True}}
        )

    @staticmethod
    def delete(msg_id):
        """Delete a message."""
        result = messages_collection.delete_one({'_id': ObjectId(msg_id)})
        return result.deleted_count > 0

    @staticmethod
    def count(unread_only=False):
        """Get message count."""
        query = {'is_read': False} if unread_only else {}
        return messages_collection.count_documents(query)

    @staticmethod
    def to_json(doc):
        """Convert to JSON-safe dict."""
        if not doc:
            return None
        return {
            'id': str(doc['_id']),
            'from_name': doc.get('from_name', ''),
            'from_email': doc.get('from_email', ''),
            'subject': doc.get('subject', ''),
            'message': doc.get('message', ''),
            'is_read': doc.get('is_read', False),
            'created_at': doc.get('created_at', '').isoformat() if doc.get('created_at') else '',
        }
