"""
═══════════════════════════════════════════════════════════
  Asif Raza — Full-Stack Portfolio Application
  Flask + MongoDB + JWT Auth + Socket.IO + REST API
═══════════════════════════════════════════════════════════
"""
import os
import sys

# ── Eventlet monkey-patch (only on Python < 3.13 / production) ──
try:
    if sys.version_info < (3, 13):
        import eventlet
        eventlet.monkey_patch()
except Exception:
    pass

from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_socketio import SocketIO
from flask_cors import CORS
from config import Config
from utils.error_handler import register_error_handlers
from utils.email_helper import send_contact_email
from middleware.validators import sanitize_input


# ── Create Flask App ────────────────────────────────────
app = Flask(__name__)
app.config.from_object(Config)

# ── Extensions ──────────────────────────────────────────
CORS(app, supports_credentials=True)
# Use eventlet on production (Python < 3.13), threading locally
_async_mode = 'eventlet' if sys.version_info < (3, 13) else 'threading'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode=_async_mode)

# ── Ensure upload directory exists ──────────────────────
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

# ── Register Error Handlers ────────────────────────────
register_error_handlers(app)

# ── Register Blueprints ────────────────────────────────
from routes.auth import auth_bp
from routes.api import api_bp
from routes.admin import admin_bp

app.register_blueprint(auth_bp)
app.register_blueprint(api_bp)
app.register_blueprint(admin_bp)

# ── Register Socket.IO Events ─────────────────────────
from routes.chat import register_socket_events
register_socket_events(socketio)

# ══════════════════════════════════════════════════════════
#  PORTFOLIO DATA (Fallback — used if MongoDB is empty)
# ══════════════════════════════════════════════════════════

BIO = {
    "name": "Asif Raza",
    "roles": ["BCA Student", "Web Developer", "UI/UX Designer", "Python Developer"],
    "description": (
        "Motivated and hardworking BCA student with a strong interest in Web Development, "
        "UI/UX design, and Python development. Seeking an opportunity to apply my technical "
        "and problem-solving skills in a professional environment while continuously learning "
        "and contributing to real-world projects."
    ),
    "github":   "https://github.com/razaasif43814-cell",
    "resume":   "/static/files/resume.pdf",
    "linkedin": "https://www.linkedin.com/in/asif-raza-605987338",
    "phone":    "+91 9771854541",
    "email":    "razaasif43814@gmail.com",
}

SKILLS = [
    {
        "title": "Web Development",
        "skills": [
            {"name": "HTML",              "image": "https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg"},
            {"name": "CSS",               "image": "https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg"},
            {"name": "JavaScript",        "image": "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg"},
            {"name": "Responsive Design", "image": "https://cdn-icons-png.flaticon.com/512/2782/2782070.png"},
        ],
    },
    {
        "title": "Programming Languages",
        "skills": [
            {"name": "Python", "image": "https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg"},
            {"name": "C",      "image": "https://raw.githubusercontent.com/devicons/devicon/master/icons/c/c-original.svg"},
            {"name": "C++",    "image": "https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg"},
        ],
    },
    {
        "title": "Backend & Database",
        "skills": [
            {"name": "Flask",   "image": "https://raw.githubusercontent.com/devicons/devicon/master/icons/flask/flask-original.svg"},
            {"name": "Node.js", "image": "https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg"},
            {"name": "MongoDB", "image": "https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg"},
            {"name": "SQL",     "image": "https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg"},
            {"name": "REST API","image": "https://cdn-icons-png.flaticon.com/512/1581/1581884.png"},
        ],
    },
    {
        "title": "Tools & Technologies",
        "skills": [
            {"name": "Git",            "image": "https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg"},
            {"name": "JWT Auth",       "image": "https://cdn-icons-png.flaticon.com/512/6195/6195699.png"},
            {"name": "Socket.IO",      "image": "https://cdn.worldvectorlogo.com/logos/socket-io.svg"},
            {"name": "UI/UX Design",   "image": "https://raw.githubusercontent.com/devicons/devicon/master/icons/figma/figma-original.svg"},
            {"name": "API Integration","image": "https://cdn-icons-png.flaticon.com/512/1581/1581884.png"},
        ],
    },
]

EXPERIENCES = [
    {
        "id": 0,
        "img": "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        "role": "3rd Rank – 12-Hour Hackathon",
        "company": "Hackathon Competition",
        "date": "2024",
        "desc": "Secured 3rd rank in a 12-hour hackathon. Demonstrated strong problem-solving and rapid development skills under time pressure.",
        "skills": ["Web Development", "Problem Solving", "Teamwork"],
    },
    {
        "id": 1,
        "img": "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        "role": "3rd Rank – 24-Hour Hackathon",
        "company": "Hackathon Competition",
        "date": "2024",
        "desc": "Secured 3rd rank in a 24-hour hackathon (Certificate Received). Built a functional project rapidly with focus on usability.",
        "skills": ["Python", "UI/UX", "API Integration"],
    },
]

