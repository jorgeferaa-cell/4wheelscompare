'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import CarSelector, { PreselectInfo } from '@/components/CarSelector';
import Logo from '@/components/Logo';
import Link from 'next/link';
import { searchCars, SearchResult } from '@/lib/api';
import AdSlot from '@/components/AdSlot';

/* ── Search bar ──────────────────────────────────────────── */

interface SearchBarProps {
  market: string;
  onSelect: (r: SearchResult) => void;
  variant?: 'light' | 'dark';
}

const YEARS = Array.from({ length: 11 }, (_, i) => 2026 - i);

function SearchBar({ market, onSelect, variant = 'light' }: SearchBarProps) {
  const t           = useTranslations('common');
  const dark        = variant === 'dark';
  const [query,     setQuery]   = useState('');
  const [year,      setYear]    = useState('');
  const [results,   setResults] = useState<SearchResult[]>([]);
  const [open,      setOpen]    = useState(false);
  const [loading,   setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchCars(query, market, year || undefined);
        setResults(res);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, market, year]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const clear = () => { setQuery(''); setResults([]); setOpen(false); };

  const formatPrice = (r: SearchResult) => {
    if (r.price_br) return `R$ ${Math.round(r.price_br / 1000)}k`;
    if (r.price_us) return `US$ ${Math.round(r.price_us / 1000)}k`;
    return '';
  };

  const catIcon = (category: string) =>
    category === 'pickup' ? '🚛' : category === 'suv' ? '🚙' : '🚗';

  return (
    <div ref={containerRef} className="relative mb-5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder={t('searchPlaceholder')}
            className={`w-full border rounded-xl pl-11 pr-10 py-3.5 text-sm
              focus:outline-none focus:border-[#D85A30] focus:ring-1 focus:ring-[#D85A30]/30
              transition-colors shadow-sm ${
              dark
                ? 'bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-500'
                : 'bg-white border-gray-200 text-gray-800'
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {loading && (
              <div className="w-4 h-4 border-2 border-gray-200 border-t-[#D85A30] rounded-full animate-spin" />
            )}
            {query && !loading && (
              <button onClick={clear}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 text-[10px] font-bold transition-colors">
                ✕
              </button>
            )}
          </div>
        </div>
        <select
          value={year}
          onChange={e => setYear(e.target.value)}
          className={`border rounded-xl px-3 py-3.5 text-sm
            focus:outline-none focus:border-[#D85A30] focus:ring-1 focus:ring-[#D85A30]/30
            transition-colors shadow-sm cursor-pointer ${
            dark
              ? 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-300'
              : 'bg-white border-gray-200 text-gray-700'
          }`}
          style={{ minWidth: 100 }}>
          <option value="">{t('yearAll')}</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {open && (
        <div className={`absolute top-full left-0 right-0 mt-1.5 border rounded-xl shadow-xl z-50 overflow-hidden ${
          dark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-white border-gray-200'
        }`}>
          {results.length === 0 ? (
            <div className={`px-4 py-4 text-sm text-center ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('searchNoResults')} — &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.flatMap((r, idx) => {
              const btn = (
                <button
                  key={r.id}
                  onClick={() => { onSelect(r); clear(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-b text-left group ${
                    dark ? 'hover:bg-[#D85A30]/10 border-[#2A2A2A]' : 'hover:bg-[#FFF8F6] border-gray-50'
                  }`}>
                  <span className="text-xl shrink-0">{catIcon(r.category)}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold ${dark ? 'text-gray-100' : 'text-gray-900'}`}>
                      {r.make}{' '}
                      <span className={`font-semibold ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{r.model}</span>
                    </div>
                    <div className={`text-xs truncate ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{r.version}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`text-xs font-bold ${dark ? 'text-gray-400' : 'text-gray-700'}`}>{r.year}</div>
                    <div className="text-xs font-black" style={{ color: '#D85A30' }}>{formatPrice(r)}</div>
                  </div>
                  <span className={`text-xs shrink-0 transition-colors group-hover:text-[#D85A30] ${
                    dark ? 'text-gray-600' : 'text-gray-300'
                  }`}>→</span>
                </button>
              );
              if (idx === 2 && results.length > 3) {
                return [btn, (
                  <div key="search-ad" className={`px-3 py-2 border-b ${dark ? 'border-[#2A2A2A]' : 'border-gray-50'}`}>
                    <AdSlot size="card" label="Patrocinado" />
                  </div>
                )];
              }
              return [btn];
            })
          )}
        </div>
      )}
    </div>
  );
}

/* ── Popular comparisons data ────────────────────────────── */

