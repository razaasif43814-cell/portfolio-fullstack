"""
Error Handler — Centralized error handling for the Flask app
"""
from flask import jsonify


def register_error_handlers(app):
    """Register all error handlers on the Flask app."""

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'status': 'error',
            'message': 'Bad request',
            'error': str(error.description) if hasattr(error, 'description') else str(error)
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'status': 'error',
            'message': 'Authentication required',
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'status': 'error',
            'message': 'Access denied. Admin privileges required.',
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'status': 'error',
            'message': 'Resource not found',
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'status': 'error',
            'message': 'Method not allowed',
        }), 405

    @app.errorhandler(429)
    def rate_limited(error):
        return jsonify({
            'status': 'error',
            'message': 'Too many requests. Please try again later.',
        }), 429

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'status': 'error',
            'message': 'Internal server error. Please try again later.',
        }), 500

    @app.errorhandler(Exception)
    def handle_exception(error):
        app.logger.error(f'Unhandled exception: {error}')
        return jsonify({
            'status': 'error',
            'message': 'An unexpected error occurred.',
        }), 500
