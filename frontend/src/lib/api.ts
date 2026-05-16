const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Make  { id: number; name: string; country?: string }
export interface Model { id: number; name: string; makeId: number }
export interface VersionSummary { id: number; name: string; year: number }

export interface SimResult {
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

export interface Score4WResult {
  score4w: number;
  breakdown: {
    price: number;
    performance: number;
    economy: number;
    reliability: number;
  };
}

export interface CarDetail {
  id: number;
  name: string;
  year: number;
  model: { id: number; name: string; make: Make };
  horsepower: number;
  torque_nm: number;
  weight_kg: number;
  top_speed_kmh: number;
  acc_0_100: number;
  fuel_consumption: number;
  tank_liters: number;
  fuel_type: string;
  price_br: number | null;
  price_us: number | null;
  market: string;
  category: string;
  eq_abs: boolean;
  eq_airbags: number;
  eq_leather: boolean;
  eq_sunroof: boolean;
  eq_apple_carplay: boolean;
  eq_navigation: boolean;
  eq_premium_audio: boolean;
  eq_heated_seats: boolean;
  eq_wireless_charge: boolean;
  eq_hud: boolean;
  eq_lane_assist: boolean;
  eq_auto_brake: boolean;
  eq_blind_spot: boolean;
  eq_adaptive_cruise: boolean;
  eq_launch_control: boolean;
  eq_awd: boolean;
  eq_air_suspension: boolean;
  eq_digital_cockpit: boolean;
  simulation: {
    sprint_201m:  SimResult;
    sprint_400m:  SimResult;
    sprint_800m:  SimResult;
    sprint_1000m: SimResult;
    trip_500km:   TripResult;
    trip_1000km:  TripResult;
  };
  score4w?: Score4WResult;
}

export async function getMakes(market?: string): Promise<Make[]> {
  const url = market ? `${API}/api/makes?market=${market}` : `${API}/api/makes`;
  const res = await fetch(url, { cache: 'no-store' });
  return res.json();
}

export async function getModels(makeId: number): Promise<Model[]> {
  const res = await fetch(`${API}/api/models/${makeId}`, { cache: 'no-store' });
  return res.json();
}

export async function getYears(modelId: number): Promise<number[]> {
  const res = await fetch(`${API}/api/years/${modelId}`, { cache: 'no-store' });
  return res.json();
}

export async function getVersions(modelId: number, year: number): Promise<VersionSummary[]> {
  const res = await fetch(`${API}/api/versions/${modelId}/${year}`, { cache: 'no-store' });
  return res.json();
}

export async function getCompare(ids: number[]): Promise<CarDetail[]> {
  const res = await fetch(`${API}/api/compare?ids=${ids.join(',')}`, { cache: 'no-store' });
  return res.json();
}

export async function getVersionScore(id: number): Promise<Score4WResult> {
  const res = await fetch(`${API}/api/versions/${id}/score`, { cache: 'no-store' });
  return res.json();
}

export interface SearchResult {
  id:       number;
  make:     string;
  model:    string;
  version:  string;
  year:     number;
  price_br: number | null;
  price_us: number | null;
  category: string;
  fuel_type: string;
}

export async function searchCars(q: string, market: string, year?: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({ q, market });
  if (year) params.set('year', year);
  const res = await fetch(`${API}/api/search?${params}`, { cache: 'no-store' });
  return res.json();
}

export interface CarImageGallery {
  front:    string | null;
  side:     string | null;
  rear:     string | null;
  interior: string | null;
  imageUrl: string | null;
}

export async function getCarImage(make: string, model: string, year: number): Promise<string | null> {
  const res = await fetch(
    `${API}/api/images?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`,
    { cache: 'no-store' }
  );
  const data = await res.json() as { imageUrl: string | null };
  return data.imageUrl;
}

export async function getCarGallery(make: string, model: string, year: number): Promise<CarImageGallery> {
  const res = await fetch(
    `${API}/api/images?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`,
    { cache: 'no-store' }
  );
  return res.json() as Promise<CarImageGallery>;
}

export type FipeData =
  | { found: true; fipeCode: string; price: string; priceNumber: number; reference: string; fuel: string }
  | { found: false };

export async function getFipe(make: string, model: string, year: number): Promise<FipeData> {
  const res = await fetch(
    `${API}/api/fipe?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`,
    { cache: 'no-store' }
  );
  return res.json() as Promise<FipeData>;
}
