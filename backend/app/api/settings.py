from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import Municipality, Ward, EmissionFactor

router = APIRouter(prefix="/settings", tags=["Municipal Settings"])

class SettingsUpdate(BaseModel):
    municipality_name: str
    baseline_target_pct: float
    target_year: int

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    muni = db.query(Municipality).first()
    wards_count = db.query(Ward).count()
    factors = db.query(EmissionFactor).all()

    return {
        "municipality": {
            "name": muni.name if muni else "Metropolis Smart District",
            "country": muni.country if muni else "United States",
            "population": muni.population if muni else 500000,
            "baseline_target_pct": muni.baseline_target_pct if muni else 30.0,
            "target_year": muni.target_year if muni else 2030,
        },
        "wards_count": wards_count,
        "emission_factors": [
            {
                "id": f.id,
                "factor_name": f.factor_name,
                "sector": f.sector.name if f.sector else "",
                "numeric_value": f.numeric_value,
                "activity_unit": f.activity_unit,
                "source_citation": f.source_citation,
                "version": f.version
            }
            for f in factors
        ]
    }

@router.put("/municipality")
def update_municipality(payload: SettingsUpdate, db: Session = Depends(get_db)):
    muni = db.query(Municipality).first()
    if not muni:
        muni = Municipality(name=payload.municipality_name)
        db.add(muni)
    
    muni.name = payload.municipality_name
    muni.baseline_target_pct = payload.baseline_target_pct
    muni.target_year = payload.target_year
    db.commit()
    db.refresh(muni)
    return {"status": "updated", "municipality": muni.name}
