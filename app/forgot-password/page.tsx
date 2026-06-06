"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Mail, CheckCircle2, Loader2, ArrowLeft, Waves } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent]       = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    })

    if (error) {
      toast.error("Gagal mengirim email reset. Silakan coba lagi.")
    } else {
      setIsSent(true)
    }
    setIsLoading(false)
  }

  return (
    <div className="sl-login">
      {/* ── Left Panel ── */}
      <div className="sl-login-left">
        <div
          className="sl-login-left-bg"
          style={{ backgroundImage: "url('/images/hero-ocean.jpg')" }}
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
            <Waves style={{ width: 12, height: 12 }} />
            Keamanan Akun Anda
          </div>

          <h1 className="sl-login-left-title">
            Pulihkan Akses<br />
            <span className="sl-cyan-text">Akun Anda</span>
          </h1>

          <p className="sl-login-left-desc">
            Jangan khawatir. Kami akan mengirimkan tautan reset password ke email Anda agar Anda bisa kembali berkontribusi bagi kelestarian laut Indonesia.
          </p>

          <div className="sl-login-left-stats">
            <div className="sl-login-left-stat">
              <div className="sl-login-left-stat-val">100%</div>
              <div className="sl-login-left-stat-lbl">Aman</div>
            </div>
            <div className="sl-login-left-stat">
              <div className="sl-login-left-stat-val">&lt;5m</div>
              <div className="sl-login-left-stat-lbl">Proses</div>
            </div>
            <div className="sl-login-left-stat">
              <div className="sl-login-left-stat-val">24/7</div>
              <div className="sl-login-left-stat-lbl">Layanan</div>
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
        <div className="sl-login-right-inner sl-mount-in">
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
            {isSent ? (
              <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
                <div style={{
                  width: 64, height: 64, background: "rgba(22,163,74,0.1)",
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", margin: "0 auto 1.25rem"
                }}>
                  <CheckCircle2 style={{ width: 32, height: 32, color: "#16a34a" }} />
                </div>
                <h2 className="sl-login-title">Email Terkirim!</h2>
                <p className="sl-login-subtitle" style={{ marginBottom: "1.75rem" }}>
                  Kami telah mengirim link reset password ke{" "}
                  <span>{email}</span>.{" "}
                  Silakan cek inbox Anda.
                </p>
                <Link href="/login" className="sl-login-submit" style={{ display: "flex" }}>
                  Kembali ke Halaman Login
                </Link>
              </div>
            ) : (
              <>
                <h2 className="sl-login-title">Lupa Password?</h2>
                <p className="sl-login-subtitle">
                  Masukkan email Anda dan kami akan mengirimkan <span>link reset password</span>
                </p>

                <form onSubmit={handleSubmit}>
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

                  <button type="submit" className="sl-login-submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 style={{ width: 18, height: 18 }} className="sl-spin" />
                        Mengirim...
                      </>
                    ) : "Kirim Link Reset"}
                  </button>
                </form>
              </>
            )}
          </div>

          <Link href="/login" className="sl-back-home">
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  )
}