EDUCATION = [
    {
        "id": 0,
        "img": "https://cdn-icons-png.flaticon.com/512/8074/8074800.png",
        "school": "Himalayan Institute of Technology",
        "date": "2nd Year | 4th Semester",
        "grade": "Pursuing",
        "desc": "Currently pursuing Bachelor of Computer Applications (BCA). Studying Web Development, Python, DBMS, Data Structures, and Software Engineering.",
        "degree": "Bachelor of Computer Applications (BCA)",
    },
    {
        "id": 1,
        "img": "https://cdn-icons-png.flaticon.com/512/2784/2784461.png",
        "school": "Bihar School Examination Board (BSEB)",
        "date": "2023",
        "grade": "Completed",
        "desc": "Completed 12th (Intermediate) examination from Bihar School Examination Board. Studied Science stream with core subjects.",
        "degree": "12th – Intermediate (BSEB), Science",
    },
    {
        "id": 2,
        "img": "https://cdn-icons-png.flaticon.com/512/2784/2784461.png",
        "school": "Bihar School Examination Board (BSEB)",
        "date": "2021",
        "grade": "Completed",
        "desc": "Completed 10th (Matriculation) examination from Bihar School Examination Board.",
        "degree": "10th – Matriculation (BSEB)",
    },
]

PROJECTS = [
    {
        "id": 0,
        "title": "Student Dashboard Web Application",
        "date": "2024",
        "description": "Built a complete student management system with login functionality. Features: assignment tracking, progress monitoring, leaderboard system, and teacher panel for assignment upload and performance analytics.",
        "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
        "tags": ["HTML", "CSS", "JavaScript", "DBMS", "Python"],
        "category": "web app",
        "github": "https://github.com/razaasif43814-cell/Smart-education-tool",
        "webapp": "https://github.com/razaasif43814-cell/Smart-education-tool",
        "case_study": {
            "problem": "Students needed a centralized platform to track assignments, monitor progress, and view leaderboards. Traditional methods were scattered and inefficient.",
            "features": ["Login System", "Assignment Tracking", "Progress Dashboard", "Leaderboard", "Teacher Panel", "Analytics"],
            "challenges": "Integrating real-time progress tracking with a responsive UI was challenging. Had to optimize database queries for the leaderboard system.",
            "learnings": "Learned about database design patterns, user authentication flows, and building responsive dashboards with real data.",
        },
    },
    {
        "id": 1,
        "title": "CHAITANYA 2.0 – Intelligent Chatbot",
        "date": "2024",
        "description": "Built an advanced chatbot application with NLP capabilities. Integrated intelligent conversation flow and dynamic response generation. Designed interactive UI for seamless user engagement.",
        "image": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80",
        "tags": ["Python", "NLP", "API", "UI/UX"],
        "category": "web app",
        "github": "https://github.com/razaasif43814-cell/CHAITANYA-2.0",
        "webapp": "https://github.com/razaasif43814-cell/CHAITANYA-2.0",
        "case_study": {
            "problem": "Users needed an intelligent chatbot that could handle natural language queries and provide contextual responses without requiring complex commands.",
            "features": ["NLP Processing", "Context-Aware Responses", "Interactive UI", "API Integration", "Conversation Memory"],
            "challenges": "Building accurate NLP processing and maintaining conversation context across sessions required careful state management.",
            "learnings": "Gained experience in NLP, API integration, conversation design patterns, and building engaging user interfaces.",
        },
    },
    {
        "id": 2,
        "title": "Full-Stack Portfolio with Admin Panel",
        "date": "2025",
        "description": "Production-ready portfolio website with JWT authentication, admin panel, real-time chat, REST API, MongoDB integration, and complete CRUD operations. Features role-based access control and live notifications.",
        "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
        "tags": ["Flask", "MongoDB", "JWT", "Socket.IO", "REST API"],
        "category": "web app",
        "github": "https://github.com/razaasif43814-cell",
        "webapp": "#",
        "case_study": {
            "problem": "Portfolio websites are typically static with no backend. Needed a production-grade app demonstrating full-stack capabilities including auth, database, real-time features, and admin management.",
            "features": ["JWT Authentication", "Admin Dashboard", "Real-time Chat", "REST API", "CRUD Operations", "Role-based Access", "Live Notifications", "MongoDB Integration"],
            "challenges": "Implementing secure JWT auth with role-based access, building real-time WebSocket communication alongside REST API, and creating a responsive admin panel with data visualization.",
            "learnings": "Mastered JWT authentication patterns, WebSocket communication, MongoDB operations, REST API design, middleware architecture, and production deployment workflows.",
        },
    },
]


# ══════════════════════════════════════════════════════════
#  MAIN ROUTES
# ══════════════════════════════════════════════════════════

