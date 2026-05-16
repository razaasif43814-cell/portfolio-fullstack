"""
Auth Routes — Login, Signup, Forgot Password, Password Reset
Implements JWT-based authentication with bcrypt password hashing.
"""
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, render_template, make_response
from models.user import User
from utils.jwt_helper import generate_token, generate_reset_token, verify_reset_token
from utils.email_helper import send_reset_email
from middleware.validators import validate_signup, validate_login, validate_email_format

auth_bp = Blueprint('auth', __name__)


# ── Pages ───────────────────────────────────────────────

@auth_bp.route('/login')
def login_page():
    """Render login page."""
    return render_template('login.html')


@auth_bp.route('/signup')
def signup_page():
    """Render signup page."""
    return render_template('signup.html')


@auth_bp.route('/forgot-password')
def forgot_password_page():
    """Render forgot password page."""
    return render_template('forgot_password.html')


# ── API Endpoints ───────────────────────────────────────

@auth_bp.route('/api/auth/signup', methods=['POST'])
@validate_signup
def signup():
    """Register a new user.

    POST /api/auth/signup
    Body: { name, email, password }
    Returns: { status, message, token, user }
    """
    data = request.get_json()
    name = data['name'].strip()
    email = data['email'].strip()
    password = data['password']

    user, error = User.create(name, email, password)
    if error:
        return jsonify({'status': 'error', 'message': error}), 409

    token = generate_token(user['_id'], user['role'])
    User.update_last_login(user['_id'])

    response = make_response(jsonify({
        'status': 'ok',
        'message': 'Account created successfully!',
        'token': token,
        'user': User.to_json(user)
    }))
    response.set_cookie('access_token', token, httponly=True, max_age=86400, samesite='Lax')
    return response, 201


@auth_bp.route('/api/auth/login', methods=['POST'])
@validate_login
def login():
    """Authenticate user and return JWT token.

    POST /api/auth/login
    Body: { email, password }
    Returns: { status, message, token, user }
    """
    data = request.get_json()
    email = data['email'].strip()
    password = data['password']

    user = User.find_by_email(email)
    if not user or not User.verify_password(user, password):
        return jsonify({'status': 'error', 'message': 'Invalid email or password'}), 401

    if not user.get('is_active', True):
        return jsonify({'status': 'error', 'message': 'Account is deactivated'}), 403

    token = generate_token(user['_id'], user['role'])
    User.update_last_login(user['_id'])

    response = make_response(jsonify({
        'status': 'ok',
        'message': 'Login successful!',
        'token': token,
        'user': User.to_json(user)
    }))
    response.set_cookie('access_token', token, httponly=True, max_age=86400, samesite='Lax')
    return response


@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    """Clear auth cookie."""
    response = make_response(jsonify({'status': 'ok', 'message': 'Logged out'}))
    response.delete_cookie('access_token')
    return response


@auth_bp.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset email.

    POST /api/auth/forgot-password
    Body: { email }
    """
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip()

    if not email or not validate_email_format(email):
        return jsonify({'status': 'error', 'message': 'Valid email is required'}), 400

    user = User.find_by_email(email)
    if not user:
        # Don't reveal if email exists — always return success
        return jsonify({'status': 'ok', 'message': 'If that email is registered, a reset link has been sent.'})

    token = generate_reset_token(email)
    expiry = datetime.utcnow() + timedelta(hours=1)
    User.set_reset_token(email, token, expiry)

    reset_url = f"{request.host_url}reset-password?token={token}"
    send_reset_email(email, reset_url)

    return jsonify({'status': 'ok', 'message': 'If that email is registered, a reset link has been sent.'})


@auth_bp.route('/reset-password')
def reset_password_page():
    """Render password reset page."""
    token = request.args.get('token', '')
    return render_template('forgot_password.html', reset_token=token, is_reset=True)


@auth_bp.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Reset password using token.

    POST /api/auth/reset-password
    Body: { token, new_password }
    """
    data = request.get_json(silent=True) or {}
    token = data.get('token', '')
    new_password = data.get('new_password', '')

    if not token or not new_password:
        return jsonify({'status': 'error', 'message': 'Token and new password required'}), 400

    if len(new_password) < 6:
        return jsonify({'status': 'error', 'message': 'Password must be at least 6 characters'}), 400

    success, message = User.reset_password(token, new_password)
    if not success:
        return jsonify({'status': 'error', 'message': message}), 400

    return jsonify({'status': 'ok', 'message': message})


@auth_bp.route('/api/auth/me')
def get_current_user():
    """Get current authenticated user info from cookie/token."""
    from utils.jwt_helper import decode_token

    token = request.cookies.get('access_token')
    if not token:
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

    if not token:
        return jsonify({'status': 'error', 'message': 'Not authenticated'}), 401

    payload, error = decode_token(token)
    if error:
        return jsonify({'status': 'error', 'message': error}), 401

    user = User.find_by_id(payload['user_id'])
    if not user:
        return jsonify({'status': 'error', 'message': 'User not found'}), 404

    return jsonify({'status': 'ok', 'user': User.to_json(user)})
