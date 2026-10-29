import {
  DashboardSummary,
  MonitoringStatus,
  Ward,
  Sector,
  AnomalyResponse,
  ForecastResponse,
  PolicySimulationResponse,
  Alert,
} from "@/types/api";

function getApiBase(): string {
  if (typeof window !== "undefined") {
    // In browser context, use relative /api/v1 so Next.js proxy rewrite handles it cleanly without CORS issues
    return "/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("carboniq_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const base = getApiBase();
  let res: Response;
  try {
    res = await fetch(`${base}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    // If browser proxy fails or direct access is needed, fallback to direct port 8000
    if (base === "/api/v1") {
      res = await fetch(`http://127.0.0.1:8000/api/v1${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      throw err;
    }
  }

  if (!res.ok) {
    let errorDetail = "API Request failed";
    try {
      const err = await res.json();
      errorDetail = err.detail || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    fetchJson<{ access_token: string; token_type: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => fetchJson<any>("/auth/me"),

  // Dashboard
  getDashboardSummary: (params?: { startDate?: string; endDate?: string; wardId?: number; sectorId?: number }) => {
    const q = new URLSearchParams();
    if (params?.startDate) q.append("start_date", params.startDate);
    if (params?.endDate) q.append("end_date", params.endDate);
    if (params?.wardId) q.append("ward_id", params.wardId.toString());
    if (params?.sectorId) q.append("sector_id", params.sectorId.toString());
    const queryString = q.toString() ? `?${q.toString()}` : "";
    return fetchJson<DashboardSummary>(`/dashboard/summary${queryString}`);
  },

  // Monitoring
  getMonitoringStatus: () => fetchJson<MonitoringStatus>("/monitoring/status"),
  controlSimulation: (action: "start" | "stop" | "step", intervalSeconds?: number) =>
    fetchJson<any>("/monitoring/control", {
      method: "POST",
      body: JSON.stringify({ action, interval_seconds: intervalSeconds }),
    }),

  // Wards
  getWards: () => fetchJson<Ward[]>("/wards"),
  getWardDetail: (id: number) => fetchJson<any>(`/wards/${id}`),

  // Sectors
  getSectors: () => fetchJson<Sector[]>("/sectors"),
  getSectorFactors: (sectorId: number) => fetchJson<any[]>(`/sectors/${sectorId}/factors`),

  // Data Management
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const base = getApiBase();
    let res: Response;
    try {
      res = await fetch(`${base}/data/upload`, {
        method: "POST",
        body: formData,
      });
    } catch {
      res = await fetch(`http://127.0.0.1:8000/api/v1/data/upload`, {
        method: "POST",
        body: formData,
      });
    }
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },
  getActivityRecords: (limit: number = 25, offset: number = 0) =>
    fetchJson<any>(`/data/records?limit=${limit}&offset=${offset}`),

  // Forecasting & ML
  getAnomalies: (days: number = 60) => fetchJson<AnomalyResponse>(`/forecasting/anomalies?days=${days}`),
  getForecast: (horizonDays: number = 14, sectorId?: number) => {
    const q = new URLSearchParams({ horizon_days: horizonDays.toString() });
    if (sectorId) q.append("sector_id", sectorId.toString());
    return fetchJson<ForecastResponse>(`/forecasting/predict?${q.toString()}`);
  },

  // Simulator
  runPolicySimulation: (params: {
    electricity_reduction_pct: number;
    renewable_share_pct: number;
    bus_electrification_pct: number;
    waste_diversion_pct: number;
    industrial_efficiency_pct: number;
  }) =>
    fetchJson<PolicySimulationResponse>("/simulator/run", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  saveScenario: (name: string, params: any) =>
    fetchJson<any>(`/simulator/save?name=${encodeURIComponent(name)}`, {
      method: "POST",
      body: JSON.stringify(params),
    }),
  getSavedScenarios: () => fetchJson<any[]>("/simulator/saved"),

  // Alerts
  getAlerts: (status?: string, severity?: string) => {
    const q = new URLSearchParams();
    if (status) q.append("status", status);
    if (severity) q.append("severity", severity);
    const qs = q.toString() ? `?${q.toString()}` : "";
    return fetchJson<Alert[]>(`/alerts${qs}`);
  },
  updateAlertStatus: (alertId: number, status: "acknowledged" | "resolved") =>
    fetchJson<any>(`/alerts/${alertId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Reports
  get downloadCsvUrl() {
    return `${getApiBase()}/reports/csv`;
  },
  get downloadPdfUrl() {
    return `${getApiBase()}/reports/pdf`;
  },

  // Settings
  getSettings: () => fetchJson<any>("/settings"),
  updateMunicipality: (payload: { municipality_name: string; baseline_target_pct: number; target_year: number }) =>
    fetchJson<any>("/settings/municipality", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
