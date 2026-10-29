from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import Alert
from app.schemas.dto import AlertResponse, AlertStatusUpdate

router = APIRouter(prefix="/alerts", tags=["Alerts Center"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    status: Optional[str] = Query(None, description="active, acknowledged, resolved"),
    severity: Optional[str] = Query(None, description="low, medium, high, critical"),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)

    alerts = query.order_by(Alert.timestamp.desc()).limit(100).all()

    return [
        AlertResponse(
            id=a.id,
            timestamp=a.timestamp,
            ward_name=a.ward.name if a.ward else "General",
            sector_name=a.sector.name if a.sector else "General",
            title=a.title,
            message=a.message,
            metric_name=a.metric_name,
            observed_value=a.observed_value,
            threshold_value=a.threshold_value,
            severity=a.severity,
            status=a.status,
            resolved_at=a.resolved_at,
            resolved_by=a.resolved_by
        )
        for a in alerts
    ]

@router.patch("/{alert_id}/status")
def update_alert_status(
    alert_id: int,
    payload: AlertStatusUpdate,
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if payload.status not in ["acknowledged", "resolved", "active"]:
        raise HTTPException(status_code=400, detail="Invalid status value")

    alert.status = payload.status
    if payload.status == "resolved":
        alert.resolved_at = datetime.utcnow()
        alert.resolved_by = "Municipal Lead Officer"
    elif payload.status == "acknowledged":
        alert.resolved_by = "Analyst Acknowledged"

    db.commit()
    return {"id": alert.id, "status": alert.status, "updated": True}
