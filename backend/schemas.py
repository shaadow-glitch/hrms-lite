from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: str
    department: str


class EmployeeOut(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime

    class Config:
        from_attributes = True


class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: str


class AttendanceOut(BaseModel):
    id: int
    employee_id: str
    date: date
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
