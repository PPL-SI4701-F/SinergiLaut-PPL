"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/lib/actions/auth.actions"
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft, Fish, Waves, Shell } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { Suspense } from "react"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get("redirectedFrom") || ""

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)

    const result = await login(formData)

    if (result?.error) {
      setError(result.error === "Invalid login credentials"
        ? "Email atau password salah. Silakan coba lagi."
        : result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page min-h-screen flex overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .login-page * {
          font-family: 'Inter', sans-serif;
        }

        /* ── Left Panel ── */
        .login-left {
          position: relative;
          flex: 1;
          display: none;
          overflow: hidden;
        }
        @media (min-width: 1024px) {
          .login-left { display: flex; flex-direction: column; justify-content: flex-end; }
        }

        .login-left-bg {
          position: absolute;
          inset: 0;
          background-image: url('/images/mission-ocean.jpg');
          background-size: cover;
          background-position: center;
          transform: scale(1.05);
          transition: transform 8s ease-in-out;
        }
        .login-left-bg:hover { transform: scale(1); }

        .login-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(3, 38, 64, 0.85) 0%,
            rgba(2, 92, 115, 0.7) 50%,
            rgba(6, 149, 138, 0.5) 100%
          );
        }

        .login-left-content {
          position: relative;
          z-index: 10;
          padding: 3rem;
          color: white;
        }

        .login-stat-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 9999px;
          padding: 0.4rem 1rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255,255,255,0.9);
          margin-bottom: 1.5rem;
          letter-spacing: 0.05em;
        }

        .login-left-title {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
          color: white;
        }
        .login-left-title span {
          background: linear-gradient(90deg, #67e8f9, #a5f3fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-left-desc {
          font-size: 1rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.6;
          max-width: 380px;
          margin-bottom: 2rem;
        }

        .login-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          border-top: 1px solid rgba(255,255,255,0.15);
          padding-top: 1.5rem;
        }

        .login-stat-item {
          text-align: center;
        }
        .login-stat-value {
          font-size: 1.6rem;
          font-weight: 800;
          color: white;
          line-height: 1;
          margin-bottom: 0.25rem;
        }
        .login-stat-label {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* Floating Icons */
        .float-icon {
          position: absolute;
          opacity: 0.08;
          animation: floatAnim 6s ease-in-out infinite;
        }
        .float-icon:nth-child(1) { top: 15%; left: 10%; animation-delay: 0s; }
        .float-icon:nth-child(2) { top: 35%; right: 12%; animation-delay: 2s; }
        .float-icon:nth-child(3) { top: 60%; left: 20%; animation-delay: 4s; }
        @keyframes floatAnim {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }

        /* ── Wave divider ── */
        .wave-divider {
          position: absolute;
          right: -1px;
          top: 0;
          height: 100%;
          width: 80px;
          z-index: 20;
        }

        /* ── Right Panel ── */
        .login-right {
          width: 100%;
          background: #f0f7ff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          position: relative;
        }
        @media (min-width: 1024px) {
          .login-right { width: 480px; flex-shrink: 0; }
        }

        /* Subtle dot pattern */
        .login-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(6,149,138,0.07) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .login-right-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 380px;
        }

        /* Logo area */
        .login-logo-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          justify-content: center;
        }
        .login-logo-img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(6,149,138,0.3));
        }
        .login-logo-text {
          font-size: 1.6rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }

        /* Card */
        .login-card {
          background: white;
          border-radius: 1.5rem;
          box-shadow:
            0 0 0 1px rgba(6,149,138,0.08),
            0 4px 6px -1px rgba(0,0,0,0.05),
            0 20px 40px -8px rgba(6,149,138,0.12);
          padding: 2.5rem;
          margin-bottom: 1.5rem;
          transition: box-shadow 0.3s ease;
        }
        .login-card:hover {
          box-shadow:
            0 0 0 1px rgba(6,149,138,0.12),
            0 4px 6px -1px rgba(0,0,0,0.05),
            0 25px 50px -10px rgba(6,149,138,0.18);
        }

        .login-card-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0e2a3a;
          margin-bottom: 0.35rem;
          letter-spacing: -0.02em;
        }
        .login-card-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 1.75rem;
          line-height: 1.5;
        }
        .login-card-subtitle span {
          color: #06958a;
          font-weight: 500;
        }

        /* Form */
        .login-field {
          margin-bottom: 1.25rem;
        }
        .login-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          letter-spacing: 0.01em;
        }
        .login-input-wrap {
          position: relative;
        }
        .login-input-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          width: 16px;
          height: 16px;
          pointer-events: none;
          transition: color 0.2s;
        }
        .login-input {
          width: 100%;
          padding: 0.75rem 0.875rem 0.75rem 2.75rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 0.9375rem;
          color: #0e2a3a;
          background: #f8fafc;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: #cbd5e1; }
        .login-input:focus {
          border-color: #06958a;
          background: white;
          box-shadow: 0 0 0 3px rgba(6,149,138,0.1);
        }
        .login-input:focus + .login-input-icon,
        .login-input-wrap:focus-within .login-input-icon { color: #06958a; }

        .login-pw-toggle {
          position: absolute;
          right: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .login-pw-toggle:hover { color: #06958a; }

        .login-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .login-forgot {
          font-size: 0.8125rem;
          color: #06958a;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .login-forgot:hover { color: #04756c; text-decoration: underline; }

        /* Error */
        .login-error {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.75rem 1rem;
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          border-radius: 0.75rem;
          font-size: 0.8125rem;
          color: #dc2626;
          margin-bottom: 1.25rem;
          animation: shakeAnim 0.4s ease;
        }
        @keyframes shakeAnim {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        /* Submit Button */
        .login-btn {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #0e4d6d 0%, #06958a 100%);
          color: white;
          border: none;
          border-radius: 0.875rem;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          transition: all 0.25s ease;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 15px rgba(6,149,138,0.3);
          position: relative;
          overflow: hidden;
        }
        .login-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .login-btn:hover::before { opacity: 1; }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(6,149,138,0.4);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Divider */
        .login-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1.5rem 0;
        }
        .login-divider-line {
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        .login-divider-text {
          font-size: 0.75rem;
          color: #94a3b8;
          white-space: nowrap;
        }

        /* Register link */
        .login-register-text {
          text-align: center;
          font-size: 0.875rem;
          color: #64748b;
        }
        .login-register-link {
          color: #06958a;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .login-register-link:hover { color: #04756c; text-decoration: underline; }

        /* Back link */
        .login-back {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.2s;
          margin-top: 0.5rem;
        }
        .login-back:hover { color: #0e4d6d; }

        /* Mount animation */
        .login-animate-in {
          opacity: 0;
          transform: translateY(16px);
          animation: mountIn 0.5s ease forwards;
        }
        @keyframes mountIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Ocean wave at bottom of left panel */
        .ocean-wave {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 80'%3E%3Cpath fill='rgba(255,255,255,0.06)' d='M0,40L48,45C96,50,192,60,288,58C384,56,480,42,576,36C672,30,768,32,864,38C960,44,1056,54,1152,54C1248,54,1344,46,1392,42L1440,38L1440,80L0,80Z'/%3E%3C/svg%3E") center/cover no-repeat;
        }
      `}</style>

      {/* ── Left Panel ── */}
      <div className="login-left">
        <div className="login-left-bg" />
        <div className="login-left-overlay" />

        {/* Floating decorative icons */}
        <Fish className="float-icon" style={{ width: 80, height: 80, top: '15%', left: '10%' }} />
        <Waves className="float-icon" style={{ width: 100, height: 100, top: '40%', right: '8%' }} />
        <Shell className="float-icon" style={{ width: 60, height: 60, top: '65%', left: '18%' }} />

        <svg className="wave-divider" viewBox="0 0 80 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M80,0 C60,150 20,200 40,300 C60,400 80,440 60,550 C40,660 10,720 40,800 C60,850 80,880 80,900 L80,0Z" fill="#f0f7ff"/>
        </svg>

        <div className="login-left-content">
          <div className="login-stat-badge">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#67e8f9', display: 'inline-block' }} />
            Platform Aktif Konservasi Laut
          </div>

          <h1 className="login-left-title">
            Bersama Jaga<br />
            <span>Laut Indonesia</span>
          </h1>

          <p className="login-left-desc">
            Bergabunglah dengan ribuan relawan dan komunitas yang peduli terhadap kelestarian ekosistem laut Nusantara.
          </p>

          <div className="login-stats-grid">
            <div className="login-stat-item">
              <div className="login-stat-value">2.4K+</div>
              <div className="login-stat-label">Relawan</div>
            </div>
            <div className="login-stat-item">
              <div className="login-stat-value">180+</div>
              <div className="login-stat-label">Komunitas</div>
            </div>
            <div className="login-stat-item">
              <div className="login-stat-value">560+</div>
              <div className="login-stat-label">Kegiatan</div>
            </div>
          </div>
        </div>

        <div className="ocean-wave" />
      </div>

      {/* ── Right Panel ── */}
      <div className="login-right">
        <div className={`login-right-inner ${mounted ? 'login-animate-in' : ''}`} style={{ animationDelay: '0.1s' }}>

          {/* Logo */}
          <div className="login-logo-wrap">
            <Image
              src="/images/SinergiLautLogo-transparent.png"
              alt="SinergiLaut Logo"
              width={44}
              height={44}
              className="login-logo-img"
            />
            <span className="login-logo-text">SinergiLaut</span>
          </div>

          {/* Card */}
          <div className="login-card">
            <h2 className="login-card-title">Selamat Datang 👋</h2>
            <p className="login-card-subtitle">
              Masuk ke akun Anda untuk melanjutkan <span>misi konservasi</span>
            </p>

            {/* Error */}
            {error && (
              <div className="login-error">
                <AlertCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="login-field">
                <label className="login-label" htmlFor="email">Alamat Email</label>
                <div className="login-input-wrap">
                  <Mail className="login-input-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field">
                <div className="login-row">
                  <label className="login-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                  <Link href="/forgot-password" className="login-forgot">Lupa password?</Link>
                </div>
                <div className="login-input-wrap" style={{ marginTop: '0.5rem' }}>
                  <Lock className="login-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    style={{ paddingRight: '2.75rem' }}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-pw-toggle"
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
              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
                    Sedang masuk...
                  </>
                ) : "Masuk ke Akun"}
              </button>
            </form>

            <div className="login-divider">
              <div className="login-divider-line" />
              <span className="login-divider-text">Belum punya akun?</span>
              <div className="login-divider-line" />
            </div>

            <p className="login-register-text">
              <Link href="/register" className="login-register-link">
                Daftar sekarang — Gratis!
              </Link>
            </p>
          </div>

          <Link href="/" className="login-back">
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f7ff' }}>
        <Image src="/images/SinergiLautLogo-transparent.png" alt="SinergiLaut Logo" width={48} height={48} style={{ animation: 'pulse 1.5s ease-in-out infinite', filter: 'drop-shadow(0 4px 8px rgba(6,149,138,0.3))' }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
