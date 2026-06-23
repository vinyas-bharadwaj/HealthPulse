import os
import sys

# Ensure the app module can be imported when running as a script
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.hospital import Hospital, HospitalDistance

dummy_hospitals = [
    # Existing
    {"name": "City General Hospital", "address": "123 Main St", "city": "Metropolis", "latitude": 40.7128, "longitude": -74.0060, "total_beds": 500, "available_beds": 120, "icu_beds_total": 50, "icu_beds_available": 15, "ventilators_total": 30, "ventilators_available": 5, "oxygen_cylinders": 100, "blood_units_a_plus": 45, "blood_units_b_plus": 30, "blood_units_o_plus": 60, "blood_units_ab_plus": 10},
    {"name": "Mercy Medical Center", "address": "456 Oak Avenue", "city": "Metropolis", "latitude": 40.7306, "longitude": -73.9352, "total_beds": 300, "available_beds": 80, "icu_beds_total": 30, "icu_beds_available": 8, "ventilators_total": 20, "ventilators_available": 2, "oxygen_cylinders": 50, "blood_units_a_plus": 25, "blood_units_b_plus": 20, "blood_units_o_plus": 40, "blood_units_ab_plus": 5},
    {"name": "St. Jude's Care", "address": "789 Pine Road", "city": "Gotham", "latitude": 40.7891, "longitude": -73.9502, "total_beds": 400, "available_beds": 200, "icu_beds_total": 40, "icu_beds_available": 25, "ventilators_total": 25, "ventilators_available": 15, "oxygen_cylinders": 150, "blood_units_a_plus": 55, "blood_units_b_plus": 35, "blood_units_o_plus": 80, "blood_units_ab_plus": 20},
    # CRITICAL SHORTAGE
    {"name": "Lakeside Health", "address": "101 Waterway Blvd", "city": "Star City", "latitude": 40.7589, "longitude": -73.9851, "total_beds": 200, "available_beds": 2, "icu_beds_total": 20, "icu_beds_available": 0, "ventilators_total": 15, "ventilators_available": 0, "oxygen_cylinders": 5, "blood_units_a_plus": 2, "blood_units_b_plus": 1, "blood_units_o_plus": 3, "blood_units_ab_plus": 0},
    {"name": "Central Hospital", "address": "202 Center St", "city": "Central City", "latitude": 40.6782, "longitude": -73.9442, "total_beds": 600, "available_beds": 250, "icu_beds_total": 80, "icu_beds_available": 40, "ventilators_total": 40, "ventilators_available": 20, "oxygen_cylinders": 200, "blood_units_a_plus": 60, "blood_units_b_plus": 45, "blood_units_o_plus": 85, "blood_units_ab_plus": 30},
    {"name": "Sunrise Medical", "address": "505 Sunrise Ave", "city": "Coast City", "latitude": 40.8296, "longitude": -73.9262, "total_beds": 250, "available_beds": 50, "icu_beds_total": 25, "icu_beds_available": 5, "ventilators_total": 10, "ventilators_available": 2, "oxygen_cylinders": 60, "blood_units_a_plus": 20, "blood_units_b_plus": 10, "blood_units_o_plus": 30, "blood_units_ab_plus": 5},
    # NEW HOSPITALS
    {"name": "Northshore Wellness", "address": "88 Northshore Dr", "city": "North City", "latitude": 40.8500, "longitude": -73.8500, "total_beds": 350, "available_beds": 150, "icu_beds_total": 35, "icu_beds_available": 20, "ventilators_total": 20, "ventilators_available": 12, "oxygen_cylinders": 120, "blood_units_a_plus": 40, "blood_units_b_plus": 25, "blood_units_o_plus": 50, "blood_units_ab_plus": 15},
    # CRITICAL SHORTAGE
    {"name": "Southside Trauma Center", "address": "99 South St", "city": "South City", "latitude": 40.6000, "longitude": -73.9000, "total_beds": 450, "available_beds": 5, "icu_beds_total": 60, "icu_beds_available": 1, "ventilators_total": 35, "ventilators_available": 1, "oxygen_cylinders": 10, "blood_units_a_plus": 5, "blood_units_b_plus": 2, "blood_units_o_plus": 4, "blood_units_ab_plus": 1},
    {"name": "East End Clinic", "address": "400 East Rd", "city": "East City", "latitude": 40.7400, "longitude": -73.8000, "total_beds": 150, "available_beds": 60, "icu_beds_total": 15, "icu_beds_available": 8, "ventilators_total": 10, "ventilators_available": 6, "oxygen_cylinders": 40, "blood_units_a_plus": 15, "blood_units_b_plus": 10, "blood_units_o_plus": 20, "blood_units_ab_plus": 5},
    # SURPLUS
    {"name": "Westview Regional", "address": "777 West Ave", "city": "West City", "latitude": 40.7600, "longitude": -74.1000, "total_beds": 550, "available_beds": 300, "icu_beds_total": 70, "icu_beds_available": 45, "ventilators_total": 50, "ventilators_available": 35, "oxygen_cylinders": 300, "blood_units_a_plus": 100, "blood_units_b_plus": 70, "blood_units_o_plus": 120, "blood_units_ab_plus": 40},
    {"name": "Pioneer Health", "address": "12 Pioneer Way", "city": "Metropolis", "latitude": 40.7000, "longitude": -74.0500, "total_beds": 220, "available_beds": 40, "icu_beds_total": 22, "icu_beds_available": 4, "ventilators_total": 12, "ventilators_available": 2, "oxygen_cylinders": 30, "blood_units_a_plus": 12, "blood_units_b_plus": 8, "blood_units_o_plus": 15, "blood_units_ab_plus": 3},
    # CRITICAL SHORTAGE
    {"name": "Valley Care", "address": "333 Valley Rd", "city": "Gotham", "latitude": 40.8100, "longitude": -73.9000, "total_beds": 280, "available_beds": 8, "icu_beds_total": 28, "icu_beds_available": 0, "ventilators_total": 14, "ventilators_available": 0, "oxygen_cylinders": 8, "blood_units_a_plus": 4, "blood_units_b_plus": 2, "blood_units_o_plus": 5, "blood_units_ab_plus": 1},
]

dummy_distances = [
    (1, 2, 5.2), (1, 3, 15.4), (2, 4, 20.1), (3, 5, 12.0), (4, 5, 18.5), (5, 6, 25.3), (2, 6, 30.0),
    (7, 3, 8.5), (8, 5, 6.2), (9, 2, 10.4), (10, 1, 9.1), (11, 1, 3.5), (12, 6, 7.8),
    (10, 4, 15.0), (10, 8, 22.0), (7, 12, 11.2), (5, 8, 4.5), (9, 4, 18.3)
]

def seed_data():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Clear out existing hospitals and distances to ensure a fresh, intuitive demo
        db.query(HospitalDistance).delete()
        db.query(Hospital).delete()
        db.commit()

        hospitals = []
        for data in dummy_hospitals:
            hospital = Hospital(**data)
            db.add(hospital)
            hospitals.append(hospital)
        
        db.commit()
        
        for hospital in hospitals:
            db.refresh(hospital)
            
        distances = []
        for src, tgt, dist in dummy_distances:
            distance = HospitalDistance(
                source_hospital_id=hospitals[src-1].id,
                target_hospital_id=hospitals[tgt-1].id,
                distance=dist
            )
            db.add(distance)
            distances.append(distance)
            
        db.commit()
        print(f"Successfully seeded {len(hospitals)} dummy hospitals and {len(distances)} distances into the database.")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
