'use client';

const BRAND_DIM   = 'rgba(216,90,48,0.3)';
const BRAND_FAINT = 'rgba(216,90,48,0.07)';
const CONTACT     = 'mailto:contato@4wheelscompare.com';

function CarIcon() {
  return (
    <svg width="34" height="22" viewBox="0 0 34 22" fill="none">
      <path
        d="M3 13.5 L7 6 L11.5 3.5 H22.5 L27 6 L31 13.5 V18 H3 V13.5Z"
        fill={BRAND_FAINT} stroke={BRAND_DIM} strokeWidth="1.3" strokeLinejoin="round"
      />
      <path
        d="M11.5 3.5 L13.5 1 H20.5 L22.5 3.5"
        fill={BRAND_FAINT} stroke={BRAND_DIM} strokeWidth="1.3" strokeLinejoin="round"
      />
      <circle cx="9.5"  cy="18" r="3" fill="none" stroke={BRAND_DIM} strokeWidth="1.3"/>
      <circle cx="24.5" cy="18" r="3" fill="none" stroke={BRAND_DIM} strokeWidth="1.3"/>
    </svg>
  );
}

function PubLabel({ right = false }: { right?: boolean }) {
  return (
    <span
      className={`absolute top-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-300 select-none ${right ? 'right-3' : 'left-3'}`}
    >
      Publicidade
    </span>
  );
}

export interface AdSlotProps {
  size: 'sidebar' | 'leaderboard' | 'card';
  label?: string;
  imageUrl?: string;
}

export default function AdSlot({ size, label, imageUrl }: AdSlotProps) {
  const border = `1.5px dashed ${BRAND_DIM}`;

  /* ── Image override ──────────────────────────────────────────── */
  if (imageUrl) {
    const cls =
      size === 'sidebar'     ? 'w-[300px] h-[250px] shrink-0' :
      size === 'leaderboard' ? 'w-full max-w-[728px] h-[90px]' :
                               'w-full h-[120px]';
    return (
      <a href={CONTACT} className={`block rounded-xl overflow-hidden transition-shadow hover:shadow-md ${cls}`}>
        <img src={imageUrl} alt={label ?? 'Publicidade'} className="w-full h-full object-cover" />
      </a>
    );
  }

  /* ── Sidebar: 300 × 250 ──────────────────────────────────────── */
  if (size === 'sidebar') {
    return (
      <div
        className="relative rounded-xl overflow-hidden transition-shadow hover:shadow-md shrink-0"
        style={{ border, backgroundColor: '#F9F9F8', width: 300, height: 250 }}
      >
        <PubLabel right />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <CarIcon />
          <p className="text-sm font-semibold text-gray-300">Anuncie aqui</p>
          <a href={CONTACT} className="text-xs font-medium transition-opacity hover:opacity-70" style={{ color: BRAND_DIM }}>
            Fale conosco →
          </a>
        </div>
        {label && (
          <span className="absolute bottom-2.5 left-3 text-[9px] font-bold uppercase tracking-widest select-none" style={{ color: BRAND_DIM }}>
            {label}
          </span>
        )}
      </div>
    );
  }

  /* ── Leaderboard: 728 × 90 ───────────────────────────────────── */
  if (size === 'leaderboard') {
    return (
      <div
        className="relative w-full max-w-[728px] h-[90px] rounded-xl overflow-hidden transition-shadow hover:shadow-md"
        style={{ border, backgroundColor: '#F9F9F8' }}
      >
        <PubLabel right />
        <div className="absolute inset-0 flex items-center justify-center gap-5">
          <CarIcon />
          <p className="text-sm font-semibold text-gray-300">Anuncie aqui</p>
          <span className="text-gray-200 font-light text-xl leading-none select-none">·</span>
          <a href={CONTACT} className="text-xs font-medium transition-opacity hover:opacity-70" style={{ color: BRAND_DIM }}>
            Fale conosco →
          </a>
        </div>
        {label && (
          <span className="absolute bottom-2 left-3 text-[9px] font-bold uppercase tracking-widest select-none" style={{ color: BRAND_DIM }}>
            {label}
          </span>
        )}
      </div>
    );
  }

  /* ── Card: full-width × 120px ─────────────────────────────────── */
  return (
    <div
      className="relative w-full h-[120px] rounded-xl overflow-hidden transition-shadow hover:shadow-sm"
      style={{ border, backgroundColor: '#FFF8F6' }}
    >
      {label && (
        <span className="absolute top-2.5 left-3 text-[9px] font-bold uppercase tracking-widest select-none" style={{ color: BRAND_DIM }}>
          {label}
        </span>
      )}
      <PubLabel right />
      <div className="absolute inset-0 flex items-center justify-center gap-4">
        <CarIcon />
        <div>
          <p className="text-sm font-semibold text-gray-300">Anuncie aqui</p>
          <a href={CONTACT} className="text-xs font-medium mt-0.5 block transition-opacity hover:opacity-70" style={{ color: BRAND_DIM }}>
            Fale conosco →
          </a>
        </div>
      </div>
    </div>
  );
}
