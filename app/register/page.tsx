"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { register } from "@/lib/actions/auth.actions"
import {
  Mail, Lock, User, Phone, Building, AlertCircle, Loader2,
  Check, ArrowRight, ArrowLeft, Eye, EyeOff, Fish, Waves, Shell, ShieldCheck
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

type RoleType = "user" | "community" | null
type Step = 1 | 2 | 3

function RegisterContent() {
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [role, setRole] = useState<RoleType>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
  })

  useEffect(() => { setMounted(true) }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok.")
      return
    }
    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter.")
      return
    }
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

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }
  }


  const stepLabels = ["Pilih Peran", "Isi Data", "Konfirmasi"]

  return (
    <div className="reg-page min-h-screen flex overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .reg-page * { font-family: 'Inter', sans-serif; }

        /* ── Left Panel ── */
        .reg-left {
          position: relative;
          flex: 1;
          display: none;
          overflow: hidden;
        }
        @media (min-width: 1024px) {
          .reg-left { display: flex; flex-direction: column; justify-content: flex-end; }
        }

        .reg-left-bg {
          position: absolute;
          inset: 0;
          background-image: url('/images/community-hero.jpg');
          background-size: cover;
          background-position: center;
          transform: scale(1.05);
          transition: transform 8s ease-in-out;
        }

        .reg-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            150deg,
            rgba(3, 38, 64, 0.88) 0%,
            rgba(2, 92, 115, 0.72) 45%,
            rgba(6, 149, 138, 0.55) 100%
          );
        }

        .reg-left-content {
          position: relative;
          z-index: 10;
          padding: 3rem;
          color: white;
        }

        .reg-badge {
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

        .reg-left-title {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
          color: white;
        }
        .reg-left-title span {
          background: linear-gradient(90deg, #67e8f9, #a5f3fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .reg-left-desc {
          font-size: 0.9375rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.65;
          max-width: 380px;
          margin-bottom: 2rem;
        }

        /* Benefits list */
        .reg-benefits { list-style: none; padding: 0; margin: 0 0 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .reg-benefit-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.85);
        }
        .reg-benefit-check {
          width: 20px; height: 20px;
          background: rgba(103, 232, 249, 0.2);
          border: 1px solid rgba(103, 232, 249, 0.4);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .reg-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          border-top: 1px solid rgba(255,255,255,0.15);
          padding-top: 1.5rem;
        }
        .reg-stat-item { text-align: center; }
        .reg-stat-value { font-size: 1.5rem; font-weight: 800; color: white; line-height: 1; margin-bottom: 0.25rem; }
        .reg-stat-label { font-size: 0.7rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.08em; }

        .float-icon {
          position: absolute;
          opacity: 0.07;
          animation: floatAnim 6s ease-in-out infinite;
        }
        @keyframes floatAnim {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }

        .wave-divider {
          position: absolute;
          right: -1px;
          top: 0;
          height: 100%;
          width: 80px;
          z-index: 20;
        }

        /* ── Right Panel ── */
        .reg-right {
          width: 100%;
          background: #f0f7ff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          position: relative;
          min-height: 100vh;
        }
        @media (min-width: 1024px) {
          .reg-right { width: 520px; flex-shrink: 0; }
        }

        .reg-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(6,149,138,0.07) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .reg-right-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
        }

        /* Logo */
        .reg-logo-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          justify-content: center;
        }
        .reg-logo-text {
          font-size: 1.6rem;
          font-weight: 800;
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }

        /* Progress stepper */
        .reg-stepper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 1.75rem;
        }
        .reg-step-wrap {
          display: flex;
          align-items: center;
        }
        .reg-step-circle {
          width: 34px; height: 34px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8125rem;
          font-weight: 700;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }
        .reg-step-circle.active {
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          color: white;
          box-shadow: 0 4px 12px rgba(6,149,138,0.35);
        }
        .reg-step-circle.done {
          background: #06958a;
          color: white;
        }
        .reg-step-circle.inactive {
          background: white;
          color: #94a3b8;
          border: 2px solid #e2e8f0;
        }
        .reg-step-label {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          position: absolute;
          top: 38px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
        }
        .reg-step-label.active-label { color: #0e4d6d; }
        .reg-step-label.done-label { color: #06958a; }
        .reg-step-label.inactive-label { color: #94a3b8; }
        .reg-step-connector {
          height: 2px;
          width: 56px;
          transition: background 0.3s ease;
          margin: 0 4px;
        }
        .reg-step-connector.done { background: #06958a; }
        .reg-step-connector.inactive { background: #e2e8f0; }

        /* Card */
        .reg-card {
          background: white;
          border-radius: 1.5rem;
          box-shadow:
            0 0 0 1px rgba(6,149,138,0.08),
            0 4px 6px -1px rgba(0,0,0,0.05),
            0 20px 40px -8px rgba(6,149,138,0.12);
          padding: 2.25rem;
          margin-bottom: 1.25rem;
          animation: slideCard 0.35s ease forwards;
        }
        @keyframes slideCard {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .reg-card-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0e2a3a;
          margin-bottom: 0.3rem;
          letter-spacing: -0.02em;
        }
        .reg-card-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 1.75rem;
          line-height: 1.5;
        }
        .reg-card-subtitle span { color: #06958a; font-weight: 500; }

        /* Role cards */
        .reg-role-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .reg-role-card {
          padding: 1.5rem;
          border-radius: 1rem;
          border: 2px solid #e2e8f0;
          background: white;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative;
          overflow: hidden;
        }
        .reg-role-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .reg-role-card.volunteer::before {
          background: linear-gradient(135deg, rgba(14,77,109,0.03), rgba(6,149,138,0.06));
        }
        .reg-role-card.community-c::before {
          background: linear-gradient(135deg, rgba(124,58,237,0.03), rgba(236,72,153,0.05));
        }
        .reg-role-card:hover { transform: translateY(-2px); }
        .reg-role-card.volunteer:hover {
          border-color: #06958a;
          box-shadow: 0 4px 20px rgba(6,149,138,0.15);
        }
        .reg-role-card.volunteer:hover::before { opacity: 1; }
        .reg-role-card.community-c:hover {
          border-color: #7c3aed;
          box-shadow: 0 4px 20px rgba(124,58,237,0.12);
        }
        .reg-role-card.community-c:hover::before { opacity: 1; }

        .reg-role-icon {
          width: 46px; height: 46px;
          border-radius: 0.75rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s;
        }
        .reg-role-card:hover .reg-role-icon { transform: scale(1.08); }
        .reg-role-icon.teal { background: linear-gradient(135deg, rgba(14,77,109,0.12), rgba(6,149,138,0.15)); }
        .reg-role-icon.purple { background: linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.1)); }

        .reg-role-name {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #0e2a3a;
          margin-bottom: 0.25rem;
        }
        .reg-role-desc {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.5;
        }
        .reg-role-arrow {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          opacity: 0;
          transition: opacity 0.2s, transform 0.2s;
          transform: translateX(-4px);
        }
        .reg-role-card:hover .reg-role-arrow { opacity: 1; transform: translateX(0); }

        /* Form fields */
        .reg-field { margin-bottom: 1.125rem; }
        .reg-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.45rem;
          letter-spacing: 0.01em;
        }
        .reg-input-wrap { position: relative; }
        .reg-input-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          width: 15px; height: 15px;
          pointer-events: none;
          transition: color 0.2s;
        }
        .reg-input {
          width: 100%;
          padding: 0.7rem 0.875rem 0.7rem 2.625rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          color: #0e2a3a;
          background: #f8fafc;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .reg-input::placeholder { color: #cbd5e1; }
        .reg-input:focus {
          border-color: #06958a;
          background: white;
          box-shadow: 0 0 0 3px rgba(6,149,138,0.1);
        }
        .reg-input:focus ~ .reg-input-icon { color: #06958a; }
        .reg-input-wrap:focus-within .reg-input-icon { color: #06958a; }

        .reg-pw-toggle {
          position: absolute;
          right: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 0;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .reg-pw-toggle:hover { color: #06958a; }

        /* Password strength */
        .pw-strength-bar {
          display: flex; gap: 4px; margin-top: 0.4rem;
        }
        .pw-strength-seg {
          flex: 1; height: 3px; border-radius: 9999px;
          transition: background 0.3s ease;
        }

        /* Error */
        .reg-error {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.75rem 1rem;
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          border-radius: 0.75rem;
          font-size: 0.8125rem;
          color: #dc2626;
          margin-bottom: 1rem;
          animation: shakeAnim 0.4s ease;
        }
        @keyframes shakeAnim {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        /* Buttons */
        .reg-btn-primary {
          flex: 1;
          padding: 0.8rem 1.25rem;
          background: linear-gradient(135deg, #0e4d6d 0%, #06958a 100%);
          color: white;
          border: none;
          border-radius: 0.875rem;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem;
          transition: all 0.25s ease;
          box-shadow: 0 4px 15px rgba(6,149,138,0.25);
          position: relative; overflow: hidden;
        }
        .reg-btn-primary::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 100%);
          opacity: 0; transition: opacity 0.25s;
        }
        .reg-btn-primary:hover::before { opacity: 1; }
        .reg-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(6,149,138,0.35); }
        .reg-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

        .reg-btn-secondary {
          flex: 1;
          padding: 0.8rem 1.25rem;
          background: white;
          color: #374151;
          border: 1.5px solid #e2e8f0;
          border-radius: 0.875rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .reg-btn-secondary:hover { border-color: #cbd5e1; background: #f8fafc; }

        .reg-btn-row { display: flex; gap: 0.75rem; margin-top: 0.25rem; }

        /* Confirmation summary */
        .reg-summary {
          background: linear-gradient(135deg, #f0f9ff, #f0fdf4);
          border: 1.5px solid rgba(6,149,138,0.15);
          border-radius: 1rem;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .reg-summary-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #06958a;
          margin-bottom: 0.875rem;
        }
        .reg-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(6,149,138,0.1);
          font-size: 0.875rem;
        }
        .reg-summary-row:last-child { border-bottom: none; padding-bottom: 0; }
        .reg-summary-key { color: #64748b; }
        .reg-summary-val { font-weight: 600; color: #0e2a3a; }
        .reg-role-chip {
          display: inline-flex; align-items: center; gap: 0.375rem;
          background: rgba(6,149,138,0.1);
          color: #06958a;
          border-radius: 9999px;
          padding: 0.2rem 0.75rem;
          font-size: 0.8rem; font-weight: 600;
        }

        /* Bottom links */
        .reg-login-text {
          text-align: center; font-size: 0.875rem; color: #64748b;
        }
        .reg-login-link {
          color: #06958a; font-weight: 600; text-decoration: none; transition: color 0.2s;
        }
        .reg-login-link:hover { color: #04756c; text-decoration: underline; }

        .reg-back-link {
          display: flex; align-items: center; justify-content: center;
          gap: 0.375rem; font-size: 0.8125rem; color: #94a3b8;
          text-decoration: none; transition: color 0.2s; margin-top: 0.5rem;
        }
        .reg-back-link:hover { color: #0e4d6d; }

        .reg-animate-in {
          opacity: 0; transform: translateY(16px);
          animation: mountIn 0.5s ease forwards;
        }
        @keyframes mountIn { to { opacity: 1; transform: translateY(0); } }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Left Panel ── */}
      <div className="reg-left">
        <div className="reg-left-bg" />
        <div className="reg-left-overlay" />

        <Fish className="float-icon" style={{ width: 90, height: 90, top: '12%', left: '8%', animationDelay: '0s' }} />
        <Waves className="float-icon" style={{ width: 110, height: 110, top: '42%', right: '6%', animationDelay: '2s' }} />
        <Shell className="float-icon" style={{ width: 65, height: 65, top: '68%', left: '15%', animationDelay: '4s' }} />

        <svg className="wave-divider" viewBox="0 0 80 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M80,0 C60,150 20,200 40,300 C60,400 80,440 60,550 C40,660 10,720 40,800 C60,850 80,880 80,900 L80,0Z" fill="#f0f7ff"/>
        </svg>

        <div className="reg-left-content">
          <div className="reg-badge">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#67e8f9', display: 'inline-block' }} />
            Bergabung Gratis — Mulai Hari Ini
          </div>

          <h1 className="reg-left-title">
            Jadilah Bagian dari<br />
            <span>Gerakan Laut Bersih</span>
          </h1>

          <p className="reg-left-desc">
            Daftarkan diri Anda dan mulai berkontribusi bagi kelestarian ekosistem laut Indonesia bersama ribuan relawan peduli.
          </p>

          <ul className="reg-benefits">
            {[
              "Akses ke ratusan kegiatan konservasi",
              "Pantau dampak kontribusi Anda secara real-time",
              "Terhubung dengan komunitas & organisasi lingkungan",
              "Terima sertifikat relawan digital",
            ].map((b, i) => (
              <li key={i} className="reg-benefit-item">
                <span className="reg-benefit-check">
                  <Check style={{ width: 11, height: 11, color: '#67e8f9' }} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="reg-stats-grid">
            <div className="reg-stat-item">
              <div className="reg-stat-value">2.4K+</div>
              <div className="reg-stat-label">Relawan</div>
            </div>
            <div className="reg-stat-item">
              <div className="reg-stat-value">180+</div>
              <div className="reg-stat-label">Komunitas</div>
            </div>
            <div className="reg-stat-item">
              <div className="reg-stat-value">560+</div>
              <div className="reg-stat-label">Kegiatan</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="reg-right">
        <div className={`reg-right-inner ${mounted ? 'reg-animate-in' : ''}`}>

          {/* Logo */}
          <div className="reg-logo-wrap">
            <Image
              src="/images/SinergiLautLogo-transparent.png"
              alt="SinergiLaut Logo"
              width={44}
              height={44}
              style={{ filter: 'drop-shadow(0 4px 8px rgba(6,149,138,0.3))' }}
            />
            <span className="reg-logo-text">SinergiLaut</span>
          </div>

          {/* Stepper */}
          <div className="reg-stepper" style={{ paddingBottom: '1.5rem', marginBottom: '0.5rem' }}>
            {[1, 2, 3].map((s) => (
              <div key={s} className="reg-step-wrap">
                <div style={{ position: 'relative' }}>
                  <div className={`reg-step-circle ${step > s ? 'done' : step === s ? 'active' : 'inactive'}`}>
                    {step > s ? <Check style={{ width: 14, height: 14 }} /> : s}
                  </div>
                  <span className={`reg-step-label ${step > s ? 'done-label' : step === s ? 'active-label' : 'inactive-label'}`}>
                    {stepLabels[s - 1]}
                  </span>
                </div>
                {s < 3 && (
                  <div className={`reg-step-connector ${step > s ? 'done' : 'inactive'}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── STEP 1: Choose Role ── */}
          {step === 1 && (
            <div className="reg-card">
              <h2 className="reg-card-title">Bergabung dengan SinergiLaut 🌊</h2>
              <p className="reg-card-subtitle">Pilih bagaimana Anda ingin <span>berkontribusi</span> untuk lingkungan laut</p>

              <div className="reg-role-grid">
                {/* Volunteer */}
                <button
                  className="reg-role-card volunteer"
                  onClick={() => { setRole("user"); setStep(2) }}
                >
                  <div className="reg-role-icon teal">
                    <User style={{ width: 22, height: 22, color: '#0e4d6d' }} />
                  </div>
                  <div>
                    <p className="reg-role-name">Volunteer / Donatur</p>
                    <p className="reg-role-desc">Ikut kegiatan konservasi, donasi, dan pantau dampak Anda.</p>
                  </div>
                  <ArrowRight className="reg-role-arrow" style={{ width: 16, height: 16, color: '#06958a' }} />
                </button>

                {/* Community */}
                <button
                  className="reg-role-card community-c"
                  onClick={() => router.push("/community/register")}
                >
                  <div className="reg-role-icon purple">
                    <Building style={{ width: 22, height: 22, color: '#7c3aed' }} />
                  </div>
                  <div>
                    <p className="reg-role-name">Komunitas / Organisasi</p>
                    <p className="reg-role-desc">Buat & kelola kegiatan, rekrut relawan, terima donasi.</p>
                  </div>
                  <ArrowRight className="reg-role-arrow" style={{ width: 16, height: 16, color: '#7c3aed' }} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Account Info ── */}
          {step === 2 && (
            <div className="reg-card">
              <h2 className="reg-card-title">Buat Akun Volunteer 🙌</h2>
              <p className="reg-card-subtitle">Isi informasi dasar untuk <span>memulai perjalanan</span> konservasi Anda</p>

              {error && (
                <div className="reg-error">
                  <AlertCircle style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleStep2Submit}>
                {/* Full Name */}
                <div className="reg-field">
                  <label className="reg-label">Nama Lengkap</label>
                  <div className="reg-input-wrap">
                    <User className="reg-input-icon" />
                    <input name="fullName" type="text" placeholder="Nama lengkap Anda"
                      value={formData.fullName} onChange={handleChange}
                      className="reg-input" required />
                  </div>
                </div>

                {/* Email */}
                <div className="reg-field">
                  <label className="reg-label">Alamat Email</label>
                  <div className="reg-input-wrap">
                    <Mail className="reg-input-icon" />
                    <input name="email" type="email" placeholder="email@example.com"
                      value={formData.email} onChange={handleChange}
                      className="reg-input" required autoComplete="email" />
                  </div>
                </div>

                {/* Phone */}
                <div className="reg-field">
                  <label className="reg-label">Nomor Telepon <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opsional)</span></label>
                  <div className="reg-input-wrap">
                    <Phone className="reg-input-icon" />
                    <input name="phone" type="tel" placeholder="+62 812 3456 7890"
                      value={formData.phone} onChange={handleChange}
                      className="reg-input" />
                  </div>
                </div>

                {/* Password */}
                <div className="reg-field">
                  <label className="reg-label">Password</label>
                  <div className="reg-input-wrap">
                    <Lock className="reg-input-icon" />
                    <input name="password" type={showPassword ? "text" : "password"}
                      placeholder="Minimal 8 karakter"
                      value={formData.password} onChange={handleChange}
                      className="reg-input" style={{ paddingRight: '2.75rem' }} required minLength={8} />
                    <button type="button" className="reg-pw-toggle"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {formData.password && (
                    <div className="pw-strength-bar">
                      {[...Array(4)].map((_, i) => {
                        const len = formData.password.length
                        const hasUpper = /[A-Z]/.test(formData.password)
                        const hasNum = /[0-9]/.test(formData.password)
                        const hasSpecial = /[^A-Za-z0-9]/.test(formData.password)
                        const score = (len >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpecial ? 1 : 0)
                        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
                        return <div key={i} className="pw-strength-seg"
                          style={{ background: i < score ? colors[score - 1] : '#e2e8f0' }} />
                      })}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="reg-field">
                  <label className="reg-label">Konfirmasi Password</label>
                  <div className="reg-input-wrap">
                    <Lock className="reg-input-icon" />
                    <input name="confirmPassword" type={showConfirm ? "text" : "password"}
                      placeholder="Ulangi password Anda"
                      value={formData.confirmPassword} onChange={handleChange}
                      className="reg-input" style={{ paddingRight: '2.75rem' }} required />
                    <button type="button" className="reg-pw-toggle"
                      onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.3rem' }}>Password tidak cocok</p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length >= 8 && (
                    <p style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Check style={{ width: 12, height: 12 }} /> Password cocok
                    </p>
                  )}
                </div>

                <div className="reg-btn-row">
                  <button type="button" className="reg-btn-secondary"
                    onClick={() => { setStep(1); setRole(null) }}>
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
              <h2 className="reg-card-title">Konfirmasi Data ✅</h2>
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
                      <User style={{ width: 12, height: 12 }} />
                      Volunteer / Donatur
                    </span>
                  </div>
                  <div className="reg-summary-row">
                    <span className="reg-summary-key">Nama</span>
                    <span className="reg-summary-val">{formData.fullName}</span>
                  </div>
                  <div className="reg-summary-row">
                    <span className="reg-summary-key">Email</span>
                    <span className="reg-summary-val" style={{ fontSize: '0.8125rem' }}>{formData.email}</span>
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
                  display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(6,149,138,0.06)',
                  border: '1.5px solid rgba(6,149,138,0.15)',
                  borderRadius: '0.75rem',
                  fontSize: '0.8rem', color: '#374151',
                  marginBottom: '1.25rem', lineHeight: 1.5
                }}>
                  <ShieldCheck style={{ width: 15, height: 15, color: '#06958a', flexShrink: 0, marginTop: 1 }} />
                  Data Anda aman. Email verifikasi akan dikirimkan setelah pendaftaran berhasil.
                </div>

                <div className="reg-btn-row">
                  <button type="button" className="reg-btn-secondary" onClick={() => setStep(2)} disabled={isLoading}>
                    <ArrowLeft style={{ width: 15, height: 15 }} /> Edit Data
                  </button>
                  <button type="submit" className="reg-btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
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

          {/* Bottom links */}
          <p className="reg-login-text">
            Sudah punya akun?{" "}
            <Link href="/login" className="reg-login-link">Masuk di sini</Link>
          </p>
          <Link href="/" className="reg-back-link">
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f7ff' }}>
        <Image src="/images/SinergiLautLogo-transparent.png" alt="SinergiLaut Logo" width={48} height={48}
          style={{ animation: 'pulse 1.5s ease-in-out infinite', filter: 'drop-shadow(0 4px 8px rgba(6,149,138,0.3))' }} />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
