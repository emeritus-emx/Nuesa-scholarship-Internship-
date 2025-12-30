"""Example tests for NUESA backend."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import get_db
from models import Base, User
from security import hash_password

# Create test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override database for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


class TestAuth:
    """Test authentication endpoints."""

    def test_register_user(self):
        """Test user registration."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "test@example.com",
                "full_name": "Test User",
                "password": "TestPassword123!",
            },
        )
        assert response.status_code == 200
        assert response.json()["email"] == "test@example.com"
        assert response.json()["full_name"] == "Test User"

    def test_register_duplicate_email(self):
        """Test registration with duplicate email."""
        # Register first user
        client.post(
            "/api/auth/register",
            json={
                "email": "duplicate@example.com",
                "full_name": "User One",
                "password": "TestPassword123!",
            },
        )

        # Try to register with same email
        response = client.post(
            "/api/auth/register",
            json={
                "email": "duplicate@example.com",
                "full_name": "User Two",
                "password": "TestPassword123!",
            },
        )
        assert response.status_code == 409
        assert "already registered" in response.json()["detail"].lower()

    def test_login_success(self):
        """Test successful login."""
        # Register user
        client.post(
            "/api/auth/register",
            json={
                "email": "login@example.com",
                "full_name": "Login User",
                "password": "TestPassword123!",
            },
        )

        # Login
        response = client.post(
            "/api/auth/login",
            json={
                "email": "login@example.com",
                "password": "TestPassword123!",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_password(self):
        """Test login with invalid password."""
        # Register user
        client.post(
            "/api/auth/register",
            json={
                "email": "password@example.com",
                "full_name": "Password Test",
                "password": "TestPassword123!",
            },
        )

        # Try login with wrong password
        response = client.post(
            "/api/auth/login",
            json={
                "email": "password@example.com",
                "password": "WrongPassword123!",
            },
        )
        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()

    def test_weak_password(self):
        """Test registration with weak password."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "weak@example.com",
                "full_name": "Weak Pass",
                "password": "weak",  # Too short, no uppercase, no digit
            },
        )
        assert response.status_code == 422  # Validation error


class TestOpportunities:
    """Test opportunity endpoints."""

    def test_list_opportunities(self):
        """Test listing opportunities."""
        response = client.get("/api/opportunities")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_list_featured_opportunities(self):
        """Test listing featured opportunities."""
        response = client.get("/api/opportunities/featured")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_search_opportunities(self):
        """Test searching opportunities."""
        response = client.get(
            "/api/opportunities/search",
            params={"keyword": "scholarship"},
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestUsers:
    """Test user endpoints."""

    def test_get_current_user_without_token(self):
        """Test getting current user without authentication."""
        response = client.get("/api/users/me")
        assert response.status_code == 403  # Forbidden

    def test_get_profile_without_token(self):
        """Test getting profile without authentication."""
        response = client.get("/api/users/profile")
        assert response.status_code == 403

    def test_get_current_user_with_valid_token(self):
        """Test getting current user with valid token."""
        # Register and login
        client.post(
            "/api/auth/register",
            json={
                "email": "profile@example.com",
                "full_name": "Profile User",
                "password": "TestPassword123!",
            },
        )

        login_response = client.post(
            "/api/auth/login",
            json={
                "email": "profile@example.com",
                "password": "TestPassword123!",
            },
        )
        token = login_response.json()["access_token"]

        # Get current user with token
        response = client.get(
            "/api/users/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "profile@example.com"
        assert data["full_name"] == "Profile User"


class TestApplications:
    """Test application endpoints."""

    def test_create_application_without_token(self):
        """Test creating application without authentication."""
        response = client.post(
            "/api/applications",
            json={"opportunity_id": 1},
        )
        assert response.status_code == 403

    def test_list_applications_without_token(self):
        """Test listing applications without authentication."""
        response = client.get("/api/applications")
        assert response.status_code == 403


class TestHealth:
    """Test health check."""

    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

    def test_root_endpoint(self):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "docs" in data


# Fixtures for common test data
@pytest.fixture
def test_user():
    """Create a test user."""
    db = TestingSessionLocal()
    user = User(
        email="fixture@example.com",
        full_name="Fixture User",
        hashed_password=hash_password("TestPassword123!"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    db.delete(user)
    db.commit()
    db.close()


@pytest.fixture
def auth_token(test_user):
    """Get authentication token for test user."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "fixture@example.com",
            "password": "TestPassword123!",
        },
    )
    return response.json()["access_token"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
