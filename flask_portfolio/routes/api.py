"""
REST API Routes — Full CRUD for Projects, Skills, Messages, Blogs
GET / POST / PUT / DELETE with proper validation and error handling.
"""
from flask import Blueprint, request, jsonify
from models.project import Project
from models.message import Message
from models.blog import Blog
from models import skills_collection
from utils.jwt_helper import token_required, admin_required
from middleware.validators import validate_json, sanitize_input
from bson import ObjectId
from datetime import datetime

api_bp = Blueprint('api', __name__)


# ══════════════════════════════════════════════════════════
#  PROJECTS — Full CRUD
# ══════════════════════════════════════════════════════════

@api_bp.route('/api/projects', methods=['GET'])
def get_projects():
    """GET /api/projects — List all projects (public)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category = request.args.get('category', None)

    projects, total = Project.get_all(page, per_page, category)
    return jsonify({
        'status': 'ok',
        'data': [Project.to_json(p) for p in projects],
        'total': total,
        'page': page,
        'per_page': per_page,
    })


@api_bp.route('/api/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    """GET /api/projects/:id — Get single project (public)."""
    project = Project.find_by_id(project_id)
    if not project:
        return jsonify({'status': 'error', 'message': 'Project not found'}), 404
    return jsonify({'status': 'ok', 'data': Project.to_json(project)})


@api_bp.route('/api/projects', methods=['POST'])
@admin_required
@validate_json('title', 'description')
def create_project():
    """POST /api/projects — Create new project (admin only)."""
    data = request.get_json()
    data['title'] = sanitize_input(data['title'], 200)
    data['description'] = sanitize_input(data['description'], 2000)
    project = Project.create(data)
    return jsonify({
        'status': 'ok',
        'message': 'Project created',
        'data': Project.to_json(project)
    }), 201


@api_bp.route('/api/projects/<project_id>', methods=['PUT'])
@admin_required
def update_project(project_id):
    """PUT /api/projects/:id — Update project (admin only)."""
    project = Project.find_by_id(project_id)
    if not project:
        return jsonify({'status': 'error', 'message': 'Project not found'}), 404

    data = request.get_json(silent=True) or {}
    updated = Project.update(project_id, data)
    return jsonify({
        'status': 'ok',
        'message': 'Project updated',
        'data': Project.to_json(updated)
    })


@api_bp.route('/api/projects/<project_id>', methods=['DELETE'])
@admin_required
def delete_project(project_id):
    """DELETE /api/projects/:id — Delete project (admin only)."""
    if not Project.delete(project_id):
        return jsonify({'status': 'error', 'message': 'Project not found'}), 404
    return jsonify({'status': 'ok', 'message': 'Project deleted'})


# ══════════════════════════════════════════════════════════
#  SKILLS — Full CRUD
# ══════════════════════════════════════════════════════════

@api_bp.route('/api/skills', methods=['GET'])
def get_skills():
    """GET /api/skills — List all skill groups (public)."""
    skills = list(skills_collection.find().sort('order', 1))
    data = []
    for s in skills:
        data.append({
            'id': str(s['_id']),
            'title': s.get('title', ''),
            'skills': s.get('skills', []),
            'order': s.get('order', 0),
        })
    return jsonify({'status': 'ok', 'data': data})


@api_bp.route('/api/skills', methods=['POST'])
@admin_required
@validate_json('title', 'skills')
def create_skill_group():
    """POST /api/skills — Add a skill group (admin only)."""
    data = request.get_json()
    doc = {
        'title': sanitize_input(data['title'], 100),
        'skills': data['skills'],  # [{name, image}]
        'order': data.get('order', 0),
        'created_at': datetime.utcnow(),
    }
    result = skills_collection.insert_one(doc)
    doc['_id'] = result.inserted_id
    return jsonify({
        'status': 'ok',
        'message': 'Skill group created',
        'data': {'id': str(doc['_id']), 'title': doc['title'], 'skills': doc['skills']}
    }), 201


@api_bp.route('/api/skills/<skill_id>', methods=['PUT'])
@admin_required
def update_skill(skill_id):
    """PUT /api/skills/:id — Update skill group (admin only)."""
    data = request.get_json(silent=True) or {}
    allowed = {'title', 'skills', 'order'}
    update = {k: v for k, v in data.items() if k in allowed}
    if update:
        skills_collection.update_one({'_id': ObjectId(skill_id)}, {'$set': update})
    return jsonify({'status': 'ok', 'message': 'Skill group updated'})


@api_bp.route('/api/skills/<skill_id>', methods=['DELETE'])
@admin_required
def delete_skill(skill_id):
    """DELETE /api/skills/:id — Delete skill group (admin only)."""
    result = skills_collection.delete_one({'_id': ObjectId(skill_id)})
    if result.deleted_count == 0:
        return jsonify({'status': 'error', 'message': 'Skill group not found'}), 404
    return jsonify({'status': 'ok', 'message': 'Skill group deleted'})


# ══════════════════════════════════════════════════════════
#  MESSAGES — Read / Delete (admin) + Create (public)
# ══════════════════════════════════════════════════════════

@api_bp.route('/api/messages', methods=['GET'])
@admin_required
def get_messages():
    """GET /api/messages — List contact messages (admin only)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    messages, total = Message.get_all(page, per_page)
    return jsonify({
        'status': 'ok',
        'data': [Message.to_json(m) for m in messages],
        'total': total,
        'unread': Message.count(unread_only=True),
        'page': page,
    })


