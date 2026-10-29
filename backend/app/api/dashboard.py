from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.analytics.aggregator import AnalyticsAggregator
from app.schemas.dto import DashboardSummaryResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    start_date: Optional[str] = Query(None, description="ISO Start date e.g. 2026-09-01"),
    end_date: Optional[str] = Query(None, description="ISO End date e.g. 2026-10-09"),
    ward_id: Optional[int] = Query(None, description="Filter by Ward ID"),
    sector_id: Optional[int] = Query(None, description="Filter by Sector ID"),
    db: Session = Depends(get_db)
):
    start_dt = None
    if start_date:
        start_dt = datetime.fromisoformat(start_date)
    end_dt = None
    if end_date:
        end_dt = datetime.fromisoformat(end_date)
        if len(end_date) <= 10:
            end_dt = end_dt.replace(hour=23, minute=59, second=59)

    summary = AnalyticsAggregator.get_dashboard_summary(
        db=db,
        start_date=start_dt,
        end_date=end_dt,
        ward_id=ward_id,
        sector_id=sector_id
    )
    return summary
