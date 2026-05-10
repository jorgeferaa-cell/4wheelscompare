'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getMakes, getModels, getYears, getVersions, getVersionScore, getCarImage, Make, Model, VersionSummary, Score4WResult } from '@/lib/api';

export interface PreselectInfo {
  id:       number;
  make:     string;
  model:    string;
  version:  string;
  year:     number;
  price_br: number | null;
  price_us: number | null;
  category: string;
}

interface Props {
  index: number;
  market: string;
  onVersionSelected: (id: number | null) => void;
  onRemove?: () => void;
  canRemove: boolean;
  preselect?: PreselectInfo | null;
  onClearPreselect?: () => void;
}

const SLOT_COLORS = [
  { border: 'border-t-[#2563EB]', dot: 'bg-[#2563EB]', label: 'text-[#2563EB]', badge: 'bg-[#2563EB]/10 text-[#2563EB]', hex: '#2563EB' },
  { border: 'border-t-[#059669]', dot: 'bg-[#059669]', label: 'text-[#059669]', badge: 'bg-[#059669]/10 text-[#059669]', hex: '#059669' },
  { border: 'border-t-[#7C3AED]', dot: 'bg-[#7C3AED]', label: 'text-[#7C3AED]', badge: 'bg-[#7C3AED]/10 text-[#7C3AED]', hex: '#7C3AED' },
  { border: 'border-t-[#0891B2]', dot: 'bg-[#0891B2]', label: 'text-[#0891B2]', badge: 'bg-[#0891B2]/10 text-[#0891B2]', hex: '#0891B2' },
];

const SLOT_LETTERS = ['A', 'B', 'C', 'D'];

const selectCls =
  'w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 ' +
  'focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 ' +
  'disabled:opacity-40 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors';

const catIcon = (category: string) =>
  category === 'pickup' ? '🚛' : category === 'suv' ? '🚙' : '🚗';

