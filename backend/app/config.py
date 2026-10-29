import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_SQLITE_FILE = ROOT_DIR / "carboniq.db"
DEFAULT_DB_URL = f"sqlite:///{DEFAULT_SQLITE_FILE}"

class Settings(BaseSettings):
    PROJECT_NAME: str = "CARBONIQ - Municipal Carbon Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "carboniq-super-secret-production-key-2026-secure-hash")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", DEFAULT_DB_URL)
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # Simulation
    SIMULATION_INTERVAL_SECONDS: int = 5
    DEFAULT_MUNICIPALITY: str = "Metropolis Smart District"
    
    class Config:
        case_sensitive = True

settings = Settings()
