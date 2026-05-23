"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
  ArrowRight,
  Users,
  MapPin,
  Globe,
  Award,
  Building,
  Search,
  CheckCircle,
  FileText,
  Shield,
  Heart,
  Star,
  Activity,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import {
  getRegisteredCommunities,
  getAdminDashboardStats,
} from "@/lib/actions/dashboard.actions";
import { createClient } from "@/lib/supabase/client";

const requirements = [
  {
    icon: Building,
    title: "Organisasi Legal",
    description:
      "Harus merupakan organisasi, LSM, atau kelompok komunitas terdaftar dengan dokumentasi resmi.",
  },
  {
    icon: Users,
    title: "Anggota Aktif",
    description:
      "Minimal 10 anggota aktif yang berkomitmen pada kegiatan konservasi laut.",
  },
  {
    icon: Activity,
    title: "Fokus Konservasi",
    description:
      "Fokus utama pada konservasi laut, pesisir, edukasi, atau keberlanjutan lingkungan bahari.",
  },
  {
    icon: Shield,
    title: "Komitmen Standar",
    description:
      "Menyetujui pedoman komunitas SinergiLaut dan standar etika yang berlaku.",
  },
];

const benefits = [
  {
    icon: Globe,
    title: "Halaman Komunitas",
    description:
      "Halaman bermerek sendiri untuk menampilkan kegiatan dan menarik sukarelawan.",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
  },
  {
    icon: Activity,
    title: "Manajemen Kegiatan",
    description:
      "Buat, publikasikan, dan kelola kegiatan konservasi dengan pendaftaran relawan.",
    color: "#06958a",
    bg: "rgba(6,149,138,0.08)",
  },
  {
    icon: Heart,
    title: "Penerimaan Donasi",
    description:
      "Terima donasi langsung untuk kegiatan Anda dengan pelacakan transparan.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
  },
  {
    icon: Users,
    title: "Jaringan Relawan",
    description:
      "Terhubung dengan ribuan sukarelawan bersemangat di seluruh Indonesia.",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
  },
  {
    icon: Star,
    title: "Visibilitas & Pengakuan",
    description:
      "Tampil di platform kami dan dapatkan pengakuan atas kerja konservasi Anda.",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.08)",
  },
  {
    icon: Award,
    title: "Lencana Terverifikasi",
    description:
      "Dapatkan lencana terverifikasi untuk membangun kepercayaan relawan dan donatur.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
  },
];

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [focusOpen, setFocusOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [registeredCommunities, setRegisteredCommunities] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [completedCount, setCompletedCount] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRegisteredCommunities().then((data: any) => setRegisteredCommunities(data))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getAdminDashboardStats().then((data: any) => setGlobalStats(data))
    const supabase = createClient()
    supabase
      .from("activities")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .then(({ count }) => setCompletedCount(count ?? 0))
  }, []);

  const focusAreas = Array.from(
    new Set(registeredCommunities.flatMap((c) => c.focus_areas || [])),
  ).sort();

  const filteredCommunities = registeredCommunities.filter((community) => {
    const matchesSearch =
      community.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFocus =
      !selectedFocus ||
      (community.focus_areas && community.focus_areas.includes(selectedFocus));
    return matchesSearch && matchesFocus;
  });

  const statsDisplay = [
    {
      icon: Users,
      value: globalStats ? `${globalStats.totalUsers}+` : "...",
      label: "Anggota Aktif",
    },
    {
      icon: MapPin,
      value: globalStats ? `${globalStats.totalCommunities}+` : "...",
      label: "Komunitas Pesisir",
    },
    {
      icon: Globe,
      value: completedCount !== null ? `${completedCount}+` : "...",
      label: "Kegiatan Selesai",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        /* ── Hero ── */
        .comm-hero {
          position: relative; min-height: 100vh;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          overflow: hidden; padding: 6rem 1.5rem 2rem;
          text-align: center;
        }
        .comm-hero-bg {
          position: absolute; inset: 0;
          background-image: url('/images/community-hero.jpg');
          background-size: cover; background-position: center 30%;
        }
        .comm-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(160deg,
            rgba(3,22,48,0.9) 0%, rgba(4,55,82,0.75) 50%, rgba(3,40,60,0.92) 100%);
        }
        .comm-hero-particles {
          position: absolute; inset: 0;
          background-image:
            radial-gradient(circle, rgba(103,232,249,0.12) 1px, transparent 1px),
            radial-gradient(circle, rgba(165,243,252,0.07) 1px, transparent 1px);
          background-size: 55px 55px, 28px 28px;
          background-position: 0 0, 14px 14px;
          animation: particleDrift 25s linear infinite;
          pointer-events: none;
        }
        @keyframes particleDrift { from{transform:translateY(0)} to{transform:translateY(-60px)} }
        .comm-hero-content { position: relative; z-index: 10; max-width: 1000px; width: 100%; }
        .comm-hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(103,232,249,0.12); backdrop-filter: blur(10px);
          border: 1px solid rgba(103,232,249,0.28); color: #a5f3fc;
          font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; padding: 0.45rem 1.25rem;
          border-radius: 9999px; margin-bottom: 2rem;
        }
        .comm-hero-title {
          font-size: clamp(2.25rem,5.5vw,4rem); font-weight: 900; color: white;
          line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 1.5rem;
        }
        .shimmer {
          background: linear-gradient(90deg,#67e8f9,#a5f3fc,#67e8f9);
          background-size: 200%; -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        @keyframes shimmer { from{background-position:0% center} to{background-position:200% center} }
        .comm-hero-desc {
          font-size: 1.0625rem; color: rgba(255,255,255,0.72);
          line-height: 1.75; max-width: 580px; margin: 0 auto 2.5rem;
        }
        .comm-hero-btns { display:flex; gap:1rem; flex-wrap:wrap; align-items:center; justify-content:center; }
        .comm-btn-primary {
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg,#06958a,#0e7268);
          color: white; border: none; border-radius: 0.875rem;
          font-size: 0.9375rem; font-weight: 700; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease; box-shadow: 0 4px 20px rgba(6,149,138,0.4);
        }
        .comm-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(6,149,138,0.5); }
        .comm-btn-ghost {
          padding: 0.875rem 2rem; background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px); color: white;
          border: 1.5px solid rgba(255,255,255,0.22); border-radius: 0.875rem;
          font-size: 0.9375rem; font-weight: 600; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.25s ease;
        }
        .comm-btn-ghost:hover { background:rgba(255,255,255,0.17); border-color:rgba(255,255,255,0.38); }
        .comm-wave { position:absolute; bottom:-2px; left:0; right:0; z-index:5; line-height:0; }

        /* ── Stats Bar ── */
        .comm-stats-wrapper {
          position: relative; z-index: 20;
          margin-top: 3.5rem; padding: 0; margin-bottom: 0;
        }
        .comm-stats-bar {
          background: linear-gradient(135deg, #06958a, #0e7268);
          border-radius: 1.5rem;
          box-shadow: 0 16px 40px rgba(6, 149, 138, 0.25);
          padding: 2.5rem 2rem; position: relative; overflow: hidden; max-width: 1000px; margin: 0 auto;
        }
        @media (max-width: 640px) {
          .comm-stats-bar { padding: 1.5rem 1rem; border-radius: 1.25rem; }
        }
        .comm-stats-glow { display: none; }
        .comm-stats-inner {
          position: relative; z-index: 2;
          max-width: 800px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
        }
        @media (max-width: 640px) {
          .comm-stats-inner { grid-template-columns: 1fr; gap: 1.25rem; }
        }
        .comm-stat-item { text-align:center; padding: 0 0.5rem; border-right:1px solid rgba(255,255,255,0.15); }
        .comm-stat-item:last-child { border-right:none; }
        @media (max-width: 640px) {
          .comm-stat-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 1.25rem; }
          .comm-stat-item:last-child { border-bottom: none; padding-bottom: 0; }
        }
        .comm-stat-icon-wrap {
          width:46px; height:46px; background:rgba(255,255,255,0.12); border-radius:0.875rem;
          display:flex; align-items:center; justify-content:center; margin:0 auto 0.875rem;
          backdrop-filter: blur(4px);
        }
        .comm-stat-val { font-size:1.875rem; font-weight:900; color:white; line-height:1; margin-bottom:0.375rem; letter-spacing:-0.03em; }
        .comm-stat-lbl { font-size:0.75rem; font-weight:600; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:0.08em; }
        @media (max-width: 640px) {
          .comm-stat-val { font-size: 1.5rem; }
          .comm-stat-lbl { font-size: 0.7rem; }
          .comm-stat-icon-wrap { width: 40px; height: 40px; margin-bottom: 0.5rem; }
        }

        /* ── Sections ── */
        .comm-section { padding: 5.5rem 1.5rem; }
        .comm-section-alt { padding: 5.5rem 1.5rem; background: #f0f9ff; }
        .comm-container { max-width: 1200px; margin: 0 auto; }
        .comm-container-md { max-width: 900px; margin: 0 auto; }
        .comm-eyebrow {
          display:inline-flex; align-items:center; gap:0.5rem;
          font-size:0.8rem; font-weight:700; text-transform:uppercase;
          letter-spacing:0.08em; color:#06958a; margin-bottom:0.875rem;
        }
        .comm-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:#06958a; }
        .comm-section-title {
          font-size: clamp(1.75rem,3.5vw,2.625rem); font-weight:800; color:#0e2a3a;
          line-height:1.2; letter-spacing:-0.02em; margin-bottom:1rem;
        }
        .comm-section-desc { font-size:1.0625rem; color:#475569; line-height:1.7; max-width:580px; }
        .text-center { text-align:center; }
        .mx-auto { margin-left:auto; margin-right:auto; }

        /* ── Register CTA Section ── */
        .comm-register-grid {
          display:grid; gap:4rem; grid-template-columns:1fr;
          align-items:center;
        }
        @media(min-width:1024px){ .comm-register-grid{ grid-template-columns:1fr 1fr; } }
        .comm-req-list { display:flex; flex-direction:column; gap:1rem; margin: 1.5rem 0 2rem; }
        .comm-req-item {
          display:flex; align-items:flex-start; gap:1rem;
          padding:1.25rem; background:white; border-radius:1rem;
          border:1.5px solid rgba(6,149,138,0.1);
          box-shadow:0 2px 8px rgba(0,0,0,0.03); transition:all 0.2s ease;
        }
        .comm-req-item:hover { transform:translateX(4px); box-shadow:0 4px 16px rgba(6,149,138,0.1); }
        .comm-req-icon {
          width:42px; height:42px; flex-shrink:0;
          background: linear-gradient(135deg,rgba(14,77,109,0.1),rgba(6,149,138,0.12));
          border-radius:0.75rem; display:flex; align-items:center; justify-content:center;
        }
        .comm-req-title { font-size:0.9375rem; font-weight:700; color:#0e2a3a; margin-bottom:0.2rem; }
        .comm-req-desc { font-size:0.8125rem; color:#64748b; line-height:1.55; }
        .comm-register-img {
          position:relative; border-radius:1.5rem; overflow:hidden;
          height:480px; box-shadow:0 20px 60px rgba(0,0,0,0.15);
        }
        .comm-register-floating {
          position:absolute; bottom:-1.5rem; left:-1.5rem; z-index:10;
          background:white; border-radius:1.25rem;
          padding:1.25rem 1.5rem;
          box-shadow:0 8px 30px rgba(6,149,138,0.15);
          border:1.5px solid rgba(6,149,138,0.12);
          display:flex; align-items:center; gap:1rem;
        }
        .comm-register-floating-icon {
          width:44px; height:44px; border-radius:0.875rem;
          background:rgba(22,163,74,0.1);
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0;
        }
        .comm-register-cta {
          display:inline-flex; align-items:center; gap:0.5rem;
          padding:0.875rem 2rem;
          background:linear-gradient(135deg,#0e4d6d,#06958a);
          color:white; border-radius:0.875rem;
          font-size:0.9375rem; font-weight:700;
          text-decoration:none; transition:all 0.25s ease;
          box-shadow:0 4px 20px rgba(6,149,138,0.3);
        }
        .comm-register-cta:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(6,149,138,0.4); }

        /* ── Benefit Cards ── */
        .comm-benefits-grid {
          display:grid; gap:1.5rem; grid-template-columns:1fr;
        }
        @media(min-width:640px){ .comm-benefits-grid{ grid-template-columns:repeat(2,1fr); } }
        @media(min-width:1024px){ .comm-benefits-grid{ grid-template-columns:repeat(3,1fr); } }
        .comm-benefit-card {
          background:white; border-radius:1.25rem; padding:2rem;
          border:1.5px solid rgba(0,0,0,0.06);
          box-shadow:0 2px 8px rgba(0,0,0,0.04);
          transition:all 0.3s ease; position:relative; overflow:hidden;
        }
        .comm-benefit-card::after {
          content:''; position:absolute; bottom:0; left:0; right:0;
          height:3px; opacity:0; transition:opacity 0.3s;
        }
        .comm-benefit-card:hover { transform:translateY(-5px); box-shadow:0 20px 50px rgba(0,0,0,0.1); }
        .comm-benefit-card:hover::after { opacity:1; }
        .comm-benefit-icon { width:52px; height:52px; border-radius:1rem; display:flex; align-items:center; justify-content:center; margin-bottom:1.25rem; }
        .comm-benefit-title { font-size:1.0625rem; font-weight:700; color:#0e2a3a; margin-bottom:0.5rem; }
        .comm-benefit-desc { font-size:0.875rem; color:#64748b; line-height:1.65; }

        /* ── Search Bar ── */
        .comm-search-wrapper { position: relative; z-index: 20; padding: 0 1.5rem; margin-top: 2.5rem; margin-bottom: 2rem; }
        .comm-search-bar {
          background: linear-gradient(135deg, #06958a, #0e7268);
          border-radius: 1.5rem;
          box-shadow: 0 16px 40px rgba(6, 149, 138, 0.25);
          padding: 2rem 1.5rem; position: relative; max-width: 1000px; margin: 0 auto;
        }
        @media (max-width: 640px) {
          .comm-search-bar { padding: 1.25rem 1rem; border-radius: 1.25rem; }
        }
        .comm-search-glow { display: none; }
        .comm-search-inner { position: relative; z-index: 2; max-width:900px; margin:0 auto; display:flex; gap:1rem; flex-wrap:wrap; align-items:center; }
        .comm-search-input-wrap { position:relative; flex:1; min-width:240px; }
        .comm-search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.55); pointer-events:none; }
        .comm-search-input {
          width:100%; padding:0.75rem 1rem 0.75rem 2.75rem;
          background:rgba(255,255,255,0.12); border:1.5px solid rgba(255,255,255,0.22);
          border-radius:0.875rem; color:white; font-size:0.9375rem;
          outline:none; font-family:inherit; transition:all 0.2s ease;
        }
        @media (max-width: 640px) {
          .comm-search-inner { flex-direction: column; align-items: stretch; gap: 0.75rem; }
          .comm-search-input-wrap { min-width: 0; }
          .comm-dropdown-btn { width: 100%; justify-content: space-between; }
          .comm-dropdown-menu { width: 100%; right: 0; left: 0; }
        }
        .comm-search-input::placeholder { color:rgba(255,255,255,0.5); }
        .comm-search-input:focus { background:rgba(255,255,255,0.18); border-color:rgba(255,255,255,0.4); }
        .comm-dropdown-wrap { position:relative; }
        .comm-dropdown-btn {
          display:inline-flex; align-items:center; gap:0.5rem;
          padding:0.75rem 1.125rem;
          background:rgba(255,255,255,0.1); border:1.5px solid rgba(255,255,255,0.22);
          border-radius:0.875rem; color:white; font-size:0.875rem; font-weight:600;
          cursor:pointer; font-family:inherit; transition:all 0.2s ease; white-space:nowrap;
        }
        .comm-dropdown-btn:hover { background:rgba(255,255,255,0.18); }
        .comm-dropdown-menu {
          position:absolute; top:calc(100% + 0.5rem); right:0;
          background:white; border-radius:0.875rem;
          box-shadow:0 8px 30px rgba(0,0,0,0.15);
          overflow:hidden; z-index:50; min-width:180px;
          border:1px solid rgba(0,0,0,0.06);
        }
        .comm-dropdown-item {
          display:block; width:100%; text-align:left; padding:0.625rem 1rem;
          font-size:0.875rem; color:#374151; background:transparent;
          border:none; cursor:pointer; font-family:inherit; transition:background 0.15s;
        }
        .comm-dropdown-item:hover { background:#f0f9ff; color:#06958a; }
        .comm-search-count { color:rgba(255,255,255,0.75); font-size:0.875rem; font-weight:500; margin-left:auto; white-space:nowrap; }

        /* ── Community Grid ── */
        .comm-grid {
          display:grid; gap:1.5rem; grid-template-columns:1fr;
        }
        @media(min-width:640px){ .comm-grid{ grid-template-columns:repeat(2,1fr); } }
        @media(min-width:1024px){ .comm-grid{ grid-template-columns:repeat(3,1fr); } }
        .comm-card {
          background:white; border-radius:1.25rem; overflow:hidden;
          border:1.5px solid rgba(0,0,0,0.06);
          box-shadow:0 2px 8px rgba(0,0,0,0.04);
          transition:all 0.3s ease; display:flex; flex-direction:column;
        }
        .comm-card:hover { transform:translateY(-5px); box-shadow:0 20px 50px rgba(0,0,0,0.1); }
        .comm-card-body { padding:1.75rem; flex:1; display:flex; flex-direction:column; }
        .comm-card-header { display:flex; align-items:flex-start; gap:1rem; margin-bottom:1rem; }
        .comm-card-avatar {
          width:56px; height:56px; border-radius:0.875rem; overflow:hidden;
          background:linear-gradient(135deg,rgba(14,77,109,0.08),rgba(6,149,138,0.1));
          flex-shrink:0; position:relative;
          border:2px solid rgba(6,149,138,0.12);
        }
        .comm-card-name { font-size:1rem; font-weight:700; color:#0e2a3a; margin-bottom:0.25rem; line-height:1.25; }
        .comm-card-loc { display:flex; align-items:center; gap:0.375rem; font-size:0.8125rem; color:#64748b; }
        .comm-card-verified {
          display:inline-flex; align-items:center; gap:0.35rem;
          background:rgba(6,149,138,0.1); color:#06958a;
          font-size:0.7rem; font-weight:700; padding:0.2rem 0.625rem;
          border-radius:9999px; text-transform:uppercase; letter-spacing:0.04em;
          margin-bottom:0.5rem;
        }
        .comm-card-desc { font-size:0.8rem; color:#64748b; line-height:1.65; margin-bottom:1rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .comm-card-tags { display:flex; flex-wrap:wrap; gap:0.375rem; margin-bottom:1rem; }
        .comm-card-tag {
          font-size:0.7rem; font-weight:600; color:#0e4d6d;
          background:rgba(14,77,109,0.08); border-radius:9999px;
          padding:0.2rem 0.625rem; text-transform:capitalize;
        }
        .comm-card-meta { display:flex; align-items:center; gap:1rem; font-size:0.8125rem; color:#64748b; margin-bottom:1rem; }
        .comm-card-btn {
          display:flex; align-items:center; justify-content:center; gap:0.5rem;
          padding:0.7rem 1rem; background:transparent;
          color:#0e4d6d; border:1.5px solid rgba(14,77,109,0.2);
          border-radius:0.75rem; font-size:0.875rem; font-weight:600;
          text-decoration:none; transition:all 0.2s ease; margin-top:auto;
        }
        .comm-card-btn:hover { background:rgba(14,77,109,0.05); border-color:rgba(14,77,109,0.4); }
        .comm-empty { padding:5rem 1.5rem; text-align:center; }
        .comm-empty-icon {
          width:72px; height:72px; background:linear-gradient(135deg,rgba(14,77,109,0.08),rgba(6,149,138,0.1));
          border-radius:50%; display:flex; align-items:center; justify-content:center;
          margin:0 auto 1.25rem;
        }

        /* ── Testimonials ── */
        .comm-testimonials-grid {
          display:grid; gap:1.5rem; grid-template-columns:1fr;
        }
        @media(min-width:768px){ .comm-testimonials-grid{ grid-template-columns:repeat(3,1fr); } }
        .comm-testimonial-card {
          background:white; border-radius:1.25rem; padding:2rem;
          border:1.5px solid rgba(0,0,0,0.06);
          box-shadow:0 2px 8px rgba(0,0,0,0.04);
          transition:all 0.3s ease;
        }
        .comm-testimonial-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,0.1); }
        .comm-testimonial-quote { font-size:0.9375rem; color:#475569; line-height:1.7; margin-bottom:1.5rem; font-style:italic; }
        .comm-testimonial-author { display:flex; align-items:center; gap:0.875rem; }
        .comm-testimonial-avatar {
          width:44px; height:44px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-weight:800; font-size:1rem; color:white; flex-shrink:0;
        }
        .comm-testimonial-name { font-size:0.9375rem; font-weight:700; color:#0e2a3a; }
        .comm-testimonial-role { font-size:0.8rem; color:#64748b; }

        /* ── CTA ── */
        .comm-cta {
          position:relative; overflow:hidden;
          background:linear-gradient(135deg,#031c36 0%,#043752 45%,#032836 100%);
          padding:5.5rem 1.5rem; text-align:center;
        }
        .comm-cta-bg {
          position:absolute; inset:0;
          background-image:radial-gradient(circle,rgba(103,232,249,0.07) 1px,transparent 1px);
          background-size:40px 40px; pointer-events:none;
        }
        .comm-cta-glow {
          position:absolute; width:600px; height:400px; border-radius:50%;
          background:radial-gradient(ellipse,rgba(6,149,138,0.18),transparent 70%);
          top:-100px; left:50%; transform:translateX(-50%); pointer-events:none;
        }
        .comm-cta-inner { position:relative; z-index:1; max-width:660px; margin:0 auto; }
        .comm-cta-badge {
          display:inline-flex; align-items:center; gap:0.5rem;
          background:rgba(103,232,249,0.1); border:1px solid rgba(103,232,249,0.22);
          color:#a5f3fc; font-size:0.8125rem; font-weight:600;
          letter-spacing:0.05em; text-transform:uppercase;
          padding:0.4rem 1.25rem; border-radius:9999px; margin-bottom:1.5rem;
        }
        .comm-cta-title {
          font-size:clamp(1.75rem,4vw,3rem); font-weight:900; color:white;
          letter-spacing:-0.02em; line-height:1.2; margin-bottom:1rem;
        }
        .comm-cta-desc { font-size:1.0625rem; color:rgba(255,255,255,0.62); line-height:1.7; margin-bottom:2.5rem; }
        .comm-cta-btns { display:flex; align-items:center; justify-content:center; gap:1rem; flex-wrap:wrap; }
        .comm-cta-btn-primary {
          padding:0.9rem 2.25rem;
          background:linear-gradient(135deg,#06958a,#04756c);
          color:white; border:none; border-radius:0.875rem;
          font-size:0.9375rem; font-weight:700; text-decoration:none;
          display:inline-flex; align-items:center; gap:0.5rem;
          transition:all 0.25s ease; box-shadow:0 4px 20px rgba(6,149,138,0.4);
        }
        .comm-cta-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(6,149,138,0.5); }
        .comm-cta-btn-ghost {
          padding:0.9rem 2.25rem; background:rgba(255,255,255,0.07); backdrop-filter:blur(10px);
          color:white; border:1.5px solid rgba(255,255,255,0.18);
          border-radius:0.875rem; font-size:0.9375rem; font-weight:600;
          text-decoration:none; display:inline-flex; align-items:center; gap:0.5rem;
          transition:all 0.25s ease;
        }
        .comm-cta-btn-ghost:hover { background:rgba(255,255,255,0.13); border-color:rgba(255,255,255,0.32); }
        .comm-trust { display:flex; align-items:center; justify-content:center; gap:2rem; flex-wrap:wrap; margin-top:2.5rem; }
        .comm-trust-item { display:flex; align-items:center; gap:0.5rem; color:rgba(255,255,255,0.55); font-size:0.8125rem; }
      `}</style>

      <Navigation />
      <main style={{ flex: 1 }}>
        {/* ── HERO ── */}
        <section className="comm-hero">
          <div className="comm-hero-bg" />
          <div className="comm-hero-overlay" />
          <div className="comm-hero-particles" />
          {/* Floating deco - removed */}

          <div className="comm-hero-content">
            <div className="comm-hero-badge">
              <Sparkles style={{ width: 12, height: 12 }} />
              Komunitas Konservasi Terdaftar
            </div>
            <h1 className="comm-hero-title">
              Komunitas <span className="shimmer">Konservasi</span> Laut
            </h1>
            <p className="comm-hero-desc">
              Temukan dan bergabunglah dengan komunitas konservasi terdaftar,
              atau daftarkan organisasi Anda dan mulai memberikan dampak nyata
              bagi laut Indonesia.
            </p>
            {/* ── STATS BAR ── */}
            <div className="comm-stats-wrapper">
              <section className="comm-stats-bar">
                <div className="comm-stats-glow" />
                <div className="comm-stats-inner">
                  {statsDisplay.map((s) => (
                    <div key={s.label} className="comm-stat-item">
                      <div className="comm-stat-icon-wrap">
                        <s.icon
                          style={{
                            width: 22,
                            height: 22,
                            color: "rgba(255,255,255,0.95)",
                          }}
                        />
                      </div>
                      <div className="comm-stat-val">{s.value}</div>
                      <div className="comm-stat-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="comm-wave">
            <svg
              viewBox="0 0 1440 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block", width: "100%" }}
            >
              <path
                d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z"
                fill="white"
              />
            </svg>
          </div>
        </section>

        {/* ── REGISTER CTA ── */}
        <section className="comm-section">
          <div className="comm-container">
            <div className="comm-register-grid">
              <div>
                <div className="comm-eyebrow">
                  <span className="comm-eyebrow-dot" />
                  Bergabung sebagai Mitra
                </div>
                <h2 className="comm-section-title">Daftarkan Komunitas Anda</h2>
                <p className="comm-section-desc">
                  Apakah Anda memimpin kelompok konservasi laut? Bergabunglah
                  dengan SinergiLaut sebagai komunitas terdaftar untuk mengakses
                  alat canggih dalam mengelola kegiatan, relawan, dan donasi.
                </p>
                <div className="comm-req-list">
                  {requirements.map((req) => (
                    <div key={req.title} className="comm-req-item">
                      <div className="comm-req-icon">
                        <req.icon
                          style={{ width: 20, height: 20, color: "#06958a" }}
                        />
                      </div>
                      <div>
                        <p className="comm-req-title">{req.title}</p>
                        <p className="comm-req-desc">{req.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/community/register" className="comm-register-cta">
                  Mulai Pendaftaran{" "}
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
              </div>

              <div style={{ position: "relative" }}>
                <div className="comm-register-img">
                  <Image
                    src="/images/mission-ocean.jpg"
                    alt="Marine conservation community"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="comm-register-floating">
                  <div className="comm-register-floating-icon">
                    <CheckCircle2
                      style={{ width: 20, height: 20, color: "#16a34a" }}
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        color: "#0e2a3a",
                        marginBottom: "0.2rem",
                      }}
                    >
                      Persetujuan Cepat
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontSize: "0.8125rem",
                        color: "#64748b",
                      }}
                    >
                      <FileText style={{ width: 13, height: 13 }} />
                      Proses 5 langkah mudah, 2-3 hari kerja
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BENEFITS ── */}
        <section className="comm-section-alt">
          <div className="comm-container">
            <div className="text-center" style={{ marginBottom: "3rem" }}>
              <div
                className="comm-eyebrow mx-auto"
                style={{ justifyContent: "center" }}
              >
                <span className="comm-eyebrow-dot" />
                Keuntungan Bergabung
              </div>
              <h2 className="comm-section-title">
                Mengapa Daftarkan Komunitas Anda?
              </h2>
              <p className="comm-section-desc mx-auto">
                Buka fitur-fitur canggih untuk menumbuhkan dampak dan menjangkau
                lebih banyak pendukung konservasi.
              </p>
            </div>
            <div className="comm-benefits-grid">
              {benefits.map((b, i) => (
                <div key={b.title} className="comm-benefit-card">
                  <style>{`.comm-benefit-card:nth-child(${i + 1})::after { background: linear-gradient(90deg, ${b.color}, ${b.color}88); }`}</style>
                  <div
                    className="comm-benefit-icon"
                    style={{ background: b.bg }}
                  >
                    <b.icon style={{ width: 24, height: 24, color: b.color }} />
                  </div>
                  <h3 className="comm-benefit-title">{b.title}</h3>
                  <p className="comm-benefit-desc">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SEARCH + COMMUNITIES ── */}
        <div className="comm-search-wrapper" id="communities">
          <section className="comm-search-bar">
            <div className="comm-search-glow" />
            <div className="comm-search-inner">
              <div className="comm-search-input-wrap">
                <Search
                  className="comm-search-icon"
                  style={{ width: 18, height: 18 }}
                />
                <input
                  type="text"
                  placeholder="Cari komunitas berdasarkan nama atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="comm-search-input"
                />
              </div>
              {focusAreas.length > 0 && (
                <div className="comm-dropdown-wrap">
                  <button
                    className="comm-dropdown-btn"
                    onClick={() => setFocusOpen(!focusOpen)}
                  >
                    <Activity style={{ width: 15, height: 15 }} />
                    {selectedFocus || "Semua Fokus"}
                    <ChevronDown
                      style={{ width: 14, height: 14, opacity: 0.7 }}
                    />
                  </button>
                  {focusOpen && (
                    <div className="comm-dropdown-menu">
                      <button
                        className="comm-dropdown-item"
                        onClick={() => {
                          setSelectedFocus(null);
                          setFocusOpen(false);
                        }}
                      >
                        Semua Fokus
                      </button>
                      {focusAreas.map((f) => (
                        <button
                          key={f}
                          className="comm-dropdown-item"
                          onClick={() => {
                            setSelectedFocus(f);
                            setFocusOpen(false);
                          }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {(selectedFocus || searchQuery !== "") && (
                <span className="comm-search-count">
                  {filteredCommunities.length} komunitas ditemukan
                </span>
              )}
            </div>
          </section>
        </div>

        <section className="comm-section">
          <div className="comm-container">
            {filteredCommunities.length > 0 ? (
              <div className="comm-grid">
                {filteredCommunities.map((community) => (
                  <div key={community.id} className="comm-card">
                    <div className="comm-card-body">
                      <div className="comm-card-header">
                        <div className="comm-card-avatar">
                          <Image
                            src={
                              community.logo_url || "https://placehold.co/100"
                            }
                            alt={community.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {community.is_verified && (
                            <div className="comm-card-verified">
                              <CheckCircle style={{ width: 10, height: 10 }} />{" "}
                              Terverifikasi
                            </div>
                          )}
                          <h3 className="comm-card-name">{community.name}</h3>
                          <div className="comm-card-loc">
                            <MapPin
                              style={{
                                width: 12,
                                height: 12,
                                color: "#06958a",
                              }}
                            />
                            {community.location || "Tanpa Lokasi"}
                          </div>
                        </div>
                      </div>

                      <p className="comm-card-desc">
                        {community.description || "Tidak ada deskripsi"}
                      </p>

                      {(community.focus_areas || []).length > 0 && (
                        <div className="comm-card-tags">
                          {(community.focus_areas || []).map((f: string) => (
                            <span key={f} className="comm-card-tag">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="comm-card-meta">
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Users
                            style={{ width: 13, height: 13, color: "#06958a" }}
                          />
                          {community.member_count || 0} anggota
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Activity
                            style={{ width: 13, height: 13, color: "#06958a" }}
                          />
                          Aktif
                        </span>
                      </div>

                      <Link
                        href={`/community/${community.id}`}
                        className="comm-card-btn"
                      >
                        Lihat Komunitas{" "}
                        <ArrowRight style={{ width: 14, height: 14 }} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="comm-empty">
                <div className="comm-empty-icon">
                  <Activity
                    style={{ width: 32, height: 32, color: "#06958a" }}
                  />
                </div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "#0e2a3a",
                    marginBottom: "0.5rem",
                  }}
                >
                  Komunitas tidak ditemukan
                </h3>
                <p style={{ fontSize: "0.9375rem", color: "#64748b" }}>
                  Coba ubah kata kunci atau filter fokus area.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
      </main>
      <Footer />
    </div>
  );
}
