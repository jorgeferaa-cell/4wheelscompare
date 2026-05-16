'use client';

import { useState, useEffect } from 'react';
import { getCarGallery, CarImageGallery } from '@/lib/api';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCarGallery(decodedMake, decodedModel, year).then(data => {
      setGallery(data);
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
        <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden max-w-2xl">
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
      )}
    </div>
  );
}
