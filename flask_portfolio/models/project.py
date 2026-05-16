"""
Project Model — Handles project CRUD operations with MongoDB
"""
from datetime import datetime
from bson import ObjectId
from models import projects_collection


class Project:
    """Project model for portfolio projects."""

    @staticmethod
    def create(data):
        """Create a new project."""
        project_doc = {
            'title': data.get('title', ''),
            'description': data.get('description', ''),
            'date': data.get('date', ''),
            'image': data.get('image', ''),
            'tags': data.get('tags', []),
            'category': data.get('category', 'web app'),
            'github': data.get('github', ''),
            'webapp': data.get('webapp', ''),
            # Case study fields
            'case_study': {
                'problem': data.get('problem', ''),
                'features': data.get('features', []),
                'challenges': data.get('challenges', ''),
                'learnings': data.get('learnings', ''),
                'architecture': data.get('architecture', ''),
                'screenshots': data.get('screenshots', []),
            },
            'is_featured': data.get('is_featured', False),
            'order': data.get('order', 0),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
        }
        result = projects_collection.insert_one(project_doc)
        project_doc['_id'] = result.inserted_id
        return project_doc

    @staticmethod
    def find_by_id(project_id):
        """Find project by ID."""
        try:
            return projects_collection.find_one({'_id': ObjectId(project_id)})
        except Exception:
            return None

    @staticmethod
    def get_all(page=1, per_page=20, category=None):
        """Get paginated list of projects."""
        query = {}
        if category:
            query['category'] = category
        skip = (page - 1) * per_page
        cursor = projects_collection.find(query).sort('order', 1).skip(skip).limit(per_page)
        total = projects_collection.count_documents(query)
        return list(cursor), total

    @staticmethod
    def update(project_id, data):
        """Update a project."""
        allowed = {
            'title', 'description', 'date', 'image', 'tags',
            'category', 'github', 'webapp', 'is_featured', 'order',
            'case_study'
        }
        update = {k: v for k, v in data.items() if k in allowed}
        if update:
            update['updated_at'] = datetime.utcnow()
            projects_collection.update_one(
                {'_id': ObjectId(project_id)},
                {'$set': update}
            )
        return Project.find_by_id(project_id)

    @staticmethod
    def delete(project_id):
        """Delete a project."""
        result = projects_collection.delete_one({'_id': ObjectId(project_id)})
        return result.deleted_count > 0

    @staticmethod
    def count():
        """Get total project count."""
        return projects_collection.count_documents({})

    @staticmethod
    def to_json(doc):
        """Convert to JSON-safe dict."""
        if not doc:
            return None
        return {
            'id': str(doc['_id']),
            'title': doc.get('title', ''),
            'description': doc.get('description', ''),
            'date': doc.get('date', ''),
            'image': doc.get('image', ''),
            'tags': doc.get('tags', []),
            'category': doc.get('category', ''),
            'github': doc.get('github', ''),
            'webapp': doc.get('webapp', ''),
            'case_study': doc.get('case_study', {}),
            'is_featured': doc.get('is_featured', False),
            'order': doc.get('order', 0),
            'created_at': doc.get('created_at', '').isoformat() if doc.get('created_at') else '',
            'updated_at': doc.get('updated_at', '').isoformat() if doc.get('updated_at') else '',
        }
