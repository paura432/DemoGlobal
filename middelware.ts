import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si la ruta es raíz '/', redirige a /es (idioma por defecto)
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/es';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/((?!api|_next|favicon.ico).*)'], // Aplica a todas las rutas excepto api, _next y favicon
};
