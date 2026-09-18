from app.db.database import SessionLocal, engine, Base
from app.db import models

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Add initial JU areas if missing
areas = ["Ambagan", "Islamnagar", "Gerua", "Pandhoa", "C&B Gate"]
for area_name in areas:
    existing = db.query(models.LocalArea).filter_by(name=area_name).first()
    if not existing:
        db.add(models.LocalArea(name=area_name, latitude=23.88, longitude=90.26))

db.commit()
db.close()
print("JU campus areas seeded successfully!")