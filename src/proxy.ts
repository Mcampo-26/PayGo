// src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Cambiamos "export function middleware" por "export default function"
export default function proxy(request: NextRequest) {
  const session = request.cookies.get('user_session')
  const { pathname } = request.nextUrl;

  // 1. SI ES UNA RUTA DE API, NO HACER NADA
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. Protecciones normales
  if (!session && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}