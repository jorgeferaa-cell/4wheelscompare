import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface MakeRow   { id: number; name: string; country: string | null }
interface ModelRow  { id: number; name: string; makeId: number }
interface VersionRow {
  id: number; name: string; year: number; modelId: number;
  horsepower: number; torque_nm: number; weight_kg: number;
  top_speed_kmh: number; acc_0_100: number;
  fuel_consumption: number; tank_liters: number; fuel_type: string;
  price_br: number | null; price_us: number | null;
  market: string; category: string;
  eq_abs: boolean; eq_airbags: number; eq_leather: boolean;
  eq_sunroof: boolean; eq_apple_carplay: boolean; eq_navigation: boolean;
  eq_premium_audio: boolean; eq_heated_seats: boolean;
  eq_wireless_charge: boolean; eq_hud: boolean; eq_lane_assist: boolean;
  eq_auto_brake: boolean; eq_blind_spot: boolean; eq_adaptive_cruise: boolean;
  eq_launch_control: boolean; eq_awd: boolean; eq_air_suspension: boolean;
  eq_digital_cockpit: boolean;
}

const BACKUP = path.join(__dirname, 'seeds-backup');

async function main() {
  const makes:    MakeRow[]    = JSON.parse(fs.readFileSync(path.join(BACKUP, 'makes.json'),    'utf8'));
  const models:   ModelRow[]   = JSON.parse(fs.readFileSync(path.join(BACKUP, 'models.json'),   'utf8'));
  const versions: VersionRow[] = JSON.parse(fs.readFileSync(path.join(BACKUP, 'versions.json'), 'utf8'));

  console.log(`Restoring: ${makes.length} makes, ${models.length} models, ${versions.length} versions`);

  // Wipe existing data in dependency order
  console.log('Clearing existing data...');
  await prisma.version.deleteMany();
  await prisma.model.deleteMany();
  await prisma.make.deleteMany();

  // Reset SQLite autoincrement sequences by re-inserting with explicit IDs
  console.log('Inserting makes...');
  for (const m of makes) {
    await prisma.make.create({ data: { id: m.id, name: m.name, country: m.country } });
  }

  console.log('Inserting models...');
  for (const m of models) {
    await prisma.model.create({ data: { id: m.id, name: m.name, makeId: m.makeId } });
  }

  console.log('Inserting versions (batches of 100)...');
  const BATCH = 100;
  for (let i = 0; i < versions.length; i += BATCH) {
    const batch = versions.slice(i, i + BATCH);
    await prisma.$transaction(
      batch.map(v =>
        prisma.version.create({
          data: {
            id: v.id, name: v.name, year: v.year, modelId: v.modelId,
            horsepower: v.horsepower, torque_nm: v.torque_nm,
            weight_kg: v.weight_kg, top_speed_kmh: v.top_speed_kmh,
            acc_0_100: v.acc_0_100, fuel_consumption: v.fuel_consumption,
            tank_liters: v.tank_liters, fuel_type: v.fuel_type,
            price_br: v.price_br, price_us: v.price_us,
            market: v.market, category: v.category,
            eq_abs: v.eq_abs, eq_airbags: v.eq_airbags,
            eq_leather: v.eq_leather, eq_sunroof: v.eq_sunroof,
            eq_apple_carplay: v.eq_apple_carplay, eq_navigation: v.eq_navigation,
            eq_premium_audio: v.eq_premium_audio, eq_heated_seats: v.eq_heated_seats,
            eq_wireless_charge: v.eq_wireless_charge, eq_hud: v.eq_hud,
            eq_lane_assist: v.eq_lane_assist, eq_auto_brake: v.eq_auto_brake,
            eq_blind_spot: v.eq_blind_spot, eq_adaptive_cruise: v.eq_adaptive_cruise,
            eq_launch_control: v.eq_launch_control, eq_awd: v.eq_awd,
            eq_air_suspension: v.eq_air_suspension, eq_digital_cockpit: v.eq_digital_cockpit,
          },
        })
      )
    );
    console.log(`  ${Math.min(i + BATCH, versions.length)} / ${versions.length}`);
  }

  console.log('Restore complete.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
