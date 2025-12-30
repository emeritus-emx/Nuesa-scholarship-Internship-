"""Initial database seeding with sample data."""
from database import SessionLocal, init_db
from models import User, Opportunity, OpportunityType, Sponsorship
from security import hash_password
from datetime import datetime, timedelta


def seed_database():
    """Seed database with sample data for development."""
    init_db()
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(User).count() > 0:
            print("Database already seeded, skipping...")
            return
        
        print("Seeding database with sample data...")
        
        # Create admin user
        admin = User(
            email="admin@nuesa.com",
            full_name="Admin User",
            hashed_password=hash_password("AdminPassword123!"),
            phone="+1234567890",
            bio="NUESA Platform Administrator",
            is_admin=True,
            is_verified=True,
            is_active=True
        )
        db.add(admin)
        
        # Create regular users
        user1 = User(
            email="student@example.com",
            full_name="John Doe",
            hashed_password=hash_password("StudentPassword123!"),
            phone="+1234567891",
            bio="Computer Science Student",
            is_verified=True,
            is_active=True
        )
        
        user2 = User(
            email="researcher@example.com",
            full_name="Jane Smith",
            hashed_password=hash_password("ResearchPassword123!"),
            phone="+1234567892",
            bio="Graduate Researcher",
            is_verified=True,
            is_active=True
        )
        
        db.add_all([user1, user2])
        db.flush()
        
        # Create sample opportunities
        now = datetime.utcnow()
        
        opp1 = Opportunity(
            title="Google Scholarship 2025 - Tech Leaders",
            description="Full-ride scholarship for exceptional students pursuing computer science, software engineering, or related fields.",
            opportunity_type=OpportunityType.SCHOLARSHIP,
            organization="Google",
            organization_logo="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
            amount=50000.00,
            currency="USD",
            deadline=now + timedelta(days=60),
            eligibility_criteria="Must be a full-time student with minimum 3.5 GPA, pursuing degree in STEM field",
            requirements="Essay submission, transcripts, letters of recommendation",
            location="Remote",
            duration="1-4 years",
            application_url="https://google.com/scholarships",
            is_featured=True,
            is_active=True,
            rating=4.8
        )
        
        opp2 = Opportunity(
            title="Microsoft Internship Program 2025",
            description="Paid summer internship at Microsoft offices worldwide. Work on innovative projects with experienced mentors.",
            opportunity_type=OpportunityType.INTERNSHIP,
            organization="Microsoft",
            organization_logo="https://www.microsoft.com/favicon.ico",
            amount=25000.00,
            currency="USD",
            deadline=now + timedelta(days=45),
            eligibility_criteria="Currently enrolled in undergraduate or graduate program, majoring in CS, EE, or related field",
            requirements="Resume, cover letter, coding assessment",
            location="Redmond, WA",
            duration="12 weeks",
            application_url="https://microsoft.com/internships",
            is_featured=True,
            is_active=True,
            rating=4.9
        )
        
        opp3 = Opportunity(
            title="Fulbright Scholarship - International",
            description="Prestigious international scholarship for graduate study and research abroad.",
            opportunity_type=OpportunityType.SCHOLARSHIP,
            organization="Fulbright Program",
            amount=100000.00,
            currency="USD",
            deadline=now + timedelta(days=90),
            eligibility_criteria="US Citizens, at least Bachelor's degree, English proficiency",
            requirements="Statement of purpose, academic records, references",
            location="Multiple Countries",
            duration="1-2 years",
            is_featured=True,
            is_active=True,
            rating=4.7
        )
        
        opp4 = Opportunity(
            title="Data Science Internship - Amazon",
            description="Work with Amazon's data science team on real-world machine learning projects.",
            opportunity_type=OpportunityType.INTERNSHIP,
            organization="Amazon",
            amount=22000.00,
            currency="USD",
            deadline=now + timedelta(days=30),
            eligibility_criteria="Junior/Senior status in undergraduate or graduate program",
            requirements="Resume, portfolio, technical interview",
            location="Seattle, WA; New York, NY; San Francisco, CA",
            duration="12-16 weeks",
            application_url="https://amazon.com/internships",
            is_active=True,
            rating=4.6
        )
        
        db.add_all([opp1, opp2, opp3, opp4])
        db.flush()
        
        # Create sample sponsorships
        spon1 = Sponsorship(
            title="Tech Company Leadership Program",
            organization="Meta (Facebook)",
            description="Mentorship and sponsorship for underrepresented students in tech.",
            amount=5000.00,
            duration="1 academic year",
            requirements="Being part of an underrepresented group in technology, commitment to mentorship",
            contact_email="diversity@meta.com",
            website="https://meta.com/diversity",
            is_active=True
        )
        
        spon2 = Sponsorship(
            title="Women in Engineering Sponsorship",
            organization="IEEE",
            description="Financial and networking support for women pursuing engineering degrees.",
            amount=3000.00,
            duration="1 academic year",
            requirements="Female student, enrolled in engineering program",
            contact_email="wie@ieee.org",
            website="https://ieee.org/women",
            is_active=True
        )
        
        db.add_all([spon1, spon2])
        
        # Commit all changes
        db.commit()
        print("✅ Database seeded successfully!")
        print(f"  - Created 1 admin user and 2 regular users")
        print(f"  - Added 4 opportunities")
        print(f"  - Added 2 sponsorships")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
