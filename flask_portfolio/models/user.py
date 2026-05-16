"""
User Model — Handles user CRUD operations with MongoDB
Supports: registration, login, password reset, role management
"""
from datetime import datetime
from bson import ObjectId
import bcrypt
from models import users_collection


class User:
    """User model with bcrypt password hashing."""

    @staticmethod
    def create(name, email, password, role='user'):
        """Register a new user."""
        if users_collection.find_one({'email': email.lower()}):
            return None, 'Email already registered'

        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        user_doc = {
            'name': name.strip(),
            'email': email.lower().strip(),
            'password_hash': password_hash,
            'role': role,  # 'admin' or 'user'
            'avatar': '',
            'is_active': True,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'last_login': None,
            'reset_token': None,
            'reset_token_expiry': None,
        }
        result = users_collection.insert_one(user_doc)
        user_doc['_id'] = result.inserted_id
        return user_doc, None

    @staticmethod
    def find_by_email(email):
        """Find user by email address."""
        return users_collection.find_one({'email': email.lower().strip()})

    @staticmethod
    def find_by_id(user_id):
        """Find user by MongoDB ObjectId."""
        try:
            return users_collection.find_one({'_id': ObjectId(user_id)})
        except Exception:
            return None

    @staticmethod
    def verify_password(user_doc, password):
        """Verify password against stored hash."""
        if not user_doc or not user_doc.get('password_hash'):
            return False
        return bcrypt.checkpw(password.encode('utf-8'), user_doc['password_hash'])

    @staticmethod
    def update_last_login(user_id):
        """Update last login timestamp."""
        users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'last_login': datetime.utcnow()}}
        )

    @staticmethod
    def update_role(user_id, new_role):
        """Change user role (admin/user)."""
        if new_role not in ('admin', 'user'):
            return False
        users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'role': new_role, 'updated_at': datetime.utcnow()}}
        )
        return True

    @staticmethod
    def update_profile(user_id, data):
        """Update user profile fields."""
        allowed = {'name', 'avatar'}
        update = {k: v for k, v in data.items() if k in allowed}
        if update:
            update['updated_at'] = datetime.utcnow()
            users_collection.update_one({'_id': ObjectId(user_id)}, {'$set': update})
        return True

    @staticmethod
    def set_reset_token(email, token, expiry):
        """Store password reset token."""
        users_collection.update_one(
            {'email': email.lower()},
            {'$set': {'reset_token': token, 'reset_token_expiry': expiry}}
        )

    @staticmethod
    def reset_password(token, new_password):
        """Reset password using token."""
        user = users_collection.find_one({
            'reset_token': token,
            'reset_token_expiry': {'$gt': datetime.utcnow()}
        })
        if not user:
            return False, 'Invalid or expired reset token'

        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        users_collection.update_one(
            {'_id': user['_id']},
            {'$set': {
                'password_hash': password_hash,
                'reset_token': None,
                'reset_token_expiry': None,
                'updated_at': datetime.utcnow()
            }}
        )
        return True, 'Password reset successful'

    @staticmethod
    def delete(user_id):
        """Delete a user."""
        result = users_collection.delete_one({'_id': ObjectId(user_id)})
        return result.deleted_count > 0

    @staticmethod
    def get_all(page=1, per_page=20):
        """Get paginated list of users."""
        skip = (page - 1) * per_page
        cursor = users_collection.find(
            {}, {'password_hash': 0, 'reset_token': 0, 'reset_token_expiry': 0}
        ).sort('created_at', -1).skip(skip).limit(per_page)
        total = users_collection.count_documents({})
        return list(cursor), total

    @staticmethod
    def count():
        """Get total user count."""
        return users_collection.count_documents({})

    @staticmethod
    def to_json(user_doc):
        """Convert user document to JSON-safe dict."""
        if not user_doc:
            return None
        return {
            'id': str(user_doc['_id']),
            'name': user_doc.get('name', ''),
            'email': user_doc.get('email', ''),
            'role': user_doc.get('role', 'user'),
            'avatar': user_doc.get('avatar', ''),
            'is_active': user_doc.get('is_active', True),
            'created_at': user_doc.get('created_at', '').isoformat() if user_doc.get('created_at') else '',
            'last_login': user_doc.get('last_login', '').isoformat() if user_doc.get('last_login') else '',
        }
