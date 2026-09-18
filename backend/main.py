import json
from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import Database Engine & Models
from app.db.database import engine, Base, get_db
from app.db import models

# Automatically create all tables on server startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="বাসা ভাড়া.com API",
    description="Backend services for Jahangirnagar University student housing rental marketplace",
    version="1.0.0"
)

# Allow requests from Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Connection Manager for Property-Linked Chat
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, conversation_id: int, websocket: WebSocket):
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append(websocket)

    def disconnect(self, conversation_id: int, websocket: WebSocket):
        if conversation_id in self.active_connections:
            self.active_connections[conversation_id].remove(websocket)
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]

    async def broadcast(self, conversation_id: int, payload: dict):
        if conversation_id in self.active_connections:
            for connection in self.active_connections[conversation_id]:
                await connection.send_text(json.dumps(payload))

manager = ConnectionManager()

@app.get("/")
def read_root():
    return {"message": "Welcome to বাসা ভাড়া.com API Engine"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "বাসা ভাড়া.com Backend"}

# Fetch properties with local area filtering
@app.get("/api/properties")
def get_properties(area: Optional[str] = Query('all'), db: Session = Depends(get_db)):
    query = db.query(models.Property)
    if area != 'all':
        query = query.join(models.LocalArea).filter(models.LocalArea.name.ilike(f"%{area}%"))
    
    properties = query.all()
    return properties

# Real-time WebSocket Endpoint
@app.websocket("/ws/chat/{conversation_id}")
async def chat_websocket(websocket: WebSocket, conversation_id: int):
    await manager.connect(conversation_id, websocket)
    try:
        while True:
            raw_data = await websocket.receive_text()
            payload = json.loads(raw_data)
            await manager.broadcast(conversation_id, payload)
    except WebSocketDisconnect:
        manager.disconnect(conversation_id, websocket)


# Add this import at the top of backend/main.py
from app.schemas.property import PropertyCreate, PropertyResponse

# Property Creation Endpoint
@app.post("/api/properties", response_model=PropertyResponse)
def create_property(payload: PropertyCreate, db: Session = Depends(get_db)):
    new_property = models.Property(
        title=payload.title,
        description=payload.description,
        property_type=payload.property_type,
        accommodation_type=payload.accommodation_type,
        gender=payload.gender,
        monthly_rent=payload.monthly_rent,
        advance_amount=payload.advance_amount,
        area_id=payload.area_id,
        address=payload.address,
        status=models.PropertyStatus.APPROVED # Auto-approve for local dev testing
    )
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    return new_property


from fastapi import HTTPException, status
from app.schemas.user import UserRegister, UserLogin, Token
from app.core.security import hash_password, verify_password, create_access_token

@app.post("/api/auth/register", response_model=Token)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    # Check existing user
    existing_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="এই ইমেইলটি ইতিমধ্যে নিবন্ধিত হয়েছে।")

    new_user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        role=payload.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "role": new_user.role.value})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "full_name": new_user.full_name,
        "role": new_user.role.value
    }

@app.post("/api/auth/login", response_model=Token)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "full_name": user.full_name,
        "role": user.role.value
    }

from sqlalchemy import asc, desc

# Updated GET /api/properties endpoint with multi-criteria filtering & sorting
@app.get("/api/properties")
def get_properties(
    area: Optional[str] = Query('all'),
    property_type: Optional[str] = Query('all'),
    gender: Optional[str] = Query('all'),
    min_price: Optional[float] = Query(0),
    max_price: Optional[float] = Query(100000),
    sort_by: Optional[str] = Query('newest'), # 'newest', 'price_low', 'price_high'
    db: Session = Depends(get_db)
):
    query = db.query(models.Property).filter(
        models.Property.status == models.PropertyStatus.APPROVED,
        models.Property.monthly_rent >= min_price,
        models.Property.monthly_rent <= max_price
    )

    # Area Filter
    if area != 'all':
        query = query.join(models.LocalArea).filter(models.LocalArea.name.ilike(f"%{area}%"))

    # Property Type Filter (STUDENT_MESS / FAMILY_FLAT)
    if property_type != 'all':
        query = query.filter(models.Property.property_type == property_type)

    # Gender Preference Filter
    if gender != 'all':
        query = query.filter(models.Property.gender == gender)

    # Sorting Logic
    if sort_by == 'price_low':
        query = query.order_by(asc(models.Property.monthly_rent))
    elif sort_by == 'price_high':
        query = query.order_by(desc(models.Property.monthly_rent))
    else:
        query = query.order_by(desc(models.Property.created_at))

    return query.all()