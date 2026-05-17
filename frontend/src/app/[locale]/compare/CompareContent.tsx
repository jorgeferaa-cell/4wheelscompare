'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCompare, getCarImage, CarDetail } from '@/lib/api';
import Logo from '@/components/Logo';
import AdSlot from '@/components/AdSlot';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';

type Tab      = 'specs' | 'race' | 'equipment';
type RaceMode = '201m' | '400m' | '800m' | '1000m' | 'trip';

const SLOT_COLORS  = ['#2563EB', '#059669', '#7C3AED', '#0891B2'];
const SLOT_LETTERS = ['A', 'B', 'C', 'D'];
const BRAND        = '#D85A30';

const FUEL_PRICE_BRL = 5.89;
const ELEC_PRICE_BRL = 0.80;

const CONFETTI = [
  { ox: -18, oy: -5, tx: -32, ty: -58, rot: 45,  delay: 0,    color: '#D85A30' },
  { ox:  -7, oy: -5, tx:  -6, ty: -62, rot: 120, delay: 0.05, color: '#FFD700' },
  { ox:   4, oy: -5, tx:  16, ty: -58, rot: 200, delay: 0.1,  color: '#3B6D11' },
  { ox:  14, oy: -5, tx:  30, ty: -50, rot: 280, delay: 0.05, color: '#2563EB' },
  { ox: -14, oy:  4, tx: -28, ty:  52, rot: 90,  delay: 0.08, color: '#7C3AED' },
  { ox:  -3, oy:  4, tx:   7, ty:  55, rot: 160, delay: 0.12, color: '#FFD700' },
  { ox:   8, oy:  4, tx:  22, ty:  52, rot: 240, delay: 0.06, color: '#D85A30' },
  { ox:  18, oy:  4, tx:  36, ty:  46, rot: 320, delay: 0.09, color: '#0891B2' },
];

const FLOWERS = [
  { ox: -28, delay: 0    },
  { ox: -20, delay: 0.06 },
  { ox: -12, delay: 0.11 },
  { ox:  -4, delay: 0.04 },
  { ox:   4, delay: 0.09 },
  { ox:  12, delay: 0.14 },
  { ox:  20, delay: 0.02 },
  { ox:  28, delay: 0.07 },
  { ox: -24, delay: 0.13 },
  { ox:  -8, delay: 0.05 },
  { ox:   8, delay: 0.10 },
  { ox:  24, delay: 0.08 },
];
const FLOWER_COLORS = ['#D85A30','#FFD700','#059669','#2563EB','#7C3AED','#0891B2','#f472b6','#34d399','#fb923c','#60a5fa','#a78bfa','#fcd34d'];

function computeTrip(car: CarDetail, distKm: number) {
  const cruise       = Math.min(car.top_speed_kmh * 0.7, 130);
  const rangeKm      = (car.tank_liters / car.fuel_consumption) * 100;
  const fuel         = (distKm * car.fuel_consumption) / 100;
  const stops        = Math.floor(distKm / rangeKm);
  const totalH       = distKm / cruise + (stops * 20) / 60;
  return {
    timeHours:    Math.floor(totalH),
    timeMinutes:  Math.round((totalH % 1) * 60),
    fuelL:        Math.round(fuel * 10) / 10,
    stops,
    avgSpeed:     Math.round(cruise),
    rangeKm:      Math.round(rangeKm),
    totalMinutes: totalH * 60,
  };
}

