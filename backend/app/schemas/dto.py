from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

# Authentication & Users
class UserBase(BaseModel):
    email: str = Field(..., description="User email address")
    full_name: str
    role: str = "analyst"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

# Activity & Carbon Accounting
class ActivityRecordCreate(BaseModel):
    record_date: datetime
    ward_id: int
    sector_id: int
    activity_type: str
    activity_quantity: float
    activity_unit: str
    emission_factor_value: Optional[float] = None
    data_source: str = "manual"

class ActivityRecordResponse(BaseModel):
    id: int
    record_date: datetime
    ward_id: int
    sector_id: int
    activity_type: str
    activity_quantity: float
    activity_unit: str
    emission_factor_value: float
    emissions_kg_co2e: float
    emissions_t_co2e: float
    data_source: str
    data_quality_status: str
    created_at: datetime
    class Config:
        from_attributes = True

# Dashboard DTOs
class TrendPoint(BaseModel):
    date: str
    total_tco2e: float
    electricity_tco2e: float
    transport_tco2e: float
    waste_tco2e: float
    industry_tco2e: float

class SectorBreakdown(BaseModel):
    sector_code: str
    sector_name: str
    emissions_tco2e: float
    percentage: float
    change_pct: float

class WardRanking(BaseModel):
    ward_id: int
    ward_name: str
    ward_code: str
    population: int
    emissions_tco2e: float
    per_capita_tco2e: float
    primary_sector: str
    intensity_status: str

class DashboardSummaryResponse(BaseModel):
    reporting_period: str
    last_updated: datetime
    total_emissions_tco2e: float
    emissions_change_pct: Optional[float]
    electricity_tco2e: float
    transport_tco2e: float
    waste_tco2e: float
    other_tco2e: float
    target_annual_reduction_pct: float
    current_progress_pct: float
    data_points_count: int
    trends: List[TrendPoint]
    sector_breakdown: List[SectorBreakdown]
    ward_rankings: List[WardRanking]
    recent_alerts_count: int

# Monitoring & Telemetry DTOs
class TelemetryEventResponse(BaseModel):
    id: int
    timestamp: datetime
    ward_id: int
    ward_name: str
    sector_id: int
    sector_name: str
    metric_name: str
    value: float
    unit: str
    emissions_rate_kg_hr: float
    status: str
    class Config:
        from_attributes = True

class MonitoringStatusResponse(BaseModel):
    is_simulation_running: bool
    refresh_interval_seconds: int
    last_event_time: Optional[datetime]
    total_events_buffered: int
    active_alerts_count: int
    current_emissions_rate_tco2e_hr: float
    recent_telemetry: List[TelemetryEventResponse]

class SimulationToggleRequest(BaseModel):
    action: str  # "start", "stop", "step"
    interval_seconds: Optional[int] = 5

# Wards & Sectors
class WardResponse(BaseModel):
    id: int
    name: str
    code: str
    population: int
    area_sq_km: float
    latitude: float
    longitude: float
    zone_type: str
    total_emissions_tco2e: float
    per_capita_tco2e: float
    class Config:
        from_attributes = True

class SectorResponse(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str]
    total_emissions_tco2e: float
    percentage: float
    data_completeness_pct: float
    class Config:
        from_attributes = True

# Machine Learning & Forecasting
class AnomalyPoint(BaseModel):
    id: int
    date: str
    ward_name: str
    sector_name: str
    metric: str
    observed_value: float
    expected_value: float
    anomaly_score: float
    severity: str
    explanation: str

class AnomalyDetectionResponse(BaseModel):
    method: str
    total_anomalies_detected: int
    anomalies: List[AnomalyPoint]
    criteria_explanation: str

class ForecastPoint(BaseModel):
    date: str
    forecast_tco2e: float
    lower_bound_tco2e: float
    upper_bound_tco2e: float
    is_projected: bool

class ForecastResponse(BaseModel):
    model_name: str
    horizon_days: int
    mae: float
    rmse: float
    baseline_mae: float
    historical_points: List[ForecastPoint]
    projected_points: List[ForecastPoint]
    status: str
    message: Optional[str] = None

# Policy Simulator
class PolicySimulationRequest(BaseModel):
    electricity_reduction_pct: float = Field(0.0, ge=0.0, le=100.0)
    renewable_share_pct: float = Field(0.0, ge=0.0, le=100.0)
    bus_electrification_pct: float = Field(0.0, ge=0.0, le=100.0)
    waste_diversion_pct: float = Field(0.0, ge=0.0, le=100.0)
    industrial_efficiency_pct: float = Field(0.0, ge=0.0, le=100.0)

class SectorImpact(BaseModel):
    sector_name: str
    baseline_tco2e: float
    simulated_tco2e: float
    saved_tco2e: float
    reduction_pct: float

class PolicySimulationResponse(BaseModel):
    baseline_total_tco2e: float
    simulated_total_tco2e: float
    net_savings_tco2e: float
    percentage_reduction: float
    target_contribution_pct: float
    sector_impacts: List[SectorImpact]
    assumptions: List[str]

# Alerts
class AlertResponse(BaseModel):
    id: int
    timestamp: datetime
    ward_name: str
    sector_name: str
    title: str
    message: str
    metric_name: str
    observed_value: float
    threshold_value: float
    severity: str
    status: str
    resolved_at: Optional[datetime]
    resolved_by: Optional[str]
    class Config:
        from_attributes = True

class AlertStatusUpdate(BaseModel):
    status: str  # "acknowledged" or "resolved"

# Data Management
class ValidationSummary(BaseModel):
    total_rows: int
    valid_rows: int
    rejected_rows: int
    duplicate_rows: int
    missing_values_count: int
    errors: List[str]

class ImportResult(BaseModel):
    success: bool
    imported_count: int
    validation_summary: ValidationSummary