const BR_POPULAR = [
  { ids: '11,13',  icon1: '🚗', icon2: '🚗', label: 'Onix vs HB20',          badge: 'Hatch · BR'  },
  { ids: '14,29',  icon1: '🚗', icon2: '🚗', label: 'Polo vs Virtus',         badge: 'Sedan · BR'  },
  { ids: '22,18',  icon1: '🚙', icon2: '🚙', label: 'Compass vs Creta',       badge: 'SUV · BR'    },
  { ids: '25,26',  icon1: '🚛', icon2: '🚛', label: 'Hilux vs Ranger',        badge: 'Pickup · BR' },
  { ids: '32,33',  icon1: '🚗', icon2: '🚗', label: 'Golf GTI vs WRX',        badge: 'Sport · BR'  },
  { ids: '21,23',  icon1: '🚗', icon2: '🚗', label: 'Corolla vs Civic',       badge: 'Sedan · BR'  },
];

const US_POPULAR = [
  { ids: '78,80',  icon1: '🚗', icon2: '🚗', label: 'Mustang vs Camaro',      badge: 'Muscle · US'  },
  { ids: '81,82',  icon1: '🚗', icon2: '🚗', label: 'Corvette vs Challenger', badge: 'Sport · US'   },
  { ids: '86,87',  icon1: '🚙', icon2: '🚙', label: 'RAV4 vs CR-V',           badge: 'SUV · US'     },
  { ids: '84,85',  icon1: '🚛', icon2: '🚛', label: 'F-150 vs Silverado',     badge: 'Pickup · US'  },
  { ids: '95,98',  icon1: '🚗', icon2: '🚗', label: 'Model 3 vs Ioniq 6',     badge: 'Electric · US'},
  { ids: '89,91',  icon1: '🚗', icon2: '🚗', label: 'BMW M3 vs Audi RS3',     badge: 'Sport · US'   },
];

/* ── Home page ───────────────────────────────────────────── */

