import { Suspense } from 'react';
import CarDetailContent from './CarDetailContent';

type Props = {
  params:       { locale: string; make: string; model: string };
  searchParams: { year?: string };
};

export default function CarDetailPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D85A30] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CarDetailContent
        locale={params.locale}
        make={params.make}
        model={params.model}
        year={searchParams.year}
      />
    </Suspense>
  );
}
