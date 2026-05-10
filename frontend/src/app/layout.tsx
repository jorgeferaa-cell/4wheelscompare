import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '4wheelscompare – Comparador de Carros',
  description: 'Compare até 4 carros com simulação de performance real',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.className} bg-page text-gray-900 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
