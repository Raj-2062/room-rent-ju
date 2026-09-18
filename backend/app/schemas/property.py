from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class PropertyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    property_type: str = "STUDENT_MESS"  # "FAMILY_FLAT" or "STUDENT_MESS"
    accommodation_type: Optional[str] = "সিঙ্গেল রুম"
    gender: str = "MALE"  # "MALE", "FEMALE", "BOTH"
    monthly_rent: Decimal
    advance_amount: Optional[Decimal] = 0.0
    area_id: Optional[int] = 1
    address: Optional[str] = None

class PropertyResponse(PropertyCreate):
    id: int
    status: str

    class Config:
        from_attributes = True