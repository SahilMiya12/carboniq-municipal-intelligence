# CARBONIQ — Municipal Carbon Intelligence Platform

> **A Data-Driven Framework for Real-Time Monitoring of Municipal Carbon Footprints Using Python Analytics**

---

## 1. Executive Overview

**CARBONIQ** is a production-grade environmental intelligence platform designed for modern sustainable smart cities. Aligned with the **Global Protocol for Community-Scale Greenhouse Gas Emission Inventories (GPC)** and **IPCC Guidelines**, CARBONIQ combines real-time IoT telemetry ingestion, Scope 1 & 2 carbon accounting, machine-learning anomaly detection, time-series forecasting, and interactive policy scenario modeling.

### Key Capabilities

* **Command Center Dashboard (`/dashboard`)**: Live KPI metrics (Gross emissions, Electricity, Transit, Waste, Stationary fuel, progress toward 2030 target), temporal stacked area trends, and district rankings.
* **Real-Time Telemetry Stream (`/monitoring`)**: High-frequency telemetry stream controller simulating municipal grid demand, traffic corridors, and transfer stations with automated surge detection.
* **Municipal Wards Intelligence (`/wards`)**: Geospatial and per-capita intensity auditing across 6 distinct municipal districts, identifying emissions hotspots.
* **Sectoral Decarbonization (`/sectors`)**: Scope 1 & Scope 2 breakdowns, verified EPA eGRID and IPCC emission factor reference library, and data completeness metrics.
* **Data Management Workspace (`/data`)**: Drag-and-drop CSV/Excel batch ingestion with ISO 14064-1 validation, duplicate detection, and error diagnostics.
* **Machine Learning Analytics (`/forecasting`)**:
  * **Unsupervised Anomaly Detection**: `scikit-learn` Isolation Forest isolating abnormal emissions bursts.
  * **Emissions Forecasting**: Autoregressive Ridge Regression with lag-7 seasonality and 95% confidence intervals (evaluating MAE and RMSE against naive baselines).
* **Decarbonization Policy Simulator (`/simulator`)**: Interactive what-if policy levers (energy efficiency, renewable grid share, bus fleet electrification, landfill diversion) calculating immediate abatement potential.
* **Alerts Center (`/alerts`)**: Threshold-based breach detection with database-backed status transitions (`active`, `acknowledged`, `resolved`).
* **Compliance Audit Reports (`/reports`)**: Instant downloads for audited CSV data and generated official municipal PDF verification audits using ReportLab.
* **Administrative Settings (`/settings`)**: Configurable municipal reduction targets, target years, and emission factors.

---

## 2. Technology Stack

### Frontend
* **Framework**: Next.js 14 (App Router)
* **Language**: TypeScript (strict mode)
* **Styling**: Tailwind CSS & Glassmorphism environmental dark theme
* **Visualizations**: Recharts (Area, Donut, Line, and Composed charts)
* **Icons**: Lucide React
* **State & Motion**: React hooks & CSS transitions

### Backend
* **API Framework**: FastAPI & Uvicorn
* **Data Science & ML**: Pandas, NumPy, scikit-learn (Isolation Forest & Ridge Regression)
* **ORM & Database**: SQLAlchemy 2.0 with PostgreSQL (and zero-config SQLite support)
* **Report Generation**: ReportLab (official PDF generation) & Python CSV
* **Security**: JWT (`python-jose`) and `bcrypt` password hashing
* **Testing**: PyTest & HTTPX

---

## 3. Project Directory Structure

```text
carbon-footprint-monitor/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (auth, dashboard, monitoring, etc.)
│   │   ├── core/            # Database engine and bcrypt security
│   │   ├── models/          # SQLAlchemy entity models
│   │   ├── schemas/         # Pydantic request/response DTOs
│   │   ├── analytics/       # Carbon accounting & aggregation engine
│   │   ├── ml/              # Isolation Forest & Forecaster models
│   │   ├── simulation/      # Telemetry simulator & Policy engine
│   │   └── reports/         # PDF and CSV generator
│   ├── tests/               # Pytest automated test suite
│   ├── seed_data.py         # 60-day historical municipal baseline generator
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Next.js App Router pages (11 routes)
│   ├── components/          # Reusable UI, layout, and chart components
│   ├── lib/                 # Typed API client and utilities
│   ├── types/               # TypeScript definitions
│   └── package.json
├── data/
│   └── sample/              # Ready-to-import sample CSV datasets
├── docker-compose.yml       # Production Docker Compose orchestration
├── .env.example
└── README.md
```

---

## 4. Local Development Setup (macOS / zsh)

### Step 1: Clone and Enter Directory
```bash
cd /Users/sahilmiya/Documents/carbon-footprint-monitor
```

### Step 2: Set Up Python Backend Virtual Environment
```bash
# Activate existing virtual environment
source venv/bin/activate

# Install backend dependencies (if needed)
pip install -r backend/requirements.txt
```

### Step 3: Initialize Database & Seed Baseline Data
```bash
PYTHONPATH=backend python backend/seed_data.py
```
*This populates 1,100+ historical activity records, 6 municipal wards, 4 emission sectors, official emission factors, and default accounts.*

### Step 4: Run Backend Tests
```bash
PYTHONPATH=backend pytest backend/tests/ -v
```

### Step 5: Start FastAPI Backend Server
```bash
PYTHONPATH=backend uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
* Interactive API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
* Health Check: `http://127.0.0.1:8000/health`

### Step 6: Start Next.js Frontend Development Server
In a separate terminal tab:
```bash
cd frontend
npm run dev
```
* Access the CARBONIQ Web Platform at: `http://localhost:3000`

---

## 5. Demo Credentials

The platform is pre-seeded with two municipal staff roles:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Carbon Analyst** | `analyst@carboniq.gov` | `Password123!` | Telemetry inspection, uploads, ML modeling |
| **District Director** | `admin@carboniq.gov` | `Password123!` | Full administrative configuration |

*(You can also click the quick-login buttons on the `/login` screen).*

---

## 6. Carbon Accounting Methodology

All emission computations adhere to standard IPCC and GPC formulas:

$$\text{Emissions } (\text{kgCO}_2\text{e}) = \text{Activity Quantity} \times \text{Emission Factor}$$

$$\text{Emissions } (\text{tCO}_2\text{e}) = \frac{\text{Emissions } (\text{kgCO}_2\text{e})}{1,000}$$

* **Electricity (Scope 2)**: $\text{Consumption (kWh)} \times \text{Regional Grid Factor (0.385 kg/kWh)}$
* **Transit (Scope 1)**: $\text{Fleet Distance (km)} \times \text{Diesel Factor (1.250 kg/km)}$
* **Waste (Scope 1)**: $\text{Tonnage (tonnes)} \times \text{Landfill Factor (450 kg/tonne)} \times (1 - \text{Gas Capture Rate})$
* **Fuel (Scope 1)**: $\text{Volume (m}^3\text{)} \times \text{Combustion Factor (2.050 kg/m}^3\text{)}$

---

## 7. Verification & Production Build

To verify production builds:
```bash
cd frontend
npm run build
```
*(All 15 routes compile to static/hybrid production pages).*
