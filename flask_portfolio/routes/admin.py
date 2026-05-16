"""
Admin Routes — Dashboard, User Management, Content Management
Protected by admin_required middleware.
"""
from flask import Blueprint, render_template, request
from utils.jwt_helper import decode_token

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


def get_admin_user():
    """Check if current user is admin via cookie."""
    token = request.cookies.get('access_token')
    if not token:
        return None
    payload, error = decode_token(token)
    if error or payload.get('role') != 'admin':
        return None
    return payload


# ── Admin Pages ─────────────────────────────────────────

@admin_bp.route('/')
@admin_bp.route('/dashboard')
def dashboard():
    """Admin dashboard — stats overview."""
    user = get_admin_user()
    if not user:
        return render_template('login.html', redirect_to='/admin/dashboard')
    return render_template('admin/dashboard.html')


@admin_bp.route('/users')
def users():
    """User management page."""
    user = get_admin_user()
    if not user:
        return render_template('login.html', redirect_to='/admin/users')
    return render_template('admin/users.html')


@admin_bp.route('/projects')
def projects():
    """Project management page."""
    user = get_admin_user()
    if not user:
        return render_template('login.html', redirect_to='/admin/projects')
    return render_template('admin/projects.html')


@admin_bp.route('/messages')
def messages():
    """Messages management page."""
    user = get_admin_user()
    if not user:
        return render_template('login.html', redirect_to='/admin/messages')
    return render_template('admin/messages.html')


@admin_bp.route('/blogs')
def blogs():
    """Blog management page."""
    user = get_admin_user()
    if not user:
        return render_template('login.html', redirect_to='/admin/blogs')
    return render_template('admin/blogs.html')
