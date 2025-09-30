from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from datetime import datetime
from pymongo import DESCENDING
from .database import db

class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])
        self.username = user_data['username']
        self.email = user_data['email']
        self.password_hash = user_data['password_hash']
        self.user_data = user_data
    
    @staticmethod
    def create_user(username, email, password):
        """Create a new user in database"""
        password_hash = generate_password_hash(password)
        user_data = {
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "profile": {
                "first_name": "",
                "last_name": "",
                "avatar_url": "",
                "bio": ""
            },
            "preferences": {
                "theme": "light",
                "language": "en",
                "email_notifications": True
            },
            "status": {
                "is_active": True,
                "is_verified": False,
                "last_login": None,
                "login_count": 0
            },
            "security": {
                "password_changed_at": datetime.utcnow(),
                "failed_login_attempts": 0,
                "lock_until": None
            },
            "timestamps": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
        
        result = db.db.users.insert_one(user_data)
        return str(result.inserted_id)

    @staticmethod
    def _wrap(user_doc):
        return User(user_doc) if user_doc else None

    @staticmethod
    def find_by_username(username):
        """Find a user by username"""
        if db.db is None:
            return None
        user_doc = db.db.users.find_one({"username": username})
        return User._wrap(user_doc)

    @staticmethod
    def find_by_email(email):
        """Find a user by email"""
        if db.db is None:
            return None
        user_doc = db.db.users.find_one({"email": email})
        return User._wrap(user_doc)

    @staticmethod
    def find_by_id(user_id):
        """Find a user by id"""
        if db.db is None:
            return None
        try:
            obj_id = ObjectId(user_id)
        except Exception:
            return None
        user_doc = db.db.users.find_one({"_id": obj_id})
        return User._wrap(user_doc)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def update_login_stats(self):
        if db.db is None:
            return
        db.db.users.update_one(
            {"_id": ObjectId(self.id)},
            {
                "$set": {
                    "status.last_login": datetime.utcnow(),
                    "timestamps.updated_at": datetime.utcnow()
                },
                "$inc": {"status.login_count": 1}
            }
        )

def get_user_sessions(user_id):
    """Get all sessions for a user"""
    sessions = db.db.sessions.find({'user_id': ObjectId(user_id)}).sort('created_at', DESCENDING)
    return [{
        'session_id': str(session['_id']),
        'session_type': session.get('session_type', 'unknown'),
        'progress': session.get('progress', {}),
        'activity': session.get('activity', {}),
        'created_at': session['created_at'].isoformat()
    } for session in sessions]