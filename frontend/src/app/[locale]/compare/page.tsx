import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCompare } from '@/lib/api';
import CompareContent from './CompareContent';

type Props = { params: { locale: string }; searchParams: { ids?: string } };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const ids = (searchParams.ids || '').split(',').map(Number).filter(Boolean);
  if (!ids.length) return { title: 'Car Comparison | 4wheelscompare' };
  try {
    const cars = await getCompare(ids);
    const names = cars.map(c => `${c.model.make.name} ${c.model.name}`);
    const title = `${names.join(' vs ')} | 4wheelscompare`;
    const first = cars[0];
    const description = first
      ? `Compare ${names.join(' vs ')}: ${first.horsepower}hp, 0–100 in ${first.acc_0_100}s, top speed ${first.top_speed_kmh}km/h. Race simulation & equipment comparison.`
      : `Compare ${names.join(' vs ')} on 4wheelscompare.`;
    return {
      title,
      description,
      openGraph: { title, description, type: 'website' },
      twitter: { card: 'summary', title, description },
    };
  } catch {
    return { title: 'Car Comparison | 4wheelscompare' };
  }
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D85A30] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