function CarSilhouette({ category, color }: { category: string; color: string }) {
  if (category === 'pickup') {
    return (
      <svg viewBox="0 0 220 72" fill="none" className="w-full h-14">
        <path d="M12,54 L14,40 L34,26 L90,22 L106,22 L106,54 Z" fill={color} opacity="0.18" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M90,22 L100,10 L140,10 L152,22 Z" fill={color} opacity="0.18" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M106,28 L106,54 L200,54 L204,40 L204,28 Z" fill={color} opacity="0.10" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="52" cy="57" r="12" fill={color} opacity="0.22"/>
        <circle cx="52" cy="57" r="6.5" fill="white" opacity="0.9"/>
        <circle cx="52" cy="57" r="2.5" fill={color} opacity="0.4"/>
        <circle cx="170" cy="57" r="12" fill={color} opacity="0.22"/>
        <circle cx="170" cy="57" r="6.5" fill="white" opacity="0.9"/>
        <circle cx="170" cy="57" r="2.5" fill={color} opacity="0.4"/>
        <path d="M101,22 L104,12 L140,12 L150,22 Z" fill="white" opacity="0.35"/>
        <ellipse cx="16" cy="42" rx="3.5" ry="2.5" fill="#ff4444" opacity="0.5"/>
        <ellipse cx="202" cy="38" rx="3.5" ry="2.5" fill="white" opacity="0.7"/>
      </svg>
    );
  }
  if (category === 'suv' || category === 'minivan') {
    return (
      <svg viewBox="0 0 220 72" fill="none" className="w-full h-14">
        <path d="M14,54 L16,38 L36,24 L76,16 L152,16 L178,26 L196,42 L198,54 Z" fill={color} opacity="0.18" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M76,16 L84,6 L148,6 L158,16 Z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="56" cy="57" r="12" fill={color} opacity="0.22"/>
        <circle cx="56" cy="57" r="6.5" fill="white" opacity="0.9"/>
        <circle cx="56" cy="57" r="2.5" fill={color} opacity="0.4"/>
        <circle cx="162" cy="57" r="12" fill={color} opacity="0.22"/>
        <circle cx="162" cy="57" r="6.5" fill="white" opacity="0.9"/>
        <circle cx="162" cy="57" r="2.5" fill={color} opacity="0.4"/>
        <path d="M85,16 L88,8 L120,8 L120,16 Z" fill="white" opacity="0.38"/>
        <path d="M122,16 L122,8 L147,8 L155,16 Z" fill="white" opacity="0.28"/>
        <ellipse cx="193" cy="44" rx="4" ry="2.5" fill="white" opacity="0.7"/>
        <ellipse cx="17" cy="44" rx="4" ry="2.5" fill="#ff4444" opacity="0.5"/>
      </svg>
    );
  }
  if (category === 'hatch') {
    return (
      <svg viewBox="0 0 220 72" fill="none" className="w-full h-14">
        <path d="M14,54 L16,40 L36,28 L74,20 L154,20 L182,36 L198,50 L198,54 Z" fill={color} opacity="0.18" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M74,20 L86,8 L148,8 L162,20 Z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="56" cy="57" r="12" fill={color} opacity="0.22"/>
        <circle cx="56" cy="57" r="6.5" fill="white" opacity="0.9"/>
        <circle cx="56" cy="57" r="2.5" fill={color} opacity="0.4"/>
        <circle cx="162" cy="57" r="12" fill={color} opacity="0.22"/>
        <circle cx="162" cy="57" r="6.5" fill="white" opacity="0.9"/>
        <circle cx="162" cy="57" r="2.5" fill={color} opacity="0.4"/>
        <path d="M87,20 L92,10 L146,10 L158,20 Z" fill="white" opacity="0.38"/>
        <ellipse cx="195" cy="46" rx="4" ry="2.5" fill="white" opacity="0.7"/>
        <ellipse cx="16" cy="46" rx="4" ry="2.5" fill="#ff4444" opacity="0.5"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 220 72" fill="none" className="w-full h-14">
      <path d="M14,54 L16,42 L36,32 L70,24 L154,24 L180,32 L198,44 L198,54 Z" fill={color} opacity="0.18" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M70,24 L88,10 L148,10 L168,24 Z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="56" cy="57" r="12" fill={color} opacity="0.22"/>
      <circle cx="56" cy="57" r="6.5" fill="white" opacity="0.9"/>
      <circle cx="56" cy="57" r="2.5" fill={color} opacity="0.4"/>
      <circle cx="162" cy="57" r="12" fill={color} opacity="0.22"/>
      <circle cx="162" cy="57" r="6.5" fill="white" opacity="0.9"/>
      <circle cx="162" cy="57" r="2.5" fill={color} opacity="0.4"/>
      <path d="M90,24 L94,12 L130,12 L148,24 Z" fill="white" opacity="0.38"/>
      <path d="M150,24 L166,24 L158,12 L132,12 Z" fill="white" opacity="0.28"/>
      <ellipse cx="195" cy="46" rx="4" ry="2.5" fill="white" opacity="0.7"/>
      <ellipse cx="16" cy="46" rx="4" ry="2.5" fill="#ff4444" opacity="0.5"/>
    </svg>
  );
}

/* ── Share button ────────────────────────────────────────── */

function ShareButton() {
  const t           = useTranslations('common');
  const [open,     setOpen]   = useState(false);
  const [copied,   setCopied] = useState(false);
  const ref         = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getUrl = () => typeof window !== 'undefined' ? window.location.href : '';

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`Compara esses carros comigo no 4wheelscompare: ${getUrl()}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    setOpen(false);
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Compare cars on 4wheelscompare 🚗⚡`);
    const url  = encodeURIComponent(getUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setOpen(false);
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(getUrl()); } catch { /* fallback */ }
    setCopied(true);
    setOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap"
        style={copied
          ? { borderColor: '#059669', color: '#059669', backgroundColor: 'rgba(5,150,105,0.12)' }
          : { borderColor: '#2A2A2A', color: '#9ca3af', backgroundColor: '#1A1A1A' }}>
        {copied ? (
          <>{t('shareCopied')}</>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            {t('share')}
          </>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-xl z-50 overflow-hidden py-1">
          <button onClick={shareWhatsApp}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-300 hover:bg-[#2A2A2A] transition-colors text-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            {t('shareWhatsapp')}
          </button>

          <button onClick={shareTwitter}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-300 hover:bg-[#2A2A2A] transition-colors text-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#e5e7eb">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            {t('shareTwitter')}
          </button>

          <div className="mx-3 border-t border-[#2A2A2A] my-1" />

          <button onClick={copyLink}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-300 hover:bg-[#2A2A2A] transition-colors text-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            {t('shareCopy')}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Loading spinner ─────────────────────────────────────── */

function Spinner() {
  const t = useTranslations();
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#D85A30] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">{t('compare.loading')}</p>
      </div>
    </div>
  );
}

type ConvertType = 'speed' | 'consumption' | 'weight' | 'distance' | 'tank' | 'torque' | 'power' | 'time';

function convertUnits(value: number, type: ConvertType, locale: string): { value: number; unit: string } {
  const imp = locale === 'en';
  const r1  = (v: number) => Math.round(v * 10) / 10;
  switch (type) {
    case 'speed':       return imp ? { value: r1(value * 0.621371),  unit: 'mph'   } : { value, unit: 'km/h'    };
    case 'consumption': return imp ? { value: r1(235.214 / value),   unit: 'mpg'   } : { value, unit: 'L/100km' };
    case 'weight':      return imp ? { value: r1(value * 2.20462),   unit: 'lbs'   } : { value, unit: 'kg'      };
    case 'distance':    return imp ? { value: r1(value * 0.621371),  unit: 'mi'    } : { value, unit: 'km'      };
    case 'tank':        return imp ? { value: r1(value * 0.264172),  unit: 'gal'   } : { value, unit: 'L'       };
    case 'torque':      return imp ? { value: r1(value * 0.737562),  unit: 'lb-ft' } : { value, unit: 'Nm'      };
    case 'power':       return { value, unit: 'hp' };
    case 'time':        return { value, unit: 's'  };
  }
}

export default function CompareContent() {
  const t            = useTranslations();
  const searchParams = useSearchParams();
  const pathname     = usePathname();
  const locale       = pathname.split('/')[1] || 'pt';
  const idsParam     = searchParams.get('ids') || '';
  const compareQuery = idsParam ? `?ids=${idsParam}` : '';

  const [cars,      setCars]      = useState<CarDetail[]>([]);
  const [images,    setImages]    = useState<(string | null)[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState<Tab>('specs');
  const [mode,      setMode]      = useState<RaceMode>('400m');
  const [tripDist,  setTripDist]  = useState(500);
  const [simulated, setSimulated] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [barWidths, setBarWidths] = useState<number[]>([]);
  const [pilotPhase, setPilotPhase] = useState<'idle'|'walking'|'racing'|'finished'>('idle');
  const [carsReady,  setCarsReady]  = useState(false);

  const PERF_ROWS = [
    { key: 'horsepower',       label: t('compare.specHorsepower'), convertType: 'power'       as ConvertType, lowerIsBetter: false },
    { key: 'torque_nm',        label: t('compare.specTorque'),     convertType: 'torque'      as ConvertType, lowerIsBetter: false },
    { key: 'weight_kg',        label: t('compare.specWeight'),     convertType: 'weight'      as ConvertType, lowerIsBetter: true  },
    { key: 'acc_0_100',        label: t('compare.specAcc'),        convertType: 'time'        as ConvertType, lowerIsBetter: true  },
    { key: 'top_speed_kmh',    label: t('compare.specTopSpeed'),   convertType: 'speed'       as ConvertType, lowerIsBetter: false },
    { key: 'fuel_consumption', label: t('compare.specConsumption'),convertType: 'consumption' as ConvertType, lowerIsBetter: true  },
    { key: 'tank_liters',      label: t('compare.specTank'),       convertType: 'tank'        as ConvertType, lowerIsBetter: false },
  ];

  const SCORE_ROWS = [
    { key: 'price'       as const, label: locale === 'pt' ? 'Preço'          : 'Price',       weight: '30%' },
    { key: 'performance' as const, label: 'Performance',                                       weight: '25%' },
    { key: 'economy'     as const, label: locale === 'pt' ? 'Economia'       : 'Economy',     weight: '25%' },
    { key: 'reliability' as const, label: locale === 'pt' ? 'Confiabilidade' : 'Reliability', weight: '20%' },
  ];

  const EQ_CATEGORIES = [
    {
      name: t('compare.eqSafety'),
      items: [
        { key: 'eq_abs',             label: t('eq.eq_abs')             },
        { key: 'eq_airbags',         label: t('eq.eq_airbags')         },
        { key: 'eq_lane_assist',     label: t('eq.eq_lane_assist')     },
        { key: 'eq_auto_brake',      label: t('eq.eq_auto_brake')      },
        { key: 'eq_blind_spot',      label: t('eq.eq_blind_spot')      },
        { key: 'eq_adaptive_cruise', label: t('eq.eq_adaptive_cruise') },
      ],
    },
    {
      name: t('compare.eqComfort'),
      items: [
        { key: 'eq_leather',        label: t('eq.eq_leather')        },
        { key: 'eq_sunroof',        label: t('eq.eq_sunroof')        },
        { key: 'eq_heated_seats',   label: t('eq.eq_heated_seats')   },
        { key: 'eq_air_suspension', label: t('eq.eq_air_suspension') },
      ],
    },
    {
      name: t('compare.eqInfotainment'),
      items: [
        { key: 'eq_apple_carplay',   label: t('eq.eq_apple_carplay')   },
        { key: 'eq_navigation',      label: t('eq.eq_navigation')      },
        { key: 'eq_premium_audio',   label: t('eq.eq_premium_audio')   },
        { key: 'eq_wireless_charge', label: t('eq.eq_wireless_charge') },
        { key: 'eq_hud',             label: t('eq.eq_hud')             },
        { key: 'eq_digital_cockpit', label: t('eq.eq_digital_cockpit') },
      ],
    },
    {
      name: t('compare.eqPerformance'),
      items: [
        { key: 'eq_awd',            label: t('eq.eq_awd')            },
        { key: 'eq_launch_control', label: t('eq.eq_launch_control') },
      ],
    },
  ];

  useEffect(() => {
    if (!idsParam) return;
    getCompare(idsParam.split(',').map(Number).filter(Boolean))
      .then(data => {
        if (!Array.isArray(data)) {
          console.error('[compare] unexpected API response:', data);
          setLoading(false);
          return;
        }
        setCars(data);
        setLoading(false);
        Promise.all(
          data.map(car => getCarImage(car.model.make.name, car.model.name, car.year))
        ).then(setImages);
      })
      .catch(err => {
        console.error('[compare] fetch error:', err);
        setLoading(false);
      });
  }, [idsParam]);

  const getTimes = (c: CarDetail[], m: RaceMode, d: number): number[] =>
    c.map(car => {
      if (m === 'trip')   return computeTrip(car, d).totalMinutes;
      if (m === '201m')   return car.simulation.sprint_201m.time_seconds;
      if (m === '400m')   return car.simulation.sprint_400m.time_seconds;
      if (m === '1000m')  return car.simulation.sprint_1000m.time_seconds;
      return car.simulation.sprint_800m.time_seconds;
    });

  const handleSimulate = () => {
    const snapshot = { cars, mode, tripDist };
    setSimulated(false);
    setBarWidths(cars.map(() => 0));
    setCarsReady(false);
    setAnimating(true);
    setPilotPhase('walking');
    setTimeout(() => {
      setCarsReady(true);
      setPilotPhase('racing');
      setTimeout(() => {
        const times = getTimes(snapshot.cars, snapshot.mode, snapshot.tripDist);
        const minT  = Math.min(...times);
        setBarWidths(times.map(t => (minT / t) * 100));
        setSimulated(true);
        setAnimating(false);
      }, 120);
      setTimeout(() => setPilotPhase('finished'), 1600);
    }, 1800);
  };

  const winnerIdx = (() => {
    if (!simulated || !cars.length) return -1;
    const times = getTimes(cars, mode, tripDist);
    return times.indexOf(Math.min(...times));
  })();

  const formatPrice = (car: CarDetail) => {
    if (car.price_br) return `R$ ${car.price_br.toLocaleString('pt-BR')}`;
    if (car.price_us) return `US$ ${car.price_us.toLocaleString('en-US')}`;
    return '—';
  };

  const calcCostPerKm = (car: CarDetail) => {
    const pricePerUnit = car.fuel_type === 'electric' ? ELEC_PRICE_BRL : FUEL_PRICE_BRL;
    return ((car.fuel_consumption / 100) * pricePerUnit).toFixed(3);
  };

  const calcRange = (car: CarDetail) =>
    Math.round((car.tank_liters / car.fuel_consumption) * 100);

  const fuelBadge = (fuelType: string): { label: string; style: React.CSSProperties } => {
    const ptEn = (pt: string, en: string) => locale === 'pt' ? pt : en;
    const map: Record<string, { label: string; style: React.CSSProperties }> = {
      flex:     { label: 'Flex',                        style: { background: 'rgba(74,222,128,0.12)',  color: '#4ade80' } },
      gasoline: { label: ptEn('Gasolina', 'Gasoline'),  style: { background: 'rgba(251,146,60,0.12)', color: '#fb923c' } },
      diesel:   { label: 'Diesel',                      style: { background: 'rgba(96,165,250,0.12)', color: '#60a5fa' } },
      electric: { label: ptEn('Elétrico', 'Electric'),  style: { background: 'rgba(56,189,248,0.12)', color: '#38bdf8' } },
      hybrid:   { label: ptEn('Híbrido', 'Hybrid'),     style: { background: 'rgba(167,139,250,0.12)',color: '#a78bfa' } },
    };
    return map[fuelType] ?? { label: fuelType, style: { background: '#2A2A2A', color: '#9ca3af' } };
  };

  const catLabel = (category: string) => {
    const ptEn = (pt: string, en: string) => locale === 'pt' ? pt : en;
    const map: Record<string, string> = {
      hatch: 'Hatch', sedan: 'Sedan', suv: 'SUV',
      pickup: 'Pickup', coupe: ptEn('Cupê', 'Coupe'), minivan: 'Minivan',
    };
    return map[category] ?? category;
  };

  /* ── Shared table column headers ─────────────────────── */
  const CarColHeaders = () => (
    <tr className="border-b border-[#2A2A2A]">
      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap" style={{ width: 140 }}>
        {t('compare.specHeader')}
      </th>
      {cars.map((car, i) => (
        <th key={car.id} className="px-4 py-3 text-center" style={{ minWidth: 110 }}>
          <div className="flex flex-col items-center gap-0.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SLOT_COLORS[i] }} />
            <span className="text-[11px] font-black uppercase tracking-wide leading-tight" style={{ color: SLOT_COLORS[i] }}>
              {car.model.make.name}
            </span>
            <span className="text-[11px] text-gray-500 font-medium leading-tight text-center">
              {car.model.name}
            </span>
          </div>
        </th>
      ))}
    </tr>
  );

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-[#0F0F0F]">

      {/* ── BRAND STRIPE ──────────────────────── */}
      <div style={{ height: 3, backgroundColor: BRAND }} />

      {/* ── NAVBAR ───────────────────────────── */}
      <header className="bg-[#0A0A0A] border-b border-[#1A1A1A] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">

          <Link href={`/${locale}`} className="shrink-0">
            <Logo size="sm" />
          </Link>

          <div className="hidden md:flex items-center gap-3 overflow-x-auto flex-1 min-w-0">
            {cars.map((car, i) => (
              <div key={car.id} className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SLOT_COLORS[i] }} />
                <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                  {car.model.make.name} {car.model.name}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <ShareButton />
            <Link href={`/${locale}`}
              className="text-xs font-semibold text-gray-500 hover:text-white transition-colors whitespace-nowrap">
              {t('common.back')}
            </Link>
            <div className="flex items-center gap-1 border-l border-[#2A2A2A] pl-3">
              {(['pt', 'en'] as const).map(loc => (
                <Link key={loc} href={`/${loc}/compare${compareQuery}`}
                  className="text-xs px-2.5 py-1 rounded-full font-semibold transition-all"
                  style={locale === loc
                    ? { backgroundColor: BRAND, color: '#fff' }
                    : { color: '#6b7280' }}>
                  {loc.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── CAR HEADER CARDS ─────────────────── */}
      <div className="bg-[#0A0A0A] border-b border-[#1A1A1A]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {cars.map((car, i) => (
              <div key={car.id}
                className="flex-none rounded-xl border border-[#2A2A2A] overflow-hidden bg-[#1A1A1A]"
                style={{ minWidth: 172, flex: '1 1 0' }}>
                <div style={{ height: 3, backgroundColor: SLOT_COLORS[i] }} />
                <div className="p-4">
                  <div className="relative mb-3">
                    {images[i] ? (
                      <img
                        src={images[i]!}
                        alt={`${car.model.make.name} ${car.model.name}`}
                        className="w-full h-14 object-contain rounded"
                      />
                    ) : (
                      <CarSilhouette category={car.category} color={SLOT_COLORS[i]} />
                    )}
                    <span
                      className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center rounded-full text-white text-[10px] font-black shadow"
                      style={{ backgroundColor: SLOT_COLORS[i] }}>
                      {SLOT_LETTERS[i]}
                    </span>
                  </div>

                  <div className="text-[10px] font-black uppercase tracking-widest mb-0.5"
                    style={{ color: SLOT_COLORS[i] }}>
                    {car.model.make.name}
                  </div>
                  <div className="text-sm font-bold text-white leading-tight">
                    {car.model.name}
                  </div>
                  <div className="text-[11px] text-gray-500 leading-tight mb-2.5 line-clamp-2">
                    {car.name}
                  </div>

                  <div className="flex items-center flex-wrap gap-1 mb-2.5">
                    <span className="text-[10px] font-bold bg-[#2A2A2A] text-gray-400 px-1.5 py-0.5 rounded-full">
                      {car.year}
                    </span>
                    <span className="text-[10px] font-bold bg-[#2A2A2A] text-gray-400 px-1.5 py-0.5 rounded-full">
                      {car.market === 'BR' ? '🇧🇷 BR' : car.market === 'US' ? '🇺🇸 US' : car.market}
                    </span>
                  </div>

                  <div className="text-base font-black mb-2" style={{ color: BRAND }}>
                    {formatPrice(car)}
                  </div>

                  {car.score4w && (
                    <div className="flex items-center justify-between mb-2.5 rounded-lg px-2 py-1.5 bg-[#222222]">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">4W Score</span>
                      <span className="text-sm font-black" style={{ color: BRAND }}>
                        {car.score4w.score4w}
                        <span className="text-[10px] font-normal text-gray-500"> /10</span>
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#2A2A2A] text-gray-400">
                      {catLabel(car.category)}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      style={fuelBadge(car.fuel_type).style}>
                      {fuelBadge(car.fuel_type).label}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABS ─────────────────────────────── */}
      <div className="bg-[#0A0A0A] border-b border-[#1A1A1A] sticky top-14 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex overflow-x-auto">
          {(['specs', 'race', 'equipment'] as Tab[]).map(tabKey => (
            <button key={tabKey} onClick={() => setTab(tabKey)}
              className="px-5 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap"
              style={tab === tabKey
                ? { borderColor: 'transparent', color: '#fff', backgroundColor: BRAND }
                : { borderColor: 'transparent', color: '#6b7280' }}>
              {tabKey === 'specs'
                ? `📊 ${t('compare.tabSpecs')}`
                : tabKey === 'race'
                  ? `🏁 ${t('compare.tabRace')}`
                  : `✓ ${t('compare.tabEquipment')}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────── */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6 items-start">
          <main className="flex-1 min-w-0 space-y-4">

        {/* ══ SPECS TAB ════════════════════════ */}
        {tab === 'specs' && (
          <>
            {/* ── 4W Score card ── */}
            <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2A2A2A] bg-[#141414] flex items-center gap-2">
                <span>🏆</span>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">4W Score</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><CarColHeaders /></thead>
                  <tbody>
                    {(() => {
                      const scores = cars.map(c => c.score4w?.score4w ?? 0);
                      const best   = Math.max(...scores);
                      const worst  = Math.min(...scores);
                      const allEq  = scores.every(v => v === scores[0]);
                      return (
                        <tr className="border-b border-[#2A2A2A] bg-[#1A1A1A] hover:bg-white/[0.03] transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-200">
                              {locale === 'pt' ? 'Pontuação' : 'Overall'}
                            </div>
                            <div className="text-[11px] text-gray-500">0 – 10</div>
                          </td>
                          {scores.map((score, i) => {
                            const isBest  = !allEq && score === best;
                            const isWorst = !allEq && score === worst;
                            return (
                              <td key={i} className="px-4 py-4 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="text-2xl font-black"
                                    style={{ color: isBest ? '#059669' : isWorst ? '#DC2626' : '#e5e7eb' }}>
                                    {score}
                                  </span>
                                  {isBest  && <div className="text-[10px] font-bold" style={{ color: '#059669' }}>{t('compare.best')}</div>}
                                  {isWorst && <div className="text-[10px] font-bold" style={{ color: '#DC2626' }}>{t('compare.worst')}</div>}
                                  <div className="w-16 h-[5px] bg-[#333] rounded-full overflow-hidden mt-1">
                                    <div className="h-full rounded-full transition-all duration-500"
                                      style={{ width: `${(score / 10) * 100}%`, backgroundColor: isBest ? '#059669' : isWorst ? '#DC2626' : SLOT_COLORS[i] }} />
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })()}
                    {SCORE_ROWS.map(({ key, label, weight }, rowIdx) => {
                      const vals  = cars.map(c => c.score4w?.breakdown[key] ?? 0);
                      const best  = Math.max(...vals);
                      const worst = Math.min(...vals);
                      const allEq = vals.every(v => v === vals[0]);
                      const rowBg = (rowIdx + 1) % 2 === 0 ? 'bg-[#141414]' : 'bg-[#1A1A1A]';
                      return (
                        <tr key={key} className={`border-b border-[#2A2A2A] last:border-0 hover:bg-white/[0.03] transition-colors ${rowBg}`}>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="text-sm text-gray-200">{label}</div>
                            <div className="text-[11px] text-gray-500">{weight}</div>
                          </td>
                          {vals.map((val, i) => {
                            const isBest  = !allEq && val === best;
                            const isWorst = !allEq && val === worst;
                            return (
                              <td key={i} className="px-4 py-3.5 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="text-sm font-bold"
                                    style={{ color: isBest ? '#059669' : isWorst ? '#DC2626' : '#e5e7eb' }}>
                                    {val}
                                  </span>
                                  {isBest  && <div className="text-[10px] font-bold" style={{ color: '#059669' }}>{t('compare.best')}</div>}
                                  {isWorst && <div className="text-[10px] font-bold" style={{ color: '#DC2626' }}>{t('compare.worst')}</div>}
                                  <div className="w-16 h-[3px] bg-[#333] rounded-full overflow-hidden mt-1">
                                    <div className="h-full rounded-full transition-all duration-500"
                                      style={{ width: `${(val / 10) * 100}%`, backgroundColor: isBest ? '#059669' : isWorst ? '#DC2626' : SLOT_COLORS[i] }} />
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 4W Radar card ── */}
            {cars.some(c => c.score4w) && (() => {
              const DIMS = [
                { key: 'price'       as const, label: locale === 'pt' ? 'Preço'          : 'Price'       },
                { key: 'performance' as const, label: 'Performance'                                       },
                { key: 'economy'     as const, label: locale === 'pt' ? 'Economia'       : 'Economy'     },
                { key: 'reliability' as const, label: locale === 'pt' ? 'Confiabilidade' : 'Reliability' },
              ];
              const data = DIMS.map(({ key, label }) => {
                const row: Record<string, string | number> = { subject: label };
                cars.forEach((car, i) => { row[`car_${i}`] = car.score4w?.breakdown[key] ?? 0; });
                return row;
              });
              return (
                <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#2A2A2A] bg-[#141414] flex items-center gap-2">
                    <span>🕸️</span>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {locale === 'pt' ? 'Radar 4W' : '4W Radar'}
                    </h3>
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={data} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fontSize: 12, fontWeight: 600, fill: '#6b7280' }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 10]}
                          tickCount={6}
                          tick={{ fontSize: 10, fill: '#9ca3af' }}
                        />
                        {cars.map((car, i) => (
                          <Radar
                            key={car.id}
                            name={`${car.model.make.name} ${car.model.name}`}
                            dataKey={`car_${i}`}
                            stroke={SLOT_COLORS[i]}
                            fill={SLOT_COLORS[i]}
                            fillOpacity={0.12}
                            strokeWidth={2}
                            dot={{ r: 3, fill: SLOT_COLORS[i] }}
                          />
                        ))}
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: 8, fontSize: 12, borderColor: '#e5e7eb' }}
                          formatter={(value) => [`${value} / 10`]}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })()}

            {/* ── Performance card ── */}
            <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2A2A2A] bg-[#141414] flex items-center gap-2">
                <span>⚡</span>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('compare.cardPerformance')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><CarColHeaders /></thead>
                  <tbody>
                    {PERF_ROWS.map(({ key, label, convertType, lowerIsBetter }, rowIdx) => {
                      const rawVals   = cars.map(c => (c as unknown as Record<string, unknown>)[key] as number);
                      const converted = rawVals.map(v => convertUnits(v, convertType, locale));
                      const vals      = converted.map(c => c.value);
                      const unit      = converted[0]?.unit ?? '';
                      const effLIB    = convertType === 'consumption' && locale === 'en' ? false : lowerIsBetter;
                      const best      = effLIB ? Math.min(...vals) : Math.max(...vals);
                      const worst     = effLIB ? Math.max(...vals) : Math.min(...vals);
                      const allEqual  = vals.every(v => v === vals[0]);
                      const maxVal    = Math.max(...vals);
                      const minVal    = Math.min(...vals);
                      const rowBg     = rowIdx % 2 === 0 ? 'bg-[#1A1A1A]' : 'bg-[#141414]';
                      return (
                        <tr key={key} className={`border-b border-[#2A2A2A] last:border-0 hover:bg-white/[0.03] transition-colors ${rowBg}`}>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-200">{label}</div>
                            <div className="text-[11px] text-gray-500">{unit}</div>
                          </td>
                          {vals.map((val, i) => {
                            const isBest  = !allEqual && val === best;
                            const isWorst = !allEqual && val === worst;
                            const pct     = effLIB
                              ? Math.round((minVal / val) * 100)
                              : Math.round((val / maxVal) * 100);
                            const barColor = isBest ? '#059669' : isWorst ? '#DC2626' : SLOT_COLORS[i];
                            return (
                              <td key={i} className="px-4 py-4 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="text-base font-black"
                                    style={{ color: isBest ? '#059669' : isWorst ? '#DC2626' : '#e5e7eb' }}>
                                    {val}
                                  </span>
                                  {isBest  && <div className="text-[10px] font-bold" style={{ color: '#059669' }}>{t('compare.best')}</div>}
                                  {isWorst && <div className="text-[10px] font-bold" style={{ color: '#DC2626' }}>{t('compare.worst')}</div>}
                                  <div className="w-16 h-[3px] bg-[#333] rounded-full overflow-hidden mt-1">
                                    <div className="h-full rounded-full transition-all duration-500"
                                      style={{ width: `${pct}%`, backgroundColor: barColor }} />
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Financial card ── */}
            <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2A2A2A] bg-[#141414] flex items-center gap-2">
                <span>💰</span>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('compare.cardFinancial')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><CarColHeaders /></thead>
                  <tbody>
                    {/* Price — row 0, #1A1A1A */}
                    <tr className="border-b border-[#2A2A2A] bg-[#1A1A1A] hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-200">{t('compare.specPrice')}</div>
                        <div className="text-[11px] text-gray-500">BRL / USD</div>
                      </td>
                      {cars.map((car, i) => (
                        <td key={i} className="px-4 py-4 text-center">
                          <span className="text-sm font-black" style={{ color: BRAND }}>
                            {formatPrice(car)}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* IPVA — row 1, #141414 */}
                    <tr className="border-b border-[#2A2A2A] bg-[#141414] hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-200">{t('compare.specIPVA')}</div>
                        <div className="text-[11px] text-gray-500">1,5% · 🇧🇷 BR</div>
                      </td>
                      {cars.map((car, i) => (
                        <td key={i} className="px-4 py-4 text-center">
                          <span className="text-sm font-bold text-gray-200">
                            {car.price_br
                              ? `R$ ${Math.round(car.price_br * 0.015).toLocaleString('pt-BR')}`
                              : <span className="text-gray-600">—</span>}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Cost per km — row 2, #1A1A1A */}
                    <tr className="border-b border-[#2A2A2A] bg-[#1A1A1A] hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-200">{t('compare.specCostKm')}</div>
                        <div className="text-[11px] text-gray-500">R$5,89/L · R$0,80/kWh</div>
                      </td>
                      {(() => {
                        const costVals = cars.map(c => parseFloat(calcCostPerKm(c)));
                        const minC  = Math.min(...costVals);
                        const maxC  = Math.max(...costVals);
                        const allEq = costVals.every(v => v === costVals[0]);
                        return cars.map((car, i) => {
                          const cost    = calcCostPerKm(car);
                          const isBest  = !allEq && costVals[i] === minC;
                          const isWorst = !allEq && costVals[i] === maxC;
                          return (
                            <td key={i} className="px-4 py-4 text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-sm font-bold"
                                  style={{ color: isBest ? '#059669' : isWorst ? '#DC2626' : '#e5e7eb' }}>
                                  R$ {cost}/km
                                </span>
                                {isBest  && <div className="text-[10px] font-bold" style={{ color: '#059669' }}>{t('compare.best')}</div>}
                                {isWorst && <div className="text-[10px] font-bold" style={{ color: '#DC2626' }}>{t('compare.worst')}</div>}
                              </div>
                            </td>
                          );
                        });
                      })()}
                    </tr>

                    {/* Range — row 3, #141414 */}
                    <tr className="bg-[#141414] hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-200">{t('compare.specRange')}</div>
                        <div className="text-[11px] text-gray-500">{locale === 'en' ? 'mi' : 'km'}</div>
                      </td>
                      {(() => {
                        const rangeVals = cars.map(c => convertUnits(calcRange(c), 'distance', locale).value);
                        const maxR  = Math.max(...rangeVals);
                        const minR  = Math.min(...rangeVals);
                        const allEq = rangeVals.every(v => v === rangeVals[0]);
                        const unit  = locale === 'en' ? 'mi' : 'km';
                        return cars.map((car, i) => {
                          const range   = rangeVals[i];
                          const isBest  = !allEq && range === maxR;
                          const isWorst = !allEq && range === minR;
                          return (
                            <td key={i} className="px-4 py-4 text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-sm font-bold"
                                  style={{ color: isBest ? '#059669' : isWorst ? '#DC2626' : '#e5e7eb' }}>
                                  {range} {unit}
                                </span>
                                {isBest  && <div className="text-[10px] font-bold" style={{ color: '#059669' }}>{t('compare.best')}</div>}
                                {isWorst && <div className="text-[10px] font-bold" style={{ color: '#DC2626' }}>{t('compare.worst')}</div>}
                              </div>
                            </td>
                          );
                        });
                      })()}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══ RACE TAB ════════════════════════ */}
        {tab === 'race' && (
          <div className="space-y-4">

            {/* Controls */}
            <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                {t('compare.raceDistance')}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(['201m', '400m', '800m', '1000m', 'trip'] as RaceMode[]).map(m => (
                  <button key={m}
                    onClick={() => { setMode(m); setSimulated(false); }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={mode === m
                      ? { backgroundColor: BRAND, color: '#fff' }
                      : { backgroundColor: '#2A2A2A', color: '#9ca3af' }}>
                    {m === 'trip' ? `🗺️ ${t('compare.raceTrip')}` : `0–${m}`}
                  </button>
                ))}
              </div>

              {mode === 'trip' && (
                <div className="mb-4 p-4 bg-[#141414] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-400">{t('compare.raceTripDist')}</span>
                    <span className="text-xl font-black" style={{ color: BRAND }}>
                      {convertUnits(tripDist, 'distance', locale).value}{' '}
                      {convertUnits(tripDist, 'distance', locale).unit}
                    </span>
                  </div>
                  <input
                    type="range" min={1} max={1000} value={tripDist}
                    onChange={e => { setTripDist(Number(e.target.value)); setSimulated(false); }}
                    className="w-full accent-[#D85A30]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 {locale === 'en' ? 'mi' : 'km'}</span>
                    <span>{locale === 'en' ? '311' : '500'} {locale === 'en' ? 'mi' : 'km'}</span>
                    <span>{locale === 'en' ? '621' : '1000'} {locale === 'en' ? 'mi' : 'km'}</span>
                  </div>
                </div>
              )}

              <button onClick={handleSimulate} disabled={animating}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: BRAND }}>
                {animating ? t('compare.raceSimulating') : t('compare.raceSimulate')}
              </button>
            </div>

            {/* Race track */}
            {(simulated || animating || pilotPhase !== 'idle') && (
              <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-5">
                <style>{`
                  @keyframes _carPulse {
                    0%,100% { filter: drop-shadow(0 0 5px gold) brightness(1.15); }
                    50%     { filter: drop-shadow(0 0 16px gold) drop-shadow(0 0 5px #fff) brightness(1.5); }
                  }
                  @keyframes _confettiBurst {
                    0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity:1; }
                    85%  { opacity:.7; }
                    100% { transform: translate(var(--tx),var(--ty)) rotate(var(--rot)) scale(.35); opacity:0; }
                  }
                  @keyframes _pilotWalkIn {
                    0%   { transform: translateY(-50%) translateX(-50px); opacity:0; }
                    12%  { transform: translateY(-50%) translateX(-30px); opacity:1; }
                    82%  { transform: translateY(-50%) translateX(0);     opacity:1; }
                    100% { transform: translateY(-50%) translateX(0);     opacity:0; }
                  }
                  @keyframes _pilotCelebWalk {
                    0%   { transform: translateX(0); }
                    40%  { transform: translateX(-8px) translateY(-3px); }
                    100% { transform: translateX(-14px); }
                  }
                  @keyframes _legSwingL {
                    0%,100% { transform: rotate(-15deg); }
                    50%     { transform: rotate(15deg); }
                  }
                  @keyframes _legSwingR {
                    0%,100% { transform: rotate(15deg); }
                    50%     { transform: rotate(-15deg); }
                  }
                  @keyframes _flowerFall {
                    0%   { transform: translateY(-25px); opacity:1; }
                    100% { transform: translateY(50px);  opacity:0; }
                  }
                  ._winCar  { animation: _carPulse .75s ease-in-out infinite; }
                  ._confbit {
                    position:absolute; width:8px; height:8px; border-radius:2px;
                    animation: _confettiBurst 1.3s ease-out forwards;
                    pointer-events:none; z-index:40;
                  }
                  ._walkPilot {
                    position:absolute; top:50%; left:14px; z-index:22; pointer-events:none;
                    animation: _pilotWalkIn 1.8s ease-out forwards;
                  }
                  ._flower {
                    position:absolute; width:7px; height:7px; border-radius:50%;
                    animation: _flowerFall 1.2s ease-in forwards;
                    pointer-events:none; z-index:35;
                  }
                `}</style>

                <h3 className="text-sm font-bold text-gray-400 mb-6">
                  {mode === 'trip'
                    ? t('compare.raceTripTitle', { dist: tripDist })
                    : t('compare.raceTitle', { mode })}
                </h3>

                <div className="space-y-7">
                  {cars.map((car, i) => {
                    const isWinner = simulated && i === winnerIdx;
                    const pct      = barWidths[i] ?? 0;
                    let timeLabel: string, speedLabel: string, fuelLabel = '';

                    if (mode !== 'trip') {
                      const sim = mode === '201m'  ? car.simulation.sprint_201m
                                : mode === '400m'  ? car.simulation.sprint_400m
                                : mode === '1000m' ? car.simulation.sprint_1000m
                                :                    car.simulation.sprint_800m;
                      timeLabel  = `${sim.time_seconds.toFixed(2)}s`;
                      const spd  = convertUnits(sim.final_speed_kmh, 'speed', locale);
                      speedLabel = `${Math.round(spd.value)} ${spd.unit}`;
                    } else {
                      const tr   = computeTrip(car, tripDist);
                      timeLabel  = `${tr.timeHours}h ${tr.timeMinutes}min`;
                      const spd  = convertUnits(tr.avgSpeed, 'speed', locale);
                      speedLabel = `${Math.round(spd.value)} ${spd.unit}`;
                      const fuel = convertUnits(tr.fuelL, 'tank', locale);
                      fuelLabel  = `${fuel.value} ${fuel.unit}`;
                    }

                    return (
                      <div key={car.id}>
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SLOT_COLORS[i] }} />
                            <span className="text-sm font-semibold text-gray-200">
                              {car.model.make.name} {car.model.name}
                            </span>
                            {isWinner && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
                                style={{ background: '#fefce8', borderColor: '#fde68a', color: '#92400e' }}>
                                {t('compare.raceWinner')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="font-bold text-white text-sm">{timeLabel}</span>
                            <span>{speedLabel}</span>
                            {fuelLabel && <span>⛽ {fuelLabel}</span>}
                          </div>
                        </div>

                        <div className="relative h-11">
                          <div className="absolute inset-0 rounded-xl overflow-hidden"
                            style={{
                              background: '#18181b',
                              backgroundImage: [
                                'repeating-linear-gradient(180deg,rgba(255,255,255,.04) 0,rgba(255,255,255,.04) 1px,transparent 1px,transparent 5px)',
                                'repeating-linear-gradient(90deg,rgba(255,255,255,.22) 0,rgba(255,255,255,.22) 12px,transparent 12px,transparent 26px)',
                              ].join(','),
                              backgroundSize: '100% 5px, 100% 2px',
                              backgroundPosition: '0 0, 0 center',
                            }}>
                            <div className="absolute left-0 top-0 h-full"
                              style={{
                                width: carsReady ? `${pct}%` : '0%',
                                background: `linear-gradient(90deg,${SLOT_COLORS[i]}60,${SLOT_COLORS[i]}a8)`,
                                transition: carsReady ? 'width 1.4s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
                                borderRight: `2px solid ${SLOT_COLORS[i]}`,
                              }} />
                            <div className="absolute left-0 top-0 w-3 h-full z-10 opacity-60"
                              style={{ backgroundImage: 'repeating-linear-gradient(180deg,#fff 0,#fff 5px,#000 5px,#000 10px)' }} />
                          </div>

                          {pilotPhase === 'walking' && (
                            <div className="_walkPilot">
                              <svg width="20" height="38" viewBox="0 0 20 38">
                                {/* Helmet */}
                                <circle cx="10" cy="5" r="5" fill={SLOT_COLORS[i]} stroke="white" strokeWidth="1" />
                                {/* Visor */}
                                <ellipse cx="10" cy="6" rx="3" ry="2" fill="rgba(0,0,0,0.6)" />
                                {/* Racing suit body */}
                                <rect x="6" y="10" width="8" height="11" rx="2" fill={SLOT_COLORS[i]} stroke="white" strokeWidth="0.8" />
                                {/* Belt line */}
                                <line x1="6" y1="16" x2="14" y2="16" stroke="white" strokeWidth="0.8" />
                                {/* Left arm */}
                                <line x1="6" y1="12" x2="2" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                {/* Right arm */}
                                <line x1="14" y1="12" x2="18" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                {/* Left leg + shoe — swings forward/back */}
                                <g style={{ transformBox: 'fill-box', transformOrigin: '50% 0%', animation: '_legSwingL 0.4s ease-in-out infinite' }}>
                                  <line x1="8" y1="21" x2="5" y2="32" stroke={SLOT_COLORS[i]} strokeWidth="2.5" strokeLinecap="round" />
                                  <rect x="3" y="30" width="5" height="3" rx="1.5" fill="white" />
                                </g>
                                {/* Right leg + shoe — opposite phase */}
                                <g style={{ transformBox: 'fill-box', transformOrigin: '50% 0%', animation: '_legSwingR 0.4s ease-in-out infinite' }}>
                                  <line x1="12" y1="21" x2="15" y2="32" stroke={SLOT_COLORS[i]} strokeWidth="2.5" strokeLinecap="round" />
                                  <rect x="13" y="30" width="5" height="3" rx="1.5" fill="white" />
                                </g>
                              </svg>
                            </div>
                          )}

                          <div className={`absolute top-1/2 text-xl z-20 select-none pointer-events-none ${isWinner ? '_winCar' : ''}`}
                            style={{
                              left: carsReady ? `${Math.max(3, pct)}%` : '3%',
                              transform: 'translate(-50%,-50%) scaleX(-1)',
                              transition: carsReady ? 'left 1.4s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
                            }}>
                            🚗
                          </div>

                          {isWinner && CONFETTI.map((p, j) => (
                            <div key={j} className="_confbit"
                              style={{
                                left: `calc(${pct}% + ${p.ox}px)`,
                                top:  `calc(50% + ${p.oy}px)`,
                                backgroundColor: p.color,
                                '--tx':  `${p.tx}px`,
                                '--ty':  `${p.ty}px`,
                                '--rot': `${p.rot}deg`,
                                animationDelay: `${p.delay}s`,
                              } as React.CSSProperties}
                            />
                          ))}

                          {pilotPhase === 'finished' && isWinner && (
                            <>
                              <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translateY(-50%)', zIndex: 26, pointerEvents: 'none' }}>
                                <div style={{ animation: '_pilotCelebWalk 1.2s ease-in-out forwards', position: 'relative', left: '-10px' }}>
                                  <svg width="20" height="38" viewBox="0 0 20 38">
                                    {/* Helmet */}
                                    <circle cx="10" cy="5" r="5" fill={SLOT_COLORS[i]} stroke="white" strokeWidth="1" />
                                    {/* Visor */}
                                    <ellipse cx="10" cy="6" rx="3" ry="2" fill="rgba(0,0,0,0.6)" />
                                    {/* Racing suit body */}
                                    <rect x="6" y="10" width="8" height="11" rx="2" fill={SLOT_COLORS[i]} stroke="white" strokeWidth="0.8" />
                                    {/* Belt line */}
                                    <line x1="6" y1="16" x2="14" y2="16" stroke="white" strokeWidth="0.8" />
                                    {/* Arms raised in V */}
                                    <line x1="6"  y1="12" x2="1"  y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    <line x1="14" y1="12" x2="19" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                    {/* Left leg + shoe */}
                                    <line x1="8" y1="21" x2="5" y2="32" stroke={SLOT_COLORS[i]} strokeWidth="2.5" strokeLinecap="round" />
                                    <rect x="3" y="30" width="5" height="3" rx="1.5" fill="white" />
                                    {/* Right leg + shoe */}
                                    <line x1="12" y1="21" x2="15" y2="32" stroke={SLOT_COLORS[i]} strokeWidth="2.5" strokeLinecap="round" />
                                    <rect x="13" y="30" width="5" height="3" rx="1.5" fill="white" />
                                  </svg>
                                </div>
                              </div>
                              {FLOWERS.map((f, j) => (
                                <div key={j} className="_flower"
                                  style={{
                                    left: `calc(${pct}% + ${f.ox}px)`,
                                    top: '8px',
                                    backgroundColor: FLOWER_COLORS[j % FLOWER_COLORS.length],
                                    animationDelay: `${f.delay}s`,
                                  }}
                                />
                              ))}
                            </>
                          )}

                          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-lg z-30 select-none pointer-events-none">
                            🏁
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ EQUIPMENT TAB ════════════════════ */}
        {tab === 'equipment' && (
          <div className="space-y-4">
            {EQ_CATEGORIES.map(cat => (
              <div key={cat.name} className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
                <div className="px-5 py-3 bg-[#141414] border-b border-[#2A2A2A]">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{cat.name}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#2A2A2A]">
                        <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium" style={{ minWidth: 140 }}>
                          {t('compare.eqHeader')}
                        </th>
                        {cars.map((car, i) => (
                          <th key={car.id} className="px-4 py-3 text-center" style={{ minWidth: 80 }}>
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SLOT_COLORS[i] }} />
                              <span className="text-[11px] font-black uppercase tracking-wide" style={{ color: SLOT_COLORS[i] }}>
                                {car.model.make.name}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cat.items.map(({ key, label }, rowIdx) => (
                        <tr key={key} className={`border-b border-[#2A2A2A] last:border-0 hover:bg-white/[0.03] transition-colors ${
                          rowIdx % 2 === 0 ? 'bg-[#1A1A1A]' : 'bg-[#141414]'
                        }`}>
                          <td className="px-5 py-3.5 text-sm text-gray-300">{label}</td>
                          {cars.map((car, i) => {
                            const raw     = (car as unknown as Record<string, unknown>)[key];
                            const has     = typeof raw === 'number' ? (raw as number) > 0 : Boolean(raw);
                            const display = typeof raw === 'number' && (raw as number) > 0 ? String(raw) : undefined;
                            return (
                              <td key={i} className="px-4 py-3.5 text-center">
                                <span className="text-base font-bold"
                                  style={{ color: has ? '#4ade80' : '#f87171' }}>
                                  {display ?? (has ? '✓' : '✗')}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
          </main>

          {/* Sidebar ad — desktop only */}
          <aside className="hidden xl:block w-[300px] shrink-0">
            <div className="sticky" style={{ top: 120 }}>
              <AdSlot size="sidebar" />
            </div>
          </aside>
        </div>
      </div>

      <footer className="text-center text-gray-600 text-xs py-10 mt-4 border-t border-[#1A1A1A]">
        4wheelscompare.com · {new Date().getFullYear()} · {t('common.footerNote')}
      </footer>
    </div>
  );
}
