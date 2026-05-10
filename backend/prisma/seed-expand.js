/**
 * seed-expand.js
 * Fills 2016-2026 gaps for every existing model and adds new makes/models
 * to reach comprehensive coverage. Run from backend/ with:
 *   node prisma/seed-expand.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

// Models introduced after 2016 (real launch years)
const MODEL_START = {
  26: 2021, // VW Nivus
  27: 2021, // Fiat Pulse
  28: 2021, // Corolla Cross
  42: 2023, // Chevrolet Montana (relaunch)
  77: 2022, // Audi RS3 (current gen)
  80: 2020, // Tesla Model Y
  81: 2021, // Ford Mustang Mach-E
  82: 2023, // Hyundai Ioniq 6
  87: 2023, // Mazda CX-90
  91: 2023, // GMC Canyon (new gen)
  92: 2023, // Chevrolet Colorado (new gen)
  94: 2023, // Nissan Z (new gen)
};

// Models discontinued before 2026
const MODEL_END = {
  17: 2022, // Fiat 500 BR
  57: 2024, // Chevy Malibu
  58: 2020, // Ford Fusion
  67: 2023, // Dodge Challenger
  79: 2023, // Dodge Charger (gas)
};

// ─── Spec evolution ───────────────────────────────────────────────────────────
function evolveSpecs(base, year) {
  const d = year - 2024; // negative = older, positive = newer
  const pwr   = Math.max(0.60, 1 + d * 0.028);
  const price  = Math.max(0.42, 1 + d * 0.048);
  const consAdj = -d * 0.13; // older cars consume more

  return {
    horsepower:       Math.max(55,  Math.round(base.horsepower       * pwr)),
    torque_nm:        Math.max(80,  Math.round(base.torque_nm        * pwr)),
    weight_kg:        Math.round(base.weight_kg * Math.min(1.07, 1 - d * 0.004)),
    top_speed_kmh:    Math.round(base.top_speed_kmh * Math.max(0.88, Math.min(1.06, 1 + d * 0.009))),
    acc_0_100:        Math.round(Math.max(3.5, base.acc_0_100 * Math.max(0.82, 1 - d * 0.020)) * 10) / 10,
    fuel_consumption: Math.round(Math.max(4.0, base.fuel_consumption + consAdj) * 10) / 10,
    price_br: base.price_br ? Math.round(base.price_br * price / 1000) * 1000 : null,
    price_us: base.price_us ? Math.round(base.price_us * price / 500)  * 500  : null,
  };
}

// ─── Equipment evolution (older = fewer modern features) ──────────────────────
function evolveEq(base, year) {
  return {
    eq_abs:             base.eq_abs,
    eq_airbags:         base.eq_airbags,
    eq_leather:         base.eq_leather,
    eq_sunroof:         base.eq_sunroof,
    eq_apple_carplay:   year >= 2018 && base.eq_apple_carplay,
    eq_navigation:      base.eq_navigation,
    eq_premium_audio:   base.eq_premium_audio,
    eq_heated_seats:    base.eq_heated_seats,
    eq_wireless_charge: year >= 2021 && base.eq_wireless_charge,
    eq_hud:             year >= 2019 && base.eq_hud,
    eq_lane_assist:     year >= 2019 && base.eq_lane_assist,
    eq_auto_brake:      year >= 2019 && base.eq_auto_brake,
    eq_blind_spot:      year >= 2018 && base.eq_blind_spot,
    eq_adaptive_cruise: year >= 2020 && base.eq_adaptive_cruise,
    eq_launch_control:  base.eq_launch_control,
    eq_awd:             base.eq_awd,
    eq_air_suspension:  year >= 2020 && base.eq_air_suspension,
    eq_digital_cockpit: year >= 2020 && base.eq_digital_cockpit,
  };
}

// ─── New models to add ────────────────────────────────────────────────────────
// Each entry: make, model, market, category, fuel_type, startYear, endYear,
//             hp, torq, wt, spd, acc, cons, tank, price_br|price_us, eq{...}
const NEW_MODELS = [
  // ── BR ──────────────────────────────────────────────────────────────────────
  { make:'Fiat',      model:'Strada',         market:'BR', category:'pickup',  fuel:'flex',
    sy:2020, ey:2026, hp:116,  tq:150,  wt:1100, spd:170, acc:10.5, cons:9.2,  tank:48,
    pbr:125000, pusd:null,
    eq:{abs:1,air:2,lea:0,sun:0,cp:1,nav:0,aud:0,heat:0,wire:0,hud:0,lane:0,brk:0,blind:0,crz:0,lnch:0,awd:0,airsusp:0,digi:0} },

  { make:'Fiat',      model:'Fastback',       market:'BR', category:'suv',     fuel:'flex',
    sy:2022, ey:2026, hp:130,  tq:200,  wt:1350, spd:183, acc:8.9,  cons:8.8,  tank:48,
    pbr:149990, pusd:null,
    eq:{abs:1,air:6,lea:0,sun:0,cp:1,nav:1,aud:1,heat:0,wire:0,hud:0,lane:1,brk:1,blind:1,crz:0,lnch:0,awd:0,airsusp:0,digi:1} },

  { make:'Renault',   model:'Oroch',          market:'BR', category:'pickup',  fuel:'flex',
    sy:2016, ey:2026, hp:165,  tq:260,  wt:1610, spd:185, acc:9.5,  cons:9.8,  tank:60,
    pbr:158990, pusd:null,
    eq:{abs:1,air:6,lea:0,sun:0,cp:1,nav:0,aud:0,heat:0,wire:0,hud:0,lane:0,brk:0,blind:1,crz:0,lnch:0,awd:0,airsusp:0,digi:0} },

  { make:'Peugeot',   model:'2008',           market:'BR', category:'suv',     fuel:'flex',
    sy:2016, ey:2026, hp:130,  tq:230,  wt:1260, spd:186, acc:8.5,  cons:8.2,  tank:44,
    pbr:139990, pusd:null,
    eq:{abs:1,air:6,lea:0,sun:1,cp:1,nav:1,aud:1,heat:0,wire:0,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:0,airsusp:0,digi:1} },

  { make:'Peugeot',   model:'3008',           market:'BR', category:'suv',     fuel:'flex',
    sy:2017, ey:2026, hp:165,  tq:250,  wt:1450, spd:200, acc:7.8,  cons:8.5,  tank:53,
    pbr:189990, pusd:null,
    eq:{abs:1,air:6,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:0,airsusp:0,digi:1} },

  { make:'Citroën',   model:'C4 Cactus',      market:'BR', category:'hatch',   fuel:'flex',
    sy:2016, ey:2023, hp:122,  tq:205,  wt:1140, spd:185, acc:9.2,  cons:8.0,  tank:50,
    pbr:119990, pusd:null,
    eq:{abs:1,air:6,lea:0,sun:1,cp:1,nav:0,aud:0,heat:0,wire:0,hud:0,lane:0,brk:0,blind:0,crz:0,lnch:0,awd:0,airsusp:0,digi:0} },

  { make:'Hyundai',   model:'i30',            market:'BR', category:'hatch',   fuel:'flex',
    sy:2016, ey:2022, hp:142,  tq:192,  wt:1310, spd:200, acc:8.6,  cons:10.2, tank:53,
    pbr:109990, pusd:null,
    eq:{abs:1,air:6,lea:0,sun:1,cp:1,nav:1,aud:1,heat:0,wire:0,hud:0,lane:0,brk:0,blind:0,crz:0,lnch:0,awd:0,airsusp:0,digi:0} },

  { make:'Hyundai',   model:'Kona',           market:'BR', category:'suv',     fuel:'flex',
    sy:2018, ey:2026, hp:177,  tq:265,  wt:1355, spd:205, acc:7.7,  cons:9.8,  tank:45,
    pbr:159990, pusd:null,
    eq:{abs:1,air:6,lea:0,sun:1,cp:1,nav:1,aud:1,heat:0,wire:0,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:0,airsusp:0,digi:1} },

  { make:'Kia',       model:'Sportage BR',    market:'BR', category:'suv',     fuel:'flex',
    sy:2016, ey:2026, hp:180,  tq:270,  wt:1540, spd:195, acc:8.2,  cons:9.5,  tank:54,
    pbr:169990, pusd:null,
    eq:{abs:1,air:6,lea:1,sun:1,cp:1,nav:1,aud:1,heat:0,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:0,airsusp:0,digi:1} },

  { make:'Kia',       model:'Stinger',        market:'BR', category:'sedan',   fuel:'gasoline',
    sy:2018, ey:2023, hp:370,  tq:510,  wt:1820, spd:270, acc:4.9,  cons:13.2, tank:60,
    pbr:379990, pusd:null,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:0,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:1,awd:1,airsusp:0,digi:1} },

  { make:'Mitsubishi', model:'Eclipse Cross', market:'BR', category:'suv',     fuel:'flex',
    sy:2018, ey:2026, hp:150,  tq:235,  wt:1500, spd:188, acc:9.5,  cons:9.8,  tank:57,
    pbr:169990, pusd:null,
    eq:{abs:1,air:6,lea:1,sun:1,cp:1,nav:1,aud:0,heat:0,wire:0,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:0} },

  { make:'Mitsubishi', model:'ASX',           market:'BR', category:'suv',     fuel:'flex',
    sy:2016, ey:2026, hp:167,  tq:222,  wt:1430, spd:188, acc:9.2,  cons:9.5,  tank:60,
    pbr:149990, pusd:null,
    eq:{abs:1,air:6,lea:0,sun:0,cp:1,nav:1,aud:0,heat:0,wire:0,hud:0,lane:0,brk:0,blind:0,crz:0,lnch:0,awd:0,airsusp:0,digi:0} },

  { make:'Jeep',      model:'Commander',      market:'BR', category:'suv',     fuel:'flex',
    sy:2022, ey:2026, hp:185,  tq:270,  wt:1810, spd:195, acc:8.4,  cons:9.8,  tank:60,
    pbr:279990, pusd:null,
    eq:{abs:1,air:6,lea:1,sun:1,cp:1,nav:1,aud:1,heat:0,wire:1,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:0,airsusp:0,digi:1} },

  { make:'Jeep',      model:'Gladiator BR',   market:'BR', category:'pickup',  fuel:'diesel',
    sy:2020, ey:2026, hp:272,  tq:599,  wt:2358, spd:175, acc:8.0,  cons:12.5, tank:80,
    pbr:449990, pusd:null,
    eq:{abs:1,air:6,lea:1,sun:1,cp:1,nav:1,aud:1,heat:0,wire:0,hud:0,lane:0,brk:0,blind:1,crz:0,lnch:0,awd:1,airsusp:0,digi:0} },

  { make:'Toyota',    model:'Hilux SW4',      market:'BR', category:'suv',     fuel:'diesel',
    sy:2016, ey:2026, hp:204,  tq:500,  wt:2210, spd:175, acc:9.5,  cons:11.5, tank:80,
    pbr:389990, pusd:null,
    eq:{abs:1,air:7,lea:1,sun:1,cp:1,nav:1,aud:1,heat:0,wire:0,hud:0,lane:0,brk:0,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:1} },

  { make:'Volkswagen', model:'Taos BR',       market:'BR', category:'suv',     fuel:'flex',
    sy:2021, ey:2026, hp:150,  tq:250,  wt:1390, spd:200, acc:8.2,  cons:8.5,  tank:50,
    pbr:159990, pusd:null,
    eq:{abs:1,air:6,lea:0,sun:1,cp:1,nav:1,aud:1,heat:0,wire:1,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:0,airsusp:0,digi:1} },

  { make:'Honda',     model:'ZR-V',           market:'BR', category:'suv',     fuel:'flex',
    sy:2023, ey:2026, hp:173,  tq:240,  wt:1500, spd:195, acc:8.0,  cons:9.2,  tank:47,
    pbr:189990, pusd:null,
    eq:{abs:1,air:6,lea:0,sun:0,cp:1,nav:1,aud:1,heat:0,wire:0,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:0,airsusp:0,digi:1} },

  { make:'Nissan',    model:'Frontier',       market:'BR', category:'pickup',  fuel:'diesel',
    sy:2016, ey:2026, hp:190,  tq:450,  wt:1940, spd:175, acc:9.8,  cons:11.8, tank:80,
    pbr:229990, pusd:null,
    eq:{abs:1,air:6,lea:0,sun:0,cp:1,nav:1,aud:0,heat:0,wire:0,hud:0,lane:0,brk:0,blind:1,crz:0,lnch:0,awd:1,airsusp:0,digi:0} },

  // ── US ──────────────────────────────────────────────────────────────────────
  { make:'GMC',       model:'Sierra 1500',    market:'US', category:'pickup',  fuel:'gasoline',
    sy:2016, ey:2026, hp:420,  tq:624,  wt:2100, spd:175, acc:6.8,  cons:14.5, tank:98,
    pbr:null, pusd:52000,
    eq:{abs:1,air:6,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:1} },

  { make:'GMC',       model:'Yukon',          market:'US', category:'suv',     fuel:'gasoline',
    sy:2016, ey:2026, hp:420,  tq:624,  wt:2540, spd:170, acc:7.2,  cons:15.8, tank:98,
    pbr:null, pusd:58000,
    eq:{abs:1,air:6,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:1,digi:1} },

  { make:'Ram',       model:'2500',           market:'US', category:'pickup',  fuel:'diesel',
    sy:2016, ey:2026, hp:370,  tq:1085, wt:2812, spd:168, acc:8.5,  cons:16.5, tank:121,
    pbr:null, pusd:58000,
    eq:{abs:1,air:6,lea:1,sun:0,cp:1,nav:1,aud:1,heat:1,wire:0,hud:0,lane:0,brk:0,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:0} },

  { make:'Ram',       model:'TRX',            market:'US', category:'pickup',  fuel:'gasoline',
    sy:2021, ey:2026, hp:702,  tq:881,  wt:2768, spd:190, acc:4.5,  cons:22.0, tank:114,
    pbr:null, pusd:82000,
    eq:{abs:1,air:8,lea:1,sun:0,cp:1,nav:1,aud:1,heat:1,wire:1,hud:0,lane:0,brk:0,blind:1,crz:0,lnch:1,awd:1,airsusp:1,digi:1} },

  { make:'Cadillac',  model:'Escalade',       market:'US', category:'suv',     fuel:'gasoline',
    sy:2016, ey:2026, hp:420,  tq:624,  wt:2740, spd:175, acc:7.0,  cons:16.5, tank:102,
    pbr:null, pusd:82000,
    eq:{abs:1,air:6,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:1,digi:1} },

  { make:'Cadillac',  model:'CT5',            market:'US', category:'sedan',   fuel:'gasoline',
    sy:2020, ey:2026, hp:335,  tq:400,  wt:1770, spd:250, acc:5.8,  cons:12.5, tank:60,
    pbr:null, pusd:42000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:0,airsusp:0,digi:1} },

  { make:'Buick',     model:'Enclave',        market:'US', category:'suv',     fuel:'gasoline',
    sy:2016, ey:2026, hp:310,  tq:366,  wt:2100, spd:185, acc:7.5,  cons:13.0, tank:83,
    pbr:null, pusd:47000,
    eq:{abs:1,air:6,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:1} },

  { make:'Buick',     model:'Encore GX',      market:'US', category:'suv',     fuel:'gasoline',
    sy:2020, ey:2026, hp:155,  tq:240,  wt:1500, spd:185, acc:9.5,  cons:9.8,  tank:48,
    pbr:null, pusd:29000,
    eq:{abs:1,air:6,lea:0,sun:0,cp:1,nav:1,aud:0,heat:1,wire:0,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:0,airsusp:0,digi:1} },

  { make:'Rivian',    model:'R1T',            market:'US', category:'pickup',  fuel:'electric',
    sy:2022, ey:2026, hp:835,  tq:1231, wt:2948, spd:201, acc:3.0,  cons:29.0, tank:135,
    pbr:null, pusd:73000,
    eq:{abs:1,air:8,lea:1,sun:0,cp:0,nav:1,aud:1,heat:1,wire:1,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:1,awd:1,airsusp:1,digi:1} },

  { make:'Rivian',    model:'R1S',            market:'US', category:'suv',     fuel:'electric',
    sy:2022, ey:2026, hp:835,  tq:1231, wt:3130, spd:201, acc:3.0,  cons:31.0, tank:135,
    pbr:null, pusd:78000,
    eq:{abs:1,air:8,lea:1,sun:0,cp:0,nav:1,aud:1,heat:1,wire:1,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:1,awd:1,airsusp:1,digi:1} },

  { make:'Lucid',     model:'Air',            market:'US', category:'sedan',   fuel:'electric',
    sy:2021, ey:2026, hp:1111, tq:1390, wt:2268, spd:270, acc:2.5,  cons:18.0, tank:120,
    pbr:null, pusd:90000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:0,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:1,awd:1,airsusp:1,digi:1} },

  { make:'Lincoln',   model:'Navigator',      market:'US', category:'suv',     fuel:'gasoline',
    sy:2016, ey:2026, hp:440,  tq:691,  wt:2900, spd:185, acc:6.5,  cons:17.0, tank:103,
    pbr:null, pusd:82000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:1,digi:1} },

  { make:'Lincoln',   model:'Corsair',        market:'US', category:'suv',     fuel:'hybrid',
    sy:2020, ey:2026, hp:295,  tq:400,  wt:1870, spd:205, acc:6.5,  cons:8.0,  tank:55,
    pbr:null, pusd:42000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:1} },

  { make:'Acura',     model:'MDX',            market:'US', category:'suv',     fuel:'gasoline',
    sy:2016, ey:2026, hp:290,  tq:267,  wt:2025, spd:210, acc:7.0,  cons:12.0, tank:73,
    pbr:null, pusd:50000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:1} },

  { make:'Acura',     model:'TLX',            market:'US', category:'sedan',   fuel:'gasoline',
    sy:2016, ey:2026, hp:272,  tq:370,  wt:1680, spd:225, acc:6.1,  cons:10.5, tank:61,
    pbr:null, pusd:40000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:0,airsusp:0,digi:1} },

  { make:'Infiniti',  model:'Q50',            market:'US', category:'sedan',   fuel:'gasoline',
    sy:2016, ey:2026, hp:300,  tq:400,  wt:1765, spd:250, acc:5.6,  cons:12.5, tank:70,
    pbr:null, pusd:42000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:0,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:0,airsusp:0,digi:1} },

  { make:'Infiniti',  model:'QX60',           market:'US', category:'suv',     fuel:'gasoline',
    sy:2016, ey:2026, hp:295,  tq:344,  wt:2090, spd:195, acc:7.4,  cons:12.8, tank:80,
    pbr:null, pusd:50000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:1} },

  { make:'Lexus',     model:'RX',             market:'US', category:'suv',     fuel:'hybrid',
    sy:2016, ey:2026, hp:275,  tq:317,  wt:1905, spd:200, acc:7.7,  cons:8.5,  tank:65,
    pbr:null, pusd:52000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:1} },

  { make:'Lexus',     model:'IS',             market:'US', category:'sedan',   fuel:'gasoline',
    sy:2016, ey:2026, hp:311,  tq:380,  wt:1715, spd:230, acc:5.9,  cons:11.5, tank:66,
    pbr:null, pusd:44000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:0,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:0,airsusp:0,digi:1} },

  { make:'Lexus',     model:'LC 500',         market:'US', category:'coupe',   fuel:'gasoline',
    sy:2017, ey:2026, hp:471,  tq:540,  wt:1920, spd:270, acc:4.4,  cons:14.0, tank:82,
    pbr:null, pusd:98000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:0,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:1,awd:0,airsusp:1,digi:1} },

  { make:'Porsche',   model:'Macan',          market:'US', category:'suv',     fuel:'gasoline',
    sy:2016, ey:2026, hp:261,  tq:400,  wt:1770, spd:232, acc:6.7,  cons:11.8, tank:54,
    pbr:null, pusd:58000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:1,awd:1,airsusp:0,digi:1} },

  { make:'Porsche',   model:'Cayenne',        market:'US', category:'suv',     fuel:'gasoline',
    sy:2016, ey:2026, hp:340,  tq:450,  wt:2095, spd:245, acc:6.2,  cons:13.2, tank:75,
    pbr:null, pusd:72000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:1,awd:1,airsusp:1,digi:1} },

  { make:'Volvo',     model:'XC60',           market:'US', category:'suv',     fuel:'hybrid',
    sy:2016, ey:2026, hp:455,  tq:670,  wt:2000, spd:218, acc:4.8,  cons:7.5,  tank:64,
    pbr:null, pusd:56000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:1} },

  { make:'Volvo',     model:'S60',            market:'US', category:'sedan',   fuel:'hybrid',
    sy:2016, ey:2026, hp:415,  tq:640,  wt:1770, spd:230, acc:4.4,  cons:7.2,  tank:60,
    pbr:null, pusd:46000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:1} },

  { make:'Hyundai',   model:'Palisade',       market:'US', category:'suv',     fuel:'gasoline',
    sy:2020, ey:2026, hp:291,  tq:355,  wt:2030, spd:190, acc:7.8,  cons:13.0, tank:71,
    pbr:null, pusd:38000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:1} },

  { make:'Kia',       model:'Telluride',      market:'US', category:'suv',     fuel:'gasoline',
    sy:2020, ey:2026, hp:291,  tq:355,  wt:2020, spd:190, acc:7.8,  cons:13.0, tank:71,
    pbr:null, pusd:37000,
    eq:{abs:1,air:8,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:1,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:1} },

  { make:'Ford',      model:'Bronco',         market:'US', category:'suv',     fuel:'gasoline',
    sy:2021, ey:2026, hp:300,  tq:441,  wt:2040, spd:180, acc:7.0,  cons:13.5, tank:68,
    pbr:null, pusd:36000,
    eq:{abs:1,air:6,lea:0,sun:0,cp:1,nav:1,aud:0,heat:0,wire:0,hud:0,lane:0,brk:0,blind:1,crz:0,lnch:0,awd:1,airsusp:0,digi:1} },

  { make:'Chevrolet', model:'Tahoe',          market:'US', category:'suv',     fuel:'gasoline',
    sy:2016, ey:2026, hp:355,  tq:519,  wt:2530, spd:175, acc:7.5,  cons:15.5, tank:98,
    pbr:null, pusd:54000,
    eq:{abs:1,air:6,lea:1,sun:1,cp:1,nav:1,aud:1,heat:1,wire:1,hud:0,lane:1,brk:1,blind:1,crz:1,lnch:0,awd:1,airsusp:0,digi:1} },
];

// ─── Version name generator ───────────────────────────────────────────────────
function versionName(baseName, year) {
  // If the baseName already encodes a year, strip it; otherwise keep as-is
  return baseName.replace(/\s*\d{4}\s*$/, '').trim();
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== seed-expand: loading existing data ===');

  const allVersions = await prisma.version.findMany({ orderBy: { year: 'desc' } });
  const existingKeys = new Set(allVersions.map(v => `${v.modelId}|${v.market}|${v.year}`));

  // Build baseline map: modelId|market → most-recent version
  const baselines = new Map();
  for (const v of allVersions) {
    const k = `${v.modelId}|${v.market}`;
    if (!baselines.has(k)) baselines.set(k, v);
  }

  console.log(`Existing versions: ${allVersions.length}`);
  console.log(`Distinct model×market baselines: ${baselines.size}`);

  const toInsert = [];

  // ── STEP 2: Gap-fill existing models ──────────────────────────────────────
  console.log('\n=== STEP 2: filling year gaps for existing models ===');
  for (const [key, base] of baselines) {
    const [mId, market] = key.split('|');
    const modelId  = parseInt(mId);
    const startYear = MODEL_START[modelId] ?? 2016;
    const endYear   = MODEL_END[modelId]   ?? 2026;

    for (const year of YEARS) {
      if (year < startYear || year > endYear) continue;
      if (existingKeys.has(`${modelId}|${market}|${year}`)) continue;

      const specs = evolveSpecs(base, year);
      const eq    = evolveEq(base, year);

      toInsert.push({
        name:    versionName(base.name, year),
        year,
        modelId,
        market,
        fuel_type:        base.fuel_type,
        tank_liters:      base.tank_liters,
        category:         base.category,
        ...specs,
        ...eq,
      });
    }
  }
  console.log(`Gap-fill records queued: ${toInsert.length}`);

  // ── STEP 3: New models ────────────────────────────────────────────────────
  console.log('\n=== STEP 3: adding new models ===');
  for (const nm of NEW_MODELS) {
    // Upsert Make
    let make = await prisma.make.findFirst({ where: { name: nm.make } });
    if (!make) {
      make = await prisma.make.create({ data: { name: nm.make } });
      console.log(`  Created make: ${nm.make}`);
    }

    // Upsert Model
    let model = await prisma.model.findFirst({ where: { name: nm.model, makeId: make.id } });
    if (!model) {
      model = await prisma.model.create({ data: { name: nm.model, makeId: make.id } });
      console.log(`  Created model: ${nm.make} ${nm.model}`);
    }

    const b = nm.eq;
    const base2024 = {
      horsepower:       nm.hp,  torque_nm:    nm.tq,    weight_kg:    nm.wt,
      top_speed_kmh:    nm.spd, acc_0_100:    nm.acc,   fuel_consumption: nm.cons,
      price_br: nm.pbr, price_us: nm.pusd,
      eq_abs:            !!b.abs,  eq_airbags:       b.air,  eq_leather:       !!b.lea,
      eq_sunroof:        !!b.sun,  eq_apple_carplay: !!b.cp, eq_navigation:    !!b.nav,
      eq_premium_audio:  !!b.aud,  eq_heated_seats:  !!b.heat, eq_wireless_charge: !!b.wire,
      eq_hud:            !!b.hud,  eq_lane_assist:   !!b.lane, eq_auto_brake:    !!b.brk,
      eq_blind_spot:     !!b.blind, eq_adaptive_cruise: !!b.crz, eq_launch_control: !!b.lnch,
      eq_awd:            !!b.awd,  eq_air_suspension: !!b.airsusp, eq_digital_cockpit: !!b.digi,
    };

    for (const year of YEARS) {
      if (year < nm.sy || year > nm.ey) continue;
      const specs = evolveSpecs(base2024, year);
      const eq    = evolveEq(base2024, year);

      toInsert.push({
        name:      nm.model,
        year,
        modelId:   model.id,
        market:    nm.market,
        category:  nm.category,
        fuel_type: nm.fuel,
        tank_liters: nm.tank,
        ...specs,
        ...eq,
      });
    }
  }

  console.log(`\nTotal records to insert: ${toInsert.length}`);

  // ── Batch insert ──────────────────────────────────────────────────────────
  const BATCH = 100;
  let done = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    await prisma.version.createMany({ data: toInsert.slice(i, i + BATCH) });
    done += Math.min(BATCH, toInsert.length - i);
    process.stdout.write(`\r  Inserting... ${done}/${toInsert.length}`);
  }
  console.log('\n  Done.\n');

  // ── Final report ──────────────────────────────────────────────────────────
  const total = await prisma.version.count();
  const [brRow] = await prisma.$queryRawUnsafe('SELECT COUNT(*) as n FROM Version WHERE price_br IS NOT NULL');
  const [usRow] = await prisma.$queryRawUnsafe('SELECT COUNT(*) as n FROM Version WHERE price_us IS NOT NULL');
  const [y16]   = await prisma.$queryRawUnsafe('SELECT COUNT(*) as n FROM Version WHERE year = 2016');
  const [y26]   = await prisma.$queryRawUnsafe('SELECT COUNT(*) as n FROM Version WHERE year = 2026');

  console.log('=== Final counts ===');
  console.log(`  Total versions : ${total}`);
  console.log(`  BR market      : ${Number(brRow.n)}`);
  console.log(`  US market      : ${Number(usRow.n)}`);
  console.log(`  Year 2016      : ${Number(y16.n)}`);
  console.log(`  Year 2026      : ${Number(y26.n)}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
