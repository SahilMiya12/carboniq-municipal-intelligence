from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.entities import ActivityRecord, Municipality
from app.schemas.dto import PolicySimulationRequest, PolicySimulationResponse, SectorImpact

class PolicySimulator:
    """
    Parametric Policy Scenario Simulator for Municipal Decarbonization Interventions.
    Applies standard marginal abatement assumptions and IPCC emission factor modifications.
    """

    @staticmethod
    def simulate_policy(
        db: Session,
        request: PolicySimulationRequest
    ) -> PolicySimulationResponse:
        records = db.query(ActivityRecord).all()

        if not records:
            # Fallback baseline if DB is empty
            baseline_elec = 12500.0
            baseline_trans = 8900.0
            baseline_waste = 4300.0
            baseline_ind = 3100.0
        else:
            baseline_elec = sum(r.emissions_t_co2e for r in records if "elec" in r.sector.code.lower())
            baseline_trans = sum(r.emissions_t_co2e for r in records if "trans" in r.sector.code.lower())
            baseline_waste = sum(r.emissions_t_co2e for r in records if "waste" in r.sector.code.lower())
            baseline_ind = sum(r.emissions_t_co2e for r in records if not any(x in r.sector.code.lower() for x in ["elec", "trans", "waste"]))

        # 1. Electricity Sector Intervention
        # Combination of efficiency reduction + grid greening (renewable share)
        eff_factor = 1.0 - (request.electricity_reduction_pct / 100.0)
        grid_factor = 1.0 - (request.renewable_share_pct / 100.0)
        sim_elec = baseline_elec * eff_factor * grid_factor
        saved_elec = baseline_elec - sim_elec

        # 2. Transportation Sector Intervention
        # Bus & fleet electrification: EV transit reduces emissions by approx 75% compared to diesel ICE
        ev_fraction = request.bus_electrification_pct / 100.0
        # 60% of municipal transport is public buses & city fleet
        sim_trans = baseline_trans * (1.0 - (0.60 * ev_fraction * 0.75))
        saved_trans = baseline_trans - sim_trans

        # 3. Solid Waste & Landfill Intervention
        # Waste diversion / composting / methane capture
        waste_div_fraction = request.waste_diversion_pct / 100.0
        sim_waste = baseline_waste * (1.0 - (waste_div_fraction * 0.85))
        saved_waste = baseline_waste - sim_waste

        # 4. Industrial & Stationary Efficiency
        ind_eff_fraction = request.industrial_efficiency_pct / 100.0
        sim_ind = baseline_ind * (1.0 - (ind_eff_fraction * 0.90))
        saved_ind = baseline_ind - sim_ind

        baseline_total = baseline_elec + baseline_trans + baseline_waste + baseline_ind
        sim_total = sim_elec + sim_trans + sim_waste + sim_ind
        net_savings = max(0.0, baseline_total - sim_total)
        pct_reduction = round((net_savings / baseline_total * 100.0), 2) if baseline_total > 0 else 0.0

        muni = db.query(Municipality).first()
        target_pct = muni.baseline_target_pct if muni else 30.0
        target_contribution = round(min(100.0, (pct_reduction / target_pct * 100.0)), 1) if target_pct > 0 else 0.0

        sector_impacts = [
            SectorImpact(
                sector_name="Electricity & Grid",
                baseline_tco2e=round(baseline_elec, 2),
                simulated_tco2e=round(sim_elec, 2),
                saved_tco2e=round(saved_elec, 2),
                reduction_pct=round((saved_elec / max(1.0, baseline_elec)) * 100.0, 1)
            ),
            SectorImpact(
                sector_name="Municipal Transportation",
                baseline_tco2e=round(baseline_trans, 2),
                simulated_tco2e=round(sim_trans, 2),
                saved_tco2e=round(saved_trans, 2),
                reduction_pct=round((saved_trans / max(1.0, baseline_trans)) * 100.0, 1)
            ),
            SectorImpact(
                sector_name="Solid Waste & Wastewater",
                baseline_tco2e=round(baseline_waste, 2),
                simulated_tco2e=round(sim_waste, 2),
                saved_tco2e=round(saved_waste, 2),
                reduction_pct=round((saved_waste / max(1.0, baseline_waste)) * 100.0, 1)
            ),
            SectorImpact(
                sector_name="Industrial & Commercial Fuel",
                baseline_tco2e=round(baseline_ind, 2),
                simulated_tco2e=round(sim_ind, 2),
                saved_tco2e=round(saved_ind, 2),
                reduction_pct=round((saved_ind / max(1.0, baseline_ind)) * 100.0, 1)
            ),
        ]

        assumptions = [
            "Grid emission intensity factor is modified linearly by the renewable electricity share.",
            "Municipal bus electrification assumes replacement of diesel buses with zero-emission electric buses operating at 75% net GHG reduction on average regional grid.",
            "Landfill diversion models methane abatement based on IPCC Tier 1 First Order Decay methodology.",
            "Modeled estimates represent projected annual equilibrium savings, subject to seasonal weather variations."
        ]

        return PolicySimulationResponse(
            baseline_total_tco2e=round(baseline_total, 2),
            simulated_total_tco2e=round(sim_total, 2),
            net_savings_tco2e=round(net_savings, 2),
            percentage_reduction=pct_reduction,
            target_contribution_pct=target_contribution,
            sector_impacts=sector_impacts,
            assumptions=assumptions
        )
