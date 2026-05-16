"""
Chat Routes — Real-time chat using Flask-SocketIO
Provides WebSocket events for live messaging and notifications.
"""
from flask import Blueprint, request
from flask_socketio import emit, join_room, leave_room
from datetime import datetime
from models import chat_collection, notifications_collection
from bson import ObjectId

chat_bp = Blueprint('chat', __name__)

# Connected users tracking
connected_users = {}


def register_socket_events(socketio):
    """Register all Socket.IO event handlers."""

    @socketio.on('connect')
    def handle_connect():
        """Client connected."""
        print(f"[Socket] Client connected: {request.sid}")

    @socketio.on('disconnect')
    def handle_disconnect():
        """Client disconnected."""
        sid = request.sid
        if sid in connected_users:
            user = connected_users.pop(sid)
            emit('user_offline', {'user': user.get('name', 'Anonymous')}, broadcast=True)
        print(f"[Socket] Client disconnected: {sid}")

    @socketio.on('join')
    def handle_join(data):
        """User joins a chat room."""
        room = data.get('room', 'general')
        name = data.get('name', 'Anonymous')

        join_room(room)
        connected_users[request.sid] = {'name': name, 'room': room}

        emit('user_online', {'user': name, 'count': len(connected_users)}, room=room)

        # Send recent chat history
        recent = list(chat_collection.find({'room': room}).sort('created_at', -1).limit(50))
        recent.reverse()
        history = [{
            'id': str(m['_id']),
            'sender': m.get('sender', ''),
            'message': m.get('message', ''),
            'time': m.get('created_at', '').isoformat() if m.get('created_at') else '',
        } for m in recent]
        emit('chat_history', {'messages': history})

    @socketio.on('leave')
    def handle_leave(data):
        """User leaves a chat room."""
        room = data.get('room', 'general')
        leave_room(room)
        if request.sid in connected_users:
            name = connected_users[request.sid].get('name', 'Anonymous')
            emit('user_offline', {'user': name}, room=room)

    @socketio.on('send_message')
    def handle_message(data):
        """Receive and broadcast a message."""
        room = data.get('room', 'general')
        sender = data.get('sender', 'Anonymous')
        message = data.get('message', '').strip()

        if not message:
            return

        # Store in database
        msg_doc = {
            'room': room,
            'sender': sender,
            'message': message[:1000],  # Max 1000 chars
            'created_at': datetime.utcnow(),
        }
        result = chat_collection.insert_one(msg_doc)

        # Broadcast to room
        emit('new_message', {
            'id': str(result.inserted_id),
            'sender': sender,
            'message': message[:1000],
            'time': datetime.utcnow().isoformat(),
        }, room=room)

        # Create notification for admin
        notifications_collection.insert_one({
            'type': 'chat',
            'title': f'New message from {sender}',
            'message': message[:100],
            'is_read': False,
            'created_at': datetime.utcnow(),
        })
        emit('new_notification', {
            'type': 'chat',
            'title': f'New message from {sender}',
            'message': message[:100],
        }, broadcast=True)

    @socketio.on('typing')
    def handle_typing(data):
        """Broadcast typing indicator."""
        room = data.get('room', 'general')
        sender = data.get('sender', 'Anonymous')
        emit('user_typing', {'user': sender}, room=room, include_self=False)

    @socketio.on('stop_typing')
    def handle_stop_typing(data):
        """Stop typing indicator."""
        room = data.get('room', 'general')
        sender = data.get('sender', 'Anonymous')
        emit('user_stopped_typing', {'user': sender}, room=room, include_self=False)


def get_online_count():
    """Get number of currently connected users."""
    return len(connected_users)
