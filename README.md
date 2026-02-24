# HRMS Lite — Human Resource Management System

A lightweight, production-ready HR management system for managing employees and tracking attendance.

---

## ⚠️ Important Note on Loading Time

This app is hosted on **Render's free tier**. 
The backend server spins down after inactivity and may take **50-60 seconds to wake up** on the first request.

If the dashboard appears stuck on loading:
- Simply **wait 60 seconds**
- Then **refresh the page**
- It will work normally after the initial wake-up

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router v6, Vite   |
| Backend    | Python, FastAPI                   |
| Database   | SQLite (dev) / PostgreSQL (prod)  |
| Deployment | Vercel (frontend), Render (backend)|

---

## Features

- **Employee Management** — Add, view, delete employees with validation and duplicate detection
- **Attendance Tracking** — Mark Present/Absent per day per employee; update existing records
- **Dashboard** — Live stats: total employees, present/absent today, department breakdown, attendance summary
- **Filters** — Filter attendance by employee and date range
- **UI/UX** — Dark professional theme, loading/empty/error states, toast notifications, modal dialogs

---

## Project Structure

```
hrms-lite/
├── backend/
│   ├── main.py          # FastAPI routes & business logic
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── database.py      # DB engine setup
│   ├── requirements.txt
│   └── render.yaml      # Render deployment config
└── frontend/
    ├── src/
    │   ├── api/client.js          # Centralized API calls
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── Modal.jsx
    │   │   └── Toast.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Employees.jsx
    │   │   └── Attendance.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css      # Full design system
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Running Locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # Edit if needed
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
cp .env.example .env.local  # Set VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

App available at: `http://localhost:5173`

---

## Deployment

### Backend → Render

1. Push `backend/` folder to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable `DATABASE_URL` (PostgreSQL connection string from Render DB)
6. Deploy

### Frontend → Vercel

1. Push `frontend/` folder to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set environment variable: `VITE_API_URL=https://your-render-backend-url.onrender.com`
4. Deploy

---

## API Endpoints

| Method | Endpoint                   | Description                          |
|--------|----------------------------|--------------------------------------|
| GET    | `/employees`               | List all employees                   |
| POST   | `/employees`               | Create employee                      |
| GET    | `/employees/{id}`          | Get employee by ID                   |
| DELETE | `/employees/{id}`          | Delete employee                      |
| GET    | `/attendance`              | List attendance (filterable)         |
| POST   | `/attendance`              | Mark attendance (upsert by day)      |
| DELETE | `/attendance/{id}`         | Delete attendance record             |
| GET    | `/dashboard`               | Summary stats                        |

---

## Assumptions & Limitations

- **Single admin** — No authentication required (per spec)
- **SQLite** used for local dev; switch to PostgreSQL for production via `DATABASE_URL`
- Attendance records are **upserted** — marking the same employee+date twice updates the status
- Employee deletion does **not** cascade to attendance (records remain but employee name shows "—")
- No pagination on tables (suitable for the expected scale of this demo)
