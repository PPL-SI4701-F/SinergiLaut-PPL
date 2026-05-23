"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Filter,
  ChevronDown,
  Leaf,
  Banknote,
  Sparkles,
  CheckCircle,
  Target,
  Heart,
  Globe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/helpers";
import { ACTIVITY_CATEGORIES } from "@/lib/constants";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const pillars = [
  {
    icon: Target,
    title: "Dampak Terukur",
    description:
      "Setiap kegiatan memiliki target sukarelawan dan pendanaan yang jelas, sehingga kontribusi Anda bisa diukur hasilnya secara nyata.",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
  },
  {
    icon: Heart,
    title: "Komunitas Berdaya",
    description:
      "Kegiatan diinisiasi dan dikelola oleh komunitas lokal yang memahami kebutuhan nyata ekosistem laut di wilayah mereka.",
    color: "#06958a",
    bg: "rgba(6,149,138,0.08)",
  },
  {
    icon: Globe,
    title: "Laut Lebih Sehat",
    description:
      "Dari pembersihan pantai hingga restorasi terumbu karang, setiap aksi berkontribusi pada kelestarian laut Indonesia jangka panjang.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Temukan Kegiatan",
    desc: "Cari kegiatan konservasi laut yang sesuai minat dan lokasimu, mulai dari bersih pantai hingga restorasi terumbu karang.",
  },
  {
    step: "02",
    title: "Bergabung atau Donasi",
    desc: "Daftar sebagai relawan langsung atau dukung kegiatan dengan donasi uang maupun barang yang dibutuhkan.",
  },
  {
    step: "03",
    title: "Buat Perubahan Nyata",
    desc: "Kontribusimu langsung berdampak pada ekosistem laut dan menginspirasi lebih banyak orang untuk peduli.",
  },
];

// Bangun daftar tipe dari ACTIVITY_CATEGORIES (konsisten dengan konstanta)
const activityTypeOptions = [
  { value: "All Types", label: "All Types" },
  ...ACTIVITY_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
];

