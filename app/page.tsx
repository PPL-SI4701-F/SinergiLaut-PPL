import Link from "next/link"
import Image from "next/image"

import { Footer } from "@/components/footer"
import {
  ArrowRight, Users, Heart, Leaf, Calendar, MapPin,
  CheckCircle, Search, Gift, LineChart, FileText,
  Sparkles, Fish, Waves, Anchor, Zap, ShieldCheck,
  TrendingUp, Globe, Star
} from "lucide-react"
const stats = [
  { icon: Users, value: "15,000+", label: "Relawan Aktif" },
  { icon: Globe, value: "250+", label: "Kegiatan Berlangsung" },
  { icon: Anchor, value: "50+", label: "Area Pesisir Terlindungi" },
  { icon: Heart, value: "Rp 2,5M+", label: "Dana Terkumpul" },
]

const pillars = [
  {
    icon: ShieldCheck,
    title: "100% Transparan",
    description: "Setiap donasi dan kegiatan dipantau secara publik. Laporan real-time tersedia untuk semua kontributor.",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
  },
  {
    icon: Users,
    title: "Komunitas Lokal",
    description: "Dipimpin oleh komunitas yang memahami kebutuhan nyata ekosistem laut di wilayah mereka.",
    color: "#06958a",
    bg: "rgba(6,149,138,0.08)",
  },
  {
    icon: TrendingUp,
    title: "Dampak Nyata",
    description: "Dari pembersihan pantai hingga restorasi terumbu karang — setiap aksi meninggalkan jejak positif.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
  },
]

const donationSteps = [
  { step: "01", icon: Search, title: "Pilih Kegiatan", desc: "Telusuri dan pilih aksi pelestarian lingkungan atau pesisir yang ingin Anda dukung." },
  { step: "02", icon: Gift, title: "Pilih Jenis Donasi", desc: "Sumbangkan sejumlah dana atau belikan barang yang sedang dibutuhkan oleh relawan." },
  { step: "03", icon: LineChart, title: "Pantau Eksekusi", desc: "Lacak setiap progres pendanaan dan persiapan aksi secara transparan dan real-time." },
  { step: "04", icon: FileText, title: "Terima Laporan", desc: "Buka tab laporan untuk melihat bukti dokumen RAB dan galeri foto hasil kegiatan." },
]


