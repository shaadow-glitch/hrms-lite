from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import re

from database import get_db, engine
import models
import schemas
from fastapi.responses import RedirectResponse

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS Lite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

# ─── EMPLOYEES ────────────────────────────────────────────────────────────────

@app.get("/employees", response_model=List[schemas.EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).order_by(models.Employee.created_at.desc()).all()


@app.post("/employees", response_model=schemas.EmployeeOut, status_code=201)
def create_employee(payload: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    if not payload.employee_id.strip():
        raise HTTPException(422, "Employee ID is required")
    if not payload.full_name.strip():
        raise HTTPException(422, "Full name is required")
    if not payload.email.strip():
        raise HTTPException(422, "Email is required")
    if not EMAIL_REGEX.match(payload.email):
        raise HTTPException(422, "Invalid email format")
    if not payload.department.strip():
        raise HTTPException(422, "Department is required")

    if db.query(models.Employee).filter(models.Employee.employee_id == payload.employee_id).first():
        raise HTTPException(409, f"Employee ID '{payload.employee_id}' already exists")
    if db.query(models.Employee).filter(models.Employee.email == payload.email).first():
        raise HTTPException(409, f"Email '{payload.email}' already in use")

    emp = models.Employee(**payload.dict())
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp


@app.get("/employees/{employee_id}", response_model=schemas.EmployeeOut)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(404, "Employee not found")
    return emp


@app.delete("/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(404, "Employee not found")
    db.delete(emp)
    db.commit()


# ─── ATTENDANCE ───────────────────────────────────────────────────────────────

@app.get("/attendance", response_model=List[schemas.AttendanceOut])
def list_attendance(
    employee_id: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.Attendance)
    if employee_id:
        q = q.filter(models.Attendance.employee_id == employee_id)
    if date_from:
        q = q.filter(models.Attendance.date >= date_from)
    if date_to:
        q = q.filter(models.Attendance.date <= date_to)
    return q.order_by(models.Attendance.date.desc()).all()


@app.post("/attendance", response_model=schemas.AttendanceOut, status_code=201)
def mark_attendance(payload: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    emp = db.query(models.Employee).filter(models.Employee.employee_id == payload.employee_id).first()
    if not emp:
        raise HTTPException(404, f"Employee '{payload.employee_id}' not found")
    if payload.status not in ("Present", "Absent"):
        raise HTTPException(422, "Status must be 'Present' or 'Absent'")

    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == payload.employee_id,
        models.Attendance.date == payload.date,
    ).first()
    if existing:
        existing.status = payload.status
        db.commit()
        db.refresh(existing)
        return existing

    record = models.Attendance(**payload.dict())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@app.delete("/attendance/{record_id}", status_code=204)
def delete_attendance(record_id: int, db: Session = Depends(get_db)):
    record = db.query(models.Attendance).filter(models.Attendance.id == record_id).first()
    if not record:
        raise HTTPException(404, "Attendance record not found")
    db.delete(record)
    db.commit()


# ─── DASHBOARD ────────────────────────────────────────────────────────────────

@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    from sqlalchemy import func
    total_employees = db.query(models.Employee).count()
    today = date.today()
    present_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == "Present",
    ).count()
    absent_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.status == "Absent",
    ).count()

    dept_counts = (
        db.query(models.Employee.department, func.count(models.Employee.id))
        .group_by(models.Employee.department)
        .all()
    )

    # present days per employee
    present_per_emp = (
        db.query(models.Attendance.employee_id, func.count(models.Attendance.id))
        .filter(models.Attendance.status == "Present")
        .group_by(models.Attendance.employee_id)
        .all()
    )

    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "departments": [{"department": d, "count": c} for d, c in dept_counts],
        "present_days_per_employee": [
            {"employee_id": eid, "present_days": cnt} for eid, cnt in present_per_emp
        ],
    }
