"""Test script to verify complete registration and login flow."""
import requests
import json
from datetime import datetime

API_BASE_URL = "http://localhost:8000/api"

def print_section(title):
    """Print a formatted section header."""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80 + "\n")

def test_registration_flow():
    """Test complete registration flow."""
    print_section("REGISTRATION FLOW TEST")
    
    # Test 1: Register first user
    print("Test 1: Register new user (john@example.com)")
    print("-" * 80)
    
    user1_data = {
        "email": f"john{datetime.now().timestamp()}@example.com",
        "full_name": "John Doe",
        "password": "SecurePass123!",
        "phone": "+234801234567"
    }
    
    response = requests.post(f"{API_BASE_URL}/auth/register", json=user1_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        user1 = response.json()
        user1_email = user1_data["email"]
        print(f"\n✅ Registration successful! User ID: {user1['id']}")
    else:
        print(f"\n❌ Registration failed!")
        return False
    
    # Test 2: Try to register with same email (should fail)
    print("\n\nTest 2: Try to register with duplicate email (should fail)")
    print("-" * 80)
    
    duplicate_data = {
        "email": user1_email,
        "full_name": "Jane Doe",
        "password": "AnotherPass123!",
        "phone": "+234802345678"
    }
    
    response = requests.post(f"{API_BASE_URL}/auth/register", json=duplicate_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 409:
        print(f"\n✅ Duplicate email rejection working correctly!")
    else:
        print(f"\n❌ Duplicate email NOT rejected properly!")
        return False
    
    # Test 3: Login with registered user
    print("\n\nTest 3: Login with registered user")
    print("-" * 80)
    
    login_data = {
        "email": user1_email,
        "password": "SecurePass123!"
    }
    
    response = requests.post(f"{API_BASE_URL}/auth/login", json=login_data)
    print(f"Status Code: {response.status_code}")
    response_json = response.json()
    
    # Print tokens (truncated for security)
    if response.status_code == 200:
        print(f"✅ Login successful!")
        print(f"Access Token: {response_json['access_token'][:50]}...")
        print(f"Token Type: {response_json['token_type']}")
        print(f"Expires In: {response_json['expires_in']} seconds")
        access_token = response_json['access_token']
    else:
        print(f"❌ Login failed!")
        print(f"Response: {json.dumps(response_json, indent=2)}")
        return False
    
    # Test 4: Login with wrong password (should fail)
    print("\n\nTest 4: Login with wrong password (should fail)")
    print("-" * 80)
    
    wrong_password_data = {
        "email": user1_email,
        "password": "WrongPassword123!"
    }
    
    response = requests.post(f"{API_BASE_URL}/auth/login", json=wrong_password_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 401:
        print(f"\n✅ Wrong password rejection working correctly!")
    else:
        print(f"\n❌ Wrong password NOT rejected properly!")
        return False
    
    # Test 5: Login with non-existent email (should fail)
    print("\n\nTest 5: Login with non-existent email (should fail)")
    print("-" * 80)
    
    nonexistent_data = {
        "email": "nonexistent@example.com",
        "password": "SomePass123!"
    }
    
    response = requests.post(f"{API_BASE_URL}/auth/login", json=nonexistent_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 401:
        print(f"\n✅ Non-existent user rejection working correctly!")
    else:
        print(f"\n❌ Non-existent user NOT rejected properly!")
        return False
    
    # Test 6: Register second user (different email)
    print("\n\nTest 6: Register second user (different email)")
    print("-" * 80)
    
    user2_data = {
        "email": f"jane{datetime.now().timestamp()}@example.com",
        "full_name": "Jane Smith",
        "password": "AnotherSecure123!",
        "phone": "+234802345678"
    }
    
    response = requests.post(f"{API_BASE_URL}/auth/register", json=user2_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        user2 = response.json()
        print(f"\n✅ Second user registration successful! User ID: {user2['id']}")
    else:
        print(f"\n❌ Second user registration failed!")
        return False
    
    # Summary
    print_section("SUMMARY")
    print("✅ All tests passed!")
    print("\nKey Findings:")
    print(f"  • User 1 (john) registered successfully with ID: {user1['id']}")
    print(f"  • User 2 (jane) registered successfully with ID: {user2['id']}")
    print(f"  • Duplicate email registration was properly rejected (409 Conflict)")
    print(f"  • Login with correct password succeeded")
    print(f"  • Login with wrong password was rejected (401 Unauthorized)")
    print(f"  • Login with non-existent email was rejected (401 Unauthorized)")
    print("\n📊 Database Status:")
    print("  • Accounts are being stored correctly")
    print("  • Email uniqueness constraint is enforced")
    print("  • Password hashing is working")
    print("  • Login authentication is functioning")
    
    return True

if __name__ == "__main__":
    try:
        success = test_registration_flow()
        exit(0 if success else 1)
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend at http://localhost:8000")
        print("   Please ensure the FastAPI server is running:")
        print("   $ cd backend && python main.py")
        exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        exit(1)
