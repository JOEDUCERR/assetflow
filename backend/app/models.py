import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, String, func

from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    employee = "employee"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)

    name = Column(String, nullable=True)
    emp_id = Column(String, unique=True, nullable=True, index=True)
    designation = Column(String, nullable=True)
    profile_complete = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
