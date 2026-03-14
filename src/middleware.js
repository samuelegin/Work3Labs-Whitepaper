import { NextResponse } from 'next/server'

export function middleware(request) {
  return NextResponse.next()

  const { pathname } = request.nextUrl
  const token = request.cookies.get('w3l_auth')?.value

  const isProtected  = ['/admin/dashboard'].some(p => pathname.startsWith(p))
  const isAuthRoute  = ['/admin/login', '/admin/setup'].some(p => pathname === p)

  if (isProtected && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && token) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}