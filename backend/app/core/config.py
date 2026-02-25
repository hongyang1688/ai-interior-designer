from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "AI Interior Designer"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/ai_designer"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Storage
    S3_ENDPOINT: str = ""
    S3_BUCKET: str = "ai-interior-designer"
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    
    # AI Models
    SD_API_URL: str = "http://localhost:7860"
    CAD_SERVICE_URL: str = ""
    
    class Config:
        env_file = ".env"


settings = Settings()