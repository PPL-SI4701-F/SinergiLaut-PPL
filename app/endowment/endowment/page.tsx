import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { getEndowmentStats, getEndowmentDisbursements } from "@/lib/actions/endowment.actions"
import { formatCurrency } from "@/lib/utils/helpers"
import {
  Heart, ShieldCheck, TrendingUp, Users, Banknote,
  ArrowRight, Sparkles, CheckCircle, Globe, Zap, Fish, Waves, Anchor
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function EndowmentPage() {
  const stats = await getEndowmentStats()
  const disbursements = await getEndowmentDisbursements()

  const availableFunds = Math.max(0, stats.totalRaised - stats.disbursed)
  const progressPercent = stats.totalRaised > 0
    ? Math.min(100, Math.round((stats.disbursed / stats.totalRaised) * 100))
    : 0

  const pillars = [
    {
      icon: ShieldCheck,
      title: "100% Transparan",
      description: "Semua arus kas dan penyaluran dana abadi dapat dipantau langsung oleh publik untuk menjaga kepercayaan.",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.08)",
    },
    {
      icon: Heart,
      title: "Dukungan Komunitas",
      description: "Dana diprioritaskan untuk komunitas kecil yang kekurangan resource agar kegiatan kebersihan laut tetap berjalan.",
      color: "#06958a",
      bg: "rgba(6,149,138,0.08)",
    },
    {
      icon: TrendingUp,
      title: "Dampak Jangka Panjang",
      description: "Setiap donasi membantu keberlangsungan pemeliharaan ekosistem laut dan mendukung regenerasi relawan.",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
    },
  ]

  const howItWorks = [
    { step: "01", title: "Dana Dikumpulkan", desc: "Surplus donasi dari kegiatan konservasi yang melebihi target otomatis masuk ke Dana Abadi." },
    { step: "02", title: "Diverifikasi Admin", desc: "Tim SinergiLaut memverifikasi kebutuhan komunitas yang mengajukan bantuan pendanaan darurat." },
    { step: "03", title: "Disalurkan Transparan", desc: "Dana disalurkan langsung ke komunitas dengan laporan publik yang bisa dipantau siapa saja." },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        /* ── Hero ── */
        .endo-hero {
          position: relative;
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          padding: 6rem 1.5rem 5rem;
          text-align: center;
        }
        .endo-hero-bg {
          position: absolute; inset: 0;
          background-image: url('/images/donate-hero.jpg');
          background-size: cover;
          background-position: center 35%;
        }
        .endo-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            160deg,
            rgba(3, 22, 48, 0.88) 0%,
            rgba(4, 55, 82, 0.72) 50%,
            rgba(3, 40, 60, 0.90) 100%
          );
        }
        .endo-hero-particles {
          position: absolute; inset: 0;
          background-image:
            radial-gradient(circle, rgba(103,232,249,0.12) 1px, transparent 1px),
            radial-gradient(circle, rgba(165,243,252,0.07) 1px, transparent 1px);
          background-size: 55px 55px, 28px 28px;
          background-position: 0 0, 14px 14px;
          animation: particleDrift 25s linear infinite;
          pointer-events: none;
        }
        @keyframes particleDrift {
          from { transform: translateY(0); }
          to { transform: translateY(-60px); }
        }
        .endo-hero-content { position: relative; z-index: 10; max-width: 820px; }
        .endo-hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(103,232,249,0.12);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(103,232,249,0.28);
          color: #a5f3fc;
          font-size: 0.8125rem; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 0.45rem 1.25rem; border-radius: 9999px;
          margin-bottom: 2rem;
        }
        .endo-hero-title {
          font-size: clamp(2.25rem, 5.5vw, 4rem);
          font-weight: 900; color: white;
          line-height: 1.1; letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
        }
        .endo-hero-title .shimmer {
          background: linear-gradient(90deg, #67e8f9, #a5f3fc, #67e8f9);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        @keyframes shimmer {
          from { background-position: 0% center; }
          to { background-position: 200% center; }
        }
        .endo-hero-desc {
          font-size: 1.0625rem; color: rgba(255,255,255,0.72);
          line-height: 1.75; max-width: 580px; margin: 0 auto 2.5rem;
        }
        .endo-hero-btns {
          display: flex; gap: 1rem; flex-wrap: wrap;
          align-items: center; justify-content: center;
        }
        .endo-btn-primary {
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #06958a, #0e7268);
          color: white; border: none; border-radius: 0.875rem;
          font-size: 0.9375rem; font-weight: 700;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(6,149,138,0.4);
        }
        .endo-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(6,149,138,0.5); }
        .endo-btn-ghost {
          padding: 0.875rem 2rem;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          color: white; border: 1.5px solid rgba(255,255,255,0.22);
          border-radius: 0.875rem;
          font-size: 0.9375rem; font-weight: 600;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
        }
        .endo-btn-ghost:hover { background: rgba(255,255,255,0.17); border-color: rgba(255,255,255,0.38); }

        /* Wave */
        .endo-wave { position: absolute; bottom: -2px; left: 0; right: 0; z-index: 5; line-height: 0; }

        /* ── Stats bar ── */
        .endo-stats-bar {
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          padding: 2.5rem 1.5rem;
        }
        .endo-stats-inner {
          max-width: 900px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(2,1fr); gap: 1.5rem;
        }
        @media(min-width:768px){ .endo-stats-inner{ grid-template-columns: repeat(4,1fr); } }
        .endo-stat-item {
          text-align: center;
          padding-right: 1.5rem;
          border-right: 1px solid rgba(255,255,255,0.15);
        }
        .endo-stat-item:nth-child(2){ border-right: none; }
        @media(min-width:768px){
          .endo-stat-item:nth-child(2){ border-right: 1px solid rgba(255,255,255,0.15); }
          .endo-stat-item:last-child{ border-right: none; }
        }
        .endo-stat-icon-wrap {
          width: 42px; height: 42px;
          background: rgba(255,255,255,0.12);
          border-radius: 0.75rem;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 0.875rem;
        }
        .endo-stat-val { font-size: 1.75rem; font-weight: 900; color: white; line-height: 1; margin-bottom: 0.3rem; letter-spacing: -0.03em; }
        .endo-stat-lbl { font-size: 0.75rem; font-weight: 500; color: rgba(255,255,255,0.65); text-transform: uppercase; letter-spacing: 0.07em; }

        /* ── Sections ── */
        .endo-section { padding: 5.5rem 1.5rem; }
        .endo-section-alt { padding: 5.5rem 1.5rem; background: #f0f9ff; }
        .endo-container { max-width: 1200px; margin: 0 auto; }
        .endo-container-md { max-width: 900px; margin: 0 auto; }
        .endo-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: #06958a; margin-bottom: 0.875rem;
        }
        .endo-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #06958a; }
        .endo-section-title {
          font-size: clamp(1.75rem, 3.5vw, 2.625rem);
          font-weight: 800; color: #0e2a3a;
          line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 1rem;
        }
        .endo-section-desc { font-size: 1.0625rem; color: #475569; line-height: 1.7; max-width: 580px; }
        .text-center { text-align: center; }
        .mx-auto { margin-left: auto; margin-right: auto; }

        /* ── Pillar Cards ── */
        .endo-pillars-grid {
          display: grid; gap: 1.5rem;
          grid-template-columns: 1fr;
        }
        @media(min-width:768px){ .endo-pillars-grid{ grid-template-columns: repeat(3,1fr); } }
        .endo-pillar-card {
          background: white;
          border-radius: 1.25rem;
          padding: 2rem;
          border: 1.5px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.3s ease;
          position: relative; overflow: hidden;
        }
        .endo-pillar-card::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 3px; opacity: 0; transition: opacity 0.3s;
        }
        .endo-pillar-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
        .endo-pillar-card:hover::after { opacity: 1; }
        .endo-pillar-icon {
          width: 52px; height: 52px; border-radius: 1rem;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.25rem;
        }
        .endo-pillar-title { font-size: 1.0625rem; font-weight: 700; color: #0e2a3a; margin-bottom: 0.5rem; }
        .endo-pillar-desc { font-size: 0.875rem; color: #64748b; line-height: 1.65; }

        /* ── Status Card ── */
        .endo-status-card {
          background: white;
          border-radius: 1.5rem;
          border: 1.5px solid rgba(6,149,138,0.1);
          box-shadow: 0 8px 30px rgba(6,149,138,0.08), 0 2px 8px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .endo-status-header {
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #f0f9ff, #e0f7f4);
          border-bottom: 1.5px solid rgba(6,149,138,0.1);
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
        }
        .endo-status-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: rgba(6,149,138,0.1); color: #06958a;
          font-size: 0.75rem; font-weight: 700;
          padding: 0.3rem 0.875rem; border-radius: 9999px;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .endo-status-live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #06958a;
          animation: livePulse 1.5s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
        .endo-funds-grid {
          display: grid; gap: 0;
          grid-template-columns: 1fr;
          border-bottom: 1.5px solid #f1f5f9;
        }
        @media(min-width:640px){ .endo-funds-grid{ grid-template-columns: repeat(3,1fr); } }
        .endo-fund-item {
          padding: 2rem;
          text-align: center;
          border-bottom: 1px solid #f1f5f9;
        }
        @media(min-width:640px){
          .endo-fund-item { border-bottom: none; border-right: 1px solid #f1f5f9; }
          .endo-fund-item:last-child { border-right: none; }
        }
        .endo-fund-label { font-size: 0.8125rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
        .endo-fund-value { font-size: 2rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1; margin-bottom: 0.375rem; }
        .endo-fund-sub { font-size: 0.8rem; color: #94a3b8; }

        /* Progress Bar */
        .endo-progress-wrap { padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9; }
        .endo-progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .endo-progress-title { font-size: 0.875rem; font-weight: 600; color: #374151; }
        .endo-progress-pct { font-size: 0.875rem; font-weight: 700; color: #06958a; }
        .endo-progress-track {
          height: 10px; background: #f1f5f9; border-radius: 9999px; overflow: hidden;
        }
        .endo-progress-fill {
          height: 100%; border-radius: 9999px;
          background: linear-gradient(90deg, #0e4d6d, #06958a);
          transition: width 0.8s ease;
          position: relative; overflow: hidden;
        }
        .endo-progress-fill::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: progressShimmer 2s linear infinite;
        }
        @keyframes progressShimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }

        /* Disbursement list */
        .endo-disbursements { padding: 2rem; }
        .endo-disb-header {
          display: flex; align-items: center; gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .endo-disb-title { font-size: 1rem; font-weight: 700; color: #0e2a3a; }
        .endo-disb-count {
          background: #f0f9ff; color: #0e4d6d;
          font-size: 0.75rem; font-weight: 700;
          padding: 0.2rem 0.625rem; border-radius: 9999px;
        }
        .endo-disb-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem;
          border-radius: 0.875rem;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          margin-bottom: 0.75rem;
          transition: all 0.2s ease;
        }
        .endo-disb-item:hover { background: #f0fdf4; border-color: rgba(6,149,138,0.15); }
        .endo-disb-item:last-child { margin-bottom: 0; }
        .endo-disb-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, rgba(14,77,109,0.1), rgba(6,149,138,0.12));
          border-radius: 0.625rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .endo-disb-name { font-size: 0.9rem; font-weight: 600; color: #0e2a3a; }
        .endo-disb-notes { font-size: 0.8125rem; color: #64748b; margin-top: 0.125rem; }
        .endo-disb-amount {
          background: rgba(6,149,138,0.08);
          color: #06958a;
          font-size: 0.875rem; font-weight: 700;
          padding: 0.35rem 0.875rem; border-radius: 9999px;
          white-space: nowrap; flex-shrink: 0;
        }
        .endo-empty {
          padding: 2.5rem; text-align: center; color: #94a3b8; font-size: 0.9rem;
        }

        /* ── How it works ── */
        .endo-how-grid {
          display: grid; gap: 2rem; grid-template-columns: 1fr;
          position: relative;
        }
        @media(min-width:768px){ .endo-how-grid{ grid-template-columns: repeat(3,1fr); } }
        .endo-how-card {
          position: relative;
          background: white;
          border-radius: 1.25rem;
          padding: 2rem;
          border: 1.5px solid rgba(6,149,138,0.1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
        }
        .endo-how-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(6,149,138,0.1); }
        .endo-how-step {
          font-size: 3rem; font-weight: 900;
          letter-spacing: -0.05em;
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1; margin-bottom: 1rem; opacity: 0.5;
        }
        .endo-how-title { font-size: 1.0625rem; font-weight: 700; color: #0e2a3a; margin-bottom: 0.5rem; }
        .endo-how-desc { font-size: 0.875rem; color: #64748b; line-height: 1.65; }

        /* ── CTA ── */
        .endo-cta {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #031c36 0%, #043752 45%, #032836 100%);
          padding: 5.5rem 1.5rem; text-align: center;
        }
        .endo-cta-bg {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(103,232,249,0.07) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none;
        }
        .endo-cta-glow {
          position: absolute;
          width: 600px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(6,149,138,0.18), transparent 70%);
          top: -100px; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .endo-cta-inner { position: relative; z-index: 1; max-width: 660px; margin: 0 auto; }
        .endo-cta-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(103,232,249,0.1); border: 1px solid rgba(103,232,249,0.22);
          color: #a5f3fc; font-size: 0.8125rem; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
          padding: 0.4rem 1.25rem; border-radius: 9999px; margin-bottom: 1.5rem;
        }
        .endo-cta-title {
          font-size: clamp(1.75rem, 4vw, 3rem); font-weight: 900; color: white;
          letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 1rem;
        }
        .endo-cta-desc { font-size: 1.0625rem; color: rgba(255,255,255,0.62); line-height: 1.7; margin-bottom: 2.5rem; }
        .endo-cta-btns { display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; }
        .endo-cta-btn-primary {
          padding: 0.9rem 2.25rem;
          background: linear-gradient(135deg, #06958a, #04756c);
          color: white; border: none; border-radius: 0.875rem;
          font-size: 0.9375rem; font-weight: 700; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(6,149,138,0.4);
        }
        .endo-cta-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(6,149,138,0.5); }
        .endo-cta-btn-ghost {
          padding: 0.9rem 2.25rem;
          background: rgba(255,255,255,0.07); backdrop-filter: blur(10px);
          color: white; border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 0.875rem; font-size: 0.9375rem; font-weight: 600;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
        }
        .endo-cta-btn-ghost:hover { background: rgba(255,255,255,0.13); border-color: rgba(255,255,255,0.32); }

        /* Trust badges */
        .endo-trust { display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap; margin-top: 2.5rem; }
        .endo-trust-item { display: flex; align-items: center; gap: 0.5rem; color: rgba(255,255,255,0.55); font-size: 0.8125rem; }
      `}</style>

      <Navigation />
      <main style={{ flex: 1, paddingTop: '4rem' }}>

        {/* ── HERO ── */}
        <section className="endo-hero">
          <div className="endo-hero-bg" />
          <div className="endo-hero-overlay" />
          <div className="endo-hero-particles" />

          {/* Floating deco */}
          <Fish style={{ position: 'absolute', top: '18%', right: '7%', width: 75, height: 75, color: 'rgba(103,232,249,0.07)', zIndex: 2 }} />
          <Anchor style={{ position: 'absolute', bottom: '25%', left: '5%', width: 55, height: 55, color: 'rgba(165,243,252,0.06)', zIndex: 2 }} />
          <Waves style={{ position: 'absolute', top: '38%', left: '10%', width: 65, height: 65, color: 'rgba(103,232,249,0.06)', zIndex: 2 }} />

          <div className="endo-hero-content">
            <div className="endo-hero-badge">
              <Sparkles style={{ width: 12, height: 12 }} />
              Transparansi Finansial
            </div>
            <h1 className="endo-hero-title">
              Dana Abadi <span className="shimmer">SinergiLaut</span>
            </h1>
            <p className="endo-hero-desc">
              Inisiatif urun dana transparan yang mengalokasikan surplus donasi untuk menyokong komunitas penggerak kebersihan laut yang membutuhkan bantuan pendanaan darurat.
            </p>
            <div className="endo-hero-btns">
              <Link href="/activities" className="endo-btn-primary">
                Lihat Kegiatan <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <a href="#status-dana" className="endo-btn-ghost">
                Status Dana
              </a>
            </div>
          </div>

          <div className="endo-wave">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
              <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z" fill="white"/>
            </svg>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="endo-stats-bar">
          <div className="endo-stats-inner">
            {[
              { icon: Banknote, val: formatCurrency(stats.totalRaised), lbl: "Total Terkumpul" },
              { icon: Heart, val: formatCurrency(stats.disbursed), lbl: "Telah Disalurkan" },
              { icon: Globe, val: formatCurrency(availableFunds), lbl: "Dana Tersedia" },
              { icon: Users, val: `${disbursements.length}`, lbl: "Komunitas Dibantu" },
            ].map((s) => (
              <div key={s.lbl} className="endo-stat-item">
                <div className="endo-stat-icon-wrap">
                  <s.icon style={{ width: 19, height: 19, color: 'rgba(255,255,255,0.9)' }} />
                </div>
                <div className="endo-stat-val">{s.val}</div>
                <div className="endo-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PILLARS ── */}
        <section className="endo-section">
          <div className="endo-container">
            <div className="text-center" style={{ marginBottom: '3rem' }}>
              <div className="endo-eyebrow mx-auto" style={{ justifyContent: 'center' }}>
                <span className="endo-eyebrow-dot" />
                Prinsip Dana Abadi
              </div>
              <h2 className="endo-section-title">Dikelola dengan Integritas Penuh</h2>
              <p className="endo-section-desc mx-auto">
                Tiga pilar utama yang memastikan dana abadi SinergiLaut dikelola dengan benar dan memberikan dampak nyata.
              </p>
            </div>
            <div className="endo-pillars-grid">
              {pillars.map((p, i) => (
                <div key={p.title} className="endo-pillar-card"
                  style={{ ['--pillar-color' as string]: p.color }}>
                  <style>{`.endo-pillar-card:nth-child(${i+1})::after { background: linear-gradient(90deg, ${p.color}, ${p.color}88); }`}</style>
                  <div className="endo-pillar-icon" style={{ background: p.bg }}>
                    <p.icon style={{ width: 24, height: 24, color: p.color }} />
                  </div>
                  <h3 className="endo-pillar-title">{p.title}</h3>
                  <p className="endo-pillar-desc">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATUS DANA ── */}
        <section className="endo-section-alt" id="status-dana">
          <div className="endo-container-md">
            <div className="text-center" style={{ marginBottom: '2.5rem' }}>
              <div className="endo-eyebrow mx-auto" style={{ justifyContent: 'center' }}>
                <span className="endo-eyebrow-dot" />
                Laporan Real-time
              </div>
              <h2 className="endo-section-title">Status & Alokasi Dana Saat Ini</h2>
              <p className="endo-section-desc mx-auto">
                Catatan transparan akumulasi dana abadi dan riwayat pendistribusiannya secara publik.
              </p>
            </div>

            <div className="endo-status-card">
              {/* Card Header */}
              <div className="endo-status-header">
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0e2a3a' }}>Dana Abadi SinergiLaut</p>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.15rem' }}>Diperbarui secara otomatis</p>
                </div>
                <div className="endo-status-badge">
                  <span className="endo-status-live-dot" />
                  Live
                </div>
              </div>

              {/* Fund Numbers */}
              <div className="endo-funds-grid">
                <div className="endo-fund-item">
                  <p className="endo-fund-label">Total Terkumpul</p>
                  <p className="endo-fund-value" style={{ color: '#0e4d6d' }}>{formatCurrency(stats.totalRaised)}</p>
                  <p className="endo-fund-sub">Dari surplus kegiatan</p>
                </div>
                <div className="endo-fund-item">
                  <p className="endo-fund-label">Telah Disalurkan</p>
                  <p className="endo-fund-value" style={{ color: '#06958a' }}>{formatCurrency(stats.disbursed)}</p>
                  <p className="endo-fund-sub">Ke {disbursements.length} komunitas</p>
                </div>
                <div className="endo-fund-item">
                  <p className="endo-fund-label">Dana Tersedia</p>
                  <p className="endo-fund-value" style={{ color: availableFunds > 0 ? '#22c55e' : '#94a3b8' }}>
                    {formatCurrency(availableFunds)}
                  </p>
                  <p className="endo-fund-sub">Siap disalurkan</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="endo-progress-wrap">
                <div className="endo-progress-header">
                  <span className="endo-progress-title">Realisasi Penyaluran</span>
                  <span className="endo-progress-pct">{progressPercent}%</span>
                </div>
                <div className="endo-progress-track">
                  <div className="endo-progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                  {formatCurrency(stats.disbursed)} dari {formatCurrency(stats.totalRaised)} telah disalurkan
                </p>
              </div>

              {/* Disbursement History */}
              <div className="endo-disbursements">
                <div className="endo-disb-header">
                  <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0e4d6d, #06958a)', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users style={{ width: 16, height: 16, color: 'white' }} />
                  </div>
                  <span className="endo-disb-title">Riwayat Penyaluran Terbaru</span>
                  {disbursements.length > 0 && (
                    <span className="endo-disb-count">{disbursements.length} transaksi</span>
                  )}
                </div>

                {disbursements.length === 0 ? (
                  <div className="endo-empty">
                    <div style={{ width: 56, height: 56, background: '#f0f9ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                      <Heart style={{ width: 24, height: 24, color: '#cbd5e1' }} />
                    </div>
                    <p>Belum ada riwayat penyaluran dana abadi.</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Dana yang terkumpul akan segera disalurkan ke komunitas yang membutuhkan.</p>
                  </div>
                ) : (
                  disbursements.map((item: any, idx: number) => (
                    <div key={idx} className="endo-disb-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div className="endo-disb-icon">
                          <Users style={{ width: 16, height: 16, color: '#06958a' }} />
                        </div>
                        <div>
                          <p className="endo-disb-name">{item.community?.name || "Bantuan Komunitas"}</p>
                          {item.notes && <p className="endo-disb-notes">{item.notes}</p>}
                        </div>
                      </div>
                      <span className="endo-disb-amount">{formatCurrency(item.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="endo-section">
          <div className="endo-container">
            <div className="text-center" style={{ marginBottom: '3rem' }}>
              <div className="endo-eyebrow mx-auto" style={{ justifyContent: 'center' }}>
                <span className="endo-eyebrow-dot" />
                Mekanisme Dana Abadi
              </div>
              <h2 className="endo-section-title">Bagaimana Dana Abadi Bekerja?</h2>
              <p className="endo-section-desc mx-auto">
                Proses transparan dari surplus donasi hingga penyaluran ke komunitas yang membutuhkan.
              </p>
            </div>
            <div className="endo-how-grid">
              {howItWorks.map((h) => (
                <div key={h.step} className="endo-how-card">
                  <div className="endo-how-step">{h.step}</div>
                  <h3 className="endo-how-title">{h.title}</h3>
                  <p className="endo-how-desc">{h.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust indicators */}
            <div style={{ marginTop: '3.5rem', padding: '1.75rem 2rem', background: '#f0f9ff', borderRadius: '1.25rem', border: '1.5px solid rgba(6,149,138,0.12)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #0e4d6d, #06958a)', borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck style={{ width: 22, height: 22, color: 'white' }} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0e2a3a', marginBottom: '0.25rem' }}>Diaudit & Dipantau Publik</p>
                <p style={{ fontSize: 0.875+'rem', color: '#64748b', lineHeight: 1.55 }}>Seluruh transaksi dana abadi dicatat di sistem kami dan dapat dipantau oleh siapa saja. Kami berkomitmen pada transparansi penuh.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {["Laporan publik real-time", "Verifikasi admin terlatih", "Audit berkala"].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#374151' }}>
                    <CheckCircle style={{ width: 15, height: 15, color: '#06958a', flexShrink: 0 }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="endo-cta">
          <div className="endo-cta-bg" />
          <div className="endo-cta-glow" />
          <div className="endo-cta-inner">
            <div className="endo-cta-badge">
              <Zap style={{ width: 12, height: 12 }} />
              Bergabung Sekarang
            </div>
            <h2 className="endo-cta-title">Kontribusi Anda Berarti<br />bagi Laut Indonesia</h2>
            <p className="endo-cta-desc">
              Dukung kegiatan konservasi laut favorit Anda. Surplus donasi otomatis masuk ke Dana Abadi dan membantu komunitas yang membutuhkan.
            </p>
            <div className="endo-cta-btns">
              <Link href="/activities" className="endo-cta-btn-primary">
                Mulai Berdonasi <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/about" className="endo-cta-btn-ghost">
                Pelajari Lebih Lanjut
              </Link>
            </div>

            {/* Trust badges */}
            <div className="endo-trust">
              {["100% Transparan", "Dana Terverifikasi", "Dampak Nyata"].map(t => (
                <div key={t} className="endo-trust-item">
                  <CheckCircle style={{ width: 14, height: 14, color: '#67e8f9' }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
