from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="analyst")  # 'admin' or 'analyst'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Municipality(Base):
    __tablename__ = "municipalities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    country = Column(String(100), default="United States")
    population = Column(Integer, default=500000)
    baseline_target_pct = Column(Float, default=30.0)  # 30% reduction by 2030
    target_year = Column(Integer, default=2030)
    created_at = Column(DateTime, default=datetime.utcnow)

    wards = relationship("Ward", back_populates="municipality")

class Ward(Base):
    __tablename__ = "wards"

    id = Column(Integer, primary_key=True, index=True)
    municipality_id = Column(Integer, ForeignKey("municipalities.id"), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)
    population = Column(Integer, default=50000)
    area_sq_km = Column(Float, default=15.0)
    latitude = Column(Float, default=37.7749)
    longitude = Column(Float, default=-122.4194)
    zone_type = Column(String(50), default="Mixed Use")  # Residential, Commercial, Industrial, Mixed Use

    municipality = relationship("Municipality", back_populates="wards")
    activity_records = relationship("ActivityRecord", back_populates="ward")
    telemetry_events = relationship("TelemetryEvent", back_populates="ward")
    alerts = relationship("Alert", back_populates="ward")

class EmissionSector(Base):
    __tablename__ = "emission_sectors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)

    activity_records = relationship("ActivityRecord", back_populates="sector")
    emission_factors = relationship("EmissionFactor", back_populates="sector")
    telemetry_events = relationship("TelemetryEvent", back_populates="sector")
    alerts = relationship("Alert", back_populates="sector")

class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id = Column(Integer, primary_key=True, index=True)
    factor_name = Column(String(255), nullable=False)
    sector_id = Column(Integer, ForeignKey("emission_sectors.id"), nullable=False)
    numeric_value = Column(Float, nullable=False)  # in kgCO2e per activity unit
    activity_unit = Column(String(50), nullable=False)  # e.g., kWh, passenger-km, liter, tonne
    emission_unit = Column(String(50), default="kgCO2e")
    geography = Column(String(100), default="National/Regional Grid")
    applicable_period = Column(String(50), default="2024-2026")
    source_citation = Column(String(255), default="EPA eGRID 2024 / IPCC Guidelines")
    version = Column(String(20), default="v2.1")
    is_illustrative = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sector = relationship("EmissionSector", back_populates="emission_factors")

class ActivityRecord(Base):
    __tablename__ = "activity_records"

    id = Column(Integer, primary_key=True, index=True)
    record_date = Column(DateTime, index=True, nullable=False)
    municipality_id = Column(Integer, ForeignKey("municipalities.id"), nullable=False)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False)
    sector_id = Column(Integer, ForeignKey("emission_sectors.id"), nullable=False)
    activity_type = Column(String(100), nullable=False)
    activity_quantity = Column(Float, nullable=False)
    activity_unit = Column(String(50), nullable=False)
    emission_factor_value = Column(Float, nullable=False)
    emissions_kg_co2e = Column(Float, nullable=False)
    emissions_t_co2e = Column(Float, nullable=False)
    data_source = Column(String(50), default="measured")  # 'measured', 'imported', 'telemetry'
    data_quality_status = Column(String(50), default="verified")  # 'verified', 'estimated', 'flagged'
    created_at = Column(DateTime, default=datetime.utcnow)

    ward = relationship("Ward", back_populates="activity_records")
    sector = relationship("EmissionSector", back_populates="activity_records")

class TelemetryEvent(Base):
    __tablename__ = "telemetry_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False)
    sector_id = Column(Integer, ForeignKey("emission_sectors.id"), nullable=False)
    metric_name = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    emissions_rate_kg_hr = Column(Float, nullable=False)
    status = Column(String(50), default="NORMAL")  # NORMAL, ELEVATED, SURGE, SPIKE

    ward = relationship("Ward", back_populates="telemetry_events")
    sector = relationship("EmissionSector", back_populates="telemetry_events")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False)
    sector_id = Column(Integer, ForeignKey("emission_sectors.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    metric_name = Column(String(100), nullable=False)
    observed_value = Column(Float, nullable=False)
    threshold_value = Column(Float, nullable=False)
    severity = Column(String(50), default="medium")  # 'low', 'medium', 'high', 'critical'
    status = Column(String(50), default="active")  # 'active', 'acknowledged', 'resolved'
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(100), nullable=True)

    ward = relationship("Ward", back_populates="alerts")
    sector = relationship("EmissionSector", back_populates="alerts")

class PolicyScenario(Base):
    __tablename__ = "policy_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    baseline_tco2e = Column(Float, nullable=False)
    projected_tco2e = Column(Float, nullable=False)
    reduction_tco2e = Column(Float, nullable=False)
    reduction_pct = Column(Float, nullable=False)
    electricity_reduction_pct = Column(Float, default=0.0)
    renewable_share_pct = Column(Float, default=0.0)
    bus_electrification_pct = Column(Float, default=0.0)
    waste_diversion_pct = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class ForecastResult(Base):
    __tablename__ = "forecast_results"

    id = Column(Integer, primary_key=True, index=True)
    forecast_date = Column(DateTime, nullable=False)
    sector_name = Column(String(100), nullable=False)
    predicted_tco2e = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=False)
    upper_bound = Column(Float, nullable=False)
    model_name = Column(String(100), default="Ridge/Linear Regression Ensemble")
    created_at = Column(DateTime, default=datetime.utcnow)
