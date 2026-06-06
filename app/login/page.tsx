"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { login } from "@/lib/actions/auth.actions"
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { Suspense } from "react"

function LoginContent() {
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get("redirectedFrom") || ""

  const [email, setEmail]               = useState("")
  const [password, setPassword]         = useState("")
  const [isLoading, setIsLoading]       = useState(false)
  const [error, setError]               = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted]           = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)
    if (redirectedFrom) formData.append("redirectedFrom", redirectedFrom)

    const result = await login(formData)

    if (result?.error) {
      setError(result.error === "Invalid login credentials"
        ? "Email atau password salah. Silakan coba lagi."
        : result.error)
      setIsLoading(false)
    } else if (result?.success && result?.redirectTo) {
      window.location.href = result.redirectTo
    }
  }

  return (
    <div className="sl-login">
      {/* ── Left Panel ── */}
      <div className="sl-login-left">
        <div
          className="sl-login-left-bg"
          style={{ backgroundImage: "url('/images/mission-ocean.jpg')" }}
        />
        <div className="sl-login-left-overlay" />

        <svg
          style={{ position: "absolute", right: -1, top: 0, height: "100%", width: 80, zIndex: 20 }}
          viewBox="0 0 80 900"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M80,0 C60,150 20,200 40,300 C60,400 80,440 60,550 C40,660 10,720 40,800 C60,850 80,880 80,900 L80,0Z" fill="#f0f7ff" />
        </svg>

        <div className="sl-login-left-content">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: "9999px",
            padding: "0.4rem 1rem", fontSize: "0.75rem", fontWeight: 500,
            color: "rgba(255,255,255,0.9)", marginBottom: "1.5rem", letterSpacing: "0.05em"
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#67e8f9", display: "inline-block" }} />
            Platform Aktif Konservasi Laut
          </div>

          <h1 className="sl-login-left-title">
            Bersama Jaga<br />
            <span className="sl-cyan-text">Laut Indonesia</span>
          </h1>

          <p className="sl-login-left-desc">
            Bergabunglah dengan ribuan relawan dan komunitas yang peduli terhadap kelestarian ekosistem laut Nusantara.
          </p>

          <div className="sl-login-left-stats">
            <div className="sl-login-left-stat">
              <div className="sl-login-left-stat-val">2.4K+</div>
              <div className="sl-login-left-stat-lbl">Relawan</div>
            </div>
            <div className="sl-login-left-stat">
              <div className="sl-login-left-stat-val">180+</div>
              <div className="sl-login-left-stat-lbl">Komunitas</div>
            </div>
            <div className="sl-login-left-stat">
              <div className="sl-login-left-stat-val">560+</div>
              <div className="sl-login-left-stat-lbl">Kegiatan</div>
            </div>
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
          background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 80'%3E%3Cpath fill='rgba(255,255,255,0.06)' d='M0,40L48,45C96,50,192,60,288,58C384,56,480,42,576,36C672,30,768,32,864,38C960,44,1056,54,1152,54C1248,54,1344,46,1392,42L1440,38L1440,80L0,80Z'/%3E%3C/svg%3E\") center/cover no-repeat"
        }} />
      </div>

      {/* ── Right Panel ── */}
      <div className="sl-login-right">
        <div
          className={`sl-login-right-inner${mounted ? " sl-mount-in" : ""}`}
          style={{ animationDelay: "0.1s" }}
        >
          {/* Logo */}
          <div className="sl-login-logo-wrap">
            <Image
              src="/images/SinergiLautLogo-transparent.png"
              alt="SinergiLaut Logo"
              width={44}
              height={44}
              style={{ filter: "drop-shadow(0 4px 8px rgba(6,149,138,0.3))" }}
            />
            <span className="sl-login-logo-text">SinergiLaut</span>
          </div>

          {/* Card */}
          <div className="sl-login-card">
            <h2 className="sl-login-title">Selamat Datang 👋</h2>
            <p className="sl-login-subtitle">
              Masuk ke akun Anda untuk melanjutkan <span>misi konservasi</span>
            </p>

            {error && (
              <div className="sl-error">
                <AlertCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="sl-field">
                <label className="sl-field-label" htmlFor="email">Alamat Email</label>
                <div className="sl-input-wrap">
                  <Mail className="sl-input-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="sl-input"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="sl-field">
                <div className="sl-field-row">
                  <label className="sl-field-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                  <Link href="/forgot-password" className="sl-forgot-link">Lupa password?</Link>
                </div>
                <div className="sl-input-wrap" style={{ marginTop: "0.5rem" }}>
                  <Lock className="sl-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="sl-input"
                    style={{ paddingRight: "2.75rem" }}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="sl-pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword
                      ? <EyeOff style={{ width: 16, height: 16 }} />
                      : <Eye style={{ width: 16, height: 16 }} />
                    }
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="sl-login-submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 style={{ width: 18, height: 18 }} className="sl-spin" />
                    Sedang masuk...
                  </>
                ) : "Masuk ke Akun"}
              </button>
            </form>

            <div className="sl-divider">
              <div className="sl-divider-line" />
              <span className="sl-divider-text">Belum punya akun?</span>
              <div className="sl-divider-line" />
            </div>

            <p className="sl-register-text">
              <Link href="/register" className="sl-register-link">
                Daftar sekarang — Gratis!
              </Link>
            </p>
          </div>

          <Link href="/" className="sl-back-home">
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f7ff" }}>
        <Image
          src="/images/SinergiLautLogo-transparent.png"
          alt="SinergiLaut Logo"
          width={48}
          height={48}
          style={{ filter: "drop-shadow(0 4px 8px rgba(6,149,138,0.3))" }}
        />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
