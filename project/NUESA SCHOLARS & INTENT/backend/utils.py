"""Utility functions for the NUESA backend."""
import json
from typing import Any, Dict
from datetime import datetime


def serialize_json(obj: Any) -> str:
    """Serialize Python object to JSON string."""
    return json.dumps(obj, default=str)


def deserialize_json(json_str: str) -> Any:
    """Deserialize JSON string to Python object."""
    if not json_str:
        return None
    return json.loads(json_str)


def format_error(error: str, status_code: int = 400) -> Dict[str, Any]:
    """Format error response."""
    return {
        "error": True,
        "message": error,
        "status_code": status_code,
        "timestamp": datetime.utcnow().isoformat()
    }


def format_success(data: Any = None, message: str = "Success") -> Dict[str, Any]:
    """Format success response."""
    return {
        "success": True,
        "message": message,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }


def paginate(items: list, page: int, page_size: int) -> Dict[str, Any]:
    """Paginate items list."""
    total = len(items)
    total_pages = (total + page_size - 1) // page_size
    start = (page - 1) * page_size
    end = start + page_size
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "data": items[start:end]
    }


def validate_email(email: str) -> bool:
    """Validate email format."""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone: str) -> bool:
    """Validate phone number format."""
    import re
    pattern = r'^[\d\+\-\(\)\s]{10,}$'
    return re.match(pattern, phone) is not None
