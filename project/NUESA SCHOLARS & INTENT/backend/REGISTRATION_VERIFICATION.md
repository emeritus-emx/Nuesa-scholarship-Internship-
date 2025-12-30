# Registration & Login Verification Guide

## Overview
This guide verifies that your complete registration flow works end-to-end:
- New accounts are registered in the database
- Duplicate emails are rejected
- Registered users can log in
- Sessions are properly managed

---

## Architecture Summary

### Backend Flow (FastAPI)
```
Frontend Register Request
    ↓
POST /api/auth/register (UserRegister)
    ↓
Check if email exists in DB
    ├─ YES → Return 409 Conflict "Email already registered"
    └─ NO → Hash password & create User
            ↓
            Commit to PostgreSQL
            ↓
            Return UserResponse (ID, email, name, created_at)
```

### Frontend Flow (React)
```
User Input (name, email, password, policies)
    ↓
Validate locally (password strength, policies accepted)
    ↓
Call apiService.register() → Backend
    ├─ Success (200) → Move to OTP verification step
    └─ Error (409) → Alert user "Email already registered"
         OR Error (400) → Alert password validation error
```

---

## Database Schema (models.py)

The `User` table enforces:
```python
email = Column(String(255), unique=True, index=True, nullable=False)
```

✅ **UNIQUE constraint** prevents duplicate emails at DB level
✅ **INDEX on email** makes lookups fast
✅ **NOT NULL** ensures every user has an email

---

## Running Verification Tests

### Prerequisites
```bash
# 1. Install backend dependencies
cd backend
pip install -r requirements.txt

# 2. Start PostgreSQL (if using Docker)
docker run --name nuesa_postgres -e POSTGRES_PASSWORD=password \
  -d -p 5432:5432 postgres:15

# 3. Start FastAPI backend
python main.py
# Should see: "Uvicorn running on http://0.0.0.0:8000"
```

### Option A: Run Automated Test Suite
```bash
cd backend

# Install requests library if not already installed
pip install requests

# Run the comprehensive registration flow test
python test_registration_flow.py
```

**Expected Output:**
```
================================================================================
  REGISTRATION FLOW TEST
================================================================================

Test 1: Register new user (john@example.com)
--------
Status Code: 200
✅ Registration successful! User ID: 1

Test 2: Try to register with duplicate email (should fail)
--------
Status Code: 409
Response: {"detail": "Email already registered"}
✅ Duplicate email rejection working correctly!

Test 3: Login with registered user
--------
Status Code: 200
✅ Login successful!

Test 4: Login with wrong password (should fail)
--------
Status Code: 401
✅ Wrong password rejection working correctly!

Test 5: Login with non-existent email (should fail)
--------
Status Code: 401
✅ Non-existent user rejection working correctly!

Test 6: Register second user (different email)
--------
Status Code: 200
✅ Second user registration successful! User ID: 2

================================================================================
  SUMMARY
================================================================================
✅ All tests passed!
```

---

### Option B: Manual Testing with cURL

#### 1. Register First User
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "full_name": "John Doe",
    "password": "SecurePass123!",
    "phone": "+234801234567"
  }'
```
**Expected Response (200 OK):**
```json
{
  "id": 1,
  "email": "john@example.com",
  "full_name": "John Doe",
  "phone": "+234801234567",
  "bio": null,
  "profile_picture_url": null,
  "is_verified": false,
  "created_at": "2025-12-30T10:30:00"
}
```

#### 2. Try Duplicate Email (Should Fail)
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "full_name": "Jane Doe",
    "password": "AnotherPass123!",
    "phone": "+234802345678"
  }'
```
**Expected Response (409 Conflict):**
```json
{
  "detail": "Email already registered"
}
```

#### 3. Login with Correct Credentials
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```
**Expected Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### 4. Login with Wrong Password
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword123!"
  }'
```
**Expected Response (401 Unauthorized):**
```json
{
  "detail": "Invalid email or password"
}
```

---

## Frontend Testing

### Step 1: Start Frontend
```bash
npm run dev
# Navigate to http://localhost:5173
```

