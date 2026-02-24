from sqlalchemy import Column, String, Integer, Date, DateTime, Enum
from sqlalchemy.sql import func
from database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, nullable=False, index=True)
    date = Column(Date, nullable=False)
    status = Column(Enum("Present", "Absent", name="attendance_status"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
