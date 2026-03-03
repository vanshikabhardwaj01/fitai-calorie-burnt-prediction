import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SECRET_KEY                  = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY              = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES    = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES   = timedelta(days=30)
    MONGO_URI                   = os.getenv("MONGO_URI", "mongodb://localhost:27017/fitai_db")
    SPOONACULAR_API_KEY         = os.getenv("SPOONACULAR_API_KEY", "")
    API_NINJAS_KEY              = os.getenv("API_NINJAS_KEY", "")
    DEBUG                       = os.getenv("FLASK_DEBUG", "True") == "True"