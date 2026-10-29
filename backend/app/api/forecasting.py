from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.ml.anomaly_detector import AnomalyDetector
from app.ml.forecaster import MunicipalEmissionForecaster
from app.schemas.dto import AnomalyDetectionResponse, ForecastResponse

router = APIRouter(prefix="/forecasting", tags=["Machine Learning & Forecasting"])

@router.get("/anomalies", response_model=AnomalyDetectionResponse)
def get_anomalies(
    days: int = Query(60, ge=7, le=365),
    db: Session = Depends(get_db)
):
    detector = AnomalyDetector()
    results = detector.detect_anomalies(db=db, days=days)
    return results

@router.get("/predict", response_model=ForecastResponse)
def get_emissions_forecast(
    horizon_days: int = Query(14, ge=7, le=90),
    sector_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    forecast_results = MunicipalEmissionForecaster.forecast_emissions(
        db=db,
        horizon_days=horizon_days,
        sector_id=sector_id
    )
    return forecast_results
