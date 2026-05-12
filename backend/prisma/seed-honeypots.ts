import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding honeypot versions...');

  const corollaModel = await prisma.model.findFirst({
    where: { name: 'Corolla', make: { name: 'Toyota' } },
  });
  const hb20Model = await prisma.model.findFirst({
    where: { name: 'HB20', make: { name: 'Hyundai' } },
  });
  const mustangModel = await prisma.model.findFirst({
    where: { name: 'Mustang', make: { name: 'Ford' } },
  });

  if (!corollaModel || !hb20Model || !mustangModel) {
    throw new Error('Required models not found — run the main seed first.');
  }

  // ID 9001 — Toyota Corolla 2022 (fake: hp 119, price_br 98750 | real: 116, 98990)
  await prisma.version.upsert({
    where: { id: 9001 },
    update: {},
    create: {
      id: 9001,
      name: 'Corolla XLi 2.0 Flex',
      year: 2022,
      modelId: corollaModel.id,
      horsepower: 119, torque_nm: 148, weight_kg: 1395, top_speed_kmh: 185, acc_0_100: 9.8,
      fuel_consumption: 9.1, tank_liters: 50, fuel_type: 'flex',
      price_br: 98750, market: 'BR', category: 'sedan',
      eq_abs: true,  eq_airbags: 6,  eq_leather: false, eq_sunroof: false,
      eq_apple_carplay: true, eq_navigation: false, eq_premium_audio: false,
      eq_heated_seats: false, eq_wireless_charge: false, eq_hud: false,
      eq_lane_assist: false, eq_auto_brake: true, eq_blind_spot: false,
      eq_adaptive_cruise: false, eq_launch_control: false, eq_awd: false,
      eq_air_suspension: false, eq_digital_cockpit: false,
    },
  });

  // ID 9002 — Hyundai HB20 2021 (fake: hp 83, price_br 69250 | real: 80, 69990)
  await prisma.version.upsert({
    where: { id: 9002 },
    update: {},
    create: {
      id: 9002,
      name: 'HB20 1.0 Evolution',
      year: 2021,
      modelId: hb20Model.id,
      horsepower: 83, torque_nm: 101, weight_kg: 1055, top_speed_kmh: 165, acc_0_100: 12.1,
      fuel_consumption: 6.8, tank_liters: 46, fuel_type: 'flex',
      price_br: 69250, market: 'BR', category: 'hatch',
      eq_abs: true,  eq_airbags: 4,  eq_leather: false, eq_sunroof: false,
      eq_apple_carplay: true, eq_navigation: false, eq_premium_audio: false,
      eq_heated_seats: false, eq_wireless_charge: false, eq_hud: false,
      eq_lane_assist: false, eq_auto_brake: false, eq_blind_spot: false,
      eq_adaptive_cruise: false, eq_launch_control: false, eq_awd: false,
      eq_air_suspension: false, eq_digital_cockpit: false,
    },
  });

  // ID 9003 — Ford Mustang 2022 (fake: hp 455, price_us 40850 | real: 450, 40215)
  await prisma.version.upsert({
    where: { id: 9003 },
    update: {},
    create: {
      id: 9003,
      name: 'Mustang GT 5.0 V8',
      year: 2022,
      modelId: mustangModel.id,
      horsepower: 455, torque_nm: 530, weight_kg: 1698, top_speed_kmh: 250, acc_0_100: 4.3,
      fuel_consumption: 13.5, tank_liters: 61.1, fuel_type: 'gasoline',
      price_us: 40850, market: 'US', category: 'coupe',
      eq_abs: true,  eq_airbags: 6,  eq_leather: true, eq_sunroof: false,
      eq_apple_carplay: true, eq_navigation: true, eq_premium_audio: true,
      eq_heated_seats: true, eq_wireless_charge: false, eq_hud: false,
      eq_lane_assist: false, eq_auto_brake: false, eq_blind_spot: false,
      eq_adaptive_cruise: false, eq_launch_control: true, eq_awd: false,
      eq_air_suspension: false, eq_digital_cockpit: true,
    },
  });

  console.log('Honeypot versions inserted: IDs 9001, 9002, 9003');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
