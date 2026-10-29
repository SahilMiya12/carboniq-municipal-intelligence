import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_dashboard_summary():
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_emissions_tco2e" in data
    assert data["total_emissions_tco2e"] > 0
    assert len(data["trends"]) > 0
    assert len(data["sector_breakdown"]) > 0
    assert len(data["ward_rankings"]) > 0

def test_wards_endpoint():
    res = client.get("/api/v1/wards")
    assert res.status_code == 200
    wards = res.json()
    assert len(wards) >= 6
    assert wards[0]["code"].startswith("W-")

def test_sectors_endpoint():
    res = client.get("/api/v1/sectors")
    assert res.status_code == 200
    sectors = res.json()
    assert len(sectors) >= 4

def test_policy_simulator():
    payload = {
        "electricity_reduction_pct": 15.0,
        "renewable_share_pct": 25.0,
        "bus_electrification_pct": 50.0,
        "waste_diversion_pct": 30.0,
        "industrial_efficiency_pct": 10.0
    }
    res = client.post("/api/v1/simulator/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["net_savings_tco2e"] > 0
    assert data["percentage_reduction"] > 0
    assert len(data["sector_impacts"]) == 4

def test_anomaly_detection():
    res = client.get("/api/v1/forecasting/anomalies")
    assert res.status_code == 200
    data = res.json()
    assert "anomalies" in data
    assert "method" in data

def test_forecasting():
    res = client.get("/api/v1/forecasting/predict?horizon_days=14")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert len(data["projected_points"]) == 14
    assert data["mae"] >= 0

def test_reports_csv():
    res = client.get("/api/v1/reports/csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "Record ID" in res.text

def test_reports_pdf():
    res = client.get("/api/v1/reports/pdf")
    assert res.status_code == 200
    assert "application/pdf" in res.headers["content-type"]
    assert res.content.startswith(b"%PDF")

def test_kaggle_csv_auto_mapping_upload():
    # Simulates an unmapped Kaggle dataset upload
    kaggle_csv_content = (
        "Diet,Transport,Vehicle Monthly Distance Km,Waste Bag Weekly Count,CarbonEmission\n"
        "omnivore,private,1500,3,3250.5\n"
        "vegetarian,public,400,1,1620.0\n"
        "vegan,walk/bicycle,0,1,850.2\n"
    )
    files = {"file": ("kaggle_carbon_footprint.csv", io.BytesIO(kaggle_csv_content.encode("utf-8")), "text/csv")}
    res = client.post("/api/v1/data/upload", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["imported_count"] == 3
    assert data["validation_summary"]["valid_rows"] == 3
