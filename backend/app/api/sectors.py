from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import EmissionSector, ActivityRecord, EmissionFactor
from app.schemas.dto import SectorResponse

router = APIRouter(prefix="/sectors", tags=["Emission Sectors"])

@router.get("", response_model=List[SectorResponse])
def get_all_sectors(db: Session = Depends(get_db)):
    sectors = db.query(EmissionSector).all()
    all_records = db.query(ActivityRecord).all()
    grand_total = sum(r.emissions_t_co2e for r in all_records) or 1.0

    results = []
    for s in sectors:
        s_records = [r for r in all_records if r.sector_id == s.id]
        total_tco2e = sum(r.emissions_t_co2e for r in s_records)
        pct = (total_tco2e / grand_total * 100.0) if grand_total > 0 else 0.0

        # Completeness metric based on verified records ratio
        verified_count = sum(1 for r in s_records if r.data_quality_status == "verified")
        completeness = round((verified_count / len(s_records) * 100.0), 1) if s_records else 95.0

        results.append(SectorResponse(
            id=s.id,
            name=s.name,
            code=s.code,
            description=s.description,
            total_emissions_tco2e=round(total_tco2e, 2),
            percentage=round(pct, 1),
            data_completeness_pct=completeness
        ))

    results.sort(key=lambda x: x.total_emissions_tco2e, reverse=True)
    return results

@router.get("/{sector_id}/factors")
def get_sector_emission_factors(sector_id: int, db: Session = Depends(get_db)):
    factors = db.query(EmissionFactor).filter(EmissionFactor.sector_id == sector_id).all()
    return [
        {
            "id": f.id,
            "name": f.factor_name,
            "value": f.numeric_value,
            "activity_unit": f.activity_unit,
            "emission_unit": f.emission_unit,
            "geography": f.geography,
            "citation": f.source_citation,
            "version": f.version,
            "is_illustrative": f.is_illustrative
        }
        for f in factors
    ]
