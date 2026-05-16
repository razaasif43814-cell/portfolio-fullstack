"""
Validators — Input validation middleware for API endpoints
"""
import re
from flask import request, jsonify
from functools import wraps


def validate_json(*required_fields):
    """Decorator: Validates that request body is JSON and contains required fields."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            data = request.get_json(silent=True)
            if data is None:
                return jsonify({'status': 'error', 'message': 'Request body must be JSON'}), 400

            missing = [field for field in required_fields if not data.get(field)]
            if missing:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required fields: {", ".join(missing)}'
                }), 400

            return f(*args, **kwargs)
        return decorated
    return decorator


def validate_email_format(email):
    """Check if email format is valid."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password_strength(password):
    """Check password meets minimum requirements."""
    errors = []
    if len(password) < 6:
        errors.append('Password must be at least 6 characters')
    if not re.search(r'[A-Za-z]', password):
        errors.append('Password must contain at least one letter')
    if not re.search(r'[0-9]', password):
        errors.append('Password must contain at least one number')
    return errors


def sanitize_input(text, max_length=500):
    """Basic input sanitization — strips HTML tags and limits length."""
    if not text:
        return ''
    # Remove basic HTML tags
    cleaned = re.sub(r'<[^>]+>', '', str(text))
    return cleaned[:max_length].strip()


def validate_signup(f):
    """Decorator: Validates signup form data."""
    @wraps(f)
    def decorated(*args, **kwargs):
        data = request.get_json(silent=True)
        if not data:
            return jsonify({'status': 'error', 'message': 'Request body must be JSON'}), 400

        # Check required fields
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')

        if not name or len(name) < 2:
            return jsonify({'status': 'error', 'message': 'Name must be at least 2 characters'}), 400

        if not email or not validate_email_format(email):
            return jsonify({'status': 'error', 'message': 'Invalid email address'}), 400

        pwd_errors = validate_password_strength(password)
        if pwd_errors:
            return jsonify({'status': 'error', 'message': pwd_errors[0]}), 400

        return f(*args, **kwargs)
    return decorated


def validate_login(f):
    """Decorator: Validates login form data."""
    @wraps(f)
    def decorated(*args, **kwargs):
        data = request.get_json(silent=True)
        if not data:
            return jsonify({'status': 'error', 'message': 'Request body must be JSON'}), 400

        if not data.get('email') or not data.get('password'):
            return jsonify({'status': 'error', 'message': 'Email and password are required'}), 400

        return f(*args, **kwargs)
    return decorated