def _get_portfolio_data():
    """Helper to load skills+projects from DB or fallback."""
    try:
        from models import skills_collection, projects_collection
        db_skills = list(skills_collection.find().sort('order', 1))
        db_projects = list(projects_collection.find().sort('order', 1))
        skills_data = [{'title': s.get('title', ''), 'skills': s.get('skills', [])}
                       for s in db_skills] if db_skills else SKILLS
        projects_data = [{
            'id': i, 'title': p.get('title', ''), 'date': p.get('date', ''),
            'description': p.get('description', ''), 'image': p.get('image', ''),
            'tags': p.get('tags', []), 'category': p.get('category', ''),
            'github': p.get('github', ''), 'webapp': p.get('webapp', ''),
            'case_study': p.get('case_study', {}),
        } for i, p in enumerate(db_projects)] if db_projects else PROJECTS
    except Exception:
        skills_data = SKILLS
        projects_data = PROJECTS
    return skills_data, projects_data


@app.route("/")
def index():
    """Root — redirect to login if not authenticated, else portfolio."""
    from utils.jwt_helper import decode_token
    token = request.cookies.get('access_token') or \
            request.headers.get('Authorization', '').replace('Bearer ', '')
    if token:
        payload, error = decode_token(token)
        if not error:
            # Logged in — go straight to portfolio
            return redirect(url_for('portfolio'))
    # Not logged in — go to login
    return redirect(url_for('auth.login_page'))


@app.route("/portfolio")
def portfolio():
    """Portfolio homepage — the main page after login."""
    skills_data, projects_data = _get_portfolio_data()
    return render_template("index.html", bio=BIO, skills=skills_data,
                           experiences=EXPERIENCES, education=EDUCATION, projects=projects_data)


@app.route("/contact", methods=["POST"])
def contact():
    """Handle contact form submission — stores in DB + sends email."""
    data = request.get_json()
    from_name    = sanitize_input(data.get("from_name", "Someone"), 100)
    from_email   = sanitize_input(data.get("from_email", ""), 200)
    subject      = sanitize_input(data.get("subject", "Portfolio Contact"), 200)
    message_body = sanitize_input(data.get("message", ""), 2000)

    if not from_email or not message_body:
        return jsonify({"status": "error", "message": "Email and message are required"}), 400

    # Store in MongoDB
    try:
        from models.message import Message
        Message.create({
            'from_name': from_name,
            'from_email': from_email,
            'subject': subject,
            'message': message_body,
        })
    except Exception as e:
        print(f"[DB ERROR] Could not store message: {e}")

    # Send email
    success, msg = send_contact_email(from_name, from_email, subject, message_body)

    # Emit real-time notification
    try:
        socketio.emit('new_notification', {
            'type': 'contact',
            'title': f'New message from {from_name}',
            'message': subject,
        })
    except Exception:
        pass

    if success:
        return jsonify({"status": "ok", "message": msg})
    return jsonify({"status": "error", "message": msg}), 500


@app.route("/case-study/<int:project_id>")
def case_study(project_id):
    """Render project case study page."""
    project = None
    for p in PROJECTS:
        if p['id'] == project_id:
            project = p
            break
    if not project:
        return render_template('404.html'), 404
    return render_template("case_study.html", project=project, bio=BIO)


@app.route("/chat")
def chat_page():
    """Live chat page."""
    return render_template("chat.html", bio=BIO)


# ══════════════════════════════════════════════════════════
#  SEED DATABASE (run once)
# ══════════════════════════════════════════════════════════

@app.route("/api/seed", methods=["POST"])
def seed_database():
    """Seed MongoDB with initial data (run once)."""
    from models import skills_collection, projects_collection
    from models.user import User

    # Seed skills if empty
    if skills_collection.count_documents({}) == 0:
        for i, group in enumerate(SKILLS):
            skills_collection.insert_one({
                'title': group['title'],
                'skills': group['skills'],
                'order': i,
            })

    # Seed projects if empty
    if projects_collection.count_documents({}) == 0:
        from models.project import Project
        for i, proj in enumerate(PROJECTS):
            proj['order'] = i
            Project.create(proj)

    # Create admin user if none exists
    admin = User.find_by_email('razaasif43814@gmail.com')
    if not admin:
        User.create('Asif Raza', 'razaasif43814@gmail.com', 'admin123', role='admin')

    return jsonify({"status": "ok", "message": "Database seeded successfully!"})


# ══════════════════════════════════════════════════════════
#  RUN SERVER
# ══════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 50)
    print("  Asif Raza Portfolio -- Full-Stack App")
    print("  REST API:    http://localhost:5000/api/")
    print("  Admin Panel: http://localhost:5000/admin/")
    print("  Live Chat:   http://localhost:5000/chat")
    print("  Login:       http://localhost:5000/login")
    print("=" * 50)
    socketio.run(app, debug=Config.DEBUG, host=Config.HOST, port=Config.PORT, allow_unsafe_werkzeug=True)
