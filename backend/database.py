from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure
import os

_client = None
_db = None

def init_db(app):
    global _client, _db
    try:
        _client = MongoClient(app.config["MONGO_URI"], serverSelectionTimeoutMS=5000)
        _client.admin.command("ping")
        _db = _client.get_default_database() if "/" in app.config["MONGO_URI"].split("@")[-1] else _client["fitai_db"]
        _create_indexes()
        print("✅ MongoDB connected successfully")
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {e}")

def get_db():
    return _db

def _create_indexes():
    if _db is None:
        return
    _db.users.create_index([("email", ASCENDING)], unique=True)
    _db.users.create_index([("username", ASCENDING)], unique=True)
    _db.user_logs.create_index([("user_id", ASCENDING), ("date", DESCENDING)])
    _db.saved_workouts.create_index([("user_id", ASCENDING)])
    _db.meal_logs.create_index([("user_id", ASCENDING), ("date", DESCENDING)])
    print("✅ DB indexes created")