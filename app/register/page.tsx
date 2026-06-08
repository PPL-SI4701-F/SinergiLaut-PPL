"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { register } from "@/lib/actions/auth.actions"
import {
  Mail, Lock, User, Phone, Building, AlertCircle, Loader2,
  Check, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck,
  Waves, Sparkles, CheckCircle2,
} from "lucide-react"
import Image from "next/image"

type RoleType = "user" | "community" | null
type Step = 1 | 2 | 3

function RegisterContent() {
  const router = useRouter()

  const [step, setStep]               = useState<Step>(1)
  const [role, setRole]               = useState<RoleType>(null)
  const [isLoading, setIsLoading]     = useState(false)
  const [error, setError]             = useState("")
  const [showPassword, setShowPassword]   = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [mounted, setMounted]         = useState(false)
  const [formData, setFormData]       = useState({
    email: "", password: "", confirmPassword: "", fullName: "", phone: "",
  })

  useEffect(() => { setMounted(true) }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) { setError("Password tidak cocok."); return }
    if (formData.password.length < 8) { setError("Password minimal 8 karakter."); return }
    setError("")
    setStep(3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const actionData = new FormData()
    actionData.append("email", formData.email)
    actionData.append("password", formData.password)
    actionData.append("fullName", formData.fullName)
    if (role) actionData.append("role", role)
    actionData.append("phone", formData.phone)

    const result = await register(actionData)
    if (result?.error) { setError(result.error); setIsLoading(false); return }
    router.push("/user/dashboard")
  }

  return (
    <div className="sl-login" style={{ fontFamily: "var(--sl-font)", justifyContent: "center", background: "var(--sl-paper-4)" }}>
      <style>{`
        .reg-card {
          background: white; border-radius: 1.5rem;
          box-shadow: 0 0 0 1px rgba(6,149,138,0.08), 0 4px 6px -1px rgba(0,0,0,0.05), 0 20px 40px -8px rgba(6,149,138,0.12);
          padding: 2.25rem; margin-bottom: 1.25rem;
          animation: slideCard 0.35s ease forwards;
        }
        @keyframes slideCard { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .reg-card-head { display: flex; align-items: center; gap: 0.875rem; margin-bottom: 0.3rem; }
        .reg-card-icon { width: 44px; height: 44px; border-radius: 0.875rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(14,77,109,0.12), rgba(6,149,138,0.15)); }
        .reg-card-title { font-size: 1.4rem; font-weight: 800; color: var(--sl-ink); letter-spacing: -0.02em; }
        .reg-card-subtitle { font-size: 0.875rem; color: var(--sl-body-2); margin-bottom: 1.75rem; line-height: 1.5; }
        .reg-card-subtitle span { color: var(--sl-teal); font-weight: 500; }

        .reg-stepper { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 1.75rem; }
        .reg-step-wrap { display: flex; align-items: center; }
        .reg-step-circle {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8125rem; font-weight: 700; transition: all 0.3s ease; position: relative; z-index: 1;
        }
        .reg-step-circle.active { background: linear-gradient(135deg, #0e4d6d, #06958a); color: white; box-shadow: 0 4px 12px rgba(6,149,138,0.35); }
        .reg-step-circle.done   { background: #06958a; color: white; }
        .reg-step-circle.inactive { background: white; color: #94a3b8; border: 2px solid #e2e8f0; }
        .reg-step-label { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; position: absolute; top: 38px; left: 50%; transform: translateX(-50%); white-space: nowrap; }
        .reg-step-label.active-label { color: #0e4d6d; }
        .reg-step-label.done-label   { color: #06958a; }
        .reg-step-label.inactive-label { color: #94a3b8; }
        .reg-step-connector { height: 2px; width: 56px; transition: background 0.3s ease; margin: 0 4px; }
        .reg-step-connector.done { background: #06958a; }
        .reg-step-connector.inactive { background: #e2e8f0; }

        .reg-role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .reg-role-card {
          padding: 1.5rem; border-radius: 1rem; border: 2px solid #e2e8f0;
          background: white; cursor: pointer; text-align: left; transition: all 0.2s ease;
          display: flex; flex-direction: column; gap: 0.75rem; position: relative; overflow: hidden;
        }
        .reg-role-card.volunteer:hover { border-color: #06958a; box-shadow: 0 4px 20px rgba(6,149,138,0.15); transform: translateY(-2px); }
        .reg-role-card.community-c:hover { border-color: #7c3aed; box-shadow: 0 4px 20px rgba(124,58,237,0.12); transform: translateY(-2px); }
        .reg-role-icon { width: 46px; height: 46px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform 0.2s; }
        .reg-role-card:hover .reg-role-icon { transform: scale(1.08); }
        .reg-role-icon.teal { background: linear-gradient(135deg, rgba(14,77,109,0.12), rgba(6,149,138,0.15)); }
        .reg-role-icon.purple { background: linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.1)); }
        .reg-role-name { font-size: 0.9375rem; font-weight: 700; color: var(--sl-ink); margin-bottom: 0.25rem; }
        .reg-role-desc { font-size: 0.8rem; color: var(--sl-body-2); line-height: 1.5; }
        .reg-role-arrow { position: absolute; bottom: 1rem; right: 1rem; opacity: 0; transition: opacity 0.2s, transform 0.2s; transform: translateX(-4px); }
        .reg-role-card:hover .reg-role-arrow { opacity: 1; transform: translateX(0); }

        .reg-field { margin-bottom: 1.125rem; }
        .reg-label { display: block; font-size: 0.8125rem; font-weight: 600; color: #374151; margin-bottom: 0.45rem; letter-spacing: 0.01em; }
        .reg-input-wrap { position: relative; }
        .reg-input-icon { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: #94a3b8; width: 15px; height: 15px; pointer-events: none; transition: color 0.2s; }
        .reg-input {
          width: 100%; padding: 0.7rem 0.875rem 0.7rem 2.625rem;
          border: 1.5px solid #e2e8f0; border-radius: 0.75rem;
          font-size: 0.9rem; color: var(--sl-ink); background: #f8fafc;
          outline: none; transition: all 0.2s ease; box-sizing: border-box; font-family: var(--sl-font);
        }
        .reg-input::placeholder { color: #cbd5e1; }
        .reg-input:focus { border-color: #06958a; background: white; box-shadow: 0 0 0 3px rgba(6,149,138,0.1); }
        .reg-input-wrap:focus-within .reg-input-icon { color: #06958a; }
        .reg-pw-toggle { position: absolute; right: 0.875rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0; display: flex; align-items: center; transition: color 0.2s; }
        .reg-pw-toggle:hover { color: #06958a; }
        .pw-strength-bar { display: flex; gap: 4px; margin-top: 0.4rem; }
        .pw-strength-seg { flex: 1; height: 3px; border-radius: 9999px; transition: background 0.3s ease; }
        .reg-error { display: flex; align-items: flex-start; gap: 0.625rem; padding: 0.75rem 1rem; background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 0.75rem; font-size: 0.8125rem; color: #dc2626; margin-bottom: 1rem; animation: shakeAnim 0.4s ease; }
        @keyframes shakeAnim { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .reg-btn-primary { flex: 1; padding: 0.8rem 1.25rem; background: linear-gradient(135deg, #0e4d6d 0%, #06958a 100%); color: white; border: none; border-radius: 0.875rem; font-size: 0.9rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.25s ease; box-shadow: 0 4px 15px rgba(6,149,138,0.25); font-family: var(--sl-font); }
        .reg-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(6,149,138,0.35); }
        .reg-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .reg-btn-secondary { flex: 1; padding: 0.8rem 1.25rem; background: white; color: #374151; border: 1.5px solid #e2e8f0; border-radius: 0.875rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s ease; font-family: var(--sl-font); }
        .reg-btn-secondary:hover { border-color: #cbd5e1; background: #f8fafc; }
        .reg-btn-row { display: flex; gap: 0.75rem; margin-top: 0.25rem; }
        .reg-summary { background: linear-gradient(135deg, #f0f9ff, #f0fdf4); border: 1.5px solid rgba(6,149,138,0.15); border-radius: 1rem; padding: 1.25rem; margin-bottom: 1.25rem; }
        .reg-summary-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #06958a; margin-bottom: 0.875rem; }
        .reg-summary-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(6,149,138,0.1); font-size: 0.875rem; }
        .reg-summary-row:last-child { border-bottom: none; padding-bottom: 0; }
        .reg-summary-key { color: var(--sl-body-2); }
        .reg-summary-val { font-weight: 600; color: var(--sl-ink); }
        .reg-role-chip { display: inline-flex; align-items: center; gap: 0.375rem; background: rgba(6,149,138,0.1); color: #06958a; border-radius: 9999px; padding: 0.2rem 0.75rem; font-size: 0.8rem; font-weight: 600; }
        .reg-benefits { list-style: none; padding: 0; margin: 0 0 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .reg-benefit-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: rgba(255,255,255,0.85); }
        .reg-benefit-check { width: 20px; height: 20px; background: rgba(103,232,249,0.2); border: 1px solid rgba(103,232,249,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Form Panel (centered) ── */}
      <div className="sl-login-right" style={{ background: "transparent" }}>
        <div
          className={`sl-login-right-inner${mounted ? " sl-mount-in" : ""}`}
          style={{ maxWidth: 420 }}
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

          {/* Stepper */}
          {step > 1 && (
            <div className="reg-stepper" style={{ paddingBottom: "1.5rem", marginBottom: "0.5rem" }}>
              {[
                { id: 2, label: "Isi Data", icon: Sparkles },
                { id: 3, label: "Konfirmasi", icon: CheckCircle2 },
              ].map(({ id: s, label, icon: Icon }, idx) => (
                <div key={s} className="reg-step-wrap">
                  <div style={{ position: "relative" }}>
                    <div className={`reg-step-circle ${step > s ? "done" : step === s ? "active" : "inactive"}`}>
                      {step > s ? <Check style={{ width: 14, height: 14 }} /> : <Icon style={{ width: 16, height: 16 }} />}
                    </div>
                    <span className={`reg-step-label ${step > s ? "done-label" : step === s ? "active-label" : "inactive-label"}`}>
                      {label}
                    </span>
                  </div>
                  {idx < 1 && (
                    <div className={`reg-step-connector ${step > s ? "done" : "inactive"}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 1: Choose Role ── */}
          {step === 1 && (
            <div className="reg-card">
              <div className="reg-card-head">
                <div className="reg-card-icon"><Waves style={{ width: 22, height: 22, color: "#06958a" }} /></div>
                <h2 className="reg-card-title">Bergabung dengan SinergiLaut</h2>
              </div>
              <p className="reg-card-subtitle">Pilih bagaimana Anda ingin <span>berkontribusi</span> untuk lingkungan laut</p>

              <div className="reg-role-grid">
                <button className="reg-role-card volunteer" onClick={() => { setRole("user"); setStep(2) }}>
                  <div className="reg-role-icon teal">
                    <User style={{ width: 22, height: 22, color: "#0e4d6d" }} />
                  </div>
                  <div>
                    <p className="reg-role-name">Volunteer / Donatur</p>
                    <p className="reg-role-desc">Ikut kegiatan konservasi, donasi, dan pantau dampak Anda.</p>
                  </div>
                  <ArrowRight className="reg-role-arrow" style={{ width: 16, height: 16, color: "#06958a" }} />
                </button>

                <button className="reg-role-card community-c" onClick={() => router.push("/community/register")}>
                  <div className="reg-role-icon purple">
                    <Building style={{ width: 22, height: 22, color: "#7c3aed" }} />
                  </div>
                  <div>
                    <p className="reg-role-name">Komunitas / Organisasi</p>
                    <p className="reg-role-desc">Buat & kelola kegiatan, rekrut relawan, terima donasi.</p>
                  </div>
                  <ArrowRight className="reg-role-arrow" style={{ width: 16, height: 16, color: "#7c3aed" }} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Account Info ── */}
          {step === 2 && (
            <div className="reg-card">
              <div className="reg-card-head">
                <div className="reg-card-icon"><Sparkles style={{ width: 22, height: 22, color: "#06958a" }} /></div>
                <h2 className="reg-card-title">Buat Akun Volunteer</h2>
              </div>
              <p className="reg-card-subtitle">Isi informasi dasar untuk <span>memulai perjalanan</span> konservasi Anda</p>

              {error && (
                <div className="reg-error">
                  <AlertCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleStep2Submit}>
                <div className="reg-field">
                  <label className="reg-label">Nama Lengkap</label>
                  <div className="reg-input-wrap">
                    <User className="reg-input-icon" />
                    <input name="fullName" type="text" placeholder="Nama lengkap Anda"
                      value={formData.fullName} onChange={handleChange} className="reg-input" required />
                  </div>
                </div>

                <div className="reg-field">
                  <label className="reg-label">Alamat Email</label>
                  <div className="reg-input-wrap">
                    <Mail className="reg-input-icon" />
                    <input name="email" type="email" placeholder="email@example.com"
                      value={formData.email} onChange={handleChange} className="reg-input" required autoComplete="email" />
                  </div>
                </div>

                <div className="reg-field">
                  <label className="reg-label">
                    Nomor Telepon{" "}
                    <span style={{ color: "#94a3b8", fontWeight: 400 }}>(opsional)</span>
                  </label>
                  <div className="reg-input-wrap">
                    <Phone className="reg-input-icon" />
                    <input name="phone" type="tel" placeholder="+62 812 3456 7890"
                      value={formData.phone} onChange={handleChange} className="reg-input" />
                  </div>
                </div>

                <div className="reg-field">
                  <label className="reg-label">Password</label>
                  <div className="reg-input-wrap">
                    <Lock className="reg-input-icon" />
                    <input name="password" type={showPassword ? "text" : "password"}
                      placeholder="Minimal 8 karakter"
                      value={formData.password} onChange={handleChange}
                      className="reg-input" style={{ paddingRight: "2.75rem" }} required minLength={8} />
                    <button type="button" className="reg-pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="pw-strength-bar">
                      {[...Array(4)].map((_, i) => {
                        const len = formData.password.length
                        const score = (len >= 8 ? 1 : 0) + (/[A-Z]/.test(formData.password) ? 1 : 0) + (/[0-9]/.test(formData.password) ? 1 : 0) + (/[^A-Za-z0-9]/.test(formData.password) ? 1 : 0)
                        const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"]
                        return <div key={i} className="pw-strength-seg" style={{ background: i < score ? colors[score - 1] : "#e2e8f0" }} />
                      })}
                    </div>
                  )}
                </div>

                <div className="reg-field">
                  <label className="reg-label">Konfirmasi Password</label>
                  <div className="reg-input-wrap">
                    <Lock className="reg-input-icon" />
                    <input name="confirmPassword" type={showConfirm ? "text" : "password"}
                      placeholder="Ulangi password Anda"
                      value={formData.confirmPassword} onChange={handleChange}
                      className="reg-input" style={{ paddingRight: "2.75rem" }} required />
                    <button type="button" className="reg-pw-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.3rem" }}>Password tidak cocok</p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 8 && (
                    <p style={{ fontSize: "0.75rem", color: "#22c55e", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Check style={{ width: 12, height: 12 }} /> Password cocok
                    </p>
                  )}
                </div>

                <div className="reg-btn-row">
                  <button type="button" className="reg-btn-secondary" onClick={() => { setStep(1); setRole(null) }}>
                    <ArrowLeft style={{ width: 15, height: 15 }} /> Kembali
                  </button>
                  <button type="submit" className="reg-btn-primary">
                    Lanjutkan <ArrowRight style={{ width: 15, height: 15 }} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── STEP 3: Confirmation ── */}
          {step === 3 && (
            <div className="reg-card">
              <div className="reg-card-head">
                <div className="reg-card-icon"><CheckCircle2 style={{ width: 22, height: 22, color: "#06958a" }} /></div>
                <h2 className="reg-card-title">Konfirmasi Data</h2>
              </div>
              <p className="reg-card-subtitle">Periksa kembali informasi Anda sebelum <span>menyelesaikan pendaftaran</span></p>

              {error && (
                <div className="reg-error">
                  <AlertCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="reg-summary">
                  <p className="reg-summary-title">Ringkasan Akun</p>
                  <div className="reg-summary-row">
                    <span className="reg-summary-key">Peran</span>
                    <span className="reg-role-chip">
                      <User style={{ width: 12, height: 12 }} /> Volunteer / Donatur
                    </span>
                  </div>
                  <div className="reg-summary-row">
                    <span className="reg-summary-key">Nama</span>
                    <span className="reg-summary-val">{formData.fullName}</span>
                  </div>
                  <div className="reg-summary-row">
                    <span className="reg-summary-key">Email</span>
                    <span className="reg-summary-val" style={{ fontSize: "0.8125rem" }}>{formData.email}</span>
                  </div>
                  <div className="reg-summary-row">
                    <span className="reg-summary-key">Telepon</span>
                    <span className="reg-summary-val">{formData.phone || "—"}</span>
                  </div>
                  <div className="reg-summary-row">
                    <span className="reg-summary-key">Password</span>
                    <span className="reg-summary-val">{"•".repeat(Math.min(formData.password.length, 10))}</span>
                  </div>
                </div>

                <div style={{
                  display: "flex", alignItems: "flex-start", gap: "0.625rem",
                  padding: "0.75rem 1rem",
                  background: "rgba(6,149,138,0.06)", border: "1.5px solid rgba(6,149,138,0.15)",
                  borderRadius: "0.75rem", fontSize: "0.8rem", color: "#374151",
                  marginBottom: "1.25rem", lineHeight: 1.5
                }}>
                  <ShieldCheck style={{ width: 15, height: 15, color: "#06958a", flexShrink: 0, marginTop: 1 }} />
                  Data Anda aman. Email verifikasi akan dikirimkan setelah pendaftaran berhasil.
                </div>

                <div className="reg-btn-row">
                  <button type="button" className="reg-btn-secondary" onClick={() => setStep(2)} disabled={isLoading}>
                    <ArrowLeft style={{ width: 15, height: 15 }} /> Edit Data
                  </button>
                  <button type="submit" className="reg-btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />
                        Mendaftar...
                      </>
                    ) : (
                      <>
                        <Check style={{ width: 15, height: 15 }} />
                        Daftar Sekarang
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--sl-body-2)" }}>
            Sudah punya akun?{" "}
            <Link href="/login" className="sl-register-link">Masuk di sini</Link>
          </p>
          <Link href="/" className="sl-back-home">
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
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
      <RegisterContent />
    </Suspense>
  )
}
