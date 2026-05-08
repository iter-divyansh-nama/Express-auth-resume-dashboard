<![CDATA[<div align="center">

# 🚀 Express Auth Resume Dashboard

### A full-stack authentication system with a premium portfolio dashboard

Built with **Express.js** · **MongoDB** · **JWT** · **OTP Email Verification** · **EJS** · **Glassmorphism UI**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Authentication Flow](#-authentication-flow)
- [API Endpoints](#-api-endpoints)
- [Page Routes](#️-page-routes)
- [Database Schema](#️-database-schema)
- [UI Design](#-ui-design)
- [Email System](#-email-system)
- [Security](#-security)
- [Author](#-author)

---

## 📖 About The Project

A personal learning project built to practice **Express.js**, **MongoDB**, **JWT authentication**, **OTP email verification**, **bcrypt password hashing**, and **EJS templating**.

The app features a complete authentication flow:

> **Register → OTP Verify → Login → Portfolio Dashboard**

After logging in, users see a beautifully designed portfolio/resume dashboard with glassmorphism UI, scroll animations, and responsive design.

---

## ✨ Features

### 🔑 Authentication
- User registration with form validation (name, email, age, password)
- Bcrypt password hashing (10 salt rounds)
- 6-digit OTP sent via email after registration
- OTP auto-expires in 5 minutes with resend option
- JWT token authentication (1-hour expiry)
- HTTP-only cookie storage for tokens
- Protected dashboard route with middleware guard
- Logout with cookie clearing

### 📊 Portfolio Dashboard
- **Hero Section** — Name, title, contact chips with gradient background
- **Career Objective** — Professional summary
- **Education Timeline** — B.Tech, XII, X with CGPA/percentages
- **Skills** — Programming, Cloud (AWS/Azure), Backend, DevOps, OS & DB
- **Projects** — LMS Backend, Multi-Cloud Weather Tracking
- **Experience** — Capgemini, Koenig Solutions (R-CAT)
- **Certifications** — 9 certifications (AWS, Azure, RHCSA, GCP)
- **Achievements** — R-CAT Scholar, GSoC, SIH
- **Account Details** — User info from MongoDB
- **All Users Table** — Lists every registered user

### 🎨 Premium UI
- Glassmorphism design with frosted-glass cards
- Animated gradient blobs in background
- Scroll-triggered fade-in animations
- Sticky navbar with shadow on scroll
- Fully responsive (desktop, tablet, mobile)
- Google Fonts (Inter, Fira Code) + Font Awesome 6 icons

### 🔌 REST API
- Full CRUD for users (GET, POST, PATCH, PUT, DELETE)
- Auth endpoints (register, login, verify-otp, resend-otp, profile)
- Consistent JSON response format

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| Runtime | Node.js 18+ | JavaScript runtime |
| Framework | Express.js 5.x | Web server & routing |
| Database | MongoDB + Mongoose 9.x | Data persistence |
| Auth | jsonwebtoken | JWT-based authentication |
| Security | bcryptjs 3.x | Password hashing |
| Email | Nodemailer 8.x | OTP email (Ethereal test) |
| Templating | EJS 5.x | Server-side rendering |
| Cookies | cookie-parser | JWT cookie handling |
| Styling | Vanilla CSS | Glassmorphism UI |
| Icons | Font Awesome 6.5 | UI icons |

---

## 📁 Project Structure

```
Express-auth-resume-dashboard/
│
├── server.js              # Main app — routes, middleware, models, APIs (533 lines)
├── package.json           # Dependencies & project config
├── package-lock.json      # Locked dependency versions
├── .gitignore             # Ignores node_modules
├── README.md              # You are here
│
├── views/                 # EJS templates
│   ├── register.ejs       # Registration form
│   ├── verify-otp.ejs     # OTP input page with resend
│   ├── otp-success.ejs    # Success screen after verification
│   ├── login.ejs          # Login form
│   └── dashboard.ejs      # Protected portfolio dashboard (486 lines)
│
├── public/                # Static files
│   └── style.css          # Complete stylesheet (784 lines)
│
└── node_modules/          # Dependencies (not pushed to GitHub)
```

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017`

### Installation

```bash
# Clone the repo
git clone https://github.com/iter-divyansh-nama/Express-auth-resume-dashboard.git

# Go to project folder
cd Express-auth-resume-dashboard

# Install dependencies
npm install

# Start MongoDB (if not running)
# Windows: net start MongoDB
# macOS:   brew services start mongodb-community
# Linux:   sudo systemctl start mongod

# Start the server
node server.js
```

### ✅ Server Output

```
Connected to MongoDB successfully!
Email transporter ready (Ethereal test account)
Server running at http://localhost:3000
```

Open **http://localhost:3000** → redirects to registration page.

---

## 🔐 Authentication Flow

```
 ┌─────────────┐
 │  /register  │  User fills name, email, age, password
 └──────┬──────┘
        ▼
 ┌─────────────┐
 │ Server      │  Validates input → hashes password with bcrypt
 │ Processing  │  Generates 6-digit OTP → saves user to MongoDB
 └──────┬──────┘
        ▼
 ┌─────────────┐
 │ Send Email  │  OTP sent via Nodemailer (Ethereal test inbox)
 └──────┬──────┘
        ▼
 ┌─────────────┐
 │ /verify-otp │  User enters OTP (5-min expiry, resend available)
 └──────┬──────┘
        ▼
 ┌─────────────┐
 │ /otp-success│  Account verified! → "Go to Login" button
 └──────┬──────┘
        ▼
 ┌─────────────┐
 │   /login    │  Email + password → bcrypt compare
 └──────┬──────┘
        ▼
 ┌─────────────┐
 │ JWT Token   │  Token generated → stored in HTTP-only cookie
 └──────┬──────┘
        ▼
 ┌─────────────┐
 │ /dashboard  │  Protected route → portfolio resume page
 └─────────────┘
```

---

## 📡 API Endpoints

### Auth APIs

#### Register
```
POST /api/auth/register
```
```json
// Request Body
{
  "name": "Divyansh Nama",
  "email": "divyansh@example.com",
  "age": 22,
  "password": "securepassword"
}

// Response (201)
{
  "success": true,
  "message": "Registered! OTP sent to email.",
  "userId": "664abc...",
  "email": "divyansh@example.com",
  "otp_for_testing": "482901",
  "emailPreview": "https://ethereal.email/message/..."
}
```

#### Verify OTP
```
POST /api/auth/verify-otp
```
```json
// Request
{ "email": "divyansh@example.com", "otp": "482901" }

// Response (200)
{ "success": true, "message": "OTP verified! Account active." }
```

#### Resend OTP
```
POST /api/auth/resend-otp
```
```json
// Request
{ "email": "divyansh@example.com" }

// Response (200)
{ "success": true, "message": "New OTP sent!" }
```

#### Login
```
POST /api/auth/login
```
```json
// Request
{ "email": "divyansh@example.com", "password": "securepassword" }

// Response (200)
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "664abc...", "name": "Divyansh Nama", "email": "divyansh@example.com" }
}
```

#### Get Profile (Protected)
```
GET /api/auth/profile
Header: Authorization: Bearer <jwt_token>
```
```json
// Response (200)
{
  "success": true,
  "data": { "_id": "...", "name": "Divyansh Nama", "email": "...", "age": 22, "isVerified": true }
}
```

---

### User CRUD APIs

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/api/users` | Get all users |
| `GET` | `/api/users/:id` | Get user by ID |
| `POST` | `/api/users` | Create a new user |
| `PATCH` | `/api/users/:id` | Partial update |
| `PUT` | `/api/users/:id` | Full update |
| `DELETE` | `/api/users/:id` | Delete user |

> Passwords are auto-hashed on create/update. Sensitive fields (`password`, `otp`, `otpExpiry`) are excluded from responses.

---

## 🖥️ Page Routes

| Route | Method | Auth | Description |
|:------|:-------|:----:|:------------|
| `/` | GET | ❌ | Redirects to `/register` |
| `/register` | GET/POST | ❌ | Registration form |
| `/verify-otp` | GET/POST | ❌ | OTP verification |
| `/resend-otp` | POST | ❌ | Resend OTP email |
| `/login` | GET/POST | ❌ | Login form |
| `/dashboard` | GET | ✅ | Protected portfolio dashboard |
| `/logout` | GET | ❌ | Clear cookie & redirect to login |

---

## 🗄️ Database Schema

**Database:** `userDB` · **Collection:** `users` · **Connection:** `mongodb://127.0.0.1:27017/userDB`

```javascript
const userSchema = {
  name:       { type: String,  required: true, trim: true },
  email:      { type: String,  required: true, unique: true, lowercase: true },
  age:        { type: Number,  required: true, min: 1, max: 120 },
  password:   { type: String,  required: true, minlength: 6 },  // bcrypt hash
  otp:        { type: String,  default: null },                  // 6-digit code
  otpExpiry:  { type: Date,    default: null },                  // 5-min window
  isVerified: { type: Boolean, default: false },                 // true after OTP
  createdAt:  { type: Date,    default: Date.now }
}
```

---

## 🎨 UI Design

### Color Palette

| Color | Hex | Usage |
|:------|:----|:------|
| 🟣 Primary | `#6c5ce7` | Buttons, links, accents |
| 🟣 Primary Light | `#a29bfe` | Hover states, blobs |
| 🟢 Success | `#00b894` | Success alerts, badges |
| 🔴 Error | `#d63031` | Error alerts, logout |
| 🔵 Info | `#0984e3` | Info alerts |
| 🩷 Accent | `#fd79a8` | Background blob |

### Design Features
- **Glassmorphism** — `backdrop-filter: blur(20px)` with semi-transparent cards
- **Animated blobs** — Floating gradient circles in background
- **Scroll animations** — Intersection Observer API triggers fade-in on scroll
- **Responsive breakpoints** — `768px` (tablet) and `480px` (mobile)
- **Typography** — Inter for UI, Fira Code for code blocks

---

## 📧 Email System

Uses **[Ethereal Email](https://ethereal.email/)** — a fake SMTP service for testing. **No real emails are sent.**

**How it works:**
1. Server auto-creates an Ethereal test account on startup
2. OTP is sent as a styled HTML email to the Ethereal inbox
3. Preview URL appears in the terminal console and on the OTP page
4. Click the link to view the email with your OTP code

> 💡 **Tip:** Check your terminal for the Ethereal preview URL after registering.

---

## 🔒 Security

| Feature | Details |
|:--------|:--------|
| Password Hashing | bcrypt, 10 salt rounds |
| JWT Tokens | 1-hour expiry, signed with secret key |
| Cookie Storage | HTTP-only cookies (no JS access) |
| OTP Expiry | Auto-expires after 5 minutes |
| Input Validation | Mongoose validators + HTML5 form validation |
| Route Protection | `authenticateToken` middleware |
| Data Filtering | Passwords & OTPs never returned in API responses |
| Duplicate Prevention | Unique constraint on email |

> ⚠️ **Note:** This is a learning project. For production, use environment variables for secrets, add HTTPS, rate limiting, and a real email service.

---

## 📦 Dependencies

```
bcryptjs       ^3.0.3    →  Password hashing
cookie-parser  ^1.4.7    →  Parse JWT cookies
ejs            ^5.0.2    →  Template engine
express        ^5.2.1    →  Web framework
jsonwebtoken   ^9.0.3    →  JWT auth tokens
mongoose       ^9.6.1    →  MongoDB ODM
nodemailer     ^8.0.7    →  Email sending
```

---

## 🤝 Contributing

1. **Fork** the repo
2. **Create** feature branch → `git checkout -b feature/amazing-feature`
3. **Commit** changes → `git commit -m "Add amazing feature"`
4. **Push** → `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

Distributed under the **ISC License**.

---

## 👤 Author

### Divyansh Nama

| | |
|:--|:--|
| 💼 | Software Engineer Trainee — **Capgemini** |
| 🎓 | B.Tech (IT) — Rajasthan Technical University (CGPA: 8.64) |
| 📧 | divyanshnama2026@gmail.com |
| 🔗 | [LinkedIn](https://linkedin.com/in/divyansh-nama-39576b256/) |
| 🐙 | [GitHub](https://github.com/iter-divyansh-nama) |
| 📍 | Jaipur, Rajasthan, India |

**Certifications:**
- ☁️ AWS Solutions Architect Associate · Cloud Practitioner · AI Practitioner
- 🔷 Azure AZ-900 · AZ-104 · AZ-305 · AZ-400
- 🐧 Red Hat Certified System Administrator (RHCSA)
- 🌐 Google Cloud Associate Cloud Engineer

---

<div align="center">

⭐ **Star this repo if you found it helpful!**

Made with ❤️ by **Divyansh Nama**

</div>
]]>
