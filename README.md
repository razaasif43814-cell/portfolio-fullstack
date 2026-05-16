# 🚀 Asif Raza — Full-Stack Portfolio Application

![Flask](https://img.shields.io/badge/Flask-3.0-blue?logo=flask)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?logo=jsonwebtokens)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black?logo=socketdotio)
![Python](https://img.shields.io/badge/Python-3.9+-yellow?logo=python)

> A production-ready full-stack portfolio website with JWT authentication, admin panel, real-time chat, REST API, MongoDB integration, and complete CRUD operations.

---

## ✨ Features

### 🔐 Authentication System
- User registration & login with bcrypt password hashing
- JWT token-based authentication
- Forgot password with email reset link
- Role-based access control (Admin / User)
- Protected routes with middleware decorators

### 🌐 REST API (Full CRUD)
- `GET / POST / PUT / DELETE` for Projects, Skills, Blogs
- `GET / DELETE` for Messages, Users (admin only)
- Input validation & sanitization
- Proper error responses (400, 401, 403, 404, 500)
- Pagination support on all list endpoints

### 👨‍💼 Admin Panel
- Dashboard with live statistics
- User management (view, change roles, delete)
- Project management (add, edit, delete with image URLs)
- Contact messages viewer (read/unread, delete)
- Blog CMS (draft/publish workflow)

### ⚡ Real-time Features
- Live chat using Socket.IO (WebSocket)
- Typing indicators
- Online user count
- Real-time notification bell in admin panel
- Chat message history stored in MongoDB

### 📝 Project Case Studies
Each project includes a detailed case study page with:
- Problem statement
- Key features list
- Challenges faced
- What I learned

### 🎨 Frontend
- 3D animated splash screen (16 languages)
- 4 color themes (Purple, Orange, Rose, Red)
- 8 language translations
- Responsive design (mobile-first)
- Glassmorphism UI with smooth animations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Flask (Python) |
| **Database** | MongoDB (PyMongo) |
| **Auth** | JWT + bcrypt |
| **Real-time** | Flask-SocketIO |
| **Frontend** | HTML5, CSS3, JavaScript |
| **Email** | Gmail SMTP |
| **API** | RESTful architecture |

---

## 📁 Project Structure

```
flask_portfolio/
├── app.py                  # Main Flask app with SocketIO
├── config.py               # Environment variable configuration
├── .env                    # Secrets (gitignored)
├── .env.example            # Environment template
├── requirements.txt        # Python dependencies
│
├── models/                 # MongoDB models
│   ├── user.py             # User (auth, CRUD, roles)
│   ├── project.py          # Projects (with case studies)
│   ├── message.py          # Contact messages
│   └── blog.py             # Blog CMS
│
├── routes/                 # API endpoints (Blueprints)
│   ├── auth.py             # Login, Signup, Forgot Password
│   ├── api.py              # REST API (CRUD operations)
│   ├── admin.py            # Admin panel pages
│   └── chat.py             # Socket.IO chat events
│
├── middleware/             # Request middleware
│   └── validators.py       # Input validation decorators
│
├── utils/                  # Helper utilities
│   ├── jwt_helper.py       # JWT generation & verification
│   ├── email_helper.py     # SMTP email functions
│   └── error_handler.py    # Centralized error handling
│
├── templates/              # HTML templates
│   ├── index.html          # Portfolio homepage
│   ├── login.html          # Login page
│   ├── signup.html         # Registration page
│   ├── forgot_password.html
│   ├── case_study.html     # Project case study
│   ├── chat.html           # Live chat room
│   └── admin/
│       ├── dashboard.html  # Admin stats overview
│       ├── users.html      # User management
│       ├── projects.html   # Project CRUD
│       ├── messages.html   # Contact messages
│       └── blogs.html      # Blog CMS
│
└── static/
    ├── css/
    │   ├── style.css       # Main portfolio styles
    │   ├── auth.css        # Auth page styles
    │   └── admin.css       # Admin panel styles
    ├── js/
    │   ├── main.js         # Portfolio interactions
    │   ├── auth.js         # Auth form handling
    │   └── admin.js        # Admin panel logic
    └── images/
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- MongoDB (running locally or MongoDB Atlas)
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/razaasif43814-cell/3d-portfolio-website.git
cd 3d-portfolio-website/flask_portfolio

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
copy .env.example .env
# Edit .env with your values

# 5. Start MongoDB
# Make sure MongoDB is running on localhost:27017

# 6. Run the application
python app.py

# 7. Seed the database (run once)
# POST http://localhost:5000/api/seed
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key | `dev-secret-key` |
| `JWT_SECRET` | JWT signing key | `jwt-secret-key` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/portfolio` |
| `GMAIL_USER` | Gmail address for SMTP | — |
| `GMAIL_PASS` | Gmail App Password | — |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | ❌ | Register user |
| `POST` | `/api/auth/login` | ❌ | Login |
| `POST` | `/api/auth/forgot-password` | ❌ | Send reset email |
| `POST` | `/api/auth/reset-password` | ❌ | Reset password |
| `GET` | `/api/auth/me` | ✅ | Current user |
| `GET` | `/api/projects` | ❌ | List projects |
| `POST` | `/api/projects` | ✅ Admin | Create project |
| `PUT` | `/api/projects/:id` | ✅ Admin | Update project |
| `DELETE` | `/api/projects/:id` | ✅ Admin | Delete project |
| `GET` | `/api/skills` | ❌ | List skills |
| `GET` | `/api/messages` | ✅ Admin | List messages |
| `GET` | `/api/users` | ✅ Admin | List users |
| `GET` | `/api/blogs` | ❌ | Published blogs |
| `GET` | `/api/stats` | ✅ Admin | Dashboard stats |

---

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Browser    │────▶│   Flask App      │────▶│  MongoDB    │
│  (Frontend)  │◀────│  + Socket.IO     │◀────│  Database   │
└──────────────┘     │  + REST API      │     └─────────────┘
                     │  + JWT Middleware │
                     └──────────────────┘
```

---

## 👨‍💻 Author

**Asif Raza** — BCA Student | Full-Stack Developer

- GitHub: [@razaasif43814-cell](https://github.com/razaasif43814-cell)
- LinkedIn: [Asif Raza](https://www.linkedin.com/in/asif-raza-605987338)
- Email: razaasif43814@gmail.com

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
