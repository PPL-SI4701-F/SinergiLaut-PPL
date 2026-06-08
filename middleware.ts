import { type NextRequest } from 'next/server'
import { proxy } from './proxy'

export default function middleware(request: NextRequest) {
  return proxy(request)
}

export const config = {
  matcher: [
    '/login/:path*',
    '/register/:path*',
    '/forgot-password/:path*',

    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',

    '/community/register/:path*',
    '/community/dashboard/:path*',
    '/user/:path*',
  ],
}