export default function HomeClient() {
  const t        = useTranslations();
  const router   = useRouter();
  const pathname = usePathname();
  const locale   = pathname.split('/')[1] || 'pt';

  const [market,      setMarket]      = useState<'BR' | 'US'>('BR');
  const [slotCount,   setSlotCount]   = useState(2);
  const [selected,    setSelected]    = useState<(number | null)[]>([null, null, null, null]);
  const [preselected, setPreselected] = useState<(PreselectInfo | null)[]>([null, null, null, null]);

  const handleSelect = (index: number, id: number | null) => {
    setSelected(prev => { const n = [...prev]; n[index] = id; return n; });
  };

  const handleSearchSelect = (r: SearchResult) => {
    const info: PreselectInfo = r;
    const emptySlot = selected.slice(0, slotCount).findIndex(id => !id);
    if (emptySlot !== -1) {
      setSelected(prev => { const n = [...prev]; n[emptySlot] = r.id; return n; });
      setPreselected(prev => { const n = [...prev]; n[emptySlot] = info; return n; });
      return;
    }
    if (slotCount < 4) {
      const newIdx = slotCount;
      setSlotCount(n => Math.min(n + 1, 4));
      setSelected(prev => { const n = [...prev]; n[newIdx] = r.id; return n; });
      setPreselected(prev => { const n = [...prev]; n[newIdx] = info; return n; });
    }
  };

  const clearPreselect = (i: number) => {
    setPreselected(prev => { const n = [...prev]; n[i] = null; return n; });
    setSelected(prev => { const n = [...prev]; n[i] = null; return n; });
  };

  const validIds   = selected.slice(0, slotCount).filter(Boolean) as number[];
  const canCompare = validIds.length >= 2;

  const handleCompare = () => {
    if (canCompare) router.push(`/${locale}/compare?ids=${validIds.join(',')}`);
  };

  const addSlot = () => setSlotCount(n => Math.min(n + 1, 4));

  const removeSlot = (i: number) => {
    setSlotCount(n => Math.max(n - 1, 2));
    setSelected(prev => { const n = [...prev]; n.splice(i, 1); n.push(null); return n; });
    setPreselected(prev => { const n = [...prev]; n.splice(i, 1); n.push(null); return n; });
  };

  const changeMarket = (m: 'BR' | 'US') => {
    setMarket(m);
    setSelected([null, null, null, null]);
    setPreselected([null, null, null, null]);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F]">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="bg-[#0A0A0A] border-b border-[#1A1A1A] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="hidden sm:inline text-xs text-gray-500 border-l border-[#2A2A2A] pl-3">
              {t('common.subtitle')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {(['pt', 'en'] as const).map(loc => (
              <Link key={loc} href={`/${loc}`}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                  locale === loc
                    ? 'bg-[#D85A30] text-white'
                    : 'text-gray-500 hover:text-white hover:bg-[#1A1A1A]'
                }`}>
                {loc.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: '#0F0F0F',
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none" aria-hidden="true">
          <div style={{
            width: 1000, height: 600,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(216,90,48,0.18) 0%, transparent 60%)',
          }} />
        </div>

        <div className="max-w-3xl mx-auto px-6 py-14 sm:py-20 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#D85A30]/15 text-[#D85A30] text-xs font-semibold px-3 py-1 rounded-full border border-[#D85A30]/25 mb-6">
            <span>⚡</span>
            <span>{t('hero.badge')}</span>
          </div>

          <h1
            className="font-condensed font-black uppercase text-white mb-5 leading-none tracking-tight"
            style={{ fontSize: 'clamp(3.5rem, 9vw, 7.5rem)' }}
          >
            {t('hero.heading1')}{' '}
            <span className="text-[#D85A30]">{t('hero.headingHighlight')}</span>
            <br />
            {t('hero.heading2')}
          </h1>

          <p className="text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: '#A0A0A0' }}>
            {t('hero.subtext')}
          </p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-sm font-semibold text-gray-500 mr-2">{t('common.market')}:</span>
            {(['BR', 'US'] as const).map(m => (
              <button key={m} onClick={() => changeMarket(m)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  market === m
                    ? 'bg-[#D85A30] text-white shadow-lg'
                    : 'bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A] hover:border-[#D85A30]/50 hover:text-[#D85A30]'
                }`}>
                <span>{m === 'BR' ? '🇧🇷' : '🇺🇸'}</span>
                <span>{m === 'BR' ? t('common.br') : t('common.us')}</span>
              </button>
            ))}
          </div>

          <SearchBar market={market} onSelect={handleSearchSelect} variant="dark" />
        </div>
      </section>

      {/* ── MAIN ───────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: slotCount }).map((_, i) => (
            <CarSelector
              key={i}
              index={i}
              market={market}
              onVersionSelected={id => handleSelect(i, id)}
              canRemove={slotCount > 2}
              onRemove={() => removeSlot(i)}
              preselect={preselected[i]}
              onClearPreselect={() => clearPreselect(i)}
            />
          ))}

          {slotCount < 4 && (
            <button onClick={addSlot}
              className="flex flex-col items-center justify-center gap-2 bg-[#141414] rounded-xl border-2 border-dashed border-[#2A2A2A] hover:border-[#D85A30]/40 hover:bg-[#D85A30]/5 transition-all py-12 text-gray-500 hover:text-[#D85A30] group min-h-[200px]">
              <span className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center text-xl font-light group-hover:scale-110 transition-transform">
                +
              </span>
              <span className="text-sm font-medium">{t('common.addCar')}</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1A1A1A] rounded-xl px-6 py-5 border border-[#2A2A2A]">
          <div>
            {canCompare ? (
              <p className="text-sm font-semibold text-gray-200">
                {t('compare.statusReady', { count: validIds.length })}
              </p>
            ) : (
              <p className="text-sm text-gray-500">{t('compare.statusMin')}</p>
            )}
            <p className="text-xs text-gray-600 mt-0.5">{t('compare.statusSubtext')}</p>
          </div>
          <button onClick={handleCompare} disabled={!canCompare}
            className={`flex items-center gap-2.5 px-10 py-4 rounded-xl font-black text-base tracking-wide transition-all whitespace-nowrap ${
              canCompare
                ? 'bg-[#D85A30] text-white hover:opacity-90 shadow-[0_0_24px_rgba(216,90,48,0.35)] active:scale-95'
                : 'bg-[#2A2A2A] text-gray-600 cursor-not-allowed'
            }`}>
            {t('common.compareBtn')}
            {canCompare && <span className="text-sm opacity-80">({validIds.length})</span>}
            {canCompare && <span className="ml-0.5">→</span>}
          </button>
        </div>

        <section className="mt-10">
          <div className="mb-4">
            <h2 className="text-base font-black text-white">{t('home.popularTitle')}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{t('home.popularSubtitle')}</p>
          </div>

          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5 mb-2">
              🇧🇷 Brasil
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BR_POPULAR.map(c => (
                <button key={c.ids} onClick={() => router.push(`/${locale}/compare?ids=${c.ids}`)}
                  className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] px-4 py-3 text-left hover:border-[#D85A30]/40 hover:bg-[#D85A30]/5 transition-all group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{c.icon1}</span>
                    <span className="text-xs text-gray-600 font-bold">vs</span>
                    <span className="text-lg">{c.icon2}</span>
                  </div>
                  <div className="text-sm font-bold text-white leading-tight group-hover:text-[#D85A30] transition-colors">
                    {c.label}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 font-medium">{c.badge}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5 mb-2">
              🇺🇸 United States
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {US_POPULAR.map(c => (
                <button key={c.ids} onClick={() => router.push(`/${locale}/compare?ids=${c.ids}`)}
                  className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] px-4 py-3 text-left hover:border-[#D85A30]/40 hover:bg-[#D85A30]/5 transition-all group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{c.icon1}</span>
                    <span className="text-xs text-gray-600 font-bold">vs</span>
                    <span className="text-lg">{c.icon2}</span>
                  </div>
                  <div className="text-sm font-bold text-white leading-tight group-hover:text-[#D85A30] transition-colors">
                    {c.label}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 font-medium">{c.badge}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="text-center text-gray-600 text-xs py-10 mt-4 border-t border-[#1A1A1A]">
        4wheelscompare.com · {new Date().getFullYear()} · {t('common.footerNote')}
      </footer>
    </div>
  );
}
