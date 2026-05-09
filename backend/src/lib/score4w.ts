import { prisma } from './prisma';

export interface Score4WResult {
  score4w: number;
  breakdown: {
    price: number;
    performance: number;
    economy: number;
    reliability: number;
  };
}

const SELECT_FIELDS = {
  id: true,
  category: true,
  market: true,
  price_br: true,
  price_us: true,
  horsepower: true,
  torque_nm: true,
  top_speed_kmh: true,
  acc_0_100: true,
  fuel_consumption: true,
  fuel_type: true,
  eq_abs: true,
  eq_airbags: true,
  eq_awd: true,
  eq_auto_brake: true,
  eq_blind_spot: true,
  eq_lane_assist: true,
  eq_adaptive_cruise: true,
} as const;

type VersionData = {
  id: number;
  category: string;
  market: string;
  price_br: number | null;
  price_us: number | null;
  horsepower: number;
  torque_nm: number;
  top_speed_kmh: number;
  acc_0_100: number;
  fuel_consumption: number;
  fuel_type: string;
  eq_abs: boolean;
  eq_airbags: number;
  eq_awd: boolean;
  eq_auto_brake: boolean;
  eq_blind_spot: boolean;
  eq_lane_assist: boolean;
  eq_adaptive_cruise: boolean;
};

function effectivePrice(v: VersionData): number | null {
  if (v.market === 'US') return v.price_us;
  if (v.market === 'BR') return v.price_br;
  // BOTH: use lowest available price
  const prices = [v.price_us, v.price_br].filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : null;
}

function normalize(value: number, min: number, max: number, lowerIsBetter = false): number {
  if (max === min) return 0.5;
  const n = (value - min) / (max - min);
  return lowerIsBetter ? 1 - n : n;
}

// Converts a 0-1 score to 0-10 with 1 decimal place
function to10(score: number): number {
  return Math.round(score * 100) / 10;
}

export async function calculate4WScore(versionId: number): Promise<Score4WResult> {
  const [target, all] = await Promise.all([
    prisma.version.findUnique({ where: { id: versionId }, select: SELECT_FIELDS }),
    prisma.version.findMany({ select: SELECT_FIELDS }),
  ]);

  if (!target) throw new Error(`Version ${versionId} not found`);

  // --- PRICE SCORE (30%) ---
  // Normalize within the same category; lower price = higher score
  const categoryVersions = all.filter(v => v.category === target.category);
  const categoryPrices = categoryVersions
    .map(v => effectivePrice(v))
    .filter((p): p is number => p !== null);
  const targetPrice = effectivePrice(target);

  let priceScore = 0.5;
  if (targetPrice !== null && categoryPrices.length > 0) {
    const min = Math.min(...categoryPrices);
    const max = Math.max(...categoryPrices);
    priceScore = normalize(targetPrice, min, max, true);
  }

  // --- PERFORMANCE SCORE (25%) ---
  // Normalize hp, torque, topSpeed, acceleration across full dataset
  const validNums = (field: keyof VersionData) =>
    all.map(v => v[field] as number).filter(n => Number.isFinite(n) && n > 0);

  const hp = validNums('horsepower');
  const tq = validNums('torque_nm');
  const sp = validNums('top_speed_kmh');
  const ac = validNums('acc_0_100');

  const performanceScore = (
    normalize(target.horsepower, Math.min(...hp), Math.max(...hp)) +
    normalize(target.torque_nm, Math.min(...tq), Math.max(...tq)) +
    normalize(target.top_speed_kmh, Math.min(...sp), Math.max(...sp)) +
    normalize(target.acc_0_100, Math.min(...ac), Math.max(...ac), true) // lower time = better
  ) / 4;

  // --- ECONOMY SCORE (25%) ---
  // EV/Hybrid get fixed bonuses; others normalized by fuel_consumption (L/100km, lower = better)
  let economyScore: number;
  const fuelType = target.fuel_type.toUpperCase();
  if (fuelType === 'ELECTRIC') {
    economyScore = 1.0;
  } else if (fuelType === 'HYBRID') {
    economyScore = 0.85;
  } else {
    const consumptions = all
      .map(v => v.fuel_consumption)
      .filter(n => Number.isFinite(n) && n > 0);
    economyScore = normalize(
      target.fuel_consumption,
      Math.min(...consumptions),
      Math.max(...consumptions),
      true,
    );
  }

  // --- RELIABILITY SCORE (20%) ---
  // Count 7 safety features (tractionControl has no dedicated field in schema); divide by 8
  const reliabilityCount =
    (target.eq_abs ? 1 : 0) +
    (target.eq_airbags > 0 ? 1 : 0) +
    (target.eq_awd ? 1 : 0) +
    (target.eq_auto_brake ? 1 : 0) + // closest proxy for stabilityControl
    (target.eq_blind_spot ? 1 : 0) +
    (target.eq_lane_assist ? 1 : 0) +
    (target.eq_adaptive_cruise ? 1 : 0);
  const reliabilityScore = reliabilityCount / 8;

  // --- FINAL SCORE ---
  const raw =
    priceScore * 0.30 +
    performanceScore * 0.25 +
    economyScore * 0.25 +
    reliabilityScore * 0.20;

  return {
    score4w: to10(raw),
    breakdown: {
      price: to10(priceScore),
      performance: to10(performanceScore),
      economy: to10(economyScore),
      reliability: to10(reliabilityScore),
    },
  };
}
