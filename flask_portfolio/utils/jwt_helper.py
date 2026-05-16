"""
JWT Helper — Token generation, verification, and utilities
"""
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from config import Config


def generate_token(user_id, role='user'):
    """Generate a JWT token for authenticated user."""
    payload = {
        'user_id': str(user_id),
        'role': role,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')


def decode_token(token):
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, 'Token expired. Please login again.'
    except jwt.InvalidTokenError:
        return None, 'Invalid token. Please login again.'


def generate_reset_token(email):
    """Generate a password reset token (expires in 1 hour)."""
    payload = {
        'email': email,
        'purpose': 'password_reset',
        'exp': datetime.utcnow() + timedelta(hours=1),
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')


def verify_reset_token(token):
    """Verify a password reset token."""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        if payload.get('purpose') != 'password_reset':
            return None, 'Invalid token purpose'
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, 'Reset link has expired'
    except jwt.InvalidTokenError:
        return None, 'Invalid reset link'


# ── Decorators ──────────────────────────────────────────

def token_required(f):
    """Decorator: Requires valid JWT token in Authorization header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Check Authorization header
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        # Check cookie as fallback
        if not token:
            token = request.cookies.get('access_token')

        if not token:
            return jsonify({'status': 'error', 'message': 'Authentication required'}), 401

        payload, error = decode_token(token)
        if error:
            return jsonify({'status': 'error', 'message': error}), 401

        # Attach user info to request
        request.user_id = payload['user_id']
        request.user_role = payload.get('role', 'user')

        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Decorator: Requires admin role."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.user_role != 'admin':
            return jsonify({'status': 'error', 'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated
