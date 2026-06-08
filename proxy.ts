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

/**
 * Memeriksa route secara aman.
 *
 * Contoh:
 * /admin          -> cocok dengan /admin
 * /admin/dashboard -> cocok dengan /admin
 * /administrator   -> tidak cocok dengan /admin
 */
function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`)
}

function matchesAnyRoute(
  pathname: string,
  routes: readonly string[]
): boolean {
  return routes.some((route) => matchesRoute(pathname, route))
}

/**
 * Mengubah unknown menjadi object yang aman dibaca.
 */
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

/**
 * Memastikan role hanya berisi nilai yang dikenal aplikasi.
 */
function parseRole(value: unknown): AppRole | null {
  if (
    value === 'admin' ||
    value === 'community' ||
    value === 'user'
  ) {
    return value
  }

  return null
}

/**
 * Menyalin seluruh cookie Supabase yang diperbarui ke response redirect.
 *
 * Ini penting agar access token atau refresh token yang diperbarui
 * tidak hilang ketika Proxy mengembalikan redirect.
 */
function copyResponseCookies(
  sourceResponse: NextResponse,
  targetResponse: NextResponse
): NextResponse {
  for (const cookie of sourceResponse.cookies.getAll()) {
    targetResponse.cookies.set(cookie)
  }

  return targetResponse
}

/**
 * Membuat redirect sambil mempertahankan cookie Supabase.
 */
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
 * Proxy autentikasi dan otorisasi SinergiLaut.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthRoute = matchesAnyRoute(pathname, AUTH_ROUTES)
  const isProtectedRoute = matchesAnyRoute(pathname, PROTECTED_ROUTES)

  /**
   * Perlindungan tambahan jika matcher nanti berubah.
   * Route yang tidak berhubungan dengan autentikasi langsung diteruskan.
   */
  if (!isAuthRoute && !isProtectedRoute) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  /**
   * Supabase sekarang menggunakan istilah Publishable Key.
   * ANON_KEY tetap didukung agar kompatibel dengan konfigurasi proyek lama.
   */
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

  /**
   * Response utama yang akan membawa cookie Supabase yang diperbarui.
   */
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
          /**
           * Perbarui cookie pada request agar Server Component berikutnya
           * langsung mendapatkan session terbaru.
           */
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }

          supabaseResponse = NextResponse.next({
            request,
          })

          /**
           * Perbarui cookie pada response agar browser menyimpan
           * access token dan refresh token terbaru.
           */
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  /**
   * E2E bypass hanya aktif ketika development.
   *
   * Nilai cookie yang diperbolehkan:
   * - admin
   * - community
   * - user
   */
  const e2eRole =
    process.env.NODE_ENV === 'development'
      ? parseRole(request.cookies.get('e2e-bypass-auth')?.value)
      : null

  let userId: string | null = e2eRole ? 'mock-user-id' : null

  /**
   * getClaims() memverifikasi JWT.
   * Tidak menggunakan getSession() sebagai sumber otorisasi.
   */
  if (!e2eRole) {
    try {
      const { data, error } = await supabase.auth.getClaims()

      if (!error) {
        const claims = asRecord(data?.claims)

        userId =
          typeof claims?.sub === 'string'
            ? claims.sub
            : null

      } else if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[Proxy] Session tidak valid atau sudah kedaluwarsa.'
        )
      }
    } catch {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[Proxy] Gagal memverifikasi session Supabase.'
        )
      }

      userId = null
    }
  }

  const isAuthenticated = Boolean(userId)

  /**
   * Mengambil role pengguna.
   *
   * Prioritas:
   * 1. E2E development role
   * 2. profiles.role
   */
  const resolveRole = async (): Promise<AppRole | null> => {
    if (e2eRole) {
      return e2eRole
    }

    if (!userId) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (
      profileError &&
      process.env.NODE_ENV === 'development'
    ) {
      console.warn(
        `[Proxy] Gagal membaca role profile: ${profileError.code}`
      )
    }

    return parseRole(profile?.role)
  }

  /**
   * Pengguna sudah login tetapi membuka login/register.
   * Langsung arahkan ke dashboard sesuai role.
   */
  if (isAuthRoute && isAuthenticated) {
    const role = await resolveRole()

    if (!role) {
      return redirectWithCookies(
        request,
        supabaseResponse,
        '/unauthorized'
      )
    }

    return redirectWithCookies(
      request,
      supabaseResponse,
      ROLE_DASHBOARDS[role]
    )
  }

  /**
   * Pengguna belum login tetapi membuka route terlindungi.
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

    return copyResponseCookies(
      supabaseResponse,
      redirectResponse
    )
  }

  /**
   * Di bawah bagian ini pengguna sudah terautentikasi.
   *
   * /profile tidak memerlukan pemeriksaan role sehingga langsung lanjut.
   * Hal ini menghindari query tabel profiles yang tidak diperlukan.
   */
  if (matchesRoute(pathname, '/profile')) {
    return supabaseResponse
  }

  /**
   * Pemeriksaan role hanya dilakukan untuk route yang memerlukannya.
   */
  const needsRoleCheck =
    pathname === '/dashboard' ||
    matchesRoute(pathname, '/admin') ||
    matchesRoute(pathname, '/community/dashboard') ||
    matchesRoute(pathname, '/user')

  if (!needsRoleCheck) {
    return supabaseResponse
  }

  const role = await resolveRole()

  if (!role) {
    return redirectWithCookies(
      request,
      supabaseResponse,
      '/unauthorized'
    )
  }

  /**
   * Dashboard umum diarahkan ke dashboard spesifik berdasarkan role.
   */
  if (pathname === '/dashboard') {
    return redirectWithCookies(
      request,
      supabaseResponse,
      ROLE_DASHBOARDS[role]
    )
  }

  /**
   * Proteksi dashboard admin.
   */
  if (
    matchesRoute(pathname, '/admin') &&
    role !== 'admin'
  ) {
    return redirectWithCookies(
      request,
      supabaseResponse,
      '/unauthorized'
    )
  }

  /**
   * Proteksi dashboard komunitas.
   */
  if (
    matchesRoute(pathname, '/community/dashboard') &&
    role !== 'community'
  ) {
    return redirectWithCookies(
      request,
      supabaseResponse,
      '/unauthorized'
    )
  }

  /**
   * Proteksi dashboard pengguna biasa.
   */
  if (
    matchesRoute(pathname, '/user') &&
    role !== 'user'
  ) {
    return redirectWithCookies(
      request,
      supabaseResponse,
      '/unauthorized'
    )
  }

  return supabaseResponse
}

/**
 * Proxy hanya dijalankan pada route autentikasi dan route terlindungi.
 *
 * Halaman publik seperti:
 * - /
 * - /about
 * - /activities
 * - /community
 * - /contact
 *
 * tidak menjalankan Proxy dan tidak memanggil Supabase Auth.
 */
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
