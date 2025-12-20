import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_PATH = /^\/admin(\/|$)/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (ADMIN_PATH.test(pathname)) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !['ADMIN', 'EDITOR'].includes(token.role)) {
      const loginUrl = new URL('/auth/signin', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};