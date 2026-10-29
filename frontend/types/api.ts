export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface TrendPoint {
  date: string;
  total_tco2e: number;
  electricity_tco2e: number;
  transport_tco2e: number;
  waste_tco2e: number;
  industry_tco2e: number;
}

export interface SectorBreakdown {
  sector_code: string;
  sector_name: string;
  emissions_tco2e: number;
  percentage: number;
  change_pct: number;
}

export interface WardRanking {
  ward_id: number;
  ward_name: string;
  ward_code: string;
  population: number;
  emissions_tco2e: number;
  per_capita_tco2e: number;
  primary_sector: string;
  intensity_status: string;
}

export interface DashboardSummary {
  reporting_period: string;
  last_updated: string;
  total_emissions_tco2e: number;
  emissions_change_pct: number | null;
  electricity_tco2e: number;
  transport_tco2e: number;
  waste_tco2e: number;
  other_tco2e: number;
  target_annual_reduction_pct: number;
  current_progress_pct: number;
  data_points_count: number;
  trends: TrendPoint[];
  sector_breakdown: SectorBreakdown[];
  ward_rankings: WardRanking[];
  recent_alerts_count: number;
}

export interface TelemetryEvent {
  id: number;
  timestamp: string;
  ward_id: number;
  ward_name: string;
  sector_id: number;
  sector_name: string;
  metric_name: string;
  value: number;
  unit: string;
  emissions_rate_kg_hr: number;
  status: string;
}

export interface MonitoringStatus {
  is_simulation_running: boolean;
  refresh_interval_seconds: number;
  last_event_time: string | null;
  total_events_buffered: number;
  active_alerts_count: number;
  current_emissions_rate_tco2e_hr: number;
  recent_telemetry: TelemetryEvent[];
}

export interface Ward {
  id: number;
  name: string;
  code: string;
  population: number;
  area_sq_km: number;
  latitude: number;
  longitude: number;
  zone_type: string;
  total_emissions_tco2e: number;
  per_capita_tco2e: number;
}

export interface Sector {
  id: number;
  name: string;
  code: string;
  description?: string;
  total_emissions_tco2e: number;
  percentage: number;
  data_completeness_pct: number;
}

export interface AnomalyPoint {
  id: number;
  date: string;
  ward_name: string;
  sector_name: string;
  metric: string;
  observed_value: number;
  expected_value: number;
  anomaly_score: number;
  severity: string;
  explanation: string;
}

export interface AnomalyResponse {
  method: string;
  total_anomalies_detected: number;
  anomalies: AnomalyPoint[];
  criteria_explanation: string;
}

export interface ForecastPoint {
  date: string;
  forecast_tco2e: number;
  lower_bound_tco2e: number;
  upper_bound_tco2e: number;
  is_projected: boolean;
}

export interface ForecastResponse {
  model_name: string;
  horizon_days: number;
  mae: number;
  rmse: number;
  baseline_mae: number;
  historical_points: ForecastPoint[];
  projected_points: ForecastPoint[];
  status: string;
  message?: string;
}

export interface SectorImpact {
  sector_name: string;
  baseline_tco2e: number;
  simulated_tco2e: number;
  saved_tco2e: number;
  reduction_pct: number;
}

export interface PolicySimulationResponse {
  baseline_total_tco2e: number;
  simulated_total_tco2e: number;
  net_savings_tco2e: number;
  percentage_reduction: number;
  target_contribution_pct: number;
  sector_impacts: SectorImpact[];
  assumptions: string[];
}

export interface Alert {
  id: number;
  timestamp: string;
  ward_name: string;
  sector_name: string;
  title: string;
  message: string;
  metric_name: string;
  observed_value: number;
  threshold_value: number;
  severity: string;
  status: string;
  resolved_at?: string;
  resolved_by?: string;
}
