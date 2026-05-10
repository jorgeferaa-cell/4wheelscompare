import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

export default function Logo({ size = 'md', variant = 'full' }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 };
  const s = sizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s * 0.3 }}>
      {/* Square icon */}
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#D85A30"/>
        {/* Car body fill */}
        <path
          d="M5,28 L6,21 Q8,15 13,13 L19,12 L22,11 L25,12 L27,14 L28,18 L29,22 L30,28 Z"
          fill="white" opacity="0.25"/>
        {/* Car body outline */}
        <path
          d="M5,28 L6,21 Q8,15 13,13 L19,12 L22,11 L25,12 L27,14 L28,18 L29,22 L30,28"
          fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        {/* Rear wheel */}
        <circle cx="11" cy="28" r="5" fill="none" stroke="white" strokeWidth="2"/>
        <circle cx="11" cy="28" r="2" fill="white"/>
        {/* Front wheel */}
        <circle cx="26" cy="28" r="5" fill="none" stroke="white" strokeWidth="2"/>
        <circle cx="26" cy="28" r="2" fill="white"/>
      </svg>

      {/* Text lockup */}
      {variant === 'full' && (
        <div style={{ lineHeight: 1.1 }}>
          <div style={{
            fontSize: s * 0.42,
            fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.3px',
          }}>
            4wheels
          </div>
          <div style={{
            fontSize: s * 0.28,
            fontWeight: 400,
            color: '#D85A30',
            letterSpacing: '1.5px',
            textTransform: 'uppercase' as const,
          }}>
            compare
          </div>
        </div>
      )}
    </div>
  );
}
