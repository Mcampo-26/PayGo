// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('user_session')
  const { pathname } = request.nextUrl;

  // 1. SI ES UNA RUTA DE API, NO HACER NADA (Dejar pasar siempre)
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. Protecciones normales para el Dashboard (/)
  if (!session && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// 3. Ajustar el matcher para que incluya todo menos archivos estáticos
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}