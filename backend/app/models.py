import enum
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import relationship

from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    employee = "employee"


class AssetStatus(str, enum.Enum):
    available = "available"
    assigned = "assigned"


class AssetAction(str, enum.Enum):
    created = "created"
    assigned = "assigned"
    returned = "returned"
    manual_assigned = "manual_assigned"
    manual_returned = "manual_returned"


class AssetRequestStatus(str, enum.Enum):
    pending = "Pending"
    approved = "Approved"
    rejected = "Rejected"


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

    assigned_assets = relationship("Asset", back_populates="assigned_to")
    asset_requests = relationship("AssetRequest", back_populates="employee")


class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    asset_name = Column(String, nullable=False)
    asset_location_id = Column(String, nullable=False, index=True)
    asset_serial_no = Column(String, unique=True, nullable=False, index=True)
    category = Column(String, nullable=False, default="", server_default="")
    manufacturer = Column(String, nullable=False, default="", server_default="")
    model = Column(String, nullable=False, default="", server_default="")
    qr_token = Column(String, unique=True, nullable=False, index=True)
    status = Column(
        Enum(AssetStatus),
        default=AssetStatus.available,
        nullable=False,
    )
    assigned_to_id = Column(String, ForeignKey("users.id"), nullable=True)
    assigned_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    assigned_to = relationship("User", back_populates="assigned_assets")
    requests = relationship("AssetRequest", back_populates="requested_asset")
    history = relationship(
        "AssetHistory",
        back_populates="asset",
        order_by="desc(AssetHistory.created_at)",
    )


class AssetRequest(Base):
    __tablename__ = "asset_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    employee_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String, nullable=False)
    requested_asset_id = Column(String, ForeignKey("assets.id"), nullable=True)
    purpose = Column(String, nullable=False)
    expected_duration = Column(String, nullable=True)
    status = Column(
        Enum(AssetRequestStatus),
        default=AssetRequestStatus.pending,
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("User", back_populates="asset_requests")
    requested_asset = relationship("Asset", back_populates="requests")


class AssetHistory(Base):
    __tablename__ = "asset_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False, index=True)
    action = Column(Enum(AssetAction), nullable=False)
    performed_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    employee_id = Column(String, nullable=True)
    employee_name = Column(String, nullable=True)
    notes = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    asset = relationship("Asset", back_populates="history")
    performed_by = relationship("User")
