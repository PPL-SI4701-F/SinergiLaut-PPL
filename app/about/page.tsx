/**
 * Halaman About SinergiLaut — Redesign Premium
 * Server Component (aman dari hydration error)
 */

import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import {
  Waves, Users, Target, Eye, Heart, Globe, Award, Leaf, Zap, Banknote,
  CheckCircle, BookOpen, Star, TrendingUp, Table2, ArrowRight,
  Anchor, Shield, Sparkles, Fish
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"

interface JourneyMilestone {
  id: string
  year: number
  title: string
  description: string
  impact_stat: string | null
  icon: string
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

const iconMap: Record<string, React.ElementType> = {
  Waves, Users, Award, Leaf, Globe, Zap, Banknote, CheckCircle,
  BookOpen, Star, TrendingUp, Target, Eye, Heart, Anchor,
}

const teamMembers = [
  { name: "Dr. Arif Wicaksono", role: "Founder & CEO", image: "/images/testimonial-1.jpg", bio: "Ahli biologi kelautan dengan 15 tahun pengalaman konservasi pesisir." },
  { name: "Sari Puspita", role: "Head of Community", image: "/images/testimonial-2.jpg", bio: "Spesialis pemberdayaan komunitas pesisir di seluruh Indonesia." },
  { name: "Reza Mahendra", role: "Chief Technology Officer", image: "/images/testimonial-3.jpg", bio: "Engineer berpengalaman di bidang platform sosial dan lingkungan." },
]

const values = [
  { icon: Heart, title: "Kolaborasi", description: "Kami percaya perubahan besar terjadi ketika komunitas, individu, dan organisasi bekerja bersama.", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  { icon: Eye, title: "Transparansi", description: "Setiap rupiah donasi dan setiap kegiatan dilaporkan dengan akuntabel dan terbuka untuk publik.", color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  { icon: Leaf, title: "Keberlanjutan", description: "Semua program dirancang untuk menciptakan dampak jangka panjang pada ekosistem laut.", color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
  { icon: Globe, title: "Inklusif", description: "Platform kami terbuka untuk semua — dari nelayan tradisional hingga korporat besar.", color: "#06958a", bg: "rgba(6,149,138,0.08)" },
]

const stats = [
  { value: "2.4K+", label: "Relawan Aktif", icon: Users },
  { value: "180+", label: "Komunitas", icon: Globe },
  { value: "560+", label: "Kegiatan", icon: Award },
  { value: "Rp 5M+", label: "Dana Terhimpun", icon: Banknote },
]

const fallbackMilestones: JourneyMilestone[] = [
  { id: "1", year: 2020, title: "SinergiLaut Didirikan", description: "Platform lahir dari keresahan sulitnya koordinasi komunitas konservasi laut di Indonesia.", impact_stat: "Misi dimulai", icon: "Waves", order_index: 1, is_published: true, created_at: "", updated_at: "" },
  { id: "2", year: 2021, title: "Komunitas Pertama Bergabung", description: "10 komunitas dari Jawa, Bali, Sulawesi bergabung. 500 relawan aktif terdaftar.", impact_stat: "10 komunitas, 500+ relawan", icon: "Users", order_index: 2, is_published: true, created_at: "", updated_at: "" },
  { id: "3", year: 2022, title: "Sistem Donasi & Transparansi", description: "Meluncurkan sistem donasi terintegrasi dengan verifikasi penggunaan dana yang transparan.", impact_stat: "Rp 1M+ dana terhimpun", icon: "Banknote", order_index: 3, is_published: true, created_at: "", updated_at: "" },
  { id: "4", year: 2023, title: "Ekspansi ke 50+ Komunitas", description: "Jaringan komunitas berkembang ke 50+ komunitas di 15 provinsi, dari Sabang hingga Papua.", impact_stat: "50+ komunitas, 15 provinsi", icon: "Globe", order_index: 4, is_published: true, created_at: "", updated_at: "" },
  { id: "5", year: 2024, title: "Milestone 10.000 Relawan", description: "Mencapai 10.000+ relawan terdaftar dan Rp 5 miliar+ dana konservasi terhimpun.", impact_stat: "10.000+ relawan, Rp 5M+ dana", icon: "Award", order_index: 5, is_published: true, created_at: "", updated_at: "" },
  { id: "6", year: 2026, title: "Platform Generasi Baru", description: "Peluncuran platform baru: realtime, Midtrans, dashboard lengkap, dan pencairan dana transparan.", impact_stat: "Fitur lengkap & real-time", icon: "Zap", order_index: 6, is_published: true, created_at: "", updated_at: "" },
]

async function getMilestones(): Promise<JourneyMilestone[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("journey_milestones").select("*")
      .eq("is_published", true).order("order_index", { ascending: true })
    if (error || !data || data.length === 0) return fallbackMilestones
    return data as JourneyMilestone[]
  } catch {
    return fallbackMilestones
  }
}

export default async function AboutPage() {
  const milestones = await getMilestones()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        /* ── Hero ── */
        .about-hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
        }
        .about-hero-bg {
          position: absolute; inset: 0;
          background-image: url('/images/hero-ocean.jpg');
          background-size: cover;
          background-position: center 40%;
        }
        .about-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            170deg,
            rgba(3,28,54,0.75) 0%,
            rgba(4,55,82,0.65) 40%,
            rgba(3,28,54,0.85) 100%
          );
        }
        /* animated particles */
        .about-hero-particles {
          position: absolute; inset: 0;
          background-image:
            radial-gradient(circle, rgba(103,232,249,0.15) 1px, transparent 1px),
            radial-gradient(circle, rgba(165,243,252,0.08) 1px, transparent 1px);
          background-size: 50px 50px, 30px 30px;
          background-position: 0 0, 15px 15px;
          animation: particleDrift 20s linear infinite;
        }
        @keyframes particleDrift {
          from { transform: translateY(0); }
          to { transform: translateY(-50px); }
        }
        .about-hero-content {
          position: relative; z-index: 10;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 1.5rem 5rem;
          text-align: center;
          width: 100%;
        }
        .about-hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(103,232,249,0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(103,232,249,0.3);
          color: #a5f3fc;
          font-size: 0.8125rem; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
          padding: 0.45rem 1.25rem;
          border-radius: 9999px;
          margin-bottom: 1.75rem;
        }
        .about-hero-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: white;
          margin-bottom: 1.5rem;
        }
        .about-hero-title .gradient-text {
          background: linear-gradient(90deg, #67e8f9, #a5f3fc, #67e8f9);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textShimmer 4s linear infinite;
        }
        @keyframes textShimmer {
          from { background-position: 0% center; }
          to { background-position: 200% center; }
        }
        .about-hero-desc {
          font-size: 1.125rem;
          color: rgba(255,255,255,0.75);
          line-height: 1.7;
          max-width: 620px;
          margin: 0 auto 2.5rem;
        }
        .about-hero-btns {
          display: flex; align-items: center; justify-content: center;
          gap: 1rem; flex-wrap: wrap;
        }
        .about-hero-btn-primary {
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #06958a, #0e7268);
          color: white; border: none; border-radius: 0.875rem;
          font-size: 0.9375rem; font-weight: 700;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(6,149,138,0.4);
        }
        .about-hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(6,149,138,0.5);
        }
        .about-hero-btn-ghost {
          padding: 0.875rem 2rem;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          color: white; border: 1.5px solid rgba(255,255,255,0.25);
          border-radius: 0.875rem;
          font-size: 0.9375rem; font-weight: 600;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
        }
        .about-hero-btn-ghost:hover {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.4);
        }

        /* Wave bottom of hero */
        .about-hero-wave {
          position: absolute; bottom: -2px; left: 0; right: 0; z-index: 5;
          line-height: 0;
        }

        /* ── Stats Bar ── */
        .about-stats-bar {
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          padding: 3rem 1.5rem;
        }
        .about-stats-grid {
          max-width: 1000px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;
        }
        @media (min-width: 768px) {
          .about-stats-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .about-stat-item {
          text-align: center;
          padding: 1rem;
          border-right: 1px solid rgba(255,255,255,0.15);
        }
        .about-stat-item:last-child, .about-stat-item:nth-child(2) { border-right: none; }
        @media (min-width: 768px) {
          .about-stat-item:nth-child(2) { border-right: 1px solid rgba(255,255,255,0.15); }
          .about-stat-item:last-child { border-right: none; }
        }
        .about-stat-icon {
          width: 44px; height: 44px;
          background: rgba(255,255,255,0.12);
          border-radius: 0.75rem;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 0.875rem;
          backdrop-filter: blur(4px);
        }
        .about-stat-value {
          font-size: 2rem; font-weight: 900;
          color: white; line-height: 1;
          margin-bottom: 0.375rem;
          letter-spacing: -0.03em;
        }
        .about-stat-label {
          font-size: 0.8125rem; font-weight: 500;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase; letter-spacing: 0.06em;
        }

        /* ── Section generic ── */
        .about-section { padding: 6rem 1.5rem; }
        .about-section-alt { padding: 6rem 1.5rem; background: #f0f9ff; }
        .about-container { max-width: 1200px; margin: 0 auto; }
        .about-container-md { max-width: 900px; margin: 0 auto; }
        .about-section-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.8125rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #06958a;
          margin-bottom: 1rem;
        }
        .about-section-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #06958a;
        }
        .about-section-title {
          font-size: clamp(1.875rem, 4vw, 3rem);
          font-weight: 800;
          color: #0e2a3a;
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin-bottom: 1.25rem;
        }
        .about-section-desc {
          font-size: 1.0625rem;
          color: #475569;
          line-height: 1.75;
          max-width: 600px;
        }

        /* ── Mission section ── */
        .about-mission-grid {
          display: grid; gap: 4rem; align-items: center;
        }
        @media (min-width: 1024px) {
          .about-mission-grid { grid-template-columns: 1fr 1fr; }
        }
        .about-mission-image {
          position: relative; border-radius: 1.5rem; overflow: hidden;
          height: 500px;
          box-shadow: 0 25px 60px rgba(14,77,109,0.2);
        }
        .about-mission-image::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(14,77,109,0.1), transparent);
          pointer-events: none;
        }
        .about-vision-card {
          margin-top: 1.5rem;
          padding: 1.25rem 1.5rem;
          background: linear-gradient(135deg, rgba(6,149,138,0.06), rgba(14,77,109,0.04));
          border: 1.5px solid rgba(6,149,138,0.15);
          border-radius: 1rem;
          display: flex; align-items: flex-start; gap: 0.875rem;
        }
        .about-vision-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          border-radius: 0.625rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ── Values ── */
        .about-values-grid {
          display: grid; gap: 1.5rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) { .about-values-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .about-values-grid { grid-template-columns: repeat(4, 1fr); } }
        .about-value-card {
          background: white;
          border-radius: 1.25rem;
          padding: 1.75rem;
          border: 1.5px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.3s ease;
          position: relative; overflow: hidden;
        }
        .about-value-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .about-value-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.1); }
        .about-value-card:hover::before { opacity: 1; }
        .about-value-icon {
          width: 48px; height: 48px;
          border-radius: 0.875rem;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.125rem;
        }
        .about-value-title {
          font-size: 1.0625rem; font-weight: 700;
          color: #0e2a3a; margin-bottom: 0.5rem;
        }
        .about-value-desc { font-size: 0.875rem; color: #64748b; line-height: 1.65; }

        /* ── Timeline ── */
        .about-timeline { position: relative; }
        .about-timeline-line {
          position: absolute;
          left: 24px; top: 0; bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #06958a, rgba(6,149,138,0.15));
        }
        @media (min-width: 768px) {
          .about-timeline-line { left: 50%; transform: translateX(-50%); }
        }
        .about-timeline-items { display: flex; flex-direction: column; gap: 0; }
        .about-timeline-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          padding-bottom: 3rem;
        }
        @media (min-width: 768px) {
          .about-timeline-item { justify-content: flex-end; padding-right: calc(50% + 2.5rem); }
          .about-timeline-item:nth-child(even) {
            justify-content: flex-start;
            padding-right: 0;
            padding-left: calc(50% + 2.5rem);
          }
        }
        .about-timeline-node {
          position: absolute;
          left: 24px; top: 0;
          transform: translate(-50%, 0);
          z-index: 10;
        }
        @media (min-width: 768px) {
          .about-timeline-node { left: 50%; }
        }
        .about-timeline-bubble {
          width: 48px; height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 4px rgba(6,149,138,0.15), 0 4px 12px rgba(6,149,138,0.3);
        }
        .about-timeline-card {
          background: white;
          border-radius: 1.25rem;
          padding: 1.5rem;
          border: 1.5px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
          max-width: 380px;
          margin-left: 3.5rem;
        }
        @media (min-width: 768px) { .about-timeline-card { margin-left: 0; } }
        .about-timeline-card:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(6,149,138,0.12); }
        .about-timeline-year {
          font-size: 0.75rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #06958a; margin-bottom: 0.5rem;
        }
        .about-timeline-title {
          font-size: 1rem; font-weight: 700;
          color: #0e2a3a; margin-bottom: 0.5rem;
        }
        .about-timeline-desc {
          font-size: 0.875rem; color: #64748b; line-height: 1.6;
          margin-bottom: 0.75rem;
        }
        .about-timeline-badge {
          display: inline-flex; align-items: center;
          background: rgba(6,149,138,0.08);
          color: #06958a;
          font-size: 0.75rem; font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
        }

        /* ── Data Table ── */
        .about-table-wrap {
          background: white;
          border-radius: 1.5rem;
          overflow: hidden;
          border: 1.5px solid rgba(0,0,0,0.07);
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .about-table-header {
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-bottom: 1.5px solid rgba(6,149,138,0.1);
          display: flex; align-items: center; gap: 1rem;
        }
        .about-table-header-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          border-radius: 0.75rem;
          display: flex; align-items: center; justify-content: center;
        }
        .about-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .about-table thead tr { background: #f8fafc; }
        .about-table th {
          padding: 0.875rem 1.25rem;
          text-align: left; font-weight: 700;
          font-size: 0.75rem; text-transform: uppercase;
          letter-spacing: 0.06em; color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }
        .about-table td { padding: 0.875rem 1.25rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .about-table tr:last-child td { border-bottom: none; }
        .about-table tr:hover td { background: #f8fffe; }
        .about-table-year { font-weight: 800; color: #06958a; font-size: 0.9375rem; }
        .about-table-icon-wrap {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: rgba(6,149,138,0.1);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .about-table-badge {
          display: inline-flex; align-items: center;
          background: rgba(6,149,138,0.08);
          color: #06958a; font-size: 0.75rem; font-weight: 600;
          padding: 0.25rem 0.625rem; border-radius: 9999px;
          white-space: nowrap;
        }

        /* ── Team ── */
        .about-team-grid {
          display: grid; gap: 2rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) { .about-team-grid { grid-template-columns: repeat(3, 1fr); } }
        .about-team-card {
          background: white;
          border-radius: 1.5rem;
          overflow: hidden;
          border: 1.5px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          text-align: center;
          padding: 2rem;
        }
        .about-team-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(14,77,109,0.15);
        }
        .about-team-avatar {
          position: relative;
          width: 90px; height: 90px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto 1.25rem;
          ring: 4px solid rgba(6,149,138,0.2);
          box-shadow: 0 0 0 4px rgba(6,149,138,0.15), 0 8px 20px rgba(0,0,0,0.1);
        }
        .about-team-name { font-size: 1.0625rem; font-weight: 700; color: #0e2a3a; margin-bottom: 0.3rem; }
        .about-team-role {
          font-size: 0.8125rem; font-weight: 600;
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.75rem;
        }
        .about-team-bio { font-size: 0.8125rem; color: #64748b; line-height: 1.6; }

        /* ── CTA ── */
        .about-cta {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #031c36 0%, #043752 40%, #032836 100%);
          padding: 6rem 1.5rem;
          text-align: center;
        }
        .about-cta-bg {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(103,232,249,0.08) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .about-cta-glow {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6,149,138,0.2), transparent 70%);
          top: -150px; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .about-cta-content { position: relative; z-index: 1; max-width: 700px; margin: 0 auto; }
        .about-cta-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(103,232,249,0.12);
          border: 1px solid rgba(103,232,249,0.25);
          color: #a5f3fc; font-size: 0.8125rem; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
          padding: 0.4rem 1.25rem; border-radius: 9999px;
          margin-bottom: 1.5rem;
        }
        .about-cta-title {
          font-size: clamp(1.75rem, 4vw, 3rem);
          font-weight: 900; color: white;
          letter-spacing: -0.02em; line-height: 1.2;
          margin-bottom: 1rem;
        }
        .about-cta-desc { font-size: 1.0625rem; color: rgba(255,255,255,0.65); line-height: 1.7; margin-bottom: 2.5rem; }
        .about-cta-btns { display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; }
        .about-cta-btn-primary {
          padding: 0.9rem 2.25rem;
          background: linear-gradient(135deg, #06958a, #04756c);
          color: white; border: none; border-radius: 0.875rem;
          font-size: 0.9375rem; font-weight: 700;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(6,149,138,0.4);
        }
        .about-cta-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(6,149,138,0.5); }
        .about-cta-btn-ghost {
          padding: 0.9rem 2.25rem;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(10px);
          color: white; border: 1.5px solid rgba(255,255,255,0.2);
          border-radius: 0.875rem;
          font-size: 0.9375rem; font-weight: 600;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
        }
        .about-cta-btn-ghost:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.35); }

        .text-center { text-align: center; }
      `}</style>

      <Navigation />
      <main style={{ flex: 1, paddingTop: '4rem' }}>

        {/* ── HERO ── */}
        <section className="about-hero">
          <div className="about-hero-bg" />
          <div className="about-hero-overlay" />
          <div className="about-hero-particles" />

          {/* Floating decoration */}
          <Fish style={{ position: 'absolute', top: '20%', right: '8%', width: 80, height: 80, color: 'rgba(103,232,249,0.08)', zIndex: 2 }} />
          <Anchor style={{ position: 'absolute', bottom: '30%', left: '6%', width: 60, height: 60, color: 'rgba(165,243,252,0.07)', zIndex: 2 }} />
          <Waves style={{ position: 'absolute', top: '35%', left: '12%', width: 70, height: 70, color: 'rgba(103,232,249,0.06)', zIndex: 2 }} />

          <div className="about-hero-content">
            <div className="about-hero-badge">
              <Sparkles style={{ width: 13, height: 13 }} />
              Platform Konservasi Laut Indonesia
            </div>
            <h1 className="about-hero-title">
              Tentang <span className="gradient-text">SinergiLaut</span>
            </h1>
            <p className="about-hero-desc">
              Platform digital yang mempertemukan komunitas, relawan, dan donatur dalam satu ekosistem terintegrasi untuk melindungi lautan Indonesia.
            </p>
            <div className="about-hero-btns">
              <Link href="/activities" className="about-hero-btn-primary">
                Lihat Kegiatan <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/register" className="about-hero-btn-ghost">
                Bergabung Gratis
              </Link>
            </div>
          </div>

          {/* Wave divider */}
          <div className="about-hero-wave">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
              <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z" fill="white"/>
            </svg>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="about-stats-bar">
          <div className="about-stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="about-stat-item">
                <div className="about-stat-icon">
                  <s.icon style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.9)' }} />
                </div>
                <div className="about-stat-value">{s.value}</div>
                <div className="about-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MISSION & VISION ── */}
        <section className="about-section">
          <div className="about-container">
            <div className="about-mission-grid">
              <div>
                <div className="about-section-eyebrow">
                  <span className="about-section-eyebrow-dot" />
                  Misi Kami
                </div>
                <h2 className="about-section-title">Melindungi Laut Indonesia,<br />Bersama-sama</h2>
                <p className="about-section-desc">
                  SinergiLaut hadir sebagai jembatan antara semangat masyarakat peduli lingkungan dan kebutuhan nyata di lapangan. Kami menyediakan infrastruktur digital untuk memudahkan koordinasi kegiatan konservasi, transparansi dana, dan pengembangan komunitas.
                </p>
                <div className="about-vision-card" style={{ marginTop: '1.5rem' }}>
                  <div className="about-vision-icon">
                    <Eye style={{ width: 18, height: 18, color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0e4d6d', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Visi Kami</p>
                    <p style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.65 }}>
                      Indonesia dengan ekosistem laut yang sehat, terlindungi, dan dikelola secara berkelanjutan oleh generasi yang peduli.
                    </p>
                  </div>
                </div>

                {/* Key highlights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                  {["Koordinasi kegiatan konservasi lintas komunitas", "Transparansi pengelolaan dan pelaporan dana", "Pemberdayaan nelayan dan masyarakat pesisir"].map(txt => (
                    <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#374151' }}>
                      <CheckCircle style={{ width: 18, height: 18, color: '#06958a', flexShrink: 0 }} />
                      {txt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="about-mission-image">
                <Image src="/images/mission-ocean.jpg" alt="Konservasi laut Indonesia" fill style={{ objectFit: 'cover' }} />
                {/* Overlay badge */}
                <div style={{
                  position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem',
                  background: 'rgba(3,28,54,0.85)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(103,232,249,0.2)',
                  borderRadius: '1rem', padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                }}>
                  <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #06958a, #0e4d6d)', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Shield style={{ width: 18, height: 18, color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white', marginBottom: '0.15rem' }}>Terverifikasi & Transparan</p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>Semua kegiatan & dana terlacak secara real-time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="about-section-alt">
          <div className="about-container">
            <div className="text-center" style={{ marginBottom: '3rem' }}>
              <div className="about-section-eyebrow" style={{ justifyContent: 'center' }}>
                <span className="about-section-eyebrow-dot" />
                Nilai-nilai Kami
              </div>
              <h2 className="about-section-title">Prinsip yang Memandu Langkah Kami</h2>
              <p className="about-section-desc" style={{ margin: '0 auto' }}>
                Empat pilar utama yang menjadi fondasi seluruh keputusan dan program SinergiLaut.
              </p>
            </div>
            <div className="about-values-grid">
              {values.map((v) => (
                <div key={v.title} className="about-value-card"
                  style={{ ['--card-color' as string]: v.color }}>
                  <style>{`.about-value-card:nth-child(${values.indexOf(v)+1})::before { background: linear-gradient(90deg, ${v.color}, ${v.color}88); }`}</style>
                  <div className="about-value-icon" style={{ background: v.bg }}>
                    <v.icon style={{ width: 22, height: 22, color: v.color }} />
                  </div>
                  <h3 className="about-value-title">{v.title}</h3>
                  <p className="about-value-desc">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section className="about-section" id="perjalanan-kami">
          <div className="about-container-md">
            <div className="text-center" style={{ marginBottom: '4rem' }}>
              <div className="about-section-eyebrow" style={{ justifyContent: 'center' }}>
                <span className="about-section-eyebrow-dot" />
                Perjalanan Kami
              </div>
              <h2 className="about-section-title">Dari Mimpi Kecil Menjadi<br />Gerakan Nyata</h2>
              <p className="about-section-desc" style={{ margin: '0 auto' }}>
                Setiap tonggak perjalanan SinergiLaut adalah bukti nyata kekuatan kolaborasi untuk laut Indonesia.
              </p>
            </div>

            {/* Timeline */}
            <div className="about-timeline" style={{ paddingLeft: '1.5rem' }}>
              <div className="about-timeline-line" />
              <div className="about-timeline-items">
                {milestones.map((m, i) => {
                  const IconComponent = iconMap[m.icon] ?? Award
                  return (
                    <div key={m.id} className="about-timeline-item">
                      <div className="about-timeline-node">
                        <div className="about-timeline-bubble">
                          <IconComponent style={{ width: 20, height: 20, color: 'white' }} />
                        </div>
                      </div>
                      <div className="about-timeline-card">
                        <p className="about-timeline-year">{m.year}</p>
                        <h3 className="about-timeline-title">{m.title}</h3>
                        <p className="about-timeline-desc">{m.description}</p>
                        {m.impact_stat && (
                          <span className="about-timeline-badge">{m.impact_stat}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Data Table */}
            <div style={{ marginTop: '4rem' }}>
              <div className="about-table-wrap">
                <div className="about-table-header">
                  <div className="about-table-header-icon">
                    <Table2 style={{ width: 18, height: 18, color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0e2a3a' }}>Data Ringkasan Perjalanan</p>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>Seluruh tonggak sejarah dalam format tabel</p>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="about-table">
                    <thead>
                      <tr>
                        <th>Tahun</th>
                        <th>Milestone</th>
                        <th style={{ display: 'none' }} className="md-show">Deskripsi</th>
                        <th>Dampak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {milestones.map((m) => {
                        const IconComponent = iconMap[m.icon] ?? Award
                        return (
                          <tr key={m.id}>
                            <td><span className="about-table-year">{m.year}</span></td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                <div className="about-table-icon-wrap">
                                  <IconComponent style={{ width: 13, height: 13, color: '#06958a' }} />
                                </div>
                                <span style={{ fontWeight: 600, color: '#0e2a3a', fontSize: '0.875rem' }}>{m.title}</span>
                              </div>
                            </td>
                            <td style={{ color: '#64748b', maxWidth: 280, lineHeight: 1.55 }}>{m.description}</td>
                            <td>
                              {m.impact_stat
                                ? <span className="about-table-badge">{m.impact_stat}</span>
                                : <span style={{ color: '#94a3b8' }}>—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '0.875rem 1.25rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                  Total {milestones.length} milestone tercatat · Data diperbarui secara berkala
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="about-section-alt">
          <div className="about-container">
            <div className="text-center" style={{ marginBottom: '3rem' }}>
              <div className="about-section-eyebrow" style={{ justifyContent: 'center' }}>
                <span className="about-section-eyebrow-dot" />
                Tim Kami
              </div>
              <h2 className="about-section-title">Orang-orang di Balik SinergiLaut</h2>
              <p className="about-section-desc" style={{ margin: '0 auto' }}>
                Dikerjakan dengan hati oleh tim yang berdedikasi untuk masa depan laut Indonesia.
              </p>
            </div>
            <div className="about-team-grid" style={{ maxWidth: 900, margin: '0 auto' }}>
              {teamMembers.map((member) => (
                <div key={member.name} className="about-team-card">
                  <div className="about-team-avatar">
                    <Image src={member.image} alt={member.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <h3 className="about-team-name">{member.name}</h3>
                  <p className="about-team-role">{member.role}</p>
                  <p className="about-team-bio">{member.bio}</p>
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
  <section className="about-cta">
          <div className="about-cta-bg" />
          <div className="about-cta-glow" />
          <div className="about-cta-content">
            <div className="about-cta-badge">
              <Sparkles style={{ width: 12, height: 12 }} />
              Mulai Perjalanan Anda
            </div>
            <h2 className="about-cta-title">Bergabunglah dengan Gerakan Laut Bersih</h2>
            <p className="about-cta-desc">
              Bersama kita bisa menciptakan perubahan nyata untuk ekosistem laut Indonesia. Daftar gratis dan mulai berkontribusi hari ini.
            </p>
            <div className="about-cta-btns">
              <Link href="/register" className="about-cta-btn-primary">
                Daftar Sekarang <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/contact" className="about-cta-btn-ghost">
                Hubungi Kami
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
 />
    </div>
  )
}