### Step 2: Test Registration
1. Click "Establish new node" (switch to register mode)
2. **Step 1:** Enter name and email → Click "Verify Identity"
3. **Step 2:** 
   - Enter password with proper strength (uppercase, digit, special char)
   - Accept all three policies
   - Click "Establish Key"
4. **Step 3:** Enter OTP code `123456` → Click "Finalize Enrollment"
5. ✅ You should be logged in to the dashboard

### Step 3: Test Duplicate Email
1. Log out
2. Try to register with the same email again
3. ✅ Should see alert: **"This email is already registered. Please log in or use a different email."**

### Step 4: Test Login
1. Click "Enter existing node"
2. Enter registered email and password
3. ✅ Should log in successfully

---

## What's Being Verified

| Check | Location | Status |
|-------|----------|--------|
| Email uniqueness constraint | `models.py` User table | ✅ `unique=True` |
| Duplicate email rejection | `routes/auth.py` register | ✅ Returns 409 |
| Password hashing | `security.py` hash_password | ✅ Uses bcrypt |
| Password validation | `schemas.py` UserRegister | ✅ Enforces strength |
| Login verification | `routes/auth.py` login | ✅ Checks password |
| Database persistence | `database.py` init_db | ✅ Creates tables |
| Session tokens | `security.py` create_access_token | ✅ Issues JWT |
| Error handling | `main.py` exception handlers | ✅ Returns proper codes |

---

## Common Issues & Solutions

### Issue: "localhost says [object Object]"
**Cause:** Error object not converted to string before alert
**Solution:** ✅ Fixed in `public/index.html` - adds alert wrapper that stringifies objects

### Issue: Email not being rejected as duplicate
**Cause:** Database not initialized or email constraint not enforced
**Solution:** 
```bash
# Check database is running
psql -U postgres -d nuesa_db

# Check users table exists
\dt users

# Check unique constraint
\d users
```

### Issue: Password validation not working
**Cause:** Frontend validation not checking all requirements
**Solution:** ✅ Fixed in `views/Auth.tsx` - now validates:
- Minimum 8 characters
- At least one uppercase letter
- At least one digit
- At least one special character (!@#$%^&*)

### Issue: "Can't connect to backend"
**Cause:** FastAPI server not running
**Solution:**
```bash
cd backend
python main.py
# Should show: "Uvicorn running on http://0.0.0.0:8000"
```

---

## Data Storage & Persistence

### Where Data is Stored
✅ **PostgreSQL Database** (`nuesa_db`)
- All registered users stored in `users` table
- Passwords hashed with bcrypt (never stored plain)
- Email addresses indexed for fast lookup

### Checking Database Directly
```bash
# Connect to PostgreSQL
psql -U postgres -d nuesa_db

# View all registered users
SELECT id, email, full_name, created_at FROM users;

# Count users
SELECT COUNT(*) FROM users;

# Check for duplicates (should be 0)
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;
```

### Sample Output
```
 id |       email        | full_name  |        created_at
----+--------------------+------------+------------------------
  1 | john@example.com   | John Doe   | 2025-12-30 10:30:00
  2 | jane@example.com   | Jane Smith | 2025-12-30 10:35:00
(2 rows)
```

---

## Success Criteria

After running tests, you should see:

✅ **Registration:**
- New accounts created successfully
- Returned with user ID and timestamp
- Data stored in PostgreSQL

✅ **Duplicate Email Handling:**
- Second registration with same email returns 409 Conflict
- Error message: "Email already registered"
- No duplicate records in database

✅ **Login:**
- Registered users can log in with correct password
- Login fails with wrong password (401)
- JWT tokens issued successfully
- Tokens can be used for authenticated requests

✅ **Data Integrity:**
- Email addresses are unique
- Passwords are hashed (never stored plain text)
- Timestamps recorded for audit trail
- All accounts stored persistently

---

## Next Steps

1. **Run the automated test:**
   ```bash
   python backend/test_registration_flow.py
   ```

2. **Test in frontend UI:**
   - Register a new account
   - Try registering with same email (should fail)
   - Log out and log back in

3. **Verify database:**
   ```bash
   psql -U postgres -d nuesa_db
   SELECT * FROM users;
   ```

4. **Check server logs:**
   - Backend should log successful registrations
   - Errors should be logged with reason

If all tests pass, your registration system is fully functional! 🎉
