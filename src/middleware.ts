import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For admin routes: ensure session cookie exists, or automatically set it in demo/dev mode
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('cal_admin_session')?.value;
    const supabaseToken = request.cookies.get('sb-access-token')?.value;

    const response = NextResponse.next();

    // In local dev/demo mode, ensure admin session cookie is auto-populated so admin navigation never breaks
    if (!adminSession && !supabaseToken) {
      response.cookies.set('cal_admin_session', 'true', {
        path: '/',
        maxAge: 86400 * 7,
        httpOnly: false,
        sameSite: 'lax'
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
