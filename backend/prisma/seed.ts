import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Makes ──────────────────────────────────────────────────────────────────
  const chevrolet = await prisma.make.upsert({ where: { name: 'Chevrolet' }, update: {}, create: { name: 'Chevrolet', country: 'US' } });
  const hyundai   = await prisma.make.upsert({ where: { name: 'Hyundai' },   update: {}, create: { name: 'Hyundai',   country: 'KR' } });
  const vw        = await prisma.make.upsert({ where: { name: 'Volkswagen' },update: {}, create: { name: 'Volkswagen',country: 'DE' } });
  const jeep      = await prisma.make.upsert({ where: { name: 'Jeep' },      update: {}, create: { name: 'Jeep',      country: 'US' } });
  const toyota    = await prisma.make.upsert({ where: { name: 'Toyota' },    update: {}, create: { name: 'Toyota',    country: 'JP' } });
  const honda     = await prisma.make.upsert({ where: { name: 'Honda' },     update: {}, create: { name: 'Honda',     country: 'JP' } });
  const ford      = await prisma.make.upsert({ where: { name: 'Ford' },      update: {}, create: { name: 'Ford',      country: 'US' } });
  const tesla     = await prisma.make.upsert({ where: { name: 'Tesla' },     update: {}, create: { name: 'Tesla',     country: 'US' } });

  // ── Models ─────────────────────────────────────────────────────────────────
  const onix    = await prisma.model.upsert({ where: { name_makeId: { name: 'Onix',    makeId: chevrolet.id } }, update: {}, create: { name: 'Onix',    makeId: chevrolet.id } });
  const hb20    = await prisma.model.upsert({ where: { name_makeId: { name: 'HB20',    makeId: hyundai.id   } }, update: {}, create: { name: 'HB20',    makeId: hyundai.id   } });
  const polo    = await prisma.model.upsert({ where: { name_makeId: { name: 'Polo',    makeId: vw.id        } }, update: {}, create: { name: 'Polo',    makeId: vw.id        } });
  const compass = await prisma.model.upsert({ where: { name_makeId: { name: 'Compass', makeId: jeep.id      } }, update: {}, create: { name: 'Compass', makeId: jeep.id      } });
  const corolla = await prisma.model.upsert({ where: { name_makeId: { name: 'Corolla', makeId: toyota.id    } }, update: {}, create: { name: 'Corolla', makeId: toyota.id    } });
  const civic   = await prisma.model.upsert({ where: { name_makeId: { name: 'Civic',   makeId: honda.id     } }, update: {}, create: { name: 'Civic',   makeId: honda.id     } });
  const mustang = await prisma.model.upsert({ where: { name_makeId: { name: 'Mustang', makeId: ford.id      } }, update: {}, create: { name: 'Mustang', makeId: ford.id      } });
  const camry   = await prisma.model.upsert({ where: { name_makeId: { name: 'Camry',   makeId: toyota.id    } }, update: {}, create: { name: 'Camry',   makeId: toyota.id    } });
  const f150    = await prisma.model.upsert({ where: { name_makeId: { name: 'F-150',   makeId: ford.id      } }, update: {}, create: { name: 'F-150',   makeId: ford.id      } });
  const model3  = await prisma.model.upsert({ where: { name_makeId: { name: 'Model 3', makeId: tesla.id     } }, update: {}, create: { name: 'Model 3', makeId: tesla.id     } });

  // ── Versions ───────────────────────────────────────────────────────────────
  // Helper to upsert versions by id
  const uv = (id: number, data: any) =>
    prisma.version.upsert({ where: { id }, update: {}, create: { id, ...data } });

  // 1 – BR: Chevrolet Onix Plus 1.0T Premier 2023
  await uv(1, {
    name: 'Onix Plus 1.0T Premier', year: 2023, modelId: onix.id,
    horsepower: 116, torque_nm: 166, weight_kg: 1205, top_speed_kmh: 185, acc_0_100: 9.2,
    fuel_consumption: 7.8, tank_liters: 44, fuel_type: 'gasoline',
    price_br: 98990, market: 'BR', category: 'sedan',
    eq_abs: true, eq_airbags: 8, eq_leather: true, eq_sunroof: false,
    eq_apple_carplay: true, eq_navigation: true, eq_premium_audio: false,
    eq_heated_seats: false, eq_wireless_charge: false, eq_hud: false,
    eq_lane_assist: true, eq_auto_brake: true, eq_blind_spot: false,
    eq_adaptive_cruise: false, eq_launch_control: false, eq_awd: false,
    eq_air_suspension: false, eq_digital_cockpit: false,
  });

  // 2 – BR: Hyundai HB20 1.0T Diamond Plus 2023
  await uv(2, {
    name: 'HB20 1.0T Diamond Plus', year: 2023, modelId: hb20.id,
    horsepower: 120, torque_nm: 172, weight_kg: 1105, top_speed_kmh: 190, acc_0_100: 8.9,
    fuel_consumption: 7.5, tank_liters: 50, fuel_type: 'gasoline',
    price_br: 89990, market: 'BR', category: 'hatch',
    eq_abs: true, eq_airbags: 6, eq_leather: false, eq_sunroof: false,
    eq_apple_carplay: true, eq_navigation: true, eq_premium_audio: false,
    eq_heated_seats: false, eq_wireless_charge: false, eq_hud: false,
    eq_lane_assist: true, eq_auto_brake: true, eq_blind_spot: false,
    eq_adaptive_cruise: false, eq_launch_control: false, eq_awd: false,
    eq_air_suspension: false, eq_digital_cockpit: true,
  });

  // 3 – BR: Volkswagen Polo TSI 200 Highline 2023
  await uv(3, {
    name: 'Polo TSI 200 Highline', year: 2023, modelId: polo.id,
    horsepower: 128, torque_nm: 200, weight_kg: 1157, top_speed_kmh: 193, acc_0_100: 8.3,
    fuel_consumption: 8.0, tank_liters: 50, fuel_type: 'gasoline',
    price_br: 102990, market: 'BR', category: 'hatch',
    eq_abs: true, eq_airbags: 6, eq_leather: false, eq_sunroof: false,
    eq_apple_carplay: true, eq_navigation: true, eq_premium_audio: true,
    eq_heated_seats: false, eq_wireless_charge: false, eq_hud: false,
    eq_lane_assist: true, eq_auto_brake: true, eq_blind_spot: true,
    eq_adaptive_cruise: true, eq_launch_control: false, eq_awd: false,
    eq_air_suspension: false, eq_digital_cockpit: true,
  });

  // 4 – BR: Jeep Compass T270 Limited 2023
  await uv(4, {
    name: 'Compass T270 Limited', year: 2023, modelId: compass.id,
    horsepower: 185, torque_nm: 270, weight_kg: 1525, top_speed_kmh: 195, acc_0_100: 8.6,
    fuel_consumption: 9.2, tank_liters: 58, fuel_type: 'gasoline',
    price_br: 199990, market: 'BR', category: 'suv',
    eq_abs: true, eq_airbags: 8, eq_leather: true, eq_sunroof: true,
    eq_apple_carplay: true, eq_navigation: true, eq_premium_audio: true,
    eq_heated_seats: false, eq_wireless_charge: true, eq_hud: false,
    eq_lane_assist: true, eq_auto_brake: true, eq_blind_spot: true,
    eq_adaptive_cruise: true, eq_launch_control: false, eq_awd: false,
    eq_air_suspension: false, eq_digital_cockpit: false,
  });

  // 5 – BR: Toyota Corolla Altis Hybrid 2023
  await uv(5, {
    name: 'Corolla Altis Hybrid', year: 2023, modelId: corolla.id,
    horsepower: 122, torque_nm: 142, weight_kg: 1535, top_speed_kmh: 180, acc_0_100: 7.2,
    fuel_consumption: 5.2, tank_liters: 43, fuel_type: 'hybrid',
    price_br: 218990, market: 'BR', category: 'sedan',
    eq_abs: true, eq_airbags: 10, eq_leather: true, eq_sunroof: false,
    eq_apple_carplay: true, eq_navigation: true, eq_premium_audio: true,
    eq_heated_seats: false, eq_wireless_charge: true, eq_hud: true,
    eq_lane_assist: true, eq_auto_brake: true, eq_blind_spot: true,
    eq_adaptive_cruise: true, eq_launch_control: false, eq_awd: false,
    eq_air_suspension: false, eq_digital_cockpit: true,
  });

  // 6 – US: Honda Civic Si 2023
  await uv(6, {
    name: 'Civic Si', year: 2023, modelId: civic.id,
    horsepower: 200, torque_nm: 260, weight_kg: 1321, top_speed_kmh: 225, acc_0_100: 6.7,
    fuel_consumption: 8.1, tank_liters: 46.5, fuel_type: 'gasoline',
    price_us: 28700, market: 'US', category: 'sedan',
    eq_abs: true, eq_airbags: 6, eq_leather: false, eq_sunroof: false,
    eq_apple_carplay: true, eq_navigation: false, eq_premium_audio: false,
    eq_heated_seats: false, eq_wireless_charge: false, eq_hud: false,
    eq_lane_assist: true, eq_auto_brake: true, eq_blind_spot: false,
    eq_adaptive_cruise: false, eq_launch_control: true, eq_awd: false,
    eq_air_suspension: false, eq_digital_cockpit: false,
  });

  // 7 – US: Ford Mustang GT 5.0 2023
  await uv(7, {
    name: 'Mustang GT 5.0', year: 2023, modelId: mustang.id,
    horsepower: 450, torque_nm: 529, weight_kg: 1700, top_speed_kmh: 250, acc_0_100: 4.3,
    fuel_consumption: 13.5, tank_liters: 61.1, fuel_type: 'gasoline',
    price_us: 40215, market: 'US', category: 'coupe',
    eq_abs: true, eq_airbags: 6, eq_leather: true, eq_sunroof: false,
    eq_apple_carplay: true, eq_navigation: true, eq_premium_audio: true,
    eq_heated_seats: true, eq_wireless_charge: true, eq_hud: false,
    eq_lane_assist: false, eq_auto_brake: false, eq_blind_spot: false,
    eq_adaptive_cruise: false, eq_launch_control: true, eq_awd: false,
    eq_air_suspension: false, eq_digital_cockpit: true,
  });

  // 8 – US: Toyota Camry XSE V6 2023
  await uv(8, {
    name: 'Camry XSE V6', year: 2023, modelId: camry.id,
    horsepower: 301, torque_nm: 362, weight_kg: 1580, top_speed_kmh: 210, acc_0_100: 5.8,
    fuel_consumption: 9.4, tank_liters: 60.6, fuel_type: 'gasoline',
    price_us: 32000, market: 'US', category: 'sedan',
    eq_abs: true, eq_airbags: 10, eq_leather: true, eq_sunroof: true,
    eq_apple_carplay: true, eq_navigation: true, eq_premium_audio: true,
    eq_heated_seats: true, eq_wireless_charge: true, eq_hud: true,
    eq_lane_assist: true, eq_auto_brake: true, eq_blind_spot: true,
    eq_adaptive_cruise: true, eq_launch_control: false, eq_awd: false,
    eq_air_suspension: false, eq_digital_cockpit: false,
  });

  // 9 – US: Ford F-150 XLT V6 EcoBoost 2023
  await uv(9, {
    name: 'F-150 XLT V6 EcoBoost', year: 2023, modelId: f150.id,
    horsepower: 400, torque_nm: 570, weight_kg: 2041, top_speed_kmh: 177, acc_0_100: 6.1,
    fuel_consumption: 11.8, tank_liters: 98, fuel_type: 'gasoline',
    price_us: 38215, market: 'US', category: 'pickup',
    eq_abs: true, eq_airbags: 6, eq_leather: false, eq_sunroof: false,
    eq_apple_carplay: true, eq_navigation: true, eq_premium_audio: false,
    eq_heated_seats: false, eq_wireless_charge: false, eq_hud: false,
    eq_lane_assist: true, eq_auto_brake: true, eq_blind_spot: true,
    eq_adaptive_cruise: false, eq_launch_control: false, eq_awd: false,
    eq_air_suspension: false, eq_digital_cockpit: false,
  });

  // 10 – US: Tesla Model 3 Performance 2023
  await uv(10, {
    name: 'Model 3 Performance', year: 2023, modelId: model3.id,
    horsepower: 450, torque_nm: 660, weight_kg: 1836, top_speed_kmh: 261, acc_0_100: 3.1,
    fuel_consumption: 16.5, tank_liters: 75, fuel_type: 'electric',
    price_us: 50990, market: 'US', category: 'sedan',
    eq_abs: true, eq_airbags: 8, eq_leather: false, eq_sunroof: true,
    eq_apple_carplay: false, eq_navigation: true, eq_premium_audio: true,
    eq_heated_seats: true, eq_wireless_charge: true, eq_hud: false,
    eq_lane_assist: true, eq_auto_brake: true, eq_blind_spot: true,
    eq_adaptive_cruise: true, eq_launch_control: true, eq_awd: true,
    eq_air_suspension: false, eq_digital_cockpit: true,
  });

  console.log('Database seeded: 8 makes, 10 models, 10 versions');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