export default function CarSelector({
  index, market, onVersionSelected, onRemove, canRemove, preselect, onClearPreselect,
}: Props) {
  const t = useTranslations('common');
  const c = SLOT_COLORS[index];

  const [makes,    setMakes]    = useState<Make[]>([]);
  const [models,   setModels]   = useState<Model[]>([]);
  const [years,    setYears]    = useState<number[]>([]);
  const [versions, setVersions] = useState<VersionSummary[]>([]);

  const [makeId,    setMakeId]    = useState<number | null>(null);
  const [modelId,   setModelId]   = useState<number | null>(null);
  const [year,      setYear]      = useState<number | null>(null);
  const [versionId, setVersionId] = useState<number | null>(null);
  const [score,     setScore]     = useState<Score4WResult | null>(null);
  const [image,     setImage]     = useState<string | null>(null);

  // Market change → reset everything
  useEffect(() => {
    setMakeId(null); setModelId(null); setYear(null); setVersionId(null);
    setModels([]); setYears([]); setVersions([]);
    onVersionSelected(null);
    getMakes(market).then(setMakes);
  }, [market]); // eslint-disable-line

  // Cascade: make → models
  useEffect(() => {
    if (!makeId) { setModels([]); setModelId(null); return; }
    setModelId(null); setYear(null); setVersionId(null);
    setYears([]); setVersions([]);
    onVersionSelected(null);
    getModels(makeId).then(setModels);
  }, [makeId]); // eslint-disable-line

  // Cascade: model → years
  useEffect(() => {
    if (!modelId) { setYears([]); setYear(null); return; }
    setYear(null); setVersionId(null); setVersions([]);
    onVersionSelected(null);
    getYears(modelId).then(setYears);
  }, [modelId]); // eslint-disable-line

  // Cascade: model+year → versions
  useEffect(() => {
    if (!modelId || !year) { setVersions([]); setVersionId(null); return; }
    setVersionId(null);
    onVersionSelected(null);
    getVersions(modelId, year).then(setVersions);
  }, [modelId, year]); // eslint-disable-line

  // Preselect: notify parent + reset on clear
  useEffect(() => {
    if (preselect) {
      onVersionSelected(preselect.id);
    } else if (preselect === null) {
      setMakeId(null); setModelId(null); setYear(null); setVersionId(null);
      setModels([]); setYears([]); setVersions([]);
      onVersionSelected(null);
    }
  }, [preselect?.id]); // eslint-disable-line

  // Fetch 4W score whenever a version is fully selected
  useEffect(() => {
    const id = preselect?.id ?? versionId;
    if (!id) { setScore(null); return; }
    getVersionScore(id).then(setScore).catch(() => setScore(null));
  }, [preselect?.id, versionId]); // eslint-disable-line

  // Fetch car image when preselect changes
  useEffect(() => {
    if (!preselect) { setImage(null); return; }
    getCarImage(preselect.make, preselect.model, preselect.year)
      .then(setImage)
      .catch(() => setImage(null));
  }, [preselect?.id]); // eslint-disable-line

  const handleVersion = (id: number) => {
    setVersionId(id);
    onVersionSelected(id);
  };

  const isComplete = !!preselect || !!versionId;

  const formatPreselectPrice = (p: PreselectInfo) => {
    if (p.price_br) return `R$ ${Math.round(p.price_br).toLocaleString('pt-BR')}`;
    if (p.price_us) return `US$ ${Math.round(p.price_us).toLocaleString('en-US')}`;
    return '';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 ${c.border} overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
        <span className={`text-xs font-bold uppercase tracking-widest ${c.label} flex items-center gap-1.5`}>
          {isComplete && <span className={`w-2 h-2 rounded-full ${c.dot}`} />}
          {t('carLabel')} {SLOT_LETTERS[index]}
        </span>
        {canRemove && (
          <button onClick={onRemove} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            {t('remove')}
          </button>
        )}
      </div>

      {/* Body: preselect card OR cascade dropdowns */}
      {preselect ? (
        <div className="p-4 flex flex-col gap-3 flex-1">
          {image && (
            <img
              src={image}
              alt={`${preselect.make} ${preselect.model}`}
              className="w-full h-20 object-contain rounded-lg"
            />
          )}
          <div className="flex items-start gap-2.5">
            <span className="text-xl shrink-0 mt-0.5">{catIcon(preselect.category)}</span>
            <div className="flex-1 min-w-0">
              <div className={`text-[10px] font-black uppercase tracking-widest ${c.label} mb-0.5`}>
                {preselect.make}
              </div>
              <div className="text-sm font-bold text-gray-900 leading-tight">
                {preselect.model}
              </div>
              <div className="text-[11px] text-gray-400 truncate mt-0.5">
                {preselect.version}
              </div>
            </div>
          </div>

          {score && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">4W Score</span>
              <span className="text-sm font-black" style={{ color: '#D85A30' }}>
                {score.score4w}<span className="text-[10px] font-normal text-gray-400"> /10</span>
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {preselect.year}
              </span>
              <span className="text-xs font-black" style={{ color: '#D85A30' }}>
                {formatPreselectPrice(preselect)}
              </span>
            </div>
            <button
              onClick={onClearPreselect}
              className="text-xs text-gray-400 hover:text-[#D85A30] transition-colors font-medium">
              ↺ {t('change')}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-2.5">
          <select value={makeId ?? ''} onChange={e => setMakeId(e.target.value ? Number(e.target.value) : null)} className={selectCls}>
            <option value="">{t('make')}</option>
            {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <select value={modelId ?? ''} onChange={e => setModelId(e.target.value ? Number(e.target.value) : null)} disabled={!makeId} className={selectCls}>
            <option value="">{t('model')}</option>
            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <select value={year ?? ''} onChange={e => setYear(e.target.value ? Number(e.target.value) : null)} disabled={!modelId} className={selectCls}>
            <option value="">{t('year')}</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select value={versionId ?? ''} onChange={e => handleVersion(Number(e.target.value))} disabled={!year || versions.length === 0} className={selectCls}>
            <option value="">{t('version')}</option>
            {versions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      )}

      {/* Status bar */}
      <div className={`mx-4 mb-4 rounded-lg px-3 py-2 text-xs font-medium text-center transition-all ${
        isComplete ? c.badge : 'bg-gray-50 text-gray-400'
      }`}>
        {isComplete
          ? score
            ? <>⭐ 4W: <span className="font-black">{score.score4w}</span>/10</>
            : `✓ ${t('carSelected')}`
          : t('selectFlow')}
      </div>
    </div>
  );
}
