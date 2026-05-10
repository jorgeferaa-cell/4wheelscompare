export interface CarSpec {
  horsepower: number;
  torque_nm: number;
  weight_kg: number;
  top_speed_kmh: number;
  eq_awd: boolean;
  eq_launch_control: boolean;
  fuel_consumption: number; // L/100km (or kWh/100km for EV)
  tank_liters: number;      // liters (or kWh for EV)
}

export interface SimulationResult {
  time_seconds: number;
  final_speed_kmh: number;
  distance_m: number;
  top_speed_reached: boolean;
}

export interface TripResult {
  distance_km: number;
  time_hours: number;
  time_minutes: number;
  fuel_consumed_liters: number;
  fuel_stops: number;
  avg_speed_kmh: number;
  range_km: number;
}

// Physics constants
const AIR_DENSITY = 1.225;        // kg/m³ at sea level
const CD = 0.30;                  // drag coefficient (typical)
const FRONTAL_AREA = 2.2;         // m²
const ROLLING_COEFF = 0.013;      // rolling resistance coefficient
const GRAVITY = 9.81;             // m/s²
const DRIVETRAIN_EFF = 0.87;      // drivetrain efficiency

function hpToWatts(hp: number): number {
  return hp * 745.7;
}

function engineForce(spec: CarSpec, v_ms: number): number {
  const maxPower_W = hpToWatts(spec.horsepower) * DRIVETRAIN_EFF;

  // Final drive ~3.5x, wheel radius 0.32m
  const gearRatioEff = 3.5;
  const wheelRadius = 0.32;
  const maxTorqueForce = (spec.torque_nm * gearRatioEff) / wheelRadius;

  // Traction limit: AWD allows more force at launch
  const tractionCoeff = spec.eq_awd ? 0.85 : 0.55;
  const tractionLimit = spec.weight_kg * GRAVITY * tractionCoeff;

  if (v_ms < 0.5) {
    const launchForce = Math.min(maxTorqueForce, tractionLimit);
    return spec.eq_launch_control ? launchForce * 1.06 : launchForce;
  }

  // Power-limited regime
  const powerForce = maxPower_W / v_ms;
  return Math.min(powerForce, maxTorqueForce, tractionLimit);
}

function resistanceForce(spec: CarSpec, v_ms: number): number {
  const drag = 0.5 * AIR_DENSITY * CD * FRONTAL_AREA * v_ms * v_ms;
  const rolling = ROLLING_COEFF * spec.weight_kg * GRAVITY;
  return drag + rolling;
}

/**
 * simulate – Euler-integrate car motion over distance_m.
 * Returns elapsed time, final speed, and whether top speed was hit.
 */
export function simulate(spec: CarSpec, distance_m: number): SimulationResult {
  const dt = 0.01; // 10 ms time step
  const topSpeedMs = spec.top_speed_kmh / 3.6;

  let t = 0, v = 0, x = 0;
  let topSpeedReached = false;

  while (x < distance_m && t < 180) {
    const fNet = engineForce(spec, v) - resistanceForce(spec, v);
    const a = fNet / spec.weight_kg;

    v = Math.max(0, v + a * dt);
    if (v >= topSpeedMs) {
      v = topSpeedMs;
      topSpeedReached = true;
    }

    x += v * dt;
    t += dt;
  }

  return {
    time_seconds: Math.round(t * 1000) / 1000,
    final_speed_kmh: Math.round(v * 3.6 * 10) / 10,
    distance_m: Math.round(x * 10) / 10,
    top_speed_reached: topSpeedReached,
  };
}

/**
 * simulateTrip – Highway cruise simulation over distance_km.
 * Uses 70% of top speed (capped at 130 km/h) as cruise speed.
 */
export function simulateTrip(spec: CarSpec, distance_km: number): TripResult {
  const cruiseSpeed_kmh = Math.min(spec.top_speed_kmh * 0.70, 130);

  const driveTime_h = distance_km / cruiseSpeed_kmh;
  const fuel_consumed = (spec.fuel_consumption / 100) * distance_km;
  const range_km = (spec.tank_liters / spec.fuel_consumption) * 100;

  const fuel_stops = Math.max(0, Math.ceil(distance_km / range_km) - 1);
  const totalTime_h = driveTime_h + (fuel_stops * 20) / 60; // 20 min/stop

  return {
    distance_km,
    time_hours: Math.round(totalTime_h * 100) / 100,
    time_minutes: Math.round(totalTime_h * 60),
    fuel_consumed_liters: Math.round(fuel_consumed * 10) / 10,
    fuel_stops,
    avg_speed_kmh: Math.round(cruiseSpeed_kmh),
    range_km: Math.round(range_km),
  };
}
