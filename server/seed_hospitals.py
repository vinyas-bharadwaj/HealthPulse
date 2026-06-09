import os
import sys

# Ensure the app module can be imported when running as a script
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.hospital import Hospital

dummy_hospitals = [
    {
        "name": "City General Hospital",
        "address": "123 Main St",
        "city": "Metropolis",
        "total_beds": 500,
        "available_beds": 120,
        "icu_beds_total": 50,
        "icu_beds_available": 15,
        "ventilators_total": 30,
        "ventilators_available": 5,
        "oxygen_cylinders": 100,
        "blood_units_a_plus": 45,
        "blood_units_b_plus": 30,
        "blood_units_o_plus": 60,
        "blood_units_ab_plus": 10,
    },
    {
        "name": "Mercy Medical Center",
        "address": "456 Oak Avenue",
        "city": "Metropolis",
        "total_beds": 300,
        "available_beds": 80,
        "icu_beds_total": 30,
        "icu_beds_available": 8,
        "ventilators_total": 20,
        "ventilators_available": 2,
        "oxygen_cylinders": 50,
        "blood_units_a_plus": 25,
        "blood_units_b_plus": 20,
        "blood_units_o_plus": 40,
        "blood_units_ab_plus": 5,
    },
    {
        "name": "St. Jude's Care",
        "address": "789 Pine Road",
        "city": "Gotham",
        "total_beds": 400,
        "available_beds": 200,
        "icu_beds_total": 40,
        "icu_beds_available": 25,
        "ventilators_total": 25,
        "ventilators_available": 15,
        "oxygen_cylinders": 150,
        "blood_units_a_plus": 55,
        "blood_units_b_plus": 35,
        "blood_units_o_plus": 80,
        "blood_units_ab_plus": 20,
    },
    {
        "name": "Lakeside Health",
        "address": "101 Waterway Blvd",
        "city": "Star City",
        "total_beds": 200,
        "available_beds": 10,
        "icu_beds_total": 20,
        "icu_beds_available": 0,
        "ventilators_total": 15,
        "ventilators_available": 0,
        "oxygen_cylinders": 20,
        "blood_units_a_plus": 10,
        "blood_units_b_plus": 15,
        "blood_units_o_plus": 20,
        "blood_units_ab_plus": 2,
    }
]

def seed_data():
    db = SessionLocal()
    try:
        # Check if we already have data
        count = db.query(Hospital).count()
        if count > 0:
            print(f"Database already contains {count} hospitals. Skipping seed.")
            return

        for data in dummy_hospitals:
            hospital = Hospital(**data)
            db.add(hospital)
        
        db.commit()
        print(f"Successfully seeded {len(dummy_hospitals)} dummy hospitals into the database.")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
