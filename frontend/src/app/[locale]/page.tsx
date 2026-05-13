import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: '4wheelscompare — Compare up to 4 cars in real time',
  description:
    'Technical specs, real-physics race simulation and complete equipment comparison for up to 4 cars. Brazil and US markets.',
  openGraph: {
    title: '4wheelscompare — Compare up to 4 cars in real time',
    description:
      'Technical specs, real-physics race simulation and complete equipment comparison for up to 4 cars. Brazil and US markets.',
    images: [{ url: '/favicon.svg', width: 512, height: 512, alt: '4wheelscompare' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '4wheelscompare — Compare up to 4 cars in real time',
    description: 'Compare up to 4 cars with real physics simulation. BR and US markets.',
  },
};

export default function Page() {
  return <HomeClient />;
}
