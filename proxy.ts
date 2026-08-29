import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from '@/lib/i18n/config';

const SESSION_COOKIE = 'vivimoon_session';

/** Path segments that require a session, checked after the locale prefix. */
const GUARDED = ['account'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const locale = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!locale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  const rest = pathname.slice(`/${locale}`.length);
  const needsSession = GUARDED.some((seg) => rest === `/${seg}` || rest.startsWith(`/${seg}/`));

  // Presence check only. The signature is verified by the page via
  // readSessionUserId(); this is a redirect optimisation that spares signed-out
  // visitors a render, not the security boundary.
  if (needsSession && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/sign-in`;
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|images|favicon.ico|.*\\..*).*)'],
};
