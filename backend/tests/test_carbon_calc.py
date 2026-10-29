import pytest
from app.analytics.carbon_calculator import CarbonCalculator, CarbonCalculationError

def test_basic_electricity_calculation():
    # 1,000 kWh at 0.385 kgCO2e/kWh -> 385.0 kgCO2e -> 0.385 tCO2e
    kg, tonnes = CarbonCalculator.calculate_emissions(1000.0, "kwh", 0.385, "kwh")
    assert kg == 385.0
    assert tonnes == 0.385

def test_unit_conversion_mwh_to_kwh():
    # 5 MWh = 5,000 kWh -> at 0.5 kg/kWh -> 2,500 kgCO2e -> 2.5 tCO2e
    kg, tonnes = CarbonCalculator.calculate_emissions(5.0, "mwh", 0.5, "kwh")
    assert kg == 2500.0
    assert tonnes == 2.5

def test_transport_emissions():
    # 100 vehicle-km for diesel bus (1.25 kgCO2e/km) -> 125 kgCO2e -> 0.125 tCO2e
    kg, tonnes = CarbonCalculator.calculate_transport_emissions(100.0, vehicle_type="diesel_bus")
    assert kg == 125.0
    assert tonnes == 0.125

def test_waste_emissions():
    # 10 tonnes MSW with 20% methane capture -> 450 * 0.8 = 360 kg/tonne -> 3600 kgCO2e
    kg, tonnes = CarbonCalculator.calculate_waste_emissions(10.0, landfill_gas_capture_pct=20.0)
    assert kg == 3600.0
    assert tonnes == 3.6

def test_incompatible_units_rejection():
    # Cannot convert liters (volume) to kwh (energy)
    with pytest.raises(CarbonCalculationError):
        CarbonCalculator.calculate_emissions(50.0, "liter", 0.385, "kwh")

def test_negative_quantity_rejection():
    with pytest.raises(CarbonCalculationError):
        CarbonCalculator.calculate_emissions(-10.0, "kwh", 0.385, "kwh")
