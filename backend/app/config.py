from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./assetflow.db")

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")

ALGORITHM = os.getenv("ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480")
)

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@assetflow.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")
