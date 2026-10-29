from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.database import engine, Base
from app.api import (
    auth,
    dashboard,
    monitoring,
    wards,
    sectors,
    data_mgmt,
    forecasting,
    simulator,
    alerts,
    reports,
    settings as settings_api,
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.on_event("startup")
def startup_event():
    from app.core.database import SessionLocal
    from app.models.entities import ActivityRecord
    db = SessionLocal()
    try:
        count = db.query(ActivityRecord).count()
        if count == 0:
            import seed_data
            seed_data.seed()
    except Exception as e:
        print(f"Startup seed verification: {e}")
    finally:
        db.close()

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(monitoring.router, prefix=settings.API_V1_STR)
app.include_router(wards.router, prefix=settings.API_V1_STR)
app.include_router(sectors.router, prefix=settings.API_V1_STR)
app.include_router(data_mgmt.router, prefix=settings.API_V1_STR)
app.include_router(forecasting.router, prefix=settings.API_V1_STR)
app.include_router(simulator.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(settings_api.router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CARBONIQ Analytics Engine",
        "version": "1.0.0",
        "database": "connected"
    }

@app.get("/")
def root():
    return {
        "name": "CARBONIQ — Municipal Carbon Intelligence Platform",
        "status": "active",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }
