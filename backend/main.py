import os
import json
import shutil
from uuid import uuid4
from typing import Dict, List, Optional
import random
import smtplib
from email.mime.text import MIMEText
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text 

from app.db.database import engine, Base, get_db, SessionLocal
from app.db import models
from app.schemas.property import PropertyCreate, PropertyResponse
from app.schemas.user import UserRegister, UserLogin, Token
from app.core.security import hash_password, verify_password, create_access_token

# -------------------------------------------------------------------
# WebSocket Connection Manager
# -------------------------------------------------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_text(message)

manager = ConnectionManager()

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=".com API Engine",
    description="Backend services for Jahangirnagar University student housing marketplace",
    version="1.0.0"
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS Middleware (Properly placed at top to prevent blocks)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# Base & Health Endpoints
# -------------------------------------------------------------------
@app.get("/")
def read_root():
    return {"message": "Welcome to .com API Engine"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# -------------------------------------------------------------------
# Auth Endpoints
# -------------------------------------------------------------------
@app.post("/api/auth/register", response_model=Token)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    try:
        # ১. ইমেইল ইতিমধ্যে আছে কি না চেক করা
        existing_user = db.query(models.User).filter(models.User.email == payload.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে!")

        # ২. ফোন নম্বর ফাঁকা বা ডিফল্ট (01700000000) হলে ডাটাবেসে ইউনিক হওয়া সাপেক্ষে নতুন র‍্যান্ডম নম্বর তৈরি করা
        import random
        clean_phone = payload.phone
        if not clean_phone or clean_phone.strip() == "" or clean_phone == "01700000000":
            while True:
                clean_phone = f"017{random.randint(10000000, 99999999)}"
                existing_phone = db.query(models.User).filter(models.User.phone == clean_phone).first()
                if not existing_phone:
                    break
        
        raw_role = payload.role.value if hasattr(payload.role, 'value') else payload.role
        user_role = str(raw_role).upper()

        # ৩. নতুন ইউজার তৈরি করা
        new_user = models.User(
            full_name=payload.full_name,
            email=payload.email,
            phone=clean_phone,
            hashed_password=hash_password(payload.password),
            role=user_role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = create_access_token({"sub": str(new_user.id), "role": user_role})
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": new_user.id,
            "full_name": new_user.full_name,
            "role": user_role
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/api/auth/login", response_model=Token)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="ভুল ইমেইল অথবা পাসওয়ার্ড!")

    raw_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
    user_role = str(raw_role).upper()

    token = create_access_token({"sub": str(user.id), "role": user_role})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "full_name": user.full_name,
        "role": user_role
    }

# -------------------------------------------------------------------
# Property Endpoints
# -------------------------------------------------------------------
@app.get("/api/properties")
def get_properties(
    area: Optional[str] = "all",
    property_type: Optional[str] = "all",
    gender: Optional[str] = "all",
    min_price: Optional[float] = 0,
    max_price: Optional[float] = 1000000000,
    search: Optional[str] = None,
    sort_by: Optional[str] = "newest",
    db: Session = Depends(get_db)
):
    try:
        query = db.query(models.Property).filter(models.Property.status == models.PropertyStatus.APPROVED)

        if search and search.lower() != "all" and search.strip() != "":
            query = query.filter(
                (models.Property.title.ilike(f"%{search}%")) | 
                (models.Property.address.ilike(f"%{search}%"))
            )

        if area and area.lower() != "all" and area.strip() != "":
            query = query.filter(models.Property.address.ilike(f"%{area}%"))

        if property_type and property_type.lower() != "all":
            query = query.filter(models.Property.property_type == property_type)

        if gender and gender.lower() != "all":
            query = query.filter((models.Property.gender == gender) | (models.Property.gender == 'BOTH'))

        query = query.filter(models.Property.monthly_rent >= 0)
        query = query.order_by(models.Property.id.desc())

        properties = query.all()

        results = []
        for p in properties:
            status_val = p.status
            if hasattr(status_val, 'value'):
                status_val = status_val.value
            
            gender_val = p.gender
            if hasattr(gender_val, 'value'):
                gender_val = gender_val.value

            prop_type = p.property_type
            if hasattr(prop_type, 'value'):
                prop_type = prop_type.value

            owner_phone = "01700000000"
            if p.owner_id:
                owner_obj = db.query(models.User).filter(models.User.id == p.owner_id).first()
                if owner_obj and owner_obj.phone:
                    owner_phone = owner_obj.phone
            
            prop_phone = getattr(p, 'phone', None) or owner_phone

            results.append({
                "id": p.id,
                "title": getattr(p, 'title', ''),
                "description": getattr(p, 'description', ''),
                "property_type": str(prop_type or 'STUDENT_MESS'),
                "accommodation_type": getattr(p, 'accommodation_type', ''),
                "gender": str(gender_val or 'BOTH'),
                "monthly_rent": float(getattr(p, 'monthly_rent', 0)),
                "monthlyRent": float(getattr(p, 'monthly_rent', 0)),
                "address": getattr(p, 'address', ''),
                "phone": prop_phone,
                "coverImage": getattr(p, 'coverImage', '') or (p.images[0] if p.images and len(p.images) > 0 else "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"),
                "images": getattr(p, 'images', []) or [],
                "status": str(status_val or 'APPROVED')
            })

        return results
    except Exception as e:
        import traceback
        print("GET PROPERTIES ERROR:")
        traceback.print_exc()
        return []

@app.post("/api/properties")
def create_property(payload: dict, db: Session = Depends(get_db)):
    try:
        owner_id = payload.get('owner_id', 1)
        title = payload.get('title', '')
        description = payload.get('description', '')
        property_type = payload.get('property_type', 'STUDENT_MESS')
        accommodation_type = payload.get('accommodation_type', '')
        gender = payload.get('gender', 'BOTH')
        
        if gender not in ['MALE', 'FEMALE', 'BOTH']:
            gender = 'BOTH'

        monthly_rent = float(payload.get('monthly_rent', 0))
        advance_amount = float(payload.get('advance_amount', 0))
        area_id = int(payload.get('area_id', 1))
        address = payload.get('address', 'Jahangirnagar University')
        phone = payload.get('phone', '').strip()
        cover_image = payload.get('coverImage', '')
        images = payload.get('images', [])

        if phone and owner_id:
            owner_obj = db.query(models.User).filter(models.User.id == int(owner_id)).first()
            if owner_obj:
                owner_obj.phone = phone
                db.commit()

        new_property = models.Property(
            title=title,
            description=description,
            property_type=property_type,
            accommodation_type=accommodation_type,
            gender=gender,
            monthly_rent=monthly_rent,
            advance_amount=advance_amount,
            area_id=area_id,
            owner_id=int(owner_id),
            address=address,
            coverImage=cover_image,
            images=images,
            status=models.PropertyStatus.PENDING
        )
        
        db.add(new_property)
        db.commit()
        db.refresh(new_property)
        return new_property
    except Exception as e:
        db.rollback()
        print("Property Creation Server Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/properties/{property_id}")
def update_property(property_id: int, payload: dict, db: Session = Depends(get_db)):
    try:
        prop = db.query(models.Property).filter(models.Property.id == property_id).first()
        if not prop:
            raise HTTPException(status_code=404, detail="Property not found")
        
        if 'title' in payload:
            prop.title = payload['title']
        if 'description' in payload:
            prop.description = payload['description']
        if 'property_type' in payload:
            prop.property_type = payload['property_type']
        if 'accommodation_type' in payload:
            prop.accommodation_type = payload['accommodation_type']
        if 'gender' in payload:
            prop.gender = payload['gender']
        if 'monthly_rent' in payload:
            prop.monthly_rent = float(payload['monthly_rent'])
        if 'address' in payload:
            prop.address = payload['address']
        if 'coverImage' in payload:
            prop.coverImage = payload['coverImage']
            
        db.commit()
        db.refresh(prop)
        return {"message": "Property updated successfully", "property": prop}
    except Exception as e:
        db.rollback()
        print("Property Update Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/properties/{property_id}")
def delete_property(property_id: int, db: Session = Depends(get_db)):
    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    db.delete(prop)
    db.commit()
    return {"message": "Property deleted successfully"}

@app.post("/api/upload-multiple")
async def upload_multiple_images(files: List[UploadFile] = File(...)):
    image_urls = []
    for file in files:
        file_ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid4().hex}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        image_urls.append(f"http://localhost:8000/uploads/{filename}")

    return {"image_urls": image_urls}

@app.get("/api/owner/properties/{owner_id}")
def get_owner_properties(owner_id: int, db: Session = Depends(get_db)):
    try:
        return db.query(models.Property).filter(models.Property.owner_id == int(owner_id)).all()
    except Exception as e:
        print("Owner Properties Fetch Error:", e)
        return []

# -------------------------------------------------------------------
# INQUIRIES ROUTER
# -------------------------------------------------------------------
@app.get("/api/owner/inquiries/{user_id}")
def get_user_inquiries(user_id: int, db: Session = Depends(get_db)):
    try:
        current_user = db.query(models.User).filter(models.User.id == user_id).first()
        user_role = "OWNER"
        
        if current_user and hasattr(current_user, 'role') and current_user.role:
            raw_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
            user_role = str(raw_role).upper()
            
        str_user_id = str(user_id).strip()
        all_messages = db.query(models.ChatMessage).order_by(models.ChatMessage.id.desc()).all()
        inquiries_dict = {}

        is_admin = 'ADMIN' in user_role

        for msg in all_messages:
            conv_id = msg.conversation_id
            if not conv_id:
                continue

            if conv_id.startswith("admin_report_"):
                parts = conv_id.split("_")
                try:
                    pid = int(parts[2])
                    report_user_id = parts[4]
                except (IndexError, ValueError):
                    continue
                
                prop = db.query(models.Property).filter(models.Property.id == pid).first()
                reporting_user = db.query(models.User).filter(models.User.id == int(report_user_id)).first()
                
                owner_name = "Ojana Owner"
                owner_email = "N/A"
                if prop and prop.owner_id:
                    owner_user = db.query(models.User).filter(models.User.id == prop.owner_id).first()
                    if owner_user:
                        owner_name = owner_user.full_name
                        owner_email = owner_user.email
                
                if is_admin or report_user_id == str_user_id:
                    if conv_id not in inquiries_dict:
                        prop_title = prop.title if prop else f"Basa #{pid}"
                        user_name = reporting_user.full_name if reporting_user else f"User #{report_user_id}"
                        user_email = reporting_user.email if reporting_user else "N/A"
                        user_role_type = reporting_user.role if reporting_user else "USER"
                        
                        inquiries_dict[conv_id] = {
                            "property_id": pid,
                            "property_title": prop_title,
                            "owner_name": owner_name,
                            "owner_email": owner_email,
                            "reporter_name": user_name,
                            "reporter_email": user_email,
                            "reporter_role": user_role_type,
                            "conversation_id": conv_id,
                            "last_message": msg.text,
                            "timestamp": msg.timestamp
                        }
            
            elif conv_id.startswith("property_"):
                if is_admin:
                    continue 

                parts = conv_id.split("_")
                try:
                    pid = int(parts[1])
                except (IndexError, ValueError):
                    continue

                prop = db.query(models.Property).filter(models.Property.id == pid).first()
                
                is_owner_of_property = prop and prop.owner_id == user_id
                is_finder = f"finder_{str_user_id}" in conv_id or str(msg.sender).strip() == str_user_id

                if is_owner_of_property or is_finder:
                    if conv_id not in inquiries_dict:
                        inquiries_dict[conv_id] = {
                            "property_id": pid,
                            "property_title": prop.title if prop else f"Basa #{pid}",
                            "owner_name": "",
                            "owner_email": "",
                            "reporter_name": "",
                            "reporter_email": "",
                            "reporter_role": "",
                            "conversation_id": conv_id,
                            "last_message": msg.text,
                            "timestamp": msg.timestamp
                        }

        return list(inquiries_dict.values())
    except Exception as e:
        print("Inquiries Fetch Error:", e)
        return []

# -------------------------------------------------------------------
# Real-Time WebSocket & Chat History
# -------------------------------------------------------------------
@app.get("/api/chat/messages/{conversation_id}")
def get_chat_history(conversation_id: str, db: Session = Depends(get_db)):
    try:
        messages = db.query(models.ChatMessage).filter(models.ChatMessage.conversation_id == conversation_id).all()
        return [
            {
                "id": msg.id,
                "sender": msg.sender,
                "text": msg.text,
                "timestamp": msg.timestamp
            }
            for msg in messages
        ]
    except Exception as e:
        print("Chat History Error:", e)
        return []

@app.websocket("/ws/chat/{conversation_id}")
async def websocket_endpoint(websocket: WebSocket, conversation_id: str):
    await manager.connect(websocket, conversation_id)
    db = SessionLocal()
    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)

            sender = data.get("sender", "")
            text = data.get("text", "")
            timestamp = data.get("timestamp", "")

            db_msg = models.ChatMessage(
                conversation_id=conversation_id,
                sender=str(sender),
                text=text,
                timestamp=timestamp
            )
            db.add(db_msg)
            db.commit()
            db.refresh(db_msg)

            payload = json.dumps({
                "sender": sender,
                "text": text,
                "timestamp": timestamp
            })
            await manager.broadcast(payload, conversation_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, conversation_id)
    except Exception as e:
        print("WebSocket Persistence Error:", e)
        db.rollback()
    finally:
        db.close()

