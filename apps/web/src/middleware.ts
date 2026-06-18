import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const exactPublicPaths = ['/']
const prefixPublicPaths = ['/login', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic =
    exactPublicPaths.includes(pathname) ||
    prefixPublicPaths.some((p) => pathname.startsWith(p))
  const token = request.cookies.get('accessToken')?.value

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isPublic && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
