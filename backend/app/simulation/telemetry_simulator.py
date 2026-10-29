import random
import threading
import time
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.entities import TelemetryEvent, Alert, Ward, EmissionSector

class TelemetrySimulator:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(TelemetrySimulator, cls).__new__(cls)
                cls._instance._is_running = False
                cls._instance._thread = None
                cls._instance._interval = 5
                cls._instance._last_event_time = None
        return cls._instance

    @property
    def is_running(self) -> bool:
        return self._is_running

    @property
    def interval(self) -> int:
        return self._interval

    @property
    def last_event_time(self):
        return self._last_event_time

    def start(self, interval_seconds: int = 5):
        if not self._is_running:
            self._interval = interval_seconds
            self._is_running = True
            self._thread = threading.Thread(target=self._run_loop, daemon=True)
            self._thread.start()

    def stop(self):
        self._is_running = False

    def generate_single_event(self, db: Session) -> TelemetryEvent:
        """
        Generates a single realistic municipal telemetry event, persists it,
        and triggers threshold alerts if applicable.
        """
        wards = db.query(Ward).all()
        sectors = db.query(EmissionSector).all()

        if not wards or not sectors:
            return None

        ward = random.choice(wards)
        sector = random.choice(sectors)

        # Decide telemetry metric by sector
        if "elec" in sector.code.lower():
            metric_name = "Substation Power Demand"
            base_val = random.uniform(2200.0, 7500.0)
            unit = "kW"
            # 0.385 kg/kWh -> per hour
            emissions_rate = (base_val * 0.385)
        elif "trans" in sector.code.lower():
            metric_name = "Corridor Traffic Volume"
            base_val = random.uniform(150.0, 850.0)
            unit = "vehicles/hr"
            emissions_rate = (base_val * 1.25)
        elif "waste" in sector.code.lower():
            metric_name = "Transfer Station Feed Rate"
            base_val = random.uniform(8.0, 45.0)
            unit = "tonnes/hr"
            emissions_rate = (base_val * 350.0)
        else:
            metric_name = "Industrial Gas Consumption"
            base_val = random.uniform(300.0, 1800.0)
            unit = "m3/hr"
            emissions_rate = (base_val * 2.05)

        # Random spike injection (10% chance)
        is_spike = random.random() < 0.10
        if is_spike:
            multiplier = random.uniform(1.8, 3.2)
            base_val *= multiplier
            emissions_rate *= multiplier
            status = "SURGE" if multiplier < 2.3 else "SPIKE"
        elif emissions_rate > 2500.0:
            status = "ELEVATED"
        else:
            status = "NORMAL"

        event = TelemetryEvent(
            timestamp=datetime.utcnow(),
            ward_id=ward.id,
            sector_id=sector.id,
            metric_name=metric_name,
            value=round(base_val, 2),
            unit=unit,
            emissions_rate_kg_hr=round(emissions_rate, 2),
            status=status
        )
        db.add(event)

        # Generate alert if status is SURGE or SPIKE
        if status in ["SURGE", "SPIKE"]:
            threshold = 2200.0
            severity = "critical" if status == "SPIKE" else "high"
            alert = Alert(
                timestamp=datetime.utcnow(),
                ward_id=ward.id,
                sector_id=sector.id,
                title=f"{status}: High Emission Rate in {ward.name}",
                message=f"{metric_name} surged to {base_val:.1f} {unit}, producing {emissions_rate:.1f} kgCO2e/hr.",
                metric_name=metric_name,
                observed_value=round(emissions_rate, 1),
                threshold_value=threshold,
                severity=severity,
                status="active"
            )
            db.add(alert)

        db.commit()
        db.refresh(event)
        self._last_event_time = event.timestamp
        return event

    def _run_loop(self):
        while self._is_running:
            db = SessionLocal()
            try:
                self.generate_single_event(db)
            except Exception as e:
                print(f"[TelemetrySimulator Error] {e}")
            finally:
                db.close()
            time.sleep(self._interval)

simulator = TelemetrySimulator()
