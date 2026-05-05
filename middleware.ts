import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware untuk:
 * 1. Me-refresh session Supabase secara otomatis
 * 2. Melindungi route yang membutuhkan autentikasi
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Jangan tulis kode antara createServerClient dan auth.getUser()
  // Jika tidak, bug yang sangat sulit di-debug bisa terjadi
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Daftar route yang membutuhkan autentikasi
  const protectedRoutes = ['/dashboard', '/admin', '/profile', '/community/dashboard', '/user/dashboard']
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirect ke login jika belum login dan mengakses route yang dilindungi
  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Jika user login, jalankan logic RBAC (Role-Based Access Control)
  if (user) {
    const role = user.user_metadata?.role || 'user'
    const pathname = request.nextUrl.pathname

    // 1. Redirect /dashboard ke dashboard masing-masing role
    if (pathname === '/dashboard') {
      const redirectUrl = request.nextUrl.clone()
      if (role === 'admin') {
        redirectUrl.pathname = '/admin/dashboard'
      } else if (role === 'community') {
        redirectUrl.pathname = '/community/dashboard'
      } else {
        redirectUrl.pathname = '/user/dashboard'
      }
      return NextResponse.redirect(redirectUrl)
    }

    // 2. Proteksi rute berdasarkan Role
    let isAuthorized = true

    if (pathname.startsWith('/admin') && role !== 'admin') {
      isAuthorized = false
    } else if (pathname.startsWith('/community/dashboard') && role !== 'community') {
      isAuthorized = false
    } else if (pathname.startsWith('/user/dashboard') && role !== 'user') {
      isAuthorized = false
    }

    if (!isAuthorized) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/unauthorized'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect ke dashboard jika sudah login dan mengakses halaman auth
  const authRoutes = ['/login', '/register', '/forgot-password']
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
