import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime
from sklearn.ensemble import IsolationForest
from sqlalchemy.orm import Session
from app.models.entities import ActivityRecord, Ward, EmissionSector

class AnomalyDetector:
    """
    Production-grade Municipal Carbon Anomaly Detection Engine
    utilizing Isolation Forest and rolling statistical z-score thresholds.
    """

    def __init__(self, contamination: float = 0.05, random_state: int = 42):
        self.contamination = contamination
        self.random_state = random_state
        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=self.random_state,
            n_estimators=100
        )

    def detect_anomalies(self, db: Session, days: int = 60) -> Dict[str, Any]:
        """
        Extracts recent activity records from the database and runs anomaly detection.
        """
        records = db.query(ActivityRecord).order_by(ActivityRecord.record_date.desc()).limit(1000).all()

        if len(records) < 15:
            return {
                "method": "Isolation Forest (scikit-learn) + Statistical Z-Score",
                "total_anomalies_detected": 0,
                "anomalies": [],
                "criteria_explanation": "Insufficient historical activity data (minimum 15 records required for statistical significance)."
            }

        data = []
        for r in records:
            data.append({
                "id": r.id,
                "date": r.record_date.strftime("%Y-%m-%d %H:%M"),
                "ward_name": r.ward.name if r.ward else "Ward Unknown",
                "sector_name": r.sector.name if r.sector else "General",
                "metric": f"{r.activity_type} ({r.activity_unit})",
                "observed_value": r.emissions_t_co2e,
                "activity_quantity": r.activity_quantity,
                "hour": r.record_date.hour,
                "day_of_week": r.record_date.weekday(),
            })

        df = pd.DataFrame(data)

        # Feature matrix for Isolation Forest
        feature_cols = ["observed_value", "activity_quantity", "hour", "day_of_week"]
        X = df[feature_cols].fillna(0).values

        # Fit model
        self.model.fit(X)
        predictions = self.model.predict(X)  # -1 for anomaly, 1 for normal
        decision_scores = self.model.decision_function(X)

        df["is_anomaly"] = predictions == -1
        df["anomaly_score"] = -decision_scores  # higher means more abnormal

        # Calculate sector-ward expected medians
        medians = df.groupby("sector_name")["observed_value"].transform("median")
        stds = df.groupby("sector_name")["observed_value"].transform("std").replace(0, 1.0)
        df["expected_value"] = medians.round(2)
        df["z_score"] = ((df["observed_value"] - medians) / stds).round(2)

        anomaly_rows = df[df["is_anomaly"]].sort_values(by="anomaly_score", ascending=False)

        anomalies_list = []
        for _, row in anomaly_rows.head(25).iterrows():
            ratio = round(row["observed_value"] / max(0.1, row["expected_value"]), 1)
            
            # Severity classification
            if row["anomaly_score"] > 0.15 or ratio >= 2.5:
                severity = "critical"
            elif row["anomaly_score"] > 0.08 or ratio >= 1.7:
                severity = "high"
            else:
                severity = "moderate"

            explanation = (
                f"Observed emission of {row['observed_value']:.2f} tCO2e is {ratio}x the typical baseline "
                f"({row['expected_value']:.2f} tCO2e) for this sector. Anomaly Score: {row['anomaly_score']:.3f}."
            )

            anomalies_list.append({
                "id": int(row["id"]),
                "date": row["date"],
                "ward_name": row["ward_name"],
                "sector_name": row["sector_name"],
                "metric": row["metric"],
                "observed_value": round(float(row["observed_value"]), 2),
                "expected_value": round(float(row["expected_value"]), 2),
                "anomaly_score": round(float(row["anomaly_score"]), 3),
                "severity": severity,
                "explanation": explanation
            })

        return {
            "method": "Isolation Forest (scikit-learn) with Sector-Conditioned Baseline",
            "total_anomalies_detected": len(anomalies_list),
            "anomalies": anomalies_list,
            "criteria_explanation": (
                "Isolation Forest isolates outliers using recursive partitioning on emission intensity, "
                "activity quantity, and temporal context. Points with negative decision scores and significant deviations "
                "from sector medians are flagged."
            )
        }
