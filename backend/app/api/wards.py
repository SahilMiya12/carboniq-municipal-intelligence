from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import Ward, ActivityRecord
from app.schemas.dto import WardResponse

router = APIRouter(prefix="/wards", tags=["Municipal Wards"])

@router.get("", response_model=List[WardResponse])
def get_all_wards(db: Session = Depends(get_db)):
    wards = db.query(Ward).all()
    results = []
    for w in wards:
        records = db.query(ActivityRecord).filter(ActivityRecord.ward_id == w.id).all()
        total_tco2e = sum(r.emissions_t_co2e for r in records)
        per_capita = (total_tco2e * 1000.0 / w.population) if w.population > 0 else 0.0

        results.append(WardResponse(
            id=w.id,
            name=w.name,
            code=w.code,
            population=w.population,
            area_sq_km=w.area_sq_km,
            latitude=w.latitude,
            longitude=w.longitude,
            zone_type=w.zone_type,
            total_emissions_tco2e=round(total_tco2e, 2),
            per_capita_tco2e=round(per_capita, 3)
        ))
    return results

@router.get("/{ward_id}")
def get_ward_detail(ward_id: int, db: Session = Depends(get_db)):
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail="Ward not found")

    records = db.query(ActivityRecord).filter(ActivityRecord.ward_id == ward.id).all()
    total_tco2e = sum(r.emissions_t_co2e for r in records)
    per_capita = (total_tco2e * 1000.0 / ward.population) if ward.population > 0 else 0.0

    # Sector breakdown for this ward
    sector_dist = {}
    for r in records:
        sec_name = r.sector.name if r.sector else "General"
        sector_dist[sec_name] = sector_dist.get(sec_name, 0.0) + r.emissions_t_co2e

    dist_list = [{"sector": k, "tco2e": round(v, 2)} for k, v in sector_dist.items()]
    dist_list.sort(key=lambda x: x["tco2e"], reverse=True)

    return {
        "ward": {
            "id": ward.id,
            "name": ward.name,
            "code": ward.code,
            "population": ward.population,
            "area_sq_km": ward.area_sq_km,
            "latitude": ward.latitude,
            "longitude": ward.longitude,
            "zone_type": ward.zone_type,
            "total_emissions_tco2e": round(total_tco2e, 2),
            "per_capita_tco2e": round(per_capita, 3),
        },
        "sector_breakdown": dist_list,
        "recent_activities": [
            {
                "id": r.id,
                "date": r.record_date.strftime("%Y-%m-%d"),
                "activity": r.activity_type,
                "quantity": f"{r.activity_quantity} {r.activity_unit}",
                "emissions_tco2e": round(r.emissions_t_co2e, 2),
                "source": r.data_source
            }
            for r in records[:10]
        ]
    }
