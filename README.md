# Bhartiya Abhilekhan - Enterprise IMS

**Bhartiya Abhilekhan(भारतीय अभिलेखन)** is an Enterprise Inventory & Order Management System. This monorepo is containerized via Docker Compose, orchestrating a FastAPI backend (Python), PostgreSQL database, and React frontend served via Nginx.

---

## 🏗️ Architecture & Features

- **/backend**: FastAPI (Python 3.10), SQLAlchemy (PostgreSQL), Pydantic schemas, and PyOTP.
  - **Negative Inventory Constraint**: Physically enforced in-database (`CheckConstraint('quantity >= 0')`).
  - **Concurrency Security**: Row-level locking (`with_for_update()`) prevents race conditions during stock updates.
  - **Passwordless TOTP Auth**: Generates a standard secret and provisioning URL. Secure verification logs access.
- **/frontend**: React 18+ (Vite), React Router DOM (v6), Tailwind CSS v3, Axios, and Lucide React.
  - **Split-Screen Authentication**: Left-hand branding panel with real-time throughput metrics. Right-hand TOTP code grid input.
  - **Admin Workspace**: analytical dashboard widgets, CRUD catalogues for products & customers, and inventory turnover wave charts.
  - **Staff Workspace**: Read-only stock workspace, active pick list status trackers, and a 2-column order creator with inline client and quantity validation.
- **/docker-compose.yml**: Orchestrates the backend API, frontend SPA (built multi-stage & served by Nginx), and database with named volumes and start-up healthchecks.

---

## 🚀 Getting Started Locally

### 1. Configure Secrets
Create a local `.env` environment file:
```bash
cp .env.example .env
```

### 2. Launch Services
Spin up all orchestrated services using Docker Compose:
```bash
docker compose up -d --build
```
- **Web Interface**: Open [http://localhost] on port `80` or already deployed link: "https://bhartiya-abhilekhan.vercel.app/".

### 🔑 Test Authenticator Credentials (OTP)
For rapid local testing, the database is seeded on startup with two default accounts. Use Google Authenticator or another TOTP generator app:

- **System Admin**:
  - Email: `admin@bhartiya.com`
  - Administration changes from this email can be made.
- **Staff Operator**:
  - Email: `staff@bhartiya.com`
  - Normal Stock change and investment can be done through this.
  **Activation** Both emails will get activation from Google OAuth via Google Authenticator.

---

## ☁️ Cloud Deployment Guide

### Git Initialisation
```bash
git init
git add.
git commit -m "feat: initial release of Bhartiya Abhilekhan"
git branch -M main
git remote add origin https://github.com/<username>/bhartiya-abhilekhan.git
git push -u origin main
```

### Deploy Backend (Render)
- Link the `/backend` directory.
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Variables: Set `DATABASE_URL` pointing to your managed PostgreSQL, and define `JWT_SECRET`.

### Deploy Frontend (Vercel)
- Link the `/frontend` directory.
- Build command: `npm run build`
- Output Directory: `dist`
- Variables: Set `VITE_API_BASE_URL` pointing to your live backend domain URL.
