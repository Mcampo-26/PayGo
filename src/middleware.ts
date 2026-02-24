// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Buscamos si existe la "sesión" (un cookie llamado 'user_session')
  const session = request.cookies.get('user_session')

  // 2. Si el usuario intenta entrar al Dashboard y NO tiene sesión...
  if (!session && request.nextUrl.pathname === '/') {
    // ...lo mandamos al Login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Si ya tiene sesión e intenta ir al Login, lo mandamos al Dashboard
  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configuramos en qué rutas actúa el middleware
export const config = {
  matcher: ['/', '/login'],
}