export default function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedType, setSelectedType] = useState("All Types");
  const [locationOpen, setLocationOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [supabaseActivities, setSupabaseActivities] = useState<any[]>([]);
  // Lokasi unik yang diambil dinamis dari data kegiatan
  const [dynamicLocations, setDynamicLocations] = useState<string[]>([]);

  useEffect(() => {
    async function fetchActivities() {
      const supabase = createClient();
      const { data } = await supabase
        .from("activities")
        .select(`*, community:communities(name)`)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (data) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          image: d.cover_image_url || "/images/placeholder.jpg",
          date: formatDate(d.start_date || new Date().toISOString()),
          location: d.location || "Online",
          type: d.category || "other",
          volunteers: d.volunteer_count || 0,
          slots: d.volunteer_quota || 0,
          icon: Leaf,
          fundingGoal: d.funding_goal || 0,
          fundingRaised: d.funding_raised || 0,
          itemsNeeded: [],
        }));
        setSupabaseActivities(mapped);

        // Bangun daftar lokasi unik dari data nyata
        const uniqueLocations = Array.from(
          new Set(data.map((d: any) => d.location).filter(Boolean))
        ).sort() as string[];
        setDynamicLocations(uniqueLocations);
      }
    }
    fetchActivities();
  }, []);

  const locations = ["All Locations", ...dynamicLocations];

  const allActivities = supabaseActivities;

  const filteredActivities = allActivities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation =
      selectedLocation === "All Locations" ||
      activity.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesType =
      selectedType === "All Types" ||
      activity.type === selectedType;
    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        /* ── Hero ── */
        .act-hero {
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
        .act-hero-bg {
          position: absolute; inset: 0;
          background-image: url('/images/donate-hero.jpg');
          background-size: cover;
          background-position: center 40%;
        }
        .act-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            160deg,
            rgba(3, 22, 48, 0.88) 0%,
            rgba(4, 55, 82, 0.72) 50%,
            rgba(3, 40, 60, 0.90) 100%
          );
        }
        .act-hero-particles {
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
        .act-hero-content { position: relative; z-index: 10; max-width: 820px; }
        .act-hero-badge {
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
        .act-hero-title {
          font-size: clamp(2.25rem, 5.5vw, 4rem);
          font-weight: 900; color: white;
          line-height: 1.1; letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
        }
        .act-hero-title .shimmer {
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
        .act-hero-desc {
          font-size: 1.0625rem; color: rgba(255,255,255,0.72);
          line-height: 1.75; max-width: 580px; margin: 0 auto 2.5rem;
        }
        .act-hero-btns {
          display: flex; gap: 1rem; flex-wrap: wrap;
          align-items: center; justify-content: center;
        }
        .act-btn-primary {
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #06958a, #0e7268);
          color: white; border: none; border-radius: 0.875rem;
          font-size: 0.9375rem; font-weight: 700;
          cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(6,149,138,0.4);
        }
        .act-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(6,149,138,0.5); }
        .act-btn-ghost {
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
        .act-btn-ghost:hover { background: rgba(255,255,255,0.17); border-color: rgba(255,255,255,0.38); }

        /* Wave */
        .act-wave { position: absolute; bottom: -2px; left: 0; right: 0; z-index: 5; line-height: 0; }

        /* ── Search Bar ── */
        .act-search-wrapper {
          position: relative; z-index: 20;
          margin-top: 2rem; padding: 0 1.5rem; margin-bottom: 2rem;
        }
        .act-search-bar {
          background: linear-gradient(135deg, #06958a, #0e7268);
          border-radius: 1.5rem;
          box-shadow: 0 16px 40px rgba(6, 149, 138, 0.25);
          padding: 2rem 1.5rem; position: relative; max-width: 1000px; margin: 0 auto;
        }
        @media (max-width: 640px) {
          .act-search-bar { padding: 1.25rem 1rem; border-radius: 1.25rem; }
        }
        .act-search-glow { display: none; }
        .act-search-inner {
          position: relative; z-index: 2; max-width: 900px; margin: 0 auto;
          display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;
        }
        .act-search-input-wrap {
          position: relative; flex: 1; min-width: 240px;
        }
        @media (max-width: 640px) {
          .act-search-inner { flex-direction: column; align-items: stretch; gap: 0.75rem; }
          .act-search-input-wrap { min-width: 0; }
          .act-dropdown-btn { width: 100%; justify-content: space-between; }
          .act-dropdown-menu { width: 100%; right: 0; left: 0; }
          .act-search-count { text-align: center; margin-top: 0.25rem; font-size: 0.8rem; }
        }
        .act-search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.55); pointer-events: none;
        }
        .act-search-input {
          width: 100%; padding: 0.75rem 1rem 0.75rem 2.75rem;
          background: rgba(255,255,255,0.12);
          border: 1.5px solid rgba(255,255,255,0.22);
          border-radius: 0.875rem;
          color: white; font-size: 0.9375rem;
          outline: none; font-family: inherit;
          transition: all 0.2s ease;
        }
        .act-search-input::placeholder { color: rgba(255,255,255,0.5); }
        .act-search-input:focus { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.4); }
        .act-dropdown-wrap { position: relative; }
        .act-dropdown-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1.125rem;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.22);
          border-radius: 0.875rem;
          color: white; font-size: 0.875rem; font-weight: 600;
          cursor: pointer; font-family: inherit;
          transition: all 0.2s ease; white-space: nowrap;
        }
        .act-dropdown-btn:hover { background: rgba(255,255,255,0.18); }
        .act-dropdown-menu {
          position: absolute; top: calc(100% + 0.5rem); right: 0;
          background: white; border-radius: 0.875rem;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          overflow: hidden; z-index: 50; min-width: 160px;
          border: 1px solid rgba(0,0,0,0.06);
        }
        .act-dropdown-item {
          display: block; width: 100%; text-align: left;
          padding: 0.625rem 1rem;
          font-size: 0.875rem; color: #374151;
          background: transparent; border: none;
          cursor: pointer; font-family: inherit;
          transition: background 0.15s ease;
        }
        .act-dropdown-item:hover { background: #f0f9ff; color: #06958a; }
        .act-results-count {
          color: rgba(255,255,255,0.75); font-size: 0.875rem; font-weight: 500;
          margin-left: auto; white-space: nowrap;
        }

        /* ── Sections ── */
        .act-section { padding: 5.5rem 1.5rem; }
        .act-section-alt { padding: 5.5rem 1.5rem; background: #f0f9ff; }
        .act-container { max-width: 1200px; margin: 0 auto; }
        .act-container-md { max-width: 900px; margin: 0 auto; }
        .act-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: #06958a; margin-bottom: 0.875rem;
        }
        .act-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #06958a; }
        .act-section-title {
          font-size: clamp(1.75rem, 3.5vw, 2.625rem);
          font-weight: 800; color: #0e2a3a;
          line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 1rem;
        }
        .act-section-desc { font-size: 1.0625rem; color: #475569; line-height: 1.7; max-width: 580px; }
        .text-center { text-align: center; }
        .mx-auto { margin-left: auto; margin-right: auto; }

        /* ── Activity Cards Grid ── */
        .act-grid {
          display: grid; gap: 1.5rem;
          grid-template-columns: 1fr;
        }
        @media(min-width:640px){ .act-grid{ grid-template-columns: repeat(2,1fr); } }
        @media(min-width:1024px){ .act-grid{ grid-template-columns: repeat(3,1fr); } }

        .act-card {
          background: white;
          border-radius: 1.25rem;
          overflow: hidden;
          border: 1.5px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.3s ease;
          display: flex; flex-direction: column;
        }
        .act-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); }

        .act-card-img-wrap {
          position: relative; height: 192px; overflow: hidden;
        }
        .act-card-img-wrap img { transition: transform 0.4s ease; }
        .act-card:hover .act-card-img-wrap img { transform: scale(1.05); }
        .act-card-badge {
          position: absolute; top: 12px; left: 12px;
          background: rgba(14,77,109,0.85);
          backdrop-filter: blur(8px);
          color: white;
          font-size: 0.75rem; font-weight: 700;
          padding: 0.3rem 0.875rem; border-radius: 9999px;
          text-transform: capitalize; letter-spacing: 0.03em;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .act-card-body { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
        .act-card-header { display: flex; align-items: flex-start; gap: 0.875rem; margin-bottom: 0.875rem; }
        .act-card-icon {
          width: 42px; height: 42px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(14,77,109,0.1), rgba(6,149,138,0.12));
          border-radius: 0.75rem;
          display: flex; align-items: center; justify-content: center;
        }
        .act-card-title { font-size: 1rem; font-weight: 700; color: #0e2a3a; line-height: 1.3; }
        .act-card-desc { font-size: 0.875rem; color: #64748b; line-height: 1.65; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .act-card-meta { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
        .act-card-meta-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #64748b; }

        .act-progress-wrap {
          padding: 0.875rem; background: #f8fafc;
          border-radius: 0.875rem; border: 1px solid #f1f5f9;
          margin-bottom: 1rem;
        }
        .act-progress-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.625rem; }
        .act-progress-label { font-size: 0.75rem; font-weight: 600; color: #374151; flex: 1; }
        .act-progress-pct { font-size: 0.75rem; font-weight: 700; color: #06958a; }
        .act-progress-track { height: 8px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; margin-bottom: 0.4rem; }
        .act-progress-fill {
          height: 100%; border-radius: 9999px;
          background: linear-gradient(90deg, #0e4d6d, #06958a);
          position: relative; overflow: hidden;
          transition: width 0.6s ease;
        }
        .act-progress-fill::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: progressShimmer 2s linear infinite;
        }
        @keyframes progressShimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .act-progress-amounts { display: flex; justify-content: space-between; font-size: 0.75rem; }
        .act-progress-raised { color: #64748b; }
        .act-progress-goal { color: #94a3b8; }

        .act-card-btns { display: flex; gap: 0.75rem; margin-top: auto; }
        .act-card-btn-primary {
          flex: 1; padding: 0.625rem 1rem;
          background: linear-gradient(135deg, #06958a, #0e7268);
          color: white; border: none; border-radius: 0.75rem;
          font-size: 0.875rem; font-weight: 700;
          text-decoration: none; text-align: center;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 10px rgba(6,149,138,0.3);
          cursor: pointer;
        }
        .act-card-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(6,149,138,0.4); }
        .act-card-btn-ghost {
          flex: 1; padding: 0.625rem 1rem;
          background: transparent;
          color: #0e4d6d; border: 1.5px solid rgba(14,77,109,0.2);
          border-radius: 0.75rem;
          font-size: 0.875rem; font-weight: 600;
          text-decoration: none; text-align: center;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .act-card-btn-ghost:hover { background: rgba(14,77,109,0.05); border-color: rgba(14,77,109,0.4); }

        /* ── Empty State ── */
        .act-empty {
          padding: 5rem 1.5rem; text-align: center;
        }
        .act-empty-icon {
          width: 72px; height: 72px;
          background: linear-gradient(135deg, rgba(14,77,109,0.08), rgba(6,149,138,0.1));
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.25rem;
        }
        .act-empty-title { font-size: 1.125rem; font-weight: 700; color: #0e2a3a; margin-bottom: 0.5rem; }
        .act-empty-desc { font-size: 0.9375rem; color: #64748b; }

        /* ── Pillar Cards ── */
        .act-pillars-grid {
          display: grid; gap: 1.5rem;
          grid-template-columns: 1fr;
        }
        @media(min-width:768px){ .act-pillars-grid{ grid-template-columns: repeat(3,1fr); } }
        .act-pillar-card {
          background: white;
          border-radius: 1.25rem;
          padding: 2rem;
          border: 1.5px solid rgba(0,0,0,0.06);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.3s ease;
          position: relative; overflow: hidden;
        }
        .act-pillar-card::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 3px; opacity: 0; transition: opacity 0.3s;
        }
        .act-pillar-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
        .act-pillar-card:hover::after { opacity: 1; }
        .act-pillar-icon {
          width: 52px; height: 52px; border-radius: 1rem;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.25rem;
        }
        .act-pillar-title { font-size: 1.0625rem; font-weight: 700; color: #0e2a3a; margin-bottom: 0.5rem; }
        .act-pillar-desc { font-size: 0.875rem; color: #64748b; line-height: 1.65; }

        /* ── How it works ── */
        .act-how-grid {
          display: grid; gap: 2rem; grid-template-columns: 1fr;
        }
        @media(min-width:768px){ .act-how-grid{ grid-template-columns: repeat(3,1fr); } }
        .act-how-card {
          background: white;
          border-radius: 1.25rem;
          padding: 2rem;
          border: 1.5px solid rgba(6,149,138,0.1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
        }
        .act-how-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(6,149,138,0.1); }
        .act-how-step {
          font-size: 3rem; font-weight: 900;
          letter-spacing: -0.05em;
          background: linear-gradient(135deg, #0e4d6d, #06958a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1; margin-bottom: 1rem; opacity: 0.5;
        }
        .act-how-title { font-size: 1.0625rem; font-weight: 700; color: #0e2a3a; margin-bottom: 0.5rem; }
        .act-how-desc { font-size: 0.875rem; color: #64748b; line-height: 1.65; }

        /* ── CTA ── */
        .act-cta {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #031c36 0%, #043752 45%, #032836 100%);
          padding: 5.5rem 1.5rem; text-align: center;
        }
        .act-cta-bg {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(103,232,249,0.07) 1px, transparent 1px);
          background-size: 40px 40px; pointer-events: none;
        }
        .act-cta-glow {
          position: absolute;
          width: 600px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(6,149,138,0.18), transparent 70%);
          top: -100px; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }
        .act-cta-inner { position: relative; z-index: 1; max-width: 660px; margin: 0 auto; }
        .act-cta-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(103,232,249,0.1); border: 1px solid rgba(103,232,249,0.22);
          color: #a5f3fc; font-size: 0.8125rem; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
          padding: 0.4rem 1.25rem; border-radius: 9999px; margin-bottom: 1.5rem;
        }
        .act-cta-title {
          font-size: clamp(1.75rem, 4vw, 3rem); font-weight: 900; color: white;
          letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 1rem;
        }
        .act-cta-desc { font-size: 1.0625rem; color: rgba(255,255,255,0.62); line-height: 1.7; margin-bottom: 2.5rem; }
        .act-cta-btns { display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; }
        .act-cta-btn-primary {
          padding: 0.9rem 2.25rem;
          background: linear-gradient(135deg, #06958a, #04756c);
          color: white; border: none; border-radius: 0.875rem;
          font-size: 0.9375rem; font-weight: 700; text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(6,149,138,0.4);
        }
        .act-cta-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(6,149,138,0.5); }
        .act-cta-btn-ghost {
          padding: 0.9rem 2.25rem;
          background: rgba(255,255,255,0.07); backdrop-filter: blur(10px);
          color: white; border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 0.875rem; font-size: 0.9375rem; font-weight: 600;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.5rem;
          transition: all 0.25s ease;
        }
        .act-cta-btn-ghost:hover { background: rgba(255,255,255,0.13); border-color: rgba(255,255,255,0.32); }
        .act-trust { display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap; margin-top: 2.5rem; }
        .act-trust-item { display: flex; align-items: center; gap: 0.5rem; color: rgba(255,255,255,0.55); font-size: 0.8125rem; }
      `}</style>

      <Navigation />
      <main style={{ flex: 1 }}>

        {/* ── HERO ── */}
        <section className="act-hero">
          <div className="act-hero-bg" />
          <div className="act-hero-overlay" />
          <div className="act-hero-particles" />

          {/* Floating deco - removed */}


          <div className="act-hero-content">
            <div className="act-hero-badge">
              <Sparkles style={{ width: 12, height: 12 }} />
              Konservasi Laut Indonesia
            </div>
            <h1 className="act-hero-title">
              Kegiatan <span className="shimmer">Konservasi</span> Laut
            </h1>
            <p className="act-hero-desc">
              Temukan peluang menjadi relawan atau dukung kegiatan konservasi laut dengan donasi dan barang yang mereka butuhkan untuk sukses.
            </p>
          </div>

          <div className="act-wave">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
              <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ── SEARCH & FILTER BAR ── */}
        <div className="act-search-wrapper" id="kegiatan-list">
          <section className="act-search-bar">
            <div className="act-search-glow" />
            <div className="act-search-inner">
            <div className="act-search-input-wrap">
              <Search className="act-search-icon" style={{ width: 18, height: 18 }} />
              <input
                type="text"
                placeholder="Cari kegiatan konservasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="act-search-input"
              />
            </div>

            {/* Location dropdown */}
            <div className="act-dropdown-wrap">
              <button
                className="act-dropdown-btn"
                onClick={() => { setLocationOpen(!locationOpen); setTypeOpen(false); }}
              >
                <MapPin style={{ width: 15, height: 15 }} />
                {selectedLocation}
                <ChevronDown style={{ width: 14, height: 14, opacity: 0.7 }} />
              </button>
              {locationOpen && (
                <div className="act-dropdown-menu">
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      className="act-dropdown-item"
                      onClick={() => { setSelectedLocation(loc); setLocationOpen(false); }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Type dropdown */}
            <div className="act-dropdown-wrap">
              <button
                className="act-dropdown-btn"
                onClick={() => { setTypeOpen(!typeOpen); setLocationOpen(false); }}
              >
                <Filter style={{ width: 15, height: 15 }} />
                {activityTypeOptions.find(o => o.value === selectedType)?.label ?? selectedType}
                <ChevronDown style={{ width: 14, height: 14, opacity: 0.7 }} />
              </button>
              {typeOpen && (
                <div className="act-dropdown-menu">
                  {activityTypeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className="act-dropdown-item"
                      onClick={() => { setSelectedType(opt.value); setTypeOpen(false); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(selectedLocation !== "All Locations" || selectedType !== "All Types" || searchQuery !== "") && filteredActivities.length > 0 && (
              <span className="act-results-count">
                {filteredActivities.length} kegiatan ditemukan
              </span>
            )}
            </div>
          </section>
        </div>

        {/* ── ACTIVITY CARDS ── */}
        <section className="act-section">
          <div className="act-container">
            {filteredActivities.length > 0 ? (
              <div className="act-grid">
                {filteredActivities.map((activity) => {
                  const pct =
                    activity.fundingGoal > 0
                      ? Math.min(
                          Math.round(
                            (activity.fundingRaised / activity.fundingGoal) * 100
                          ),
                          100
                        )
                      : 0;
                  return (
                    <Link key={activity.id} href={`/activities/${activity.id}`} className="act-card" style={{ textDecoration: "none", cursor: "pointer" }}>
                      <div className="act-card-img-wrap">
                        <Image
                          src={activity.image}
                          alt={activity.title}
                          fill
                          className="object-cover"
                        />
                        <span className="act-card-badge">{activity.type}</span>
                      </div>
                      <div className="act-card-body">
                        <div className="act-card-header">
                          <div className="act-card-icon">
                            <activity.icon style={{ width: 20, height: 20, color: "#06958a" }} />
                          </div>
                          <h3 className="act-card-title">{activity.title}</h3>
                        </div>
                        <p className="act-card-desc">{activity.description}</p>

                        <div className="act-card-meta">
                          <div className="act-card-meta-item">
                            <Calendar style={{ width: 14, height: 14, color: "#06958a", flexShrink: 0 }} />
                            {activity.date}
                          </div>
                          <div className="act-card-meta-item">
                            <MapPin style={{ width: 14, height: 14, color: "#06958a", flexShrink: 0 }} />
                            {activity.location}
                          </div>
                          <div className="act-card-meta-item">
                            <Users style={{ width: 14, height: 14, color: "#06958a", flexShrink: 0 }} />
                            {activity.volunteers} / {activity.slots} relawan
                          </div>
                        </div>

                        {/* Funding Progress */}
                        <div className="act-progress-wrap">
                          <div className="act-progress-header">
                            <Banknote style={{ width: 14, height: 14, color: "#06958a", flexShrink: 0 }} />
                            <span className="act-progress-label">Progres Pendanaan</span>
                            <span className="act-progress-pct">{pct}%</span>
                          </div>
                          <div className="act-progress-track">
                            <div className="act-progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="act-progress-amounts">
                            <span className="act-progress-raised">{formatCurrency(activity.fundingRaised)}</span>
                            <span className="act-progress-goal">target {formatCurrency(activity.fundingGoal)}</span>
                          </div>
                        </div>

                        <div className="act-card-btns">
                          <span className="act-card-btn-primary">Relawan</span>
                          <span className="act-card-btn-ghost">Donasi</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="act-empty">
                <div className="act-empty-icon">
                  <Search style={{ width: 32, height: 32, color: "#06958a" }} />
                </div>
                <h3 className="act-empty-title">Tidak ada kegiatan ditemukan</h3>
                <p className="act-empty-desc">
                  Coba ubah kata kunci, lokasi, atau tipe kegiatan yang kamu cari.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── PILLARS ── */}
        <section className="act-section-alt">
          <div className="act-container">
            <div className="text-center" style={{ marginBottom: "3rem" }}>
              <div className="act-eyebrow mx-auto" style={{ justifyContent: "center" }}>
                <span className="act-eyebrow-dot" />
                Mengapa Bergabung
              </div>
              <h2 className="act-section-title">Setiap Aksi Memberi Dampak Nyata</h2>
              <p className="act-section-desc mx-auto">
                Kontribusimu — sekecil apapun — bermakna bagi keberlangsungan ekosistem laut Indonesia.
              </p>
            </div>
            <div className="act-pillars-grid">
              {pillars.map((p, i) => (
                <div
                  key={p.title}
                  className="act-pillar-card"
                >
                  <style>{`.act-pillar-card:nth-child(${i + 1})::after { background: linear-gradient(90deg, ${p.color}, ${p.color}88); }`}</style>
                  <div className="act-pillar-icon" style={{ background: p.bg }}>
                    <p.icon style={{ width: 24, height: 24, color: p.color }} />
                  </div>
                  <h3 className="act-pillar-title">{p.title}</h3>
                  <p className="act-pillar-desc">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="act-section">
          <div className="act-container">
            <div className="text-center" style={{ marginBottom: "3rem" }}>
              <div className="act-eyebrow mx-auto" style={{ justifyContent: "center" }}>
                <span className="act-eyebrow-dot" />
                Cara Berkontribusi
              </div>
              <h2 className="act-section-title">Mulai dalam 3 Langkah Mudah</h2>
              <p className="act-section-desc mx-auto">
                Proses sederhana untuk mulai berkontribusi pada pelestarian laut Indonesia bersama komunitas kami.
              </p>
            </div>
            <div className="act-how-grid">
              {howItWorks.map((h) => (
                <div key={h.step} className="act-how-card">
                  <div className="act-how-step">{h.step}</div>
                  <h3 className="act-how-title">{h.title}</h3>
                  <p className="act-how-desc">{h.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust indicators */}
            <div style={{ marginTop: "3.5rem", padding: "1.75rem 2rem", background: "#f0f9ff", borderRadius: "1.25rem", border: "1.5px solid rgba(6,149,138,0.12)", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, #0e4d6d, #06958a)", borderRadius: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Leaf style={{ width: 22, height: 22, color: "white" }} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0e2a3a", marginBottom: "0.25rem" }}>Terverifikasi & Dimoderasi</p>
                <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.55 }}>Seluruh kegiatan telah diverifikasi oleh tim SinergiLaut dan dikelola oleh komunitas yang terdaftar dan terpercaya.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {["Komunitas terverifikasi", "Laporan transparan", "Monitoring dampak"].map(t => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "#374151" }}>
                    <CheckCircle style={{ width: 15, height: 15, color: "#06958a", flexShrink: 0 }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


      </main>
      <Footer />
    </div>
  );
}
