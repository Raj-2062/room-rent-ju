import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, 
    Numeric, Text, Enum as SQLEnum, Float
)
from sqlalchemy.orm import relationship
from app.db.database import Base

class UserRole(str, enum.Enum):
    HOME_OWNER = "HOME_OWNER"
    ROOM_FINDER = "ROOM_FINDER"
    ADMIN = "ADMIN"

class PropertyType(str, enum.Enum):
    FAMILY_FLAT = "FAMILY_FLAT"
    STUDENT_MESS = "STUDENT_MESS"

class GenderPreference(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    BOTH = "BOTH"

class PropertyStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    RENTED = "RENTED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.ROOM_FINDER)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class LocalArea(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    property_type = Column(SQLEnum(PropertyType), nullable=False, default=PropertyType.STUDENT_MESS)
    accommodation_type = Column(String(50), nullable=True)
    gender = Column(SQLEnum(GenderPreference), nullable=False, default=GenderPreference.MALE)
    monthly_rent = Column(Numeric(10, 2), nullable=False)
    advance_amount = Column(Numeric(10, 2), default=0.0)
    
    area_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    address = Column(String(255), nullable=True)
    latitude = Column(Float, default=23.88)
    longitude = Column(Float, default=90.26)

    status = Column(SQLEnum(PropertyStatus), default=PropertyStatus.APPROVED)
    created_at = Column(DateTime, default=datetime.utcnow)

    area = relationship("LocalArea")
    