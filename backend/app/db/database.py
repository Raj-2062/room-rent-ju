import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# প্রজেক্টের মূল ফোল্ডারের সঠিক অ্যাবসোলিউট পাথ বের করা হলো, 
# যাতে টার্মিনাল যেখান থেকেই রান করা হোক না কেন ডাটাবেজ ফাইল একটাই থাকে।
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
db_path = os.path.join(BASE_DIR, "basabhara.db")

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path}")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get DB session in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()