@api_bp.route('/api/messages/<msg_id>/read', methods=['PUT'])
@admin_required
def mark_message_read(msg_id):
    """PUT /api/messages/:id/read — Mark as read (admin only)."""
    Message.mark_read(msg_id)
    return jsonify({'status': 'ok', 'message': 'Marked as read'})


@api_bp.route('/api/messages/<msg_id>', methods=['DELETE'])
@admin_required
def delete_message(msg_id):
    """DELETE /api/messages/:id — Delete message (admin only)."""
    if not Message.delete(msg_id):
        return jsonify({'status': 'error', 'message': 'Message not found'}), 404
    return jsonify({'status': 'ok', 'message': 'Message deleted'})


# ══════════════════════════════════════════════════════════
#  USERS — Admin management
# ══════════════════════════════════════════════════════════

@api_bp.route('/api/users', methods=['GET'])
@admin_required
def get_users():
    """GET /api/users — List all users (admin only)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    from models.user import User
    users, total = User.get_all(page, per_page)
    return jsonify({
        'status': 'ok',
        'data': [User.to_json(u) for u in users],
        'total': total,
        'page': page,
    })


@api_bp.route('/api/users/<user_id>/role', methods=['PUT'])
@admin_required
def change_user_role(user_id):
    """PUT /api/users/:id/role — Change user role (admin only)."""
    data = request.get_json(silent=True) or {}
    new_role = data.get('role', '')

    from models.user import User
    if not User.update_role(user_id, new_role):
        return jsonify({'status': 'error', 'message': 'Invalid role. Must be admin or user.'}), 400
    return jsonify({'status': 'ok', 'message': f'Role changed to {new_role}'})


@api_bp.route('/api/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """DELETE /api/users/:id — Delete user (admin only)."""
    from models.user import User
    if not User.delete(user_id):
        return jsonify({'status': 'error', 'message': 'User not found'}), 404
    return jsonify({'status': 'ok', 'message': 'User deleted'})


# ══════════════════════════════════════════════════════════
#  BLOGS — Full CRUD
# ══════════════════════════════════════════════════════════

@api_bp.route('/api/blogs', methods=['GET'])
def get_blogs():
    """GET /api/blogs — List published blog posts (public)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    blogs, total = Blog.get_all(page, per_page, status='published')
    return jsonify({
        'status': 'ok',
        'data': [Blog.to_json(b) for b in blogs],
        'total': total,
        'page': page,
    })


@api_bp.route('/api/blogs/all', methods=['GET'])
@admin_required
def get_all_blogs():
    """GET /api/blogs/all — List all blogs including drafts (admin only)."""
    page = request.args.get('page', 1, type=int)
    blogs, total = Blog.get_all(page, 20)
    return jsonify({
        'status': 'ok',
        'data': [Blog.to_json(b) for b in blogs],
        'total': total,
        'page': page,
    })


@api_bp.route('/api/blogs/<blog_id>', methods=['GET'])
def get_blog(blog_id):
    """GET /api/blogs/:id — Get single blog post."""
    blog = Blog.find_by_id(blog_id)
    if not blog:
        return jsonify({'status': 'error', 'message': 'Blog not found'}), 404
    Blog.increment_views(blog_id)
    return jsonify({'status': 'ok', 'data': Blog.to_json(blog)})


@api_bp.route('/api/blogs', methods=['POST'])
@admin_required
@validate_json('title', 'content')
def create_blog():
    """POST /api/blogs — Create blog post (admin only)."""
    data = request.get_json()
    blog = Blog.create(data, request.user_id)
    return jsonify({
        'status': 'ok',
        'message': 'Blog created',
        'data': Blog.to_json(blog)
    }), 201


@api_bp.route('/api/blogs/<blog_id>', methods=['PUT'])
@admin_required
def update_blog(blog_id):
    """PUT /api/blogs/:id — Update blog post (admin only)."""
    data = request.get_json(silent=True) or {}
    updated = Blog.update(blog_id, data)
    if not updated:
        return jsonify({'status': 'error', 'message': 'Blog not found'}), 404
    return jsonify({'status': 'ok', 'message': 'Blog updated', 'data': Blog.to_json(updated)})


@api_bp.route('/api/blogs/<blog_id>', methods=['DELETE'])
@admin_required
def delete_blog(blog_id):
    """DELETE /api/blogs/:id — Delete blog post (admin only)."""
    if not Blog.delete(blog_id):
        return jsonify({'status': 'error', 'message': 'Blog not found'}), 404
    return jsonify({'status': 'ok', 'message': 'Blog deleted'})


# ══════════════════════════════════════════════════════════
#  STATS — Dashboard statistics
# ══════════════════════════════════════════════════════════

@api_bp.route('/api/stats', methods=['GET'])
@admin_required
def get_stats():
    """GET /api/stats — Dashboard statistics (admin only)."""
    from models.user import User

    return jsonify({
        'status': 'ok',
        'data': {
            'users': User.count(),
            'projects': Project.count(),
            'messages': Message.count(),
            'unread_messages': Message.count(unread_only=True),
            'blogs': Blog.count(),
            'published_blogs': Blog.count(status='published'),
        }
    })
