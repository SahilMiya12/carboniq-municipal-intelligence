from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.simulation.policy_engine import PolicySimulator
from app.schemas.dto import PolicySimulationRequest, PolicySimulationResponse
from app.models.entities import PolicyScenario

router = APIRouter(prefix="/simulator", tags=["Policy Simulator"])

@router.post("/run", response_model=PolicySimulationResponse)
def run_policy_simulation(
    request: PolicySimulationRequest,
    db: Session = Depends(get_db)
):
    results = PolicySimulator.simulate_policy(db=db, request=request)
    return results

@router.post("/save")
def save_scenario(
    request: PolicySimulationRequest,
    name: str,
    db: Session = Depends(get_db)
):
    sim = PolicySimulator.simulate_policy(db=db, request=request)
    scenario = PolicyScenario(
        name=name,
        baseline_tco2e=sim.baseline_total_tco2e,
        projected_tco2e=sim.simulated_total_tco2e,
        reduction_tco2e=sim.net_savings_tco2e,
        reduction_pct=sim.percentage_reduction,
        electricity_reduction_pct=request.electricity_reduction_pct,
        renewable_share_pct=request.renewable_share_pct,
        bus_electrification_pct=request.bus_electrification_pct,
        waste_diversion_pct=request.waste_diversion_pct
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    return {"id": scenario.id, "name": scenario.name, "saved": True}

@router.get("/saved")
def get_saved_scenarios(db: Session = Depends(get_db)):
    scenarios = db.query(PolicyScenario).order_by(PolicyScenario.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "baseline_tco2e": s.baseline_tco2e,
            "projected_tco2e": s.projected_tco2e,
            "reduction_pct": s.reduction_pct,
            "created_at": s.created_at.strftime("%Y-%m-%d")
        }
        for s in scenarios
    ]
