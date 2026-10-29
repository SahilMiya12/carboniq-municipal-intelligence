from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import TelemetryEvent, Alert
from app.schemas.dto import MonitoringStatusResponse, TelemetryEventResponse, SimulationToggleRequest
from app.simulation.telemetry_simulator import simulator

router = APIRouter(prefix="/monitoring", tags=["Monitoring & Telemetry"])

@router.get("/status", response_model=MonitoringStatusResponse)
def get_monitoring_status(db: Session = Depends(get_db)):
    events = db.query(TelemetryEvent).order_by(TelemetryEvent.timestamp.desc()).limit(15).all()
    active_alerts = db.query(Alert).filter(Alert.status == "active").count()
    total_events = db.query(TelemetryEvent).count()

    # Calculate real-time rate
    current_rate = sum(e.emissions_rate_kg_hr for e in events[:5]) / 1000.0 if events else 0.0

    recent_dto = []
    for e in events:
        recent_dto.append(TelemetryEventResponse(
            id=e.id,
            timestamp=e.timestamp,
            ward_id=e.ward_id,
            ward_name=e.ward.name if e.ward else "Ward Unknown",
            sector_id=e.sector_id,
            sector_name=e.sector.name if e.sector else "General",
            metric_name=e.metric_name,
            value=e.value,
            unit=e.unit,
            emissions_rate_kg_hr=e.emissions_rate_kg_hr,
            status=e.status
        ))

    return MonitoringStatusResponse(
        is_simulation_running=simulator.is_running,
        refresh_interval_seconds=simulator.interval,
        last_event_time=simulator.last_event_time,
        total_events_buffered=total_events,
        active_alerts_count=active_alerts,
        current_emissions_rate_tco2e_hr=round(current_rate, 3),
        recent_telemetry=recent_dto
    )

@router.post("/control")
def control_simulation(request: SimulationToggleRequest, db: Session = Depends(get_db)):
    if request.action == "start":
        simulator.start(interval_seconds=request.interval_seconds or 5)
        return {"status": "started", "interval": simulator.interval}
    elif request.action == "stop":
        simulator.stop()
        return {"status": "stopped"}
    elif request.action == "step":
        event = simulator.generate_single_event(db)
        return {"status": "step_generated", "event_id": event.id if event else None}
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use start, stop, or step.")
