Online Course Management System
A full-stack MERN application for managing online courses, user enrollments, and student learning progress. Features role-based access control, JWT authentication, full-text course search/filtering, and progress tracking.

🚀 Features
Authentication & Authorization: Role-based access control (Student and Admin/Instructor) using JWT and bcryptjs.

Course Catalog Management: Full CRUD capabilities for courses with categories, levels, and lesson structures.

Search & Filter: Real-time course filtering by title keywords, category, and skill level using MongoDB text indexes.

Enrollments & Progress Tracking: Students can enroll in courses, mark completed lessons, and track dynamic percentage progress.

Responsive Dashboard: Dark-themed UI built with modern HTML5, CSS3, and JavaScript ES6.

🛠️ Tech Stack
Frontend: HTML5, CSS3 (Flexbox/Grid), JavaScript ES6 (Fetch API)

Backend: Node.js, Express.js

Database: MongoDB Atlas, Mongoose ODM

Security & Auth: JSON Web Tokens (JWT), bcryptjs, CORS, dotenv

Deployment: Render (Web Service for Backend, Static Site for Frontend)

📁 Repository Structure
Plaintext
online-course-system/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT & role authorization middleware
│   ├── models/
│   │   ├── Course.js        # Course schema with text indexing
│   │   ├── Enrollment.js    # Enrollment schema with progress calculation
│   │   └── User.js          # User schema (student/admin roles)
│   ├── .env                 # Local environment variables (gitignored)
│   ├── .gitignore           # Ignores node_modules and .env
│   ├── package.json         # Backend dependencies & scripts
│   ├── seed.js              # Database seed script for initial data
│   └── server.js            # Express API server & database connection
└── frontend/
    ├── app.js               # Frontend state management & API interaction
    ├── index.html           # Main dashboard layout
    └── style.css            # Custom CSS styling
    
⚡ Local Setup Guide
1. Prerequisites
Node.js (v18+)

MongoDB Atlas cluster or local MongoDB instance (mongodb://localhost:27017/course_system)

2. Clone the Repository

3. Backend Setup
Bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

4. Seed the Database
Populate initial course data and an admin account:

Bash
node seed.js
5. Start the Backend Server
Bash
npm run dev   
# or
npm start     # Runs with node

6. Frontend Setup
Open frontend/app.js and verify line 1:


📡 REST API Documentation
Authentication (/api/auth)
POST /api/auth/register — Register a student or admin user.

POST /api/auth/login — Authenticate user and return JWT token.

Courses (/api/courses)
GET /api/courses — Retrieve courses with optional query parameters (?search=, ?category=, ?level=).

POST /api/courses — Create a new course (Requires Admin JWT).

Enrollments & Progress (/api/enrollments)
POST /api/enrollments/:courseId — Enroll active student in a course (Requires Student JWT).

GET /api/enrollments/my-courses — Fetch enrolled courses with calculated progress (Requires Student JWT).

PATCH /api/enrollments/:courseId/progress — Update completed lessons and overall progress percentage (Requires Student JWT).

👤 Author
Kaushal Kumar — GitHub
