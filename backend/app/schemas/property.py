from pydantic import BaseModel
from typing import Optional, List

class PropertyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    property_type: Optional[str] = "STUDENT_MESS"
    accommodation_type: Optional[str] = "সিঙ্গেল রুম"
    gender: Optional[str] = "MALE"
    monthly_rent: float
    advance_amount: Optional[float] = 0.0
    area_id: Optional[int] = 1
    address: Optional[str] = None
    coverImage: Optional[str] = None
    images: Optional[List[str]] = []

class PropertyResponse(PropertyCreate):
    id: int
    status: str

    class Config:
        from_attributes = True