# -------------------------------------------------------------------
# Admin Endpoints
# -------------------------------------------------------------------
@app.get("/api/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    return {
        "total_users": db.query(models.User).count(),
        "total_properties": db.query(models.Property).count(),
        "pending_properties": db.query(models.Property).filter(models.Property.status == models.PropertyStatus.PENDING).count(),
        "approved_properties": db.query(models.Property).filter(models.Property.status == models.PropertyStatus.APPROVED).count()
    }

@app.get("/api/admin/properties/pending")
def get_pending_properties(db: Session = Depends(get_db)):
    return db.query(models.Property).filter(models.Property.status == models.PropertyStatus.PENDING).all()

@app.put("/api/admin/properties/{property_id}/approve")
def approve_property(property_id: int, db: Session = Depends(get_db)):
    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    prop.status = models.PropertyStatus.APPROVED
    db.commit()
    return {"message": "Property approved successfully"}

@app.put("/api/admin/properties/{property_id}/reject")
def reject_property(property_id: int, db: Session = Depends(get_db)):
    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    prop.status = models.PropertyStatus.REJECTED
    db.commit()
    return {"message": "Property rejected successfully"}

def fix_legacy_gender_values():
    db = SessionLocal()
    try:
        db.execute(text("UPDATE properties SET gender = 'BOTH' WHERE gender = 'ANY'"))
        db.commit()
    except Exception as e:
        db.rollback()
        print("Legacy gender fix note:", e)
    finally:
        db.close()

def setup_default_admin():
    db = SessionLocal()
    try:
        admin = db.query(models.User).filter(models.User.email == "admin@basabhara.com").first()
        if not admin:
            new_admin = models.User(
                full_name="System Admin",
                email="admin@basabhara.com",
                phone="01700000000",
                hashed_password=hash_password("admin123"),
                role="ADMIN"
            )
            db.add(new_admin)
            db.commit()
            print("Admin account created: admin@basabhara.com / admin123")
    except Exception as e:
        print("Admin setup error:", e)
        db.rollback()
    finally:
        db.close()

fix_legacy_gender_values()
setup_default_admin()

@app.get("/api/admin/users")
def get_admin_users(db: Session = Depends(get_db)):
    try:
        users = db.query(models.User).all()
        return [
            {
                "id": u.id,
                "full_name": u.full_name,
                "email": u.email,
                "phone": u.phone or '',
                "role": str(u.role.value if hasattr(u.role, 'value') else u.role).upper()
            }
            for u in users
        ]
    except Exception as e:
        print("Get Admin Users Error:", e)
        return []

@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@app.delete("/api/inquiries/{conversation_id}")
def delete_inquiry(conversation_id: str, db: Session = Depends(get_db)):
    try:
        messages = db.query(models.ChatMessage).filter(models.ChatMessage.conversation_id == conversation_id).all()
        if not messages:
            raise HTTPException(status_code=404, detail="Inquiry not found")
        
        for msg in messages:
            db.delete(msg)
        db.commit()
        return {"message": "Inquiry deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))    

@app.delete("/api/admin/inquiries/{conversation_id}")
def delete_admin_inquiry(conversation_id: str, db: Session = Depends(get_db)):
    try:
        messages = db.query(models.ChatMessage).filter(models.ChatMessage.conversation_id == conversation_id).all()
        if not messages:
            raise HTTPException(status_code=404, detail="Report or Inquiry not found")
        
        for msg in messages:
            db.delete(msg)
        db.commit()
        return {"message": "Report deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/reports/{conversation_id}")
def delete_admin_report(conversation_id: str, db: Session = Depends(get_db)):
    try:
        messages = db.query(models.ChatMessage).filter(models.ChatMessage.conversation_id == conversation_id).all()
        if not messages:
            raise HTTPException(status_code=404, detail="Report not found")
        
        for msg in messages:
            db.delete(msg)
        db.commit()
        return {"message": "Report deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------------------------------------------
# Google & OTP Auth Endpoints
# -------------------------------------------------------------------
otp_memory_store = {}
GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"

@app.post("/api/auth/google")
def google_auth(data: dict, db: Session = Depends(get_db)):
    token = data.get("token")
    selected_role = data.get("role", "ROOM_FINDER") # Front-end theke asha selected role
    try:
        if token == "mock_google_token" or not token:
            email = data.get("email", "google.user@gmail.com")
            name = data.get("full_name", "Google User")
        else:
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
            email = idinfo.get("email")
            name = idinfo.get("name", "Google User")
        
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            import random
            clean_phone = f"017{random.randint(10000000, 99999999)}"
            while db.query(models.User).filter(models.User.phone == clean_phone).first():
                clean_phone = f"017{random.randint(10000000, 99999999)}"

            user = models.User(
                full_name=name,
                email=email,
                hashed_password=hash_password("GOOGLE_AUTH_SECURE_USER"),
                role=selected_role,
                phone=clean_phone
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Jodi user age thekei thake, tahole tar role-ti notun selected role diye update kore dibo
            user.role = selected_role
            db.commit()
            db.refresh(user)
            
        token_jwt = create_access_token({"sub": str(user.id), "role": str(user.role)})

        return {
            "message": "Google login successful",
            "access_token": token_jwt,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "user_id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": str(user.role),
                "phone": user.phone
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")

@app.post("/api/auth/send-otp")
def send_email_otp(data: dict):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    otp = str(random.randint(100000, 999999))
    otp_memory_store[email] = otp
    print(f"--- [OTP FOR {email}]: {otp} ---")
    return {"message": "OTP sent successfully to your email"}

@app.post("/api/auth/verify-otp")
def verify_email_otp(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    otp = data.get("otp")
    
    if not email or not otp:
        raise HTTPException(status_code=400, detail="Email and OTP are required")
        
    stored_otp = otp_memory_store.get(email)
    if not stored_otp or stored_otp != otp:
        raise HTTPException(status_code=400, detail="ভুল বা মেয়াদোত্তীর্ণ ওটিপি কোড!")
        
    del otp_memory_store[email]
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            full_name=email.split('@')[0],
            email=email,
            hashed_password=hash_password("OTP_VERIFIED_USER"),
            role="ROOM_FINDER",
            phone="01700000000"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    token_jwt = create_access_token({"sub": str(user.id), "role": str(user.role)})

    return {
        "message": "OTP verified successfully",
        "access_token": token_jwt,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "user_id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": str(user.role),
            "phone": user.phone
        }
    }