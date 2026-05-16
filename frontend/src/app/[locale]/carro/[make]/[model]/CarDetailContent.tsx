'use client';

import { useState, useEffect } from 'react';
import { getCarGallery, getFipe, CarImageGallery, FipeData } from '@/lib/api';

export default function CarDetailContent({
  locale,
  make,
  model,
  year: yearStr,
}: {
  locale: string;
  make: string;
  model: string;
  year?: string;
}) {
  const decodedMake  = decodeURIComponent(make);
  const decodedModel = decodeURIComponent(model);
  const year         = parseInt(yearStr || '2023');

  const [gallery, setGallery] = useState<CarImageGallery | null>(null);
  const [fipe,    setFipe]    = useState<FipeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCarGallery(decodedMake, decodedModel, year),
      getFipe(decodedMake, decodedModel, year),
    ]).then(([galleryData, fipeData]) => {
      setGallery(galleryData);
      setFipe(fipeData);
      setLoading(false);
    });
  }, [decodedMake, decodedModel, year]);

  const views = [
    { key: 'front'    as const, label: locale === 'pt' ? 'Frontal'  : 'Front'    },
    { key: 'side'     as const, label: locale === 'pt' ? 'Lateral'  : 'Side'     },
    { key: 'rear'     as const, label: locale === 'pt' ? 'Traseira' : 'Rear'     },
    { key: 'interior' as const, label: locale === 'pt' ? 'Interior' : 'Interior' },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        {decodedMake} {decodedModel} {year}
      </h1>

      {loading ? (
        <div className="w-8 h-8 border-2 border-[#D85A30] border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="space-y-4 max-w-2xl">
          {/* Photo grid */}
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
            {views.map(({ key, label }) => (
              <div key={key} className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                {gallery?.[key] ? (
                  <img
                    src={gallery[key]!}
                    alt={`${decodedMake} ${decodedModel} ${label}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    {label}
                  </div>
                )}
                <span className="absolute bottom-1 left-2 text-xs text-white bg-black/50 px-1 rounded">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* FIPE card */}
          {fipe?.found && (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                {locale === 'pt' ? 'Tabela FIPE' : 'FIPE Price'}
              </p>
              <p className="text-3xl font-black text-white mb-1">{fipe.price}</p>
              <p className="text-xs text-gray-500">
                {locale === 'pt' ? 'Código FIPE' : 'FIPE Code'}: {fipe.fipeCode} &bull; {fipe.reference}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {locale === 'pt' ? 'Preço médio de mercado' : 'Average market price'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
