import random
from datetime import datetime, timedelta
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.entities import (
    User,
    Municipality,
    Ward,
    EmissionSector,
    EmissionFactor,
    ActivityRecord,
    Alert,
    TelemetryEvent
)
from app.analytics.carbon_calculator import CarbonCalculator

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Municipality).first():
            print("Database already contains data. Skipping initial seed.")
            return

        print("Seeding CARBONIQ Database with municipal baseline data...")

        # 1. Users
        admin_user = User(
            email="admin@carboniq.gov",
            hashed_password=get_password_hash("Password123!"),
            full_name="Dr. Elena Vance (Lead Sustainability Director)",
            role="admin",
            is_active=True
        )
        analyst_user = User(
            email="analyst@carboniq.gov",
            hashed_password=get_password_hash("Password123!"),
            full_name="Marcus Chen (Carbon Data Analyst)",
            role="analyst",
            is_active=True
        )
        db.add_all([admin_user, analyst_user])

        # 2. Municipality
        muni = Municipality(
            name="Metropolis Smart District",
            country="United States",
            population=480000,
            baseline_target_pct=30.0,
            target_year=2030
        )
        db.add(muni)
        db.flush()

        # 3. Wards
        wards_data = [
            ("North Innovation Quarter", "W-01", 85000, 12.4, 37.785, -122.405, "Commercial"),
            ("Downtown Financial Core", "W-02", 95000, 8.2, 37.792, -122.398, "High-Density Commercial"),
            ("East Industrial Marine Terminal", "W-03", 45000, 22.5, 37.765, -122.385, "Industrial"),
            ("West Residential Greens", "W-04", 130000, 28.1, 37.750, -122.450, "Residential"),
            ("South Harbor Logistics Hub", "W-05", 65000, 19.3, 37.730, -122.390, "Logistics/Freight"),
            ("University & Medical District", "W-06", 60000, 14.0, 37.760, -122.455, "Institutional"),
        ]
        wards = []
        for name, code, pop, area, lat, lon, z_type in wards_data:
            w = Ward(
                municipality_id=muni.id,
                name=name,
                code=code,
                population=pop,
                area_sq_km=area,
                latitude=lat,
                longitude=lon,
                zone_type=z_type
            )
            db.add(w)
            wards.append(w)
        db.flush()

        # 4. Sectors
        sectors_data = [
            ("Electricity & Grid Power", "ELEC-GRID", "Municipal grid power draw, commercial and public facility electricity."),
            ("Municipal Transportation & Fleet", "TRANS-MUNI", "Public transit buses, municipal maintenance fleet, and traffic corridors."),
            ("Solid Waste & Landfills", "WASTE-MSW", "Municipal solid waste collection, transfer stations, and landfill methane."),
            ("Industrial & Stationary Fuel", "FUEL-IND", "Natural gas heating, stationary boilers, and industrial process fuel."),
        ]
        sectors = []
        for name, code, desc in sectors_data:
            s = EmissionSector(name=name, code=code, description=desc)
            db.add(s)
            sectors.append(s)
        db.flush()

        # 5. Emission Factors
        factors_data = [
            ("EPA eGRID Subregion CAMX 2024", sectors[0].id, 0.385, "kwh", "kgCO2e", "Regional Grid", "EPA eGRID 2024 Table 1", False),
            ("IPCC Mobile Diesel Fleet Factor", sectors[1].id, 1.250, "vehicle-km", "kgCO2e", "National Fleet", "IPCC Guidelines Vol 2 Ch 3", False),
            ("IPCC Municipal Solid Waste Landfill", sectors[2].id, 450.0, "tonne", "kgCO2e", "Municipal Solid Waste", "IPCC Waste Model Tier 1", False),
            ("EPA Stationary Natural Gas Combustion", sectors[3].id, 2.050, "m3", "kgCO2e", "Stationary Commercial", "EPA GHG Emission Factors Hub", False),
        ]
        for fname, s_id, val, a_unit, e_unit, geo, cite, is_ill in factors_data:
            ef = EmissionFactor(
                factor_name=fname,
                sector_id=s_id,
                numeric_value=val,
                activity_unit=a_unit,
                emission_unit=e_unit,
                geography=geo,
                source_citation=cite,
                version="v2.4",
                is_illustrative=is_ill
            )
            db.add(ef)
        db.flush()

        # 6. Generate 60 days of historical activity records
        print("Generating 60 days of municipal activity records...")
        now = datetime.utcnow()
        activity_records = []

        for day_offset in range(60, -1, -1):
            record_date = now - timedelta(days=day_offset)
            is_weekend = record_date.weekday() >= 5
            
            for w in wards:
                # 1) Electricity
                base_kwh = (w.population * 12.0) * (0.8 if is_weekend else 1.15)
                # East Industrial consumes more
                if w.code == "W-03":
                    base_kwh *= 2.2
                qty_kwh = base_kwh * random.uniform(0.92, 1.08)
                kg_co2e, t_co2e = CarbonCalculator.calculate_emissions(qty_kwh, "kwh", 0.385, "kwh")
                activity_records.append(ActivityRecord(
                    record_date=record_date.replace(hour=14, minute=0),
                    municipality_id=muni.id,
                    ward_id=w.id,
                    sector_id=sectors[0].id,
                    activity_type="Grid Electricity Demand",
                    activity_quantity=round(qty_kwh, 1),
                    activity_unit="kWh",
                    emission_factor_value=0.385,
                    emissions_kg_co2e=kg_co2e,
                    emissions_t_co2e=t_co2e,
                    data_source="measured",
                    data_quality_status="verified"
                ))

                # 2) Transit
                base_vkm = (w.population * 0.45) * (0.65 if is_weekend else 1.1)
                qty_vkm = base_vkm * random.uniform(0.90, 1.10)
                kg_co2e, t_co2e = CarbonCalculator.calculate_emissions(qty_vkm, "vehicle-km", 1.250, "vehicle-km")
                activity_records.append(ActivityRecord(
                    record_date=record_date.replace(hour=17, minute=30),
                    municipality_id=muni.id,
                    ward_id=w.id,
                    sector_id=sectors[1].id,
                    activity_type="Transit Bus Operation",
                    activity_quantity=round(qty_vkm, 1),
                    activity_unit="vehicle-km",
                    emission_factor_value=1.250,
                    emissions_kg_co2e=kg_co2e,
                    emissions_t_co2e=t_co2e,
                    data_source="telemetry",
                    data_quality_status="verified"
                ))

                # 3) Waste (periodic every 2 days)
                if day_offset % 2 == 0:
                    base_tonnes = (w.population * 0.0012) * random.uniform(0.85, 1.15)
                    kg_co2e, t_co2e = CarbonCalculator.calculate_emissions(base_tonnes, "tonne", 450.0, "tonne")
                    activity_records.append(ActivityRecord(
                        record_date=record_date.replace(hour=11, minute=0),
                        municipality_id=muni.id,
                        ward_id=w.id,
                        sector_id=sectors[2].id,
                        activity_type="Landfill Solid Waste",
                        activity_quantity=round(base_tonnes, 2),
                        activity_unit="tonne",
                        emission_factor_value=450.0,
                        emissions_kg_co2e=kg_co2e,
                        emissions_t_co2e=t_co2e,
                        data_source="measured",
                        data_quality_status="verified"
                    ))

                # 4) Industrial Fuel (mostly in industrial / commercial wards)
                if w.code in ["W-02", "W-03", "W-05"]:
                    qty_m3 = (3500.0 if w.code == "W-03" else 1200.0) * random.uniform(0.88, 1.12)
                    # Introduce an intentional anomaly 8 days ago in W-03
                    if day_offset == 8 and w.code == "W-03":
                        qty_m3 *= 3.4
                    kg_co2e, t_co2e = CarbonCalculator.calculate_emissions(qty_m3, "m3", 2.050, "m3")
                    activity_records.append(ActivityRecord(
                        record_date=record_date.replace(hour=16, minute=0),
                        municipality_id=muni.id,
                        ward_id=w.id,
                        sector_id=sectors[3].id,
                        activity_type="Natural Gas Stationary Boilers",
                        activity_quantity=round(qty_m3, 1),
                        activity_unit="m3",
                        emission_factor_value=2.050,
                        emissions_kg_co2e=kg_co2e,
                        emissions_t_co2e=t_co2e,
                        data_source="measured",
                        data_quality_status="verified"
                    ))

        db.add_all(activity_records)
        db.flush()

        # 7. Seed sample alerts
        alerts_data = [
            (
                wards[2].id,
                sectors[3].id,
                "SPIKE: High Natural Gas Consumption in W-03",
                "Stationary combustion surged to 11,900 m3, exceeding nominal baseline by 340%.",
                "Industrial Gas Consumption",
                24.39,
                8.0,
                "critical",
                "active"
            ),
            (
                wards[1].id,
                sectors[0].id,
                "SURGE: Peak Commercial HVAC Draw in W-02",
                "Substation grid power draw exceeded 6,200 kW during heatwave demand peak.",
                "Substation Power Demand",
                2.38,
                1.8,
                "high",
                "active"
            ),
            (
                wards[0].id,
                sectors[1].id,
                "ELEVATED: Tech Corridor Traffic Gridlock",
                "Vehicle delay index increased corridor transit emissions by 42%.",
                "Corridor Traffic Volume",
                1.45,
                1.2,
                "medium",
                "acknowledged"
            ),
        ]
        for w_id, s_id, title, msg, m_name, obs, thresh, sev, stat in alerts_data:
            a = Alert(
                timestamp=now - timedelta(hours=random.randint(1, 36)),
                ward_id=w_id,
                sector_id=s_id,
                title=title,
                message=msg,
                metric_name=m_name,
                observed_value=obs,
                threshold_value=thresh,
                severity=sev,
                status=stat
            )
            db.add(a)

        db.commit()
        print(f"Successfully seeded {len(activity_records)} records, {len(wards)} wards, {len(sectors)} sectors!")

    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
