import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type AppRole = 'admin' | 'community' | 'user'
type JwtClaims = Record<string, unknown>

/**
 * Route autentikasi:
 * Pengguna yang sudah login akan diarahkan ke dashboard sesuai role.
 */
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/community/register',
] as const

/**
 * Route yang membutuhkan pengguna terautentikasi.
 */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/profile',
  '/community/dashboard',
  '/user',
] as const

/**
 * Dashboard tujuan berdasarkan role pengguna.
 */
const ROLE_DASHBOARDS: Record<AppRole, string> = {
  admin: '/admin/dashboard',
  community: '/community/dashboard',
  user: '/user/dashboard',
}

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`)
}

function matchesAnyRoute(
  pathname: string,
  routes: readonly string[]
): boolean {
  return routes.some((route) => matchesRoute(pathname, route))
}

function asRecord(value: unknown): JwtClaims | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return null
  }

  return value as JwtClaims
}

function parseRole(value: unknown): string | null {
  if (typeof value === "string" && (
    value === "admin" ||
    value === "community" ||
    value.startsWith("user")
  )) {
    return value;
  }

  return null
}

function copyResponseCookies(
  sourceResponse: NextResponse,
  targetResponse: NextResponse
): NextResponse {
  for (const cookie of sourceResponse.cookies.getAll()) {
    targetResponse.cookies.set(cookie)
  }

  return targetResponse
}

function redirectWithCookies(
  request: NextRequest,
  sourceResponse: NextResponse,
  destination: string
): NextResponse {
  const redirectUrl = request.nextUrl.clone()

  redirectUrl.pathname = destination
  redirectUrl.search = ''

  const redirectResponse = NextResponse.redirect(redirectUrl)

  return copyResponseCookies(sourceResponse, redirectResponse)
}

/**
 * Proxy autentikasi SinergiLaut.
 *
 * Tanggung jawab proxy:
 * 1. Refresh session cookie Supabase.
 * 2. Redirect unauthenticated user yang mengakses protected route ke /login.
 * 3. Redirect authenticated user yang membuka halaman login/register ke dashboard.
 *
 * Role-based access control (admin/community/user) diserahkan ke masing-masing
 * layout (/app/admin/layout.tsx, /app/community/dashboard/layout.tsx, /app/user/layout.tsx)
 * agar lebih reliable dan tidak bergantung pada ketersediaan database di edge.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthRoute = matchesAnyRoute(pathname, AUTH_ROUTES)
  const isProtectedRoute = matchesAnyRoute(pathname, PROTECTED_ROUTES)

  if (!isAuthRoute && !isProtectedRoute) {
    return NextResponse.next()
  }

  // Allow Next.js Server Actions to execute on their current path without redirect
  if (request.headers.has('next-action')) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      '[Proxy] NEXT_PUBLIC_SUPABASE_URL atau Supabase key belum tersedia.'
    )

    return new NextResponse('Internal Server Error', {
      status: 500,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },

        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }

          supabaseResponse = NextResponse.next({
            request,
          })

          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  /**
   * E2E bypass hanya aktif ketika development.
   */
  const e2eRole =
    process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_E2E_TESTING === 'true'
      ? parseRole(request.cookies.get('e2e-bypass-auth')?.value)
      : null

  let isAuthenticated = Boolean(e2eRole)

  if (!e2eRole) {
    try {
      const { data, error } = await supabase.auth.getClaims()

      if (!error) {
        const claims = asRecord(data?.claims)
        const userId = typeof claims?.sub === 'string' ? claims.sub : null
        isAuthenticated = Boolean(userId)
      }
    } catch {
      isAuthenticated = false
    }
  }

  /**
   * Pengguna belum login tetapi membuka route terlindungi → redirect ke /login.
   */
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone()

    loginUrl.pathname = '/login'
    loginUrl.search = ''
    loginUrl.searchParams.set(
      'redirectedFrom',
      `${pathname}${request.nextUrl.search}`
    )

    const redirectResponse = NextResponse.redirect(loginUrl)

    return copyResponseCookies(supabaseResponse, redirectResponse)
  }

  /**
   * Pengguna sudah login tetapi membuka login/register.
   * Coba arahkan ke dashboard sesuai role. Jika role tidak bisa dibaca
   * (misalnya database sedang tidak tersedia), arahkan ke /user/dashboard
   * sebagai fallback aman — layout akan menangani redirect role yang benar.
   */
  if (isAuthRoute && isAuthenticated) {
    if (e2eRole) {
      return redirectWithCookies(
        request,
        supabaseResponse,
        ROLE_DASHBOARDS[e2eRole as AppRole]
      )
    }

    try {
      const { data, error } = await supabase.auth.getClaims()
      if (!error) {
        const claims = asRecord(data?.claims)
        const userId = typeof claims?.sub === 'string' ? claims.sub : null

        if (userId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle()

          const role = parseRole(profile?.role)

          if (role) {
            return redirectWithCookies(
              request,
              supabaseResponse,
              ROLE_DASHBOARDS[role as AppRole]
            )
          }
        }
      }
    } catch {
      // ignored — gunakan fallback
    }

    // Fallback: layout akan menangani redirect yang benar
    return redirectWithCookies(request, supabaseResponse, '/user/dashboard')
  }

  /**
   * Pengguna sudah terautentikasi mengakses protected route.
   * Langsung lanjutkan — role-based access control ditangani oleh layout.
   */
  return supabaseResponse
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
