"""
Blog Model — Full CMS with draft/publish workflow
"""
from datetime import datetime
from bson import ObjectId
from models import blogs_collection


class Blog:
    """Blog post model with CMS features."""

    @staticmethod
    def create(data, author_id):
        """Create a new blog post."""
        blog_doc = {
            'title': data.get('title', ''),
            'slug': data.get('slug', ''),
            'content': data.get('content', ''),
            'excerpt': data.get('excerpt', ''),
            'cover_image': data.get('cover_image', ''),
            'category': data.get('category', 'General'),
            'tags': data.get('tags', []),
            'author_id': ObjectId(author_id),
            'status': data.get('status', 'draft'),  # draft, published
            'views': 0,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'published_at': None,
        }
        if blog_doc['status'] == 'published':
            blog_doc['published_at'] = datetime.utcnow()

        result = blogs_collection.insert_one(blog_doc)
        blog_doc['_id'] = result.inserted_id
        return blog_doc

    @staticmethod
    def find_by_id(blog_id):
        try:
            return blogs_collection.find_one({'_id': ObjectId(blog_id)})
        except Exception:
            return None

    @staticmethod
    def find_by_slug(slug):
        return blogs_collection.find_one({'slug': slug, 'status': 'published'})

    @staticmethod
    def get_all(page=1, per_page=10, status=None):
        query = {}
        if status:
            query['status'] = status
        skip = (page - 1) * per_page
        cursor = blogs_collection.find(query).sort('created_at', -1).skip(skip).limit(per_page)
        total = blogs_collection.count_documents(query)
        return list(cursor), total

    @staticmethod
    def update(blog_id, data):
        allowed = {'title', 'slug', 'content', 'excerpt', 'cover_image',
                    'category', 'tags', 'status'}
        update = {k: v for k, v in data.items() if k in allowed}
        if update:
            update['updated_at'] = datetime.utcnow()
            if update.get('status') == 'published':
                update['published_at'] = datetime.utcnow()
            blogs_collection.update_one({'_id': ObjectId(blog_id)}, {'$set': update})
        return Blog.find_by_id(blog_id)

    @staticmethod
    def increment_views(blog_id):
        blogs_collection.update_one(
            {'_id': ObjectId(blog_id)},
            {'$inc': {'views': 1}}
        )

    @staticmethod
    def delete(blog_id):
        result = blogs_collection.delete_one({'_id': ObjectId(blog_id)})
        return result.deleted_count > 0

    @staticmethod
    def count(status=None):
        query = {'status': status} if status else {}
        return blogs_collection.count_documents(query)

    @staticmethod
    def to_json(doc):
        if not doc:
            return None
        return {
            'id': str(doc['_id']),
            'title': doc.get('title', ''),
            'slug': doc.get('slug', ''),
            'content': doc.get('content', ''),
            'excerpt': doc.get('excerpt', ''),
            'cover_image': doc.get('cover_image', ''),
            'category': doc.get('category', ''),
            'tags': doc.get('tags', []),
            'author_id': str(doc.get('author_id', '')),
            'status': doc.get('status', 'draft'),
            'views': doc.get('views', 0),
            'created_at': doc.get('created_at', '').isoformat() if doc.get('created_at') else '',
            'updated_at': doc.get('updated_at', '').isoformat() if doc.get('updated_at') else '',
            'published_at': doc.get('published_at', '').isoformat() if doc.get('published_at') else '',
        }
