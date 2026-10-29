from typing import Tuple, Dict

UNIT_CONVERSIONS: Dict[str, Dict[str, float]] = {
    # Energy to standard kWh
    "energy": {
        "kwh": 1.0,
        "mwh": 1000.0,
        "gwh": 1000000.0,
        "btu": 0.000293071,
        "gj": 277.778,
    },
    # Volume to standard liters
    "liquid_fuel": {
        "liter": 1.0,
        "liters": 1.0,
        "gallon": 3.78541,
        "gallons": 3.78541,
        "m3": 1000.0,
    },
    # Mass to standard kg
    "mass": {
        "kg": 1.0,
        "tonne": 1000.0,
        "tonnes": 1000.0,
        "ton": 907.185,
        "tons": 907.185,
    },
    # Distance / transit
    "distance": {
        "km": 1.0,
        "miles": 1.60934,
        "passenger-km": 1.0,
        "vehicle-km": 1.0,
    }
}

class CarbonCalculationError(ValueError):
    """Raised when activity units or emission factor units are incompatible or invalid."""
    pass

class CarbonCalculator:
    """
    Transparent, verifiable municipal carbon accounting engine.
    Compliant with GHG Protocol for Cities (GPC) and IPCC Tier 1 & Tier 2 methodologies.
    """

    @staticmethod
    def calculate_emissions(
        activity_quantity: float,
        activity_unit: str,
        emission_factor_value: float,
        factor_activity_unit: str = None
    ) -> Tuple[float, float]:
        """
        Calculates emissions in kgCO2e and converts to tCO2e (metric tonnes).
        Returns: (emissions_kg_co2e, emissions_t_co2e)
        """
        if activity_quantity < 0:
            raise CarbonCalculationError(f"Activity quantity cannot be negative: {activity_quantity}")
        if emission_factor_value < 0:
            raise CarbonCalculationError(f"Emission factor cannot be negative: {emission_factor_value}")
        
        act_unit_clean = activity_unit.strip().lower()
        
        # Unit normalization factor
        multiplier = 1.0
        
        if factor_activity_unit:
            fac_unit_clean = factor_activity_unit.strip().lower()
            if act_unit_clean != fac_unit_clean:
                # Check if both belong to the same conversion domain
                matched = False
                for domain, rates in UNIT_CONVERSIONS.items():
                    if act_unit_clean in rates and fac_unit_clean in rates:
                        multiplier = rates[act_unit_clean] / rates[fac_unit_clean]
                        matched = True
                        break
                if not matched:
                    raise CarbonCalculationError(
                        f"Incompatible unit dimension: Cannot convert '{activity_unit}' to '{factor_activity_unit}'"
                    )

        # Standard calculation: activity * factor * multiplier
        emissions_kg_co2e = float(activity_quantity * emission_factor_value * multiplier)
        emissions_t_co2e = float(emissions_kg_co2e / 1000.0)

        return round(emissions_kg_co2e, 4), round(emissions_t_co2e, 6)

    @staticmethod
    def calculate_electricity_emissions(
        kwh: float,
        grid_emission_factor_kg_per_kwh: float = 0.385,
        renewable_offset_pct: float = 0.0
    ) -> Tuple[float, float]:
        """
        Scope 2 Electricity emission calculation with renewable energy credit / offset consideration.
        """
        effective_kwh = max(0.0, kwh * (1.0 - (renewable_offset_pct / 100.0)))
        return CarbonCalculator.calculate_emissions(effective_kwh, "kwh", grid_emission_factor_kg_per_kwh)

    @staticmethod
    def calculate_transport_emissions(
        vehicle_km: float,
        vehicle_type: str = "diesel_bus",
        occupancy: float = 1.0
    ) -> Tuple[float, float]:
        """
        Scope 1 / Scope 3 Municipal Transport calculations.
        """
        # EPA / IPCC standard factors in kgCO2e per vehicle-km
        vehicle_factors = {
            "diesel_bus": 1.250,
            "cng_bus": 1.100,
            "electric_bus": 0.220,  # derived from average grid charging
            "light_commercial": 0.215,
            "passenger_car": 0.170,
            "municipal_truck": 1.450
        }
        factor = vehicle_factors.get(vehicle_type.lower(), 0.170)
        return CarbonCalculator.calculate_emissions(vehicle_km, "vehicle-km", factor)

    @staticmethod
    def calculate_waste_emissions(
        tonnes_waste: float,
        waste_type: str = "municipal_solid_waste",
        landfill_gas_capture_pct: float = 20.0
    ) -> Tuple[float, float]:
        """
        Scope 1 Solid waste methane emission calculation based on IPCC Waste Model.
        Average MSW generates ~450 kg CO2e per tonne without capture.
        """
        base_factor = 450.0  # kg CO2e / tonne
        effective_factor = base_factor * (1.0 - (landfill_gas_capture_pct / 100.0))
        return CarbonCalculator.calculate_emissions(tonnes_waste, "tonne", effective_factor)
