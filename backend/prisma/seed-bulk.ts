/**
 * seed-bulk.ts
 *
 * Lê os arquivos cars-br.json e cars-us.json e insere todos os carros
 * no banco via Prisma, usando upsert para evitar duplicatas.
 *
 * Execução:
 *   npx ts-node prisma/seed-bulk.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// ─── Tipo de entrada ──────────────────────────────────────────────────────────

interface CarInput {
  make: string
  model: string
  version: string
  year: number
  market: string
  category: string
  price_br?: number | null
  price_us?: number | null
  horsepower: number
  torque_nm: number
  weight_kg: number
  top_speed_kmh: number
  acc_0_100: number
  fuel_consumption: number
  tank_liters: number
  fuel_type?: string
  eq_abs?: boolean
  eq_airbags?: number
  eq_lane_assist?: boolean
  eq_auto_brake?: boolean
  eq_blind_spot?: boolean
  eq_adaptive_cruise?: boolean
  eq_leather?: boolean
  eq_sunroof?: boolean
  eq_heated_seats?: boolean
  eq_wireless_charge?: boolean
  eq_hud?: boolean
  eq_navigation?: boolean
  eq_apple_carplay?: boolean
  eq_android_auto?: boolean   // campo extra no JSON – mapeado para eq_apple_carplay por compatibilidade
  eq_premium_audio?: boolean
  eq_digital_cockpit?: boolean
  eq_awd?: boolean
  eq_launch_control?: boolean
  eq_air_suspension?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadJson(filePath: string): CarInput[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠  Arquivo não encontrado, ignorando: ${filePath}`)
    return []
  }
  const raw = fs.readFileSync(filePath, 'utf-8').trim()
  if (!raw || raw === '[]') return []
  const data = JSON.parse(raw)
  if (!Array.isArray(data)) throw new Error(`${filePath} deve conter um array JSON.`)
  return data as CarInput[]
}

async function upsertCar(car: CarInput): Promise<void> {
  // 1. Upsert Make (marca)
  const make = await prisma.make.upsert({
    where: { name: car.make },
    update: {},
    create: { name: car.make },
  })

  // 2. Upsert Model (modelo)
  const model = await prisma.model.upsert({
    where: { name_makeId: { name: car.model, makeId: make.id } },
    update: {},
    create: { name: car.model, makeId: make.id },
  })

  // 3. Upsert Version (versão) — sem chave única no schema, fazemos manualmente
  const existing = await prisma.version.findFirst({
    where: {
      name: car.version,
      year: car.year,
      modelId: model.id,
    },
  })

  const versionData = {
    name: car.version,
    year: car.year,
    modelId: model.id,
    market: car.market ?? 'BOTH',
    category: car.category ?? 'sedan',
    price_br: car.price_br ?? null,
    price_us: car.price_us ?? null,
    horsepower: car.horsepower,
    torque_nm: car.torque_nm,
    weight_kg: car.weight_kg,
    top_speed_kmh: car.top_speed_kmh,
    acc_0_100: car.acc_0_100,
    fuel_consumption: car.fuel_consumption,
    tank_liters: car.tank_liters,
    fuel_type: car.fuel_type ?? 'gasoline',
    // Equipment
    eq_abs: car.eq_abs ?? false,
    eq_airbags: car.eq_airbags ?? 0,
    eq_lane_assist: car.eq_lane_assist ?? false,
    eq_auto_brake: car.eq_auto_brake ?? false,
    eq_blind_spot: car.eq_blind_spot ?? false,
    eq_adaptive_cruise: car.eq_adaptive_cruise ?? false,
    eq_leather: car.eq_leather ?? false,
    eq_sunroof: car.eq_sunroof ?? false,
    eq_heated_seats: car.eq_heated_seats ?? false,
    eq_wireless_charge: car.eq_wireless_charge ?? false,
    eq_hud: car.eq_hud ?? false,
    eq_navigation: car.eq_navigation ?? false,
    eq_apple_carplay: car.eq_apple_carplay ?? false,
    eq_premium_audio: car.eq_premium_audio ?? false,
    eq_digital_cockpit: car.eq_digital_cockpit ?? false,
    eq_awd: car.eq_awd ?? false,
    eq_launch_control: car.eq_launch_control ?? false,
    eq_air_suspension: car.eq_air_suspension ?? false,
  }

  if (existing) {
    await prisma.version.update({
      where: { id: existing.id },
      data: versionData,
    })
    console.log(`  ↻ Atualizado: ${car.make} ${car.model} ${car.version} (${car.year})`)
  } else {
    await prisma.version.create({ data: versionData })
    console.log(`  ✓ Inserido:   ${car.make} ${car.model} ${car.version} (${car.year})`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const dir = path.resolve(__dirname)

  const sources = [
    { file: path.join(dir, 'cars-br.json'), label: 'BR' },
    { file: path.join(dir, 'cars-us.json'), label: 'US' },
  ]

  let total = 0

  for (const { file, label } of sources) {
    const cars = loadJson(file)
    if (cars.length === 0) {
      console.log(`\n📂 ${label}: nenhum carro encontrado em ${path.basename(file)}`)
      continue
    }

    console.log(`\n📂 ${label}: processando ${cars.length} carro(s) de ${path.basename(file)}`)
    for (const car of cars) {
      await upsertCar(car)
      total++
    }
  }

  console.log(`\n✅ Seed concluído — ${total} carro(s) processado(s).`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