import { createClient } from "@/lib/supabase/server"
import { formatDate } from "@/lib/utils/helpers"
import { Navigation } from "@/components/navigation"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: realActivities } = await supabase
    .from("activities")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3)

  let featuredActivities: any[] = []
  if (realActivities) {
    featuredActivities = realActivities.map(d => ({
      id: d.id,
      title: d.title,
      description: d.description,
      image: d.cover_image_url || "/images/placeholder.jpg",
      category: "Konservasi",
      date: formatDate(d.start_date || new Date().toISOString()),
      location: d.location || "Online",
      volunteers: d.volunteer_count || 0
    }))
  }

  const { data: realCompletedActivities } = await supabase
    .from("activities")
    .select("*")
    .eq("status", "completed")
    .order("start_date", { ascending: false })
    .limit(2)

  let completedActivities: any[] = []
  if (realCompletedActivities) {
    completedActivities = realCompletedActivities.map(d => ({
      id: d.id,
      title: d.title,
      description: d.description,
      image: d.cover_image_url || "/images/placeholder.jpg",
      category: "Konservasi",
      date: formatDate(d.start_date || new Date().toISOString()),
      location: d.location || "Online",
      volunteers: d.volunteer_count || 0
    }))
  }


  

  

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        /* ── HERO ── */
        .home-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          padding: 6rem 1.5rem 6rem;
          text-align: center;
        }
        .home-hero-bg {
          position: absolute; inset: 0;
          background-image: url('/images/hero-ocean.jpg');
          background-size: cover;
          background-position: center 40%;
        }
        .home-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            160deg,
            rgba(2, 14, 36, 0.92) 0%,
            rgba(4, 55, 82, 0.78) 50%,
            rgba(3, 40, 60, 0.92) 100%
          );
        }
        .home-hero-particles {
          position: absolute; inset: 0;
          background-image:
            radial-gradient(circle, rgba(103,232,249,0.14) 1px, transparent 1px),
            radial-gradient(circle, rgba(165,243,252,0.08) 1px, transparent 1px);
          background-size: 55px 55px, 28px 28px;
          background-position: 0 0, 14px 14px;
          animation: particleDrift 28s linear infinite;
          pointer-events: none;
        }
        @keyframes particleDrift {
          from { transform: translateY(0); }
          to { transform: translateY(-60px); }
        }
        .home-hero-content { position: relative; z-index: 10; max-width: 860px; }

        .home-hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(103,232,249,0.12);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(103,232,249,0.28);
          color: #a5f3fc;
          font-size: 0.8125rem; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 0.45rem 1.25rem; border-radius: 9999px;
          margin-bottom: 2.5rem;
        }

        .home-hero-logo {
          width: 88px; height: 88px;
          background: white;
          border-radius: 1.5rem;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 2rem;
          box-shadow: 0 8px 40px rgba(6,149,138,0.4), 0 0 0 6px rgba(255,255,255,0.1);
          padding: 1rem;
          animation: logoPulse 4s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%,100% { box-shadow: 0 8px 40px rgba(6,149,138,0.4), 0 0 0 6px rgba(255,255,255,0.1); }
          50% { box-shadow: 0 12px 60px rgba(6,149,138,0.6), 0 0 0 10px rgba(255,255,255,0.06); }
        }

        .home-hero-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900; color: white;
          line-height: 1.08; letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
        }
        .home-hero-title .shimmer {
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

        .home-hero-desc {
          font-size: 1.125rem; color: rgba(255,255,255,0.72);
          line-height: 1.75; max-width: 620px; margin: 0 auto 3rem;
        }

        .home-hero-btns {
          display: flex; gap: 1rem; flex-wrap: wrap;
          align-items: center; justify-content: center;
          margin-bottom: 3.5rem;
        }
        .home-btn-primary {
          padding: 1rem 2.25rem;
          background: linear-gradient(135deg, #06958a, #0e7268);
          color: white; border: none; border-radius: 0.875rem;
          font-size: 1rem; font-weight: 700;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(6,149,138,0.45);
        }
        .home-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(6,149,138,0.55); }
        .home-btn-ghost {
          padding: 1rem 2.25rem;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          color: white; border: 1.5px solid rgba(255,255,255,0.25);
          border-radius: 0.875rem;
          font-size: 1rem; font-weight: 600;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
        }
        .home-btn-ghost:hover { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.4); }

        /* Hero scroll indicator */
        .home-hero-scroll {
          position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%);
          z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
        }
        .home-hero-scroll span {
          font-size: 0.75rem; color: rgba(255,255,255,0.45); letter-spacing: 0.08em; text-transform: uppercase;
        }
        .home-scroll-dot {
          width: 24px; height: 38px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          display: flex; align-items: flex-start; justify-content: center;
          padding-top: 6px;
        }
        .home-scroll-dot::after {
          content: '';
          width: 4px; height: 8px;
          background: rgba(255,255,255,0.6);
          border-radius: 2px;
          animation: scrollBounce 1.8s ease-in-out infinite;
        }
        @keyframes scrollBounce {
          0%,100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.3; }
        }

        /* Wave */
        .home-wave { position: absolute; bottom: -2px; left: 0; right: 0; z-index: 5; line-height: 0; }

        /* ── Stats Bar ── */
        .home-stats-wrapper {
          position: relative;
          z-index: 20;
          margin-top: 3.5rem;
          margin-bottom: 0;
          padding: 0;
        }
        .home-stats-bar {
          background: linear-gradient(135deg, #06958a, #0e7268);
          border-radius: 1.5rem;
          box-shadow: 0 16px 40px rgba(6, 149, 138, 0.25);
          padding: 2.5rem 2rem;
          position: relative;
          overflow: hidden;
          max-width: 1000px;
          margin: 0 auto;
        }
        @media (max-width: 640px) {
          .home-stats-bar { padding: 1.5rem 1rem; border-radius: 1.25rem; }
        }
        .home-stats-glow { display: none; }
        .home-stats-inner {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 480px) {
          .home-stats-inner { gap: 1rem 0.5rem; }
        }
        @media(min-width:768px){ .home-stats-inner{ grid-template-columns: repeat(4, 1fr); } }
        .home-stat-item {
          text-align: center;
          padding: 0 0.5rem;
          border-right: 1px solid rgba(255,255,255,0.15);
        }
        .home-stat-item:nth-child(2), .home-stat-item:last-child { border-right: none; }
        @media(min-width:768px){
          .home-stat-item { padding-right: 1.5rem; }
          .home-stat-item:nth-child(2){ border-right: 1px solid rgba(255,255,255,0.15); }
          .home-stat-item:last-child{ border-right: none; }
        }
        .home-stat-icon-wrap {
          width: 46px; height: 46px;
          background: rgba(255,255,255,0.12);
          border-radius: 0.875rem;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 0.875rem;
          backdrop-filter: blur(4px);
        }
        .home-stat-val { font-size: 1.875rem; font-weight: 900; color: white; line-height: 1; margin-bottom: 0.375rem; letter-spacing: -0.03em; }
        .home-stat-lbl { font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.08em; }
        @media (max-width: 640px) {
          .home-stat-val { font-size: 1.375rem; }
          .home-stat-lbl { font-size: 0.65rem; }
          .home-stat-icon-wrap { width: 38px; height: 38px; margin-bottom: 0.5rem; }
        }

        /* ── Sections ── */
        .home-section { padding: 6rem 1.5rem; }
        .home-section-alt {
          padding: 6rem 1.5rem;
          background: linear-gradient(165deg, #f8fafc 0%, #eff6ff 100%);
          position: relative;
          overflow: hidden;
        }
        .home-section-alt::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle at 20% 30%, rgba(6,149,138,0.03) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, rgba(59,130,246,0.03) 0%, transparent 50%);
          pointer-events: none;
        }
        .home-container { max-width: 1200px; margin: 0 auto; }
        .home-container-md { max-width: 900px; margin: 0 auto; }
        .home-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: #06958a; margin-bottom: 0.875rem;
        }
        .home-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #06958a; }
        .home-section-title {
          font-size: clamp(1.75rem, 3.5vw, 2.625rem);
          font-weight: 800; color: #0e2a3a;
          line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 1rem;
        }
        .home-section-desc { font-size: 1.0625rem; color: #475569; line-height: 1.7; max-width: 580px; }
        .text-center { text-align: center; }
        .mx-auto { margin-left: auto; margin-right: auto; }

        /* ── Intro Banner ── */
        .home-intro-card {
          background: white;
          border-radius: 1.75rem;
          padding: 3rem 2.5rem;
          border: 1.5px solid rgba(6,149,138,0.12);
          box-shadow: 0 8px 40px rgba(6,149,138,0.08);
          max-width: 860px; margin: 0 auto;
          text-align: center;
        }
        .home-intro-title {
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          font-weight: 800; color: #0e2a3a;
          letter-spacing: -0.02em; margin-bottom: 1rem;
        }
        .home-intro-desc {
          font-size: 1.0625rem; color: #475569;
          line-height: 1.75; margin-bottom: 2rem; max-width: 640px; margin-left: auto; margin-right: auto;
        }
        .home-intro-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          color: white; border-radius: 0.875rem;
          font-size: 0.9375rem; font-weight: 700;
          text-decoration: none; transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(6,149,138,0.3);
        }
        .home-intro-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(6,149,138,0.4); }

        /* ── Pillar Cards ── */
        .home-pillars-grid {
          display: grid; gap: 2rem;
          grid-template-columns: 1fr;
        }
        @media(min-width:768px){ .home-pillars-grid{ grid-template-columns: repeat(3,1fr); } }
        .home-pillar-card {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 1.75rem;
          padding: 2.75rem 2.25rem;
          border: 1.5px solid rgba(255, 255, 255, 0.65);
          box-shadow: 
            0 4px 10px rgba(0, 0, 0, 0.02),
            0 14px 28px rgba(0, 0, 0, 0.04);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; align-items: flex-start;
          text-align: left;
        }
        .home-pillar-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: transparent; transition: background 0.4s ease;
        }
        .home-pillar-card:hover { 
          transform: translateY(-10px) scale(1.01);
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 
            0 15px 35px rgba(0, 0, 0, 0.05),
            0 30px 60px rgba(0, 0, 0, 0.08);
          border-color: rgba(255, 255, 255, 0.95);
        }
        .home-pillar-icon {
          width: 58px; height: 58px; border-radius: 1.25rem;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.75rem; position: relative;
          box-shadow: 0 8px 20px -5px rgba(0,0,0,0.1);
          transition: all 0.4s ease;
        }
        .home-pillar-card:hover .home-pillar-icon { transform: scale(1.1) rotate(5deg); }
        .home-pillar-icon::after {
          content: ''; position: absolute; inset: -4px; border-radius: 1.45rem;
          background: inherit; filter: blur(12px); opacity: 0; transition: opacity 0.4s; z-index: -1;
        }
        .home-pillar-card:hover .home-pillar-icon::after { opacity: 0.5; }
        .home-pillar-title { 
          font-size: 1.25rem; font-weight: 800; color: #0e2a3a; margin-bottom: 0.875rem;
          letter-spacing: -0.01em; 
        }
        .home-pillar-desc { 
          font-size: 1rem; color: #475569; line-height: 1.7; 
          font-weight: 450;
        }

        /* ── Activity Cards ── */
        .home-act-grid {
          display: grid; gap: 1.5rem;
          grid-template-columns: 1fr;
        }
        @media(min-width:640px){ .home-act-grid{ grid-template-columns: repeat(2,1fr); } }
        @media(min-width:1024px){ .home-act-grid{ grid-template-columns: repeat(3,1fr); } }

        .home-act-card {
          background: white;
          border-radius: 1.25rem;
          overflow: hidden;
          border: 1.5px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.3s ease;
          display: flex; flex-direction: column;
        }
        .home-act-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
        .home-act-img { position: relative; height: 200px; overflow: hidden; }
        .home-act-img img { transition: transform 0.4s ease; }
        .home-act-card:hover .home-act-img img { transform: scale(1.05); }
        .home-act-badge {
          position: absolute; top: 12px; left: 12px;
          background: rgba(14,77,109,0.85);
          backdrop-filter: blur(8px);
          color: white;
          font-size: 0.75rem; font-weight: 700;
          padding: 0.3rem 0.875rem; border-radius: 9999px;
          text-transform: capitalize; border: 1px solid rgba(255,255,255,0.2);
        }
        .home-act-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
        .home-act-title { font-size: 1rem; font-weight: 700; color: #0e2a3a; margin-bottom: 0.5rem; line-height: 1.3; }
        .home-act-desc { font-size: 0.875rem; color: #64748b; line-height: 1.65; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .home-act-meta { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
        .home-act-meta-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #64748b; }
        .home-act-btn {
          margin-top: auto;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.7rem 1rem;
          background: transparent;
          color: #0e4d6d; border: 1.5px solid rgba(14,77,109,0.2);
          border-radius: 0.75rem;
          font-size: 0.875rem; font-weight: 600;
          text-decoration: none; transition: all 0.2s ease;
        }
        .home-act-btn:hover { background: rgba(14,77,109,0.05); border-color: rgba(14,77,109,0.4); }

        /* ── Completed Cards ── */
        .home-comp-grid {
          display: grid; gap: 1.5rem;
          grid-template-columns: 1fr;
        }
        @media(min-width:768px){ .home-comp-grid{ grid-template-columns: repeat(2,1fr); } }
        .home-comp-card {
          display: flex; flex-direction: row;
          background: white;
          border-radius: 1.25rem;
          overflow: hidden;
          border: 1.5px solid rgba(34,197,94,0.15);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.3s ease;
        }
        .home-comp-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(34,197,94,0.12); }
        .home-comp-img { position: relative; width: 160px; flex-shrink: 0; overflow: hidden; }
        .home-comp-img img { transition: transform 0.4s ease; }
        .home-comp-card:hover .home-comp-img img { transform: scale(1.05); }
        .home-comp-badge {
          position: absolute; top: 10px; left: 10px; z-index: 1;
          display: flex; align-items: center; gap: 0.35rem;
          background: #16a34a;
          color: white; font-size: 0.7rem; font-weight: 700;
          padding: 0.25rem 0.625rem; border-radius: 9999px;
        }
        .home-comp-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
        .home-comp-title { font-size: 0.9375rem; font-weight: 700; color: #0e2a3a; margin-bottom: 0.5rem; line-height: 1.3; }
        .home-comp-desc { font-size: 0.8125rem; color: #64748b; line-height: 1.65; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
        .home-comp-meta { display: flex; align-items: center; gap: 1rem; font-size: 0.8rem; color: #64748b; margin-bottom: 1rem; }
        .home-comp-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: white; border: none; border-radius: 0.75rem;
          font-size: 0.8125rem; font-weight: 700;
          text-decoration: none; transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(22,163,74,0.3);
        }
        .home-comp-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(22,163,74,0.4); }

        /* ── Mission Section ── */
        .home-mission-grid {
          display: grid; gap: 4rem; grid-template-columns: 1fr;
          align-items: center;
        }
        @media(min-width:1024px){ .home-mission-grid{ grid-template-columns: 1fr 1fr; } }
        .home-mission-img {
          border-radius: 1.5rem; overflow: hidden;
          height: 420px; position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .home-mission-features { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 2rem; }
        .home-mission-feat {
          display: flex; align-items: flex-start; gap: 1rem;
          padding: 1.25rem;
          background: white; border-radius: 1rem;
          border: 1.5px solid rgba(6,149,138,0.1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          transition: all 0.2s ease;
        }
        .home-mission-feat:hover { transform: translateX(4px); box-shadow: 0 4px 16px rgba(6,149,138,0.1); }
        .home-mission-feat-icon {
          width: 44px; height: 44px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(14,77,109,0.1), rgba(6,149,138,0.12));
          border-radius: 0.75rem;
          display: flex; align-items: center; justify-content: center;
        }
        .home-mission-feat-title { font-size: 0.9375rem; font-weight: 700; color: #0e2a3a; margin-bottom: 0.25rem; }
        .home-mission-feat-desc { font-size: 0.8125rem; color: #64748b; line-height: 1.55; }

        /* ── How to Donate ── */
        .home-how-grid {
          display: grid; gap: 1.5rem;
          grid-template-columns: 1fr;
          position: relative;
        }
        @media(min-width:640px){ .home-how-grid{ grid-template-columns: repeat(2,1fr); } }
        @media(min-width:1024px){ .home-how-grid{ grid-template-columns: repeat(4,1fr); } }
        .home-how-card {
          background: white;
          border-radius: 1.25rem;
          padding: 2rem 1.5rem;
          border: 1.5px solid rgba(6,149,138,0.1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
          text-align: center;
        }
        .home-how-card:hover { transform: translateY(-4px); box-shadow: 0 14px 35px rgba(6,149,138,0.1); }
        .home-how-icon {
          width: 60px; height: 60px;
          background: linear-gradient(135deg, rgba(14,77,109,0.08), rgba(6,149,138,0.12));
          border-radius: 1rem;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
          transition: transform 0.2s ease;
        }
        .home-how-card:hover .home-how-icon { transform: scale(1.08); }
        .home-how-step {
          font-size: 2.5rem; font-weight: 900;
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          line-height: 1; margin-bottom: 0.75rem; opacity: 0.4;
        }
        .home-how-title { font-size: 0.9375rem; font-weight: 700; color: #0e2a3a; margin-bottom: 0.5rem; }
        .home-how-desc { font-size: 0.8125rem; color: #64748b; line-height: 1.65; }

        /* ── CTA ── */
        .home-cta {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #031c36 0%, #043752 45%, #032836 100%);
          padding: 6rem 1.5rem; text-align: center;
        }
        .home-cta-bg {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(103,232,249,0.07) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none;
        }
        .home-cta-glow {
          position: absolute;
          width: 700px; height: 500px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(6,149,138,0.2), transparent 70%);
          top: -150px; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .home-cta-inner { position: relative; z-index: 1; max-width: 700px; margin: 0 auto; }
        .home-cta-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(103,232,249,0.1); border: 1px solid rgba(103,232,249,0.22);
          color: #a5f3fc; font-size: 0.8125rem; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
          padding: 0.4rem 1.25rem; border-radius: 9999px; margin-bottom: 1.5rem;
        }
        .home-cta-title {
          font-size: clamp(2rem, 4.5vw, 3.25rem); font-weight: 900; color: white;
          letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 1.25rem;
        }
        .home-cta-desc { font-size: 1.0625rem; color: rgba(255,255,255,0.62); line-height: 1.7; margin-bottom: 2.5rem; }
        .home-cta-btns { display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; }
        .home-cta-btn-primary {
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, #06958a, #04756c);
          color: white; border: none; border-radius: 0.875rem;
          font-size: 1rem; font-weight: 700; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(6,149,138,0.4);
        }
        .home-cta-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(6,149,138,0.55); }
        .home-cta-btn-ghost {
          padding: 1rem 2.5rem;
          background: rgba(255,255,255,0.07); backdrop-filter: blur(10px);
          color: white; border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 0.875rem; font-size: 1rem; font-weight: 600;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
        }
        .home-cta-btn-ghost:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.32); }
        .home-trust { display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap; margin-top: 2.5rem; }
        .home-trust-item { display: flex; align-items: center; gap: 0.5rem; color: rgba(255,255,255,0.5); font-size: 0.8125rem; }

        /* ── View All Button ── */
        .home-view-all {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.875rem 2.25rem;
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          color: white; border-radius: 0.875rem;
          font-size: 0.9375rem; font-weight: 700;
          text-decoration: none; transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(6,149,138,0.3);
        }
        .home-view-all:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(6,149,138,0.4); }
      `}</style>

      <Navigation />
      <main style={{ flex: 1 }}>

        {/* ── HERO ── */}
        <section className="home-hero">
          <div className="home-hero-bg" />
          <div className="home-hero-overlay" />
          <div className="home-hero-particles" />

          <div className="home-hero-content">
            <div className="home-hero-badge">
              <Sparkles style={{ width: 12, height: 12 }} />
              Platform Konservasi Laut Indonesia
            </div>

            <div className="home-hero-logo">
              <Image
                src="/images/SinergiLautLogo-transparent.png"
                alt="SinergiLaut Logo"
                width={64}
                height={64}
                style={{ width: "100%", height: "auto", objectFit: "contain" }}
                priority
              />
            </div>

            <h1 className="home-hero-title">
              Bersama Jaga<br />
              <span className="shimmer">Laut Indonesia</span>
            </h1>
            <p className="home-hero-desc">
              Terhubung dengan komunitas konservasi, relawan, dan donatur untuk menciptakan dampak nyata bagi ekosistem laut Nusantara.
            </p>
            <div className="home-hero-btns">
              <Link href="/activities" className="home-btn-primary">
                Lihat Kegiatan <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
              <Link href="/register" className="home-btn-ghost">
                Daftar Gratis
              </Link>
            </div>

            {/* ── STATS BAR ── */}
            <div className="home-stats-wrapper">
              <section className="home-stats-bar">
                <div className="home-stats-glow" />
                <div className="home-stats-inner">
                  {stats.map((s) => (
                    <div key={s.label} className="home-stat-item">
                      <div className="home-stat-icon-wrap">
                        <s.icon style={{ width: 22, height: 22, color: "rgba(255,255,255,0.95)" }} />
                      </div>
                      <div className="home-stat-val">{s.value}</div>
                      <div className="home-stat-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Scroll indicator */}


          <div className="home-wave">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
              <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ── INTRO ── */}
        <section className="home-section">
          <div className="home-container">
            <div className="home-intro-card">
              <div className="home-eyebrow mx-auto" style={{ justifyContent: "center" }}>
                <span className="home-eyebrow-dot" />
                Tentang SinergiLaut
              </div>
              <h2 className="home-intro-title">Mengenal SinergiLaut Lebih Dekat</h2>
              <p className="home-intro-desc">
                SinergiLaut hadir sebagai wadah kolaboratif yang menghubungkan berbagai elemen masyarakat — dari relawan, donatur, hingga komunitas lokal — untuk bersinergi melindungi dan menjaga kelestarian ekosistem laut Nusantara melalui aksi nyata dan berkesinambungan.
              </p>
              <Link href="/about" className="home-intro-btn">
                Pelajari Lebih Lanjut <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── PILLARS ── */}
        <section className="home-section-alt">
          <div className="home-container">
            <div className="text-center" style={{ marginBottom: "3rem" }}>
              <div className="home-eyebrow mx-auto" style={{ justifyContent: "center" }}>
                <span className="home-eyebrow-dot" />
                Nilai Kami
              </div>
              <h2 className="home-section-title">Dibangun di Atas Tiga Prinsip</h2>
              <p className="home-section-desc mx-auto">
                Fondasi kuat yang membuat setiap langkah konservasi kami bermakna dan berdampak.
              </p>
            </div>
            <div className="home-pillars-grid">
              {pillars.map((p, i) => (
                <div key={p.title} className="home-pillar-card">
                  <style>{`.home-pillar-card:nth-child(${i + 1})::before { background: ${p.color}; }`}</style>
                  <div className="home-pillar-icon" style={{ background: p.bg }}>
                    <p.icon style={{ width: 26, height: 26, color: p.color }} />
                  </div>
                  <h3 className="home-pillar-title">{p.title}</h3>
                  <p className="home-pillar-desc">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED ACTIVITIES ── */}
        <section className="home-section">
          <div className="home-container">
            <div className="text-center" style={{ marginBottom: "3rem" }}>
              <div className="home-eyebrow mx-auto" style={{ justifyContent: "center" }}>
                <span className="home-eyebrow-dot" />
                Kegiatan Unggulan
              </div>
              <h2 className="home-section-title">Kegiatan Konservasi Terbaru</h2>
              <p className="home-section-desc mx-auto">
                Temukan cara bermakna untuk berkontribusi bagi pelestarian laut melalui berbagai program kami.
              </p>
            </div>

            {featuredActivities.length > 0 ? (
              <div className="home-act-grid">
                {featuredActivities.map((activity) => (
                  <div key={activity.id} className="home-act-card">
                    <div className="home-act-img">
                      <Image src={activity.image} alt={activity.title} fill className="object-cover" />
                      <span className="home-act-badge">{activity.category || "Konservasi"}</span>
                    </div>
                    <div className="home-act-body">
                      <h3 className="home-act-title">{activity.title}</h3>
                      <p className="home-act-desc">{activity.description}</p>
                      <div className="home-act-meta">
                        <div className="home-act-meta-item">
                          <Calendar style={{ width: 14, height: 14, color: "#06958a" }} />
                          {activity.date}
                        </div>
                        <div className="home-act-meta-item">
                          <MapPin style={{ width: 14, height: 14, color: "#06958a" }} />
                          {activity.location}
                        </div>
                        <div className="home-act-meta-item">
                          <Users style={{ width: 14, height: 14, color: "#06958a" }} />
                          {activity.volunteers} relawan
                        </div>
                      </div>
                      <Link href={`/activities/${activity.id}`} className="home-act-btn">
                        Lihat Detail <ArrowRight style={{ width: 14, height: 14 }} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                <Leaf style={{ width: 48, height: 48, margin: "0 auto 1rem", color: "#94a3b8" }} />
                <p>Belum ada kegiatan yang dipublikasikan.</p>
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <Link href="/activities" className="home-view-all">
                Lihat Semua Kegiatan <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── COMPLETED ACTIVITIES ── */}
        {completedActivities.length > 0 && (
          <section className="home-section-alt">
            <div className="home-container">
              <div className="text-center" style={{ marginBottom: "3rem" }}>
                <div className="home-eyebrow mx-auto" style={{ justifyContent: "center" }}>
                  <span className="home-eyebrow-dot" style={{ background: "#16a34a" }} />
                  <span style={{ color: "#16a34a" }}>Keberhasilan Kami</span>
                </div>
                <h2 className="home-section-title">Konservasi yang Berhasil</h2>
                <p className="home-section-desc mx-auto">
                  Aksi nyata yang telah berhasil diselesaikan berkat dukungan donatur dan relawan luar biasa kami.
                </p>
              </div>
              <div className="home-comp-grid">
                {completedActivities.map((activity) => (
                  <div key={activity.id} className="home-comp-card">
                    <div className="home-comp-img">
                      <Image src={activity.image} alt={activity.title} fill className="object-cover" />
                      <div className="home-comp-badge">
                        <CheckCircle style={{ width: 10, height: 10 }} /> Selesai
                      </div>
                    </div>
                    <div className="home-comp-body">
                      <h3 className="home-comp-title">{activity.title}</h3>
                      <p className="home-comp-desc">{activity.description}</p>
                      <div className="home-comp-meta">
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Users style={{ width: 13, height: 13, color: "#16a34a" }} />
                          {activity.volunteers} relawan
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin style={{ width: 13, height: 13, color: "#16a34a" }} />
                          {activity.location.split(",")[0]}
                        </span>
                      </div>
                      <Link href={`/activities/${activity.id}`} className="home-comp-btn">
                        Lihat Laporan <ArrowRight style={{ width: 13, height: 13 }} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── MISSION ── */}
        <section className="home-section">
          <div className="home-container">
            <div className="home-mission-grid">
              <div>
                <div className="home-eyebrow">
                  <span className="home-eyebrow-dot" />
                  Misi Kami
                </div>
                <h2 className="home-section-title">Konservasi Laut yang Berkelanjutan</h2>
                <p className="home-section-desc" style={{ marginBottom: "0.5rem" }}>
                  SinergiLaut menyatukan individu, organisasi, dan korporasi yang peduli untuk menciptakan perubahan positif jangka panjang bagi ekosistem laut kita.
                </p>
                <div className="home-mission-features">
                  {[
                    { icon: Users, title: "Komunitas di Garis Depan", desc: "Kami memberdayakan komunitas lokal untuk memimpin upaya konservasi di wilayah mereka." },
                    { icon: Heart, title: "Dampak Transparan", desc: "Setiap donasi dan usaha dilacak dan dilaporkan secara terbuka kepada publik." },
                    { icon: Leaf, title: "Aksi Berkesinambungan", desc: "Program-program dirancang untuk menciptakan perubahan jangka panjang, bukan hanya aksi sesaat." },
                  ].map((f) => (
                    <div key={f.title} className="home-mission-feat">
                      <div className="home-mission-feat-icon">
                        <f.icon style={{ width: 20, height: 20, color: "#06958a" }} />
                      </div>
                      <div>
                        <p className="home-mission-feat-title">{f.title}</p>
                        <p className="home-mission-feat-desc">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="home-mission-img">
                <Image src="/images/mission-ocean.jpg" alt="Ocean conservation in action" fill className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW TO DONATE ── */}
        <section className="home-section-alt">
          <div className="home-container">
            <div className="text-center" style={{ marginBottom: "3rem" }}>
              <div className="home-eyebrow mx-auto" style={{ justifyContent: "center" }}>
                <span className="home-eyebrow-dot" />
                Cara Berdonasi
              </div>
              <h2 className="home-section-title">Mudah & Transparan dalam 4 Langkah</h2>
              <p className="home-section-desc mx-auto">
                Langkah sederhana untuk ikut berkontribusi dalam menjaga kelestarian laut Indonesia.
              </p>
            </div>
            <div className="home-how-grid">
              {donationSteps.map((d) => (
                <div key={d.step} className="home-how-card">
                  <div className="home-how-step">{d.step}</div>
                  <div className="home-how-icon">
                    <d.icon style={{ width: 26, height: 26, color: "#06958a" }} />
                  </div>
                  <h3 className="home-how-title">{d.title}</h3>
                  <p className="home-how-desc">{d.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <Link href="/activities" className="home-view-all">
                Mulai Berdonasi Sekarang <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="home-cta">
          <div className="home-cta-bg" />
          <div className="home-cta-glow" />
          <div className="home-cta-inner">
            <div className="home-cta-badge">
              <Zap style={{ width: 12, height: 12 }} />
              Bergabung Sekarang
            </div>
            <h2 className="home-cta-title">
              Jadilah Bagian dari<br />Gerakan Laut Bersih
            </h2>
            <p className="home-cta-desc">
              Daftarkan diri atau komunitasmu dan mulai berkontribusi nyata bagi kelestarian ekosistem laut Indonesia hari ini.
            </p>
            <div className="home-cta-btns">
              <Link href="/register" className="home-cta-btn-primary">
                Daftar Gratis <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/activities" className="home-cta-btn-ghost">
                Lihat Kegiatan
              </Link>
            </div>
            <div className="home-trust">
              {["100% Transparan", "Komunitas Terverifikasi", "Dampak Nyata", "Gratis Bergabung"].map(t => (
                <div key={t} className="home-trust-item">
                  <CheckCircle style={{ width: 14, height: 14, color: "#67e8f9" }} />
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
