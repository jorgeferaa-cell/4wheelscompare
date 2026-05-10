import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['pt', 'en'];
const DEFAULT_LOCALE = 'pt';

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Already has a locale prefix — let it through
  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return NextResponse.next();

  // Redirect / and anything else to the default locale
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|_vercel|api|favicon\\.ico|.*\\..*).*)',
  ],
};
