# 🎓 Complete Backend Code Explanation Guide

This guide explains every aspect of your NUESA backend code to help you understand it thoroughly.

---

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [File-by-File Breakdown](#file-by-file-breakdown)
4. [How Data Flows](#how-data-flows)
5. [Security Deep Dive](#security-deep-dive)
6. [Database Concepts](#database-concepts)
7. [API Endpoints Explained](#api-endpoints-explained)
8. [Common Patterns](#common-patterns)

---

## 🏛️ Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React Frontend)                  │
│                  http://localhost:5173                       │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/HTTPS
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                         │
│              http://localhost:8000/api/...                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Middleware Layer (Security First)            │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ 1. CORS Middleware                             │ │  │
│  │  │    - Checks request origin                     │ │  │
│  │  │    - Allows only configured domains            │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ 2. TrustedHost Middleware                      │ │  │
│  │  │    - Validates Host header                     │ │  │
│  │  │    - Prevents header injection attacks         │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                             ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Route Handlers Layer                    │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ Auth Routes                                     │ │  │
│  │  │  - POST /register   (public)                   │ │  │
│  │  │  - POST /login      (public)                   │ │  │
│  │  │  - POST /refresh    (public)                   │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ Users Routes                                    │ │  │
│  │  │  - GET /me          (protected)                │ │  │
│  │  │  - GET /profile     (protected)                │ │  │
│  │  │  - PUT /profile     (protected)                │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ Opportunities Routes                           │ │  │
│  │  │  - GET /            (public)                   │ │  │
│  │  │  - GET /{id}        (public)                   │ │  │
│  │  │  - POST /           (admin only)               │ │  │
│  │  │  - POST /save       (protected)                │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ Applications Routes                            │ │  │
│  │  │  - POST /           (protected)                │ │  │
│  │  │  - GET /            (protected)                │ │  │
│  │  │  - PUT /{id}        (protected)                │ │  │
│  │  │  - POST /submit     (protected)                │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                             ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               Business Logic Layer                  │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ Validation (Pydantic Schemas)                 │ │  │
│  │  │  - Check data types                           │ │  │
│  │  │  - Check required fields                      │ │  │
│  │  │  - Check field constraints                    │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ Security (Authentication/Authorization)       │ │  │
│  │  │  - Hash passwords                             │ │  │
│  │  │  - Create/verify JWT tokens                   │ │  │
│  │  │  - Check user permissions                     │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ Database Operations (SQLAlchemy ORM)          │ │  │
│  │  │  - Create records                             │ │  │
│  │  │  - Read/query data                            │ │  │
│  │  │  - Update records                             │ │  │
│  │  │  - Delete records                             │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                             ↓                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Database Access Layer                     │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │ SQLAlchemy ORM Engine                        │ │  │
│  │  │  - Converts Python to SQL                     │ │  │
│  │  │  - Manages database connections              │ │  │
│  │  │  - Handles transactions                       │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ↓
        ┌──────────────────────────────────┐
        │   Database (SQLite or PostgreSQL)│
        │                                  │
        │  ┌───────────────────────────┐  │
        │  │ Tables:                   │  │
        │  │ - users                   │  │
        │  │ - user_profiles           │  │
        │  │ - opportunities           │  │
        │  │ - applications            │  │
        │  │ - saved_opportunities     │  │
        │  │ - opportunity_ratings     │  │
        │  │ - sponsorships            │  │
        │  │ - notifications           │  │
        │  └───────────────────────────┘  │
        └──────────────────────────────────┘
```

### Three-Layer Pattern

Your backend follows the **Three-Layer Architecture Pattern**:

```
┌─────────────────────────────────────┐
│   PRESENTATION LAYER                │
│   (main.py, routes/)                │
│   - FastAPI endpoints               │
│   - Request/Response handling       │
│   - HTTP status codes               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   BUSINESS LOGIC LAYER              │
│   (security.py, utils.py, schemas)  │
│   - Validation                      │
│   - Authentication                  │
│   - Authorization                   │
│   - Data transformation             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   DATA ACCESS LAYER                 │
│   (models.py, database.py)          │
│   - Database queries                │
│   - ORM operations                  │
│   - Data persistence                │
└─────────────────────────────────────┘
```

---

## 🧠 Core Concepts

### 1. **What is FastAPI?**

FastAPI is a modern Python web framework for building APIs.

**Key Points:**
- **ASGI Framework**: Asynchronous Server Gateway Interface (faster than traditional WSGI)
- **Automatic Documentation**: Generates Swagger UI automatically
- **Type Hints**: Uses Python type hints for validation
- **Fast Performance**: One of the fastest Python frameworks
- **Easy Debugging**: Built-in interactive API docs

**Example:**
```python
from fastapi import FastAPI

app = FastAPI()  # Create application

@app.get("/api/users")  # Define a route
async def get_users():  # Define handler
    return {"users": []}  # Return JSON
```

### 2. **What is SQLAlchemy?**

SQLAlchemy is an Object-Relational Mapping (ORM) library that lets you write Python code instead of SQL.

**Benefits:**
- **Abstraction**: Write Python, not Srrr
- **Database Agnostic**: Works with SQLite, PostgreSQL, MySQL, etc.
- **Type Safe**: Compile-time checking
- **SQL Injection Prevention**: Automatic parameterization

**Without ORM (Raw SQL):**
```sql
SELECT * FROM users WHERE email = 'user@example.com';
-- Vulnerable to SQL injection!
```

**With SQLAlchemy:**
```python
user = db.query(User).filter(User.email == 'user@example.com').first()
# Safe and readable!
```

### 3. **What is JWT (JSON Web Tokens)?**

JWT is a stateless authentication method. Instead of storing sessions on the server, tokens contain encoded data.

**How JWT Works:**
```
1. User login → Server creates JWT token
2. Token = Header.Payload.Signature
3. Client stores token in localStorage
4. Client sends token with each request
5. Server verifies signature → Access granted
```

**JWT Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE2NzAwMDAwMDB9.signature

Header:      {"alg": "HS256", "typ": "JWT"}
Payload:     {"sub": "123", "exp": 1670000000}
Signature:   HMAC(Header + Payload, SECRET_KEY)
```

### 4. **What is Bcrypt?**

Bcrypt is a password hashing algorithm that makes passwords extremely difficult to crack.

**Key Features:**
- **One-way Hash**: Can't decrypt, only verify
- **Salt**: Adds random data to prevent rainbow table attacks
- **Slow**: Intentionally slow to prevent brute force
- **Adaptive**: Gets slower as computers get faster

**Process:**
```
Plain Password: "MyPassword123!"
                    ↓
            Bcrypt Hash Function
                    ↓
Hashed:     $2b$12$R9h/cIPz0gi.URNN3kh2OPST9/PgBkqquzi8Ax957IZgf7ByW5Bm6
            (Never shows original!)

Verification:
Enter Password: "MyPassword123!"
                    ↓
        Compare with stored hash
                    ↓
            Match? → Access Granted
```

### 5. **What is Pydantic?**

Pydantic is a data validation library that uses Python type hints.

**Benefits:**
- **Automatic Validation**: Checks types and constraints
- **Error Messages**: Clear feedback on what's wrong
- **JSON Serialization**: Converts Python objects to JSON
- **Type Safety**: Catches errors at request time

**Example:**
```python
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr                    # Must be valid email
    full_name: str = Field(..., min_length=2)  # Min 2 chars
    password: str = Field(..., min_length=8)   # Min 8 chars

# Automatic validation:
# ✅ Valid: {"email": "user@example.com", "full_name": "John", "password": "Pass123!"}
# ❌ Invalid: {"email": "invalid", "full_name": "J", "password": "short"}
# Error: email is not a valid email address
# Error: ensure this value has at least 2 characters
```

---

## 📂 File-by-File Breakdown

### **main.py** - Application Entry Point

```python
from fastapi import FastAPI

app = FastAPI(
    title="NUESA Scholars & Intent API",  # Show in docs
    description="...",                     # Show in docs
    version="1.0.0"                        # API version
)
```

**What happens:**
1. **Import**: Loads FastAPI and middleware
2. **Create App**: Instantiates FastAPI application
3. **Add Middleware**: Security layers
4. **Register Routes**: Connects route handlers
5. **Startup Events**: Initialize database
6. **Exception Handlers**: Catch errors

**Key Functions:**

| Function | Purpose | Returns |
|----------|---------|---------|
| `root()` | Health check | App status |
| `health_check()` | Server status | Timestamp |
| Middleware handlers | Security checks | Accept or reject requests |

---

### **config.py** - Configuration Management

**Purpose**: Centralize all settings (not hardcoded in code)

```python
class Settings(BaseSettings):
    SECRET_KEY: str = "..."           # JWT signing key
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # Token lifetime
    DATABASE_URL: str = "sqlite://..."     # Database connection
    CORS_ORIGINS: list = [...]            # Allowed domains
```

**Why This Matters:**

```
❌ BAD (Hardcoded):
SECRET_KEY = "my-secret-key"  # Not secure!

✅ GOOD (Configuration):
from config import get_settings
settings = get_settings()
SECRET_KEY = settings.SECRET_KEY  # From .env
```

**Loading Process:**
```
1. Check .env file
2. Load environment variables
3. Apply defaults
4. Return Settings instance
```

---

### **models.py** - Database Schema

**Purpose**: Define database tables as Python classes

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, index=True)
    # Column(type, constraints)
```

**Column Types:**
| Type | SQL | Purpose |
|------|-----|---------|
| `Integer` | INT | Numbers |
| `String(255)` | VARCHAR(255) | Text (max 255 chars) |
| `Text` | TEXT | Long text |
| `Boolean` | BOOLEAN | True/False |
| `DateTime` | TIMESTAMP | Date and time |
| `Float` | FLOAT | Decimal numbers |

**Column Constraints:**
```python
Column(Integer, primary_key=True)      # Unique identifier
Column(String, unique=True)            # No duplicates
Column(String, index=True)             # Fast search
Column(String, nullable=False)         # Required
Column(String, default="active")       # Default value
```

**Relationships:**
```python
# One-to-Many: One user has many applications
applications = relationship("Application", back_populates="user")

# One-to-One: One user has one profile
profile = relationship("UserProfile", uselist=False, back_populates="user")

# Many-to-Many: Users save many opportunities, opportunities saved by many users
saved_opportunities = relationship(
    "Opportunity",
    secondary="saved_opportunities",  # Junction table
    back_populates="saved_by_users"
)
```

**Example Database Flow:**
```
Create User:
user = User(email="john@example.com", full_name="John")
db.add(user)
db.commit()
→ INSERT INTO users (email, full_name) VALUES ('john@example.com', 'John')

Read User:
user = db.query(User).filter(User.email == "john@example.com").first()
→ SELECT * FROM users WHERE email = 'john@example.com' LIMIT 1

Update User:
user.full_name = "Jane"
db.commit()
→ UPDATE users SET full_name = 'Jane' WHERE id = 1

Delete User:
db.delete(user)
db.commit()
→ DELETE FROM users WHERE id = 1
```

---

### **schemas.py** - Data Validation

**Purpose**: Define what valid request/response data looks like

```python
class UserRegister(BaseModel):
    email: EmailStr                    # Must be valid email
    full_name: str = Field(..., min_length=2)
    password: str = Field(..., min_length=8)
```

**Validation Process:**

```
Request JSON:
{
  "email": "john@example.com",
  "full_name": "John",
  "password": "SecurePass123!"
}
         ↓
    Pydantic validates:
  - Is email a valid email format? ✅
  - Is full_name at least 2 chars? ✅
  - Is password at least 8 chars? ✅
         ↓
    Create UserRegister object (or return errors)
```

**Response Serialization:**
```python
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: datetime

# When returning from endpoint, automatically converts:
User(id=1, email="john@example.com", ...)
    ↓
{
  "id": 1,
  "email": "john@example.com",
  "full_name": "John",
  "created_at": "2025-12-29T10:30:00"
}
```

---

### **security.py** - Authentication & Authorization

**Key Functions:**

```python
def hash_password(password: str) -> str:
    """Convert plain password to irreversible hash"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    # Result: $2b$12$XZ...  (never shows original password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if password matches hash"""
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
    # Compares without revealing either password continue

def create_access_token(data: dict) -> str:
    """Create JWT token for authentication"""
    # Add expiration time
    # Sign with SECRET_KEY
    # Return encoded token

def verify_token(token: str) -> dict:
    """Decode and verify JWT token"""
    # Decode using SECRET_KEY
    # Check if expired
    # Return user data or raise error
```

**Authentication Flow:**

```
1. USER REGISTERS
   POST /api/auth/register
   { "email": "john@example.com", "password": "SecurePass123!" }
             ↓
   hash_password("SecurePass123!")
             ↓
   $2b$12$XZ... (stored in database)

2. USER LOGS IN
   POST /api/auth/login
   { "email": "john@example.com", "password": "SecurePass123!" }
             ↓
   Get user from database
             ↓
   verify_password("SecurePass123!", "$2b$12$XZ...")
             ↓
   ✅ Match! Create tokens
             ↓
   access_token: "eyJh..."
   refresh_token: "eyJy..."

3. USER MAKES PROTECTED REQUEST
   GET /api/users/me
   Header: Authorization: Bearer eyJh...
             ↓
   verify_token("eyJh...")
             ↓
   ✅ Valid! Extract user_id = 1
             ↓
   Return user data

4. ACCESS TOKEN EXPIRES (60 min)
   POST /api/auth/refresh
   { "refresh_token": "eyJy..." }
             ↓
   verify_token("eyJy...")
             ↓
   ✅ Valid! Create new access_token
             ↓
   Return new access_token
```

---

### **database.py** - Database Connection

```python
engine = create_engine(DATABASE_URL)
# Creates connection to database

SessionLocal = sessionmaker(bind=engine)
# Creates sessions (connections) to database

def get_db():
    db = SessionLocal()
    try:
        yield db  # Provide database session
    finally:
        db.close()  # Always close connection
```

**Why SessionLocal?**
```
Each request needs its own database connection:

Request 1:        Request 2:
├─ Session 1     ├─ Session 2
├─ Query users   ├─ Query opportunities
└─ Close         └─ Close

If we reused one session, users could interfere with each other!
```

---

### **routes/auth.py** - Authentication Endpoints

**Endpoints:**

```python
@app.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # 1. Validate email not already used
    # 2. Hash password
    # 3. Create user in database
    # 4. Return user data

@app.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    # 1. Find user by email
    # 2. Verify password matches
    # 3. Create access token
    # 4. Create refresh token
    # 5. Return both tokens

@app.post("/refresh")
def refresh(refresh_token: str, db: Session = Depends(get_db)):
    # 1. Verify refresh token valid
    # 2. Get user from database
    # 3. Create new access token
    # 4. Return new access token
```

---

### **routes/users.py** - User Management

```python
@app.get("/me")
def get_current_user(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Depends(get_current_user) extracts user_id from token
    # 2. Query user from database
    # 3. Return user data
    # Requires valid access token!

@app.put("/profile")
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Verify user authenticated
    # 2. Validate new profile data
    # 3. Update database
    # 4. Return updated profile
    # Requires valid access token!
```

---

### **routes/opportunities.py** - Opportunity Management

```python
@app.get("/opportunities")
def list_opportunities(
    page: int = Query(1),
    page_size: int = Query(20),
    db: Session = Depends(get_db)
):
    # 1. Query opportunities (no auth needed - public)
    # 2. Apply pagination: skip (page-1)*page_size, take page_size
    # 3. Return list of opportunities

@app.post("/opportunities")
def create_opportunity(
    opp_data: OpportunityCreate,
    current_user: dict = Depends(require_admin),  # Admin only!
    db: Session = Depends(get_db)
):
    # 1. Verify user is admin
    # 2. Validate opportunity data
    # 3. Create opportunity in database
    # 4. Return created opportunity
    # Requires admin access token!

@app.post("/opportunities/{id}/save")
def save_opportunity(
    opportunity_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Verify user authenticated
    # 2. Create saved_opportunities record
    # 3. Link user to opportunity
    # 4. Return success message
```

---

### **routes/applications.py** - Application Management

```python
@app.post("/applications")
def create_application(
    app_data: ApplicationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Verify user authenticated
    # 2. Check if opportunity exists
    # 3. Check if already applied (prevent duplicates)
    # 4. Create application with DRAFT status
    # 5. Return created application

@app.post("/applications/{id}/submit")
def submit_application(
    application_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Verify user authenticated
    # 2. Get application from database
    # 3. Check authorization (user owns this application)
    # 4. Check status is DRAFT
    # 5. Change status to SUBMITTED
    # 6. Set submitted_at timestamp
    # 7. Save and return

@app.post("/applications/{id}/withdraw")
def withdraw_application(
    application_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Verify user authenticated
    # 2. Get application from database
    # 3. Check authorization
    # 4. Check status is SUBMITTED or UNDER_REVIEW
    # 5. Change status to WITHDRAWN
    # 6. Save and return
```

---

## 🔄 How Data Flows

### Complete Request-Response Cycle

```
EXAMPLE: User Registration

1. FRONTEND SENDS REQUEST
   POST /api/auth/register
   {
     "email": "john@example.com",
     "full_name": "John Doe",
     "password": "SecurePass123!"
   }

2. FASTAPI RECEIVES REQUEST
   main.py @app.post("/register")

3. MIDDLEWARE CHECKS
   ├─ CORS Middleware: Is origin allowed? ✅
   ├─ TrustedHost Middleware: Is Host valid? ✅
   └─ Continue to route handler

4. PYDANTIC VALIDATES INPUT
   schemas.py UserRegister
   ├─ Is email a valid email? ✅
   ├─ Is full_name at least 2 chars? ✅
   ├─ Is password at least 8 chars? ✅
   └─ Create UserRegister object

5. ROUTE HANDLER EXECUTES
   routes/auth.py register()
   ├─ Receives: UserRegister object, Database session
   ├─ Query users table: SELECT * FROM users WHERE email = ?
   │  └─ Found? Return 409 Conflict
   ├─ Hash password: SecurePass123! → $2b$12$XZ...
   ├─ Create User object
   ├─ db.add(user)
   ├─ db.commit() → INSERT INTO users (...)
   ├─ db.refresh(user) → Get generated ID
   └─ Return user object

6. PYDANTIC SERIALIZES RESPONSE
   schemas.py UserResponse
   ├─ Convert User object to dictionary
   ├─ Keep only specified fields (id, email, full_name, created_at)
   └─ Convert datetime to ISO format string

7. FASTAPI SENDS RESPONSE
   HTTP 200 OK
   Content-Type: application/json
   {
     "id": 1,
     "email": "john@example.com",
     "full_name": "John Doe",
     "created_at": "2025-12-29T10:30:00"
   }

8. FRONTEND RECEIVES RESPONSE
   JavaScript parses JSON
   Store user data in app state
   Redirect to dashboard
```

### Authentication Flow (Login)

```
USER LOGS IN

1. Frontend submits:
   POST /api/auth/login
   {"email": "john@example.com", "password": "SecurePass123!"}

2. Route handler:
   └─ Query database: SELECT * FROM users WHERE email = ?
      └─ User not found? → 401 Unauthorized
      └─ User found: user_obj

3. Verify password:
   bcrypt.checkpw("SecurePass123!", "$2b$12$XZ...")
   └─ Hash doesn't match? → 401 Unauthorized
   └─ Hash matches: Continue

4. Create access token:
   data = {"sub": "1", "email": "john@example.com", "is_admin": false}
   jwt.encode(data, SECRET_KEY, "HS256")
   └─ Returns: "eyJhbGc..."

5. Create refresh token:
   data = {"sub": "1", "type": "refresh"}
   jwt.encode(data, SECRET_KEY, "HS256")
   └─ Returns: "eyJyZW..."

6. Return both tokens:
   {
     "access_token": "eyJhbGc...",
     "refresh_token": "eyJyZW...",
     "token_type": "bearer",
     "expires_in": 3600
   }

7. Frontend stores tokens:
   localStorage.setItem('access_token', 'eyJhbGc...')
   localStorage.setItem('refresh_token', 'eyJyZW...')

8. Future requests include token:
   GET /api/users/me
   Headers: {
     "Authorization": "Bearer eyJhbGc..."
   }
   └─ Backend verifies: jwt.decode("eyJhbGc...", SECRET_KEY)
      └─ Valid signature? ✅
      └─ Not expired? ✅
      └─ Extract user_id = 1
      └─ Return user data
```

### Protected Endpoint Flow

```
GET /api/users/me
Authorization: Bearer eyJhbGc...

1. Request reaches endpoint handler
   @app.get("/me")
   def get_user(current_user: dict = Depends(get_current_user)):

2. Dependency injection: Depends(get_current_user)
   └─ Calls get_current_user(credentials)
      ├─ Extract token from Authorization header
      ├─ Call verify_token(token)
      │  ├─ jwt.decode(token, SECRET_KEY)
      │  ├─ Check expiration
      │  └─ Return {"user_id": "1", "payload": {...}}
      └─ Return current_user dict

3. Handler receives current_user:
   current_user = {"user_id": "1", "payload": {...}}

4. Query database:
   user = db.query(User).filter(User.id == 1).first()

5. Return user data:
   {
     "id": 1,
     "email": "john@example.com",
     "full_name": "John Doe",
     "is_verified": true,
     "created_at": "2025-12-29T10:30:00"
   }
```

---

## 🔐 Security Deep Dive

### Password Security

```
REGISTRATION:
User enters: "MyPassword123!"
             ↓
   hash_password() → bcrypt.hashpw()
             ↓
   Result: $2b$12$R9h/cIPz0gi.URNN3kh2OPST9/PgBkqquzi8Ax957IZgf7ByW5Bm6
             ↓
   Store in database (NOT the plain password!)

LOGIN:
User enters: "MyPassword123!"
             ↓
   Get stored hash from database
             ↓
   verify_password() → bcrypt.checkpw(plain, hash)
             ↓
   ✅ Match! → Grant access
   ❌ No match! → Deny access

WHY BCRYPT?
1. One-way: Can't decrypt hash to get password
2. Slow: Takes time on purpose (prevents brute force)
3. Salt: Adds randomness (prevents rainbow tables)
4. Adaptive: Gets slower over time

Even if database is stolen:
- Attacker sees hashes, not passwords
- Can't reverse hashes
- Bcrypt is slow (takes billions of years to crack)
```

### JWT Token Security

```
TOKEN STRUCTURE:
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE2NzAwMDAwMDB9.signature"
 ↓Header                            ↓Payload                          ↓Signature
 {"alg":"HS256","typ":"JWT"}      {"sub":"123","exp":1670000000}   HMAC-SHA256

SIGNATURE VERIFICATION:
1. Client sends: Header.Payload.Signature
2. Server recalculates: HMAC(Header.Payload, SECRET_KEY)
3. Compare calculated signature with received signature
4. If different: Token tampered with! Reject.
5. If same: Token authentic! Accept.

WHY SECURE?
1. Can't forge without SECRET_KEY
2. Can't modify payload (signature won't match)
3. Includes expiration (time-limited access)
4. Server doesn't need to store session (stateless)

TOKEN ATTACKS PREVENTED:
❌ Token forgery: Need SECRET_KEY
❌ Token modification: Signature won't match
❌ Old tokens: Check expiration
❌ Token theft: Use HTTPS only (not HTTP)
```

### SQL Injection Prevention

```
VULNERABLE (Raw SQL):
query = f"SELECT * FROM users WHERE email = '{email}'"
# If email = "' OR '1'='1", becomes:
# SELECT * FROM users WHERE email = '' OR '1'='1'
# Returns ALL users!

SAFE (SQLAlchemy):
user = db.query(User).filter(User.email == email).first()
# SQLAlchemy automatically parameterizes:
# SELECT * FROM users WHERE email = ?
# Parameters: [email]
# Treats email as data, not SQL code!
```

### CORS Security

```
WITHOUT CORS PROTECTION:
Any website can make requests to your API:
- evil.com → malicious.com/api/transfer-money
- Attacker gains user tokens
- Steals sensitive data

WITH CORS PROTECTION:
In config.py:
CORS_ORIGINS = [
    "http://localhost:5173",
    "https://yourdomain.com"
]

Requests from other origins rejected:
- Request from evil.com → 403 Forbidden
- Request from yourdomain.com → 200 OK

CORS Header Check:
Browser sends: Origin: evil.com
Server checks: Is evil.com in CORS_ORIGINS?
No → Block request
Yes → Allow request
```

### Authorization (Role-Based Access Control)

```
USER vs ADMIN ENDPOINTS:

Regular user endpoint:
@app.get("/users/me")
def get_user(current_user: dict = Depends(get_current_user)):
    # Any authenticated user can access

Admin endpoint:
@app.post("/opportunities")
def create_opportunity(current_user: dict = Depends(require_admin)):
    # Only users with is_admin=true can access

require_admin() function:
def require_admin(current_user: dict = Depends(get_current_user)):
    if not current_user.get("payload", {}).get("is_admin", false):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

Example:
Regular user token: {"sub": "1", "is_admin": false}
└─ GET /api/opportunities ✅ (public)
└─ POST /api/opportunities ❌ (admin only)

Admin token: {"sub": "2", "is_admin": true}
└─ GET /api/opportunities ✅ (public)
└─ POST /api/opportunities ✅ (admin)
```

---

## 🗄️ Database Concepts

### Relationships

```
ONE-TO-MANY: User → Applications
User has MANY applications
Application belongs to ONE user

In Code:
class User:
    applications = relationship("Application", back_populates="user")

class Application:
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="applications")

In SQL:
CREATE TABLE applications (
    id INT PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES users(id),
    ...
)

Query Example:
user = db.query(User).filter(User.id == 1).first()
applications = user.applications  # Access related applications
# SELECT * FROM applications WHERE user_id = 1


ONE-TO-ONE: User ↔ UserProfile
User has ONE profile
Profile belongs to ONE user

In Code:
class User:
    profile = relationship("UserProfile", uselist=False, back_populates="user")

class UserProfile:
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    user = relationship("User", back_populates="profile")

Query Example:
user = db.query(User).filter(User.id == 1).first()
profile = user.profile  # Access the one related profile


MANY-TO-MANY: Users ↔ Opportunities (through SavedOpportunities)
User can save MANY opportunities
Opportunity can be saved by MANY users

In Code:
class User:
    saved_opportunities = relationship(
        "Opportunity",
        secondary="saved_opportunities",  # Junction table
        back_populates="saved_by_users"
    )

class Opportunity:
    saved_by_users = relationship(
        "User",
        secondary="saved_opportunities",
        back_populates="saved_opportunities"
    )

In SQL:
CREATE TABLE saved_opportunities (
    user_id INT FOREIGN KEY,
    opportunity_id INT FOREIGN KEY,
    PRIMARY KEY (user_id, opportunity_id)
)

Query Example:
user = db.query(User).filter(User.id == 1).first()
saved = user.saved_opportunities  # Get all opportunities user saved
```

### Cascade Operations

```
CASCADE = Automatically handle related records

Example:
class User:
    applications = relationship("Application", cascade="all, delete-orphan")

When you delete a user:
1. Delete user from users table
2. Automatically delete all user's applications
3. Clean up orphaned application records

Without cascade:
Foreign key constraint error! Can't delete because applications reference user.

With cascade:
Delete succeeds, related records cleaned up automatically.
```

### Indexes

```
Indexing speeds up searches:

Without Index:
SELECT * FROM users WHERE email = 'john@example.com'
Scans entire table: 1000 rows = 1000 checks ⚠️ Slow

With Index:
Column(String, index=True)
Scans index (B-tree): 1000 rows = ~10 checks ✅ Fast

When to use indexes:
✅ Frequently searched columns (email, username, ID)
✅ Filter/WHERE conditions
✅ Sorting/ORDER BY

When NOT to use:
❌ Rarely searched columns
❌ Small tables (< 100 rows)
❌ Columns with few unique values
❌ TEXT columns (use full-text search instead)
```

---

## 🌐 API Endpoints Explained

### Endpoint Anatomy

```
POST /api/auth/login
 ↓    ↓   ↓    ↓
 │    │   │    └─ Resource
 │    │   └─────── Version/Scope
 │    └─────────── Resource
 └──────────────── HTTP Method

HTTP Methods (CRUD):
POST   = Create (C)
GET    = Read (R)
PUT    = Update (U)
DELETE = Delete (D)
```

### Status Codes Explained

```
2xx = Success
  200 OK                 - Request succeeded, returning data
  201 Created            - Resource created successfully
  204 No Content         - Success, no data to return

3xx = Redirection
  301 Moved Permanently  - Resource moved, use new URL

4xx = Client Error (User's fault)
  400 Bad Request        - Invalid data sent
  401 Unauthorized       - Not authenticated (no token)
  403 Forbidden          - Authenticated but not authorized (token valid, but no permission)
  404 Not Found          - Resource doesn't exist
  409 Conflict           - Duplicate email, etc.
  422 Validation Error   - Data doesn't match schema

5xx = Server Error (Server's fault)
  500 Internal Server Error - Unexpected error
  503 Service Unavailable   - Server down/maintenance
```

### Common Endpoint Patterns

```
1. PUBLIC ENDPOINTS (No authentication)
   GET /api/opportunities
   GET /api/opportunities/{id}
   GET /api/opportunities/search
   POST /api/auth/register
   POST /api/auth/login

2. PROTECTED ENDPOINTS (Requires valid token)
   GET /api/users/me
   GET /api/users/profile
   PUT /api/users/profile
   GET /api/applications
   POST /api/applications/{id}/save

3. ADMIN ENDPOINTS (Requires admin token)
   POST /api/opportunities
   PUT /api/opportunities/{id}
   DELETE /api/opportunities/{id}

4. MIXED ENDPOINTS
   GET /api/opportunities/{id}       (public)
   POST /api/opportunities/{id}/save (protected)
   PUT /api/opportunities/{id}       (admin)
   DELETE /api/opportunities/{id}    (admin)
```

---

## 🎨 Common Patterns

### Dependency Injection

```python
# Pattern: Depends(function)
# Automatically calls function and injects result

@app.get("/users/me")
def get_user(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # current_user and db are automatically injected
    # Before: Called get_current_user(), got result
    # Before: Called get_db(), got result
    # Now: Use them directly!

# Benefits:
# 1. Code reuse (get_current_user used in many endpoints)
# 2. Automatic error handling (if fails, returns error)
# 3. Cleaner code (no manual function calls)
```

### Query Parameters vs Path Parameters

```python
# PATH PARAMETER: /api/users/{user_id}
@app.get("/api/users/{user_id}")
def get_user(user_id: int):
    # user_id from URL path
    # Required
    # Example: GET /api/users/123

# QUERY PARAMETER: /api/opportunities?page=2&size=20
@app.get("/api/opportunities")
def list_opportunities(
    page: int = Query(1),      # ?page=value
    page_size: int = Query(20) # ?page_size=value
):
    # page and page_size from URL query string
    # Optional (use defaults if not provided)
    # Example: GET /api/opportunities?page=2&page_size=50

# REQUEST BODY: POST with JSON
@app.post("/api/auth/register")
def register(user_data: UserRegister):
    # user_data from request body (JSON)
    # Required (must be provided)
    # Example:
    # POST /api/auth/register
    # Content-Type: application/json
    # {"email": "john@example.com", "password": "..."}
```

### Error Handling Pattern

```python
from fastapi import HTTPException, status

# Pattern 1: Simple error
if not user:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
    )
# Returns: {"detail": "User not found"} with 404 status

# Pattern 2: Complex error
if user.is_banned:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Your account has been suspended"
    )

# Pattern 3: Validation error (automatic)
# If Pydantic validation fails, FastAPI automatically returns:
# {
#   "detail": [
#     {
#       "loc": ["body", "email"],
#       "msg": "invalid email format",
#       "type": "value_error.email"
#     }
#   ]
# }
```

### Pagination Pattern

```python
def list_items(
    page: int = Query(1, ge=1),           # page >= 1
    page_size: int = Query(20, ge=1, le=100)  # 1 <= size <= 100
):
    # Calculate offset
    offset = (page - 1) * page_size
    
    # Query with pagination
    items = db.query(Item).offset(offset).limit(page_size).all()
    
    # Return paginated result
    return {
        "page": page,
        "page_size": page_size,
        "total": total_count,
        "data": items
    }

# Example:
# GET /api/items?page=1&page_size=10
#   Skip: (1-1)*10 = 0 rows
#   Take: 10 rows
#   Returns items 0-9

# GET /api/items?page=2&page_size=10
#   Skip: (2-1)*10 = 10 rows
#   Take: 10 rows
#   Returns items 10-19
```

### Filtering Pattern

```python
def search_items(
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Start with base query
    query = db.query(Item)
    
    # Apply filters if provided
    if keyword:
        query = query.filter(Item.title.ilike(f"%{keyword}%"))
    
    if category:
        query = query.filter(Item.category == category)
    
    # Execute and return
    return query.all()

# Examples:
# GET /api/items?keyword=laptop
#   Returns items with "laptop" in title

# GET /api/items?category=electronics
#   Returns items in electronics category

# GET /api/items?keyword=laptop&category=electronics
#   Returns items with "laptop" in title AND in electronics category
```

---

## 📊 Data Flow Summary

```
REQUEST ARRIVES
    ↓
MIDDLEWARE CHECKS
├─ CORS origin valid?
├─ Host header valid?
└─ Continue → ✅

ROUTE MATCHED
├─ POST /api/auth/login
├─ GET /api/users/me
└─ etc.

INPUT VALIDATION (Pydantic)
├─ Check types
├─ Check constraints
└─ Convert to Python objects

DEPENDENCY INJECTION (Depends)
├─ Extract JWT token
├─ Verify token
├─ Get database session
├─ Check permissions

BUSINESS LOGIC
├─ Query database
├─ Transform data
├─ Perform operations

DATABASE OPERATIONS (SQLAlchemy)
├─ Convert to SQL
├─ Execute query
├─ Get results

OUTPUT SERIALIZATION (Pydantic)
├─ Convert Python objects to JSON
├─ Include only specified fields

RESPONSE SENT
├─ HTTP status code
├─ JSON body
└─ Headers
```

---

## 🎯 Key Takeaways

### Understanding Your Backend

1. **Architecture**: Three layers (presentation, business logic, data access)
2. **Security**: Password hashing, JWT tokens, CORS, SQL injection prevention
3. **Database**: SQLAlchemy ORM with models, relationships, and cascades
4. **Validation**: Pydantic schemas validate all inputs
5. **Authentication**: JWT tokens for stateless authentication
6. **Authorization**: Role-based access control (admin/user)
7. **Error Handling**: Proper HTTP status codes and error messages
8. **Endpoints**: RESTful API design with CRUD operations

### Code Quality

✅ Type hints throughout
✅ Docstrings on functions
✅ Clear separation of concerns
✅ DRY (Don't Repeat Yourself) principle
✅ Proper error handling
✅ Security best practices
✅ Scalable architecture
✅ Easy to extend

---

## 🚀 Next Steps

1. **Read the code**: Now that you understand concepts, read actual code
2. **Run locally**: Execute `python main.py` and test endpoints
3. **Experiment**: Modify code and see what happens
4. **Extend**: Add new endpoints following existing patterns
5. **Deploy**: Put it in production with proper security

---

**Congratulations!** You now understand every angle of your Python FastAPI backend! 🎉

Continue reading code, ask questions, and keep learning!
