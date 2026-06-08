import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import {
  ArrowRight, Users, Heart, Leaf, Calendar, MapPin,
  CheckCircle, Search, Gift, LineChart, FileText,
  Sparkles, Zap, ShieldCheck, TrendingUp, Globe, Building, Target, Banknote, Activity,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { formatDate, formatCurrency } from "@/lib/utils/helpers"
import { getHomePageStats } from "@/lib/actions/dashboard.actions"

// ISR: cache halaman selama 60 detik — menghindari 3 DB query per request
// Ubah ke nilai lebih kecil jika data harus selalu real-time
export const revalidate = 60

const pillars = [
  { icon: ShieldCheck, title: "100% Transparan",  description: "Setiap donasi dan kegiatan dipantau secara publik. Laporan real-time tersedia untuk semua kontributor.", color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  { icon: Users,       title: "Komunitas Lokal",  description: "Dipimpin oleh komunitas yang memahami kebutuhan nyata ekosistem laut di wilayah mereka.",             color: "#06958a", bg: "rgba(6,149,138,0.08)"  },
  { icon: TrendingUp,  title: "Dampak Nyata",     description: "Dari pembersihan pantai hingga restorasi terumbu karang — setiap aksi meninggalkan jejak positif.",   color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
]

const donationSteps = [
  { step: "01", icon: Search,    title: "Pilih Kegiatan",    desc: "Telusuri dan pilih aksi pelestarian lingkungan atau pesisir yang ingin Anda dukung." },
  { step: "02", icon: Gift,      title: "Pilih Jenis Donasi", desc: "Sumbangkan sejumlah dana atau belikan barang yang sedang dibutuhkan oleh relawan." },
  { step: "03", icon: LineChart, title: "Pantau Eksekusi",   desc: "Lacak setiap progres pendanaan dan persiapan aksi secara transparan dan real-time." },
  { step: "04", icon: FileText,  title: "Terima Laporan",    desc: "Buka tab laporan untuk melihat bukti dokumen RAB dan galeri foto hasil kegiatan." },
]

const missionFeatures = [
  { icon: Users, title: "Komunitas di Garis Depan", desc: "Kami memberdayakan komunitas lokal untuk memimpin upaya konservasi di wilayah mereka." },
  { icon: Heart, title: "Dampak Transparan",        desc: "Setiap donasi dan usaha dilacak dan dilaporkan secara terbuka kepada publik." },
  { icon: Leaf,  title: "Aksi Berkesinambungan",    desc: "Program-program dirancang untuk menciptakan perubahan jangka panjang, bukan hanya aksi sesaat." },
]

export default async function HomePage() {
  const homeStats = await getHomePageStats()

  const stats = [
    {
      icon: Users,
      value: `${homeStats.totalVolunteers.toLocaleString("id-ID")}`,
      label: "Relawan Aktif",
    },
    {
      icon: Globe,
      value: `${homeStats.ongoingActivities}`,
      label: "Kegiatan Berlangsung",
    },
    {
      icon: Building,
      value: `${homeStats.totalCommunities.toLocaleString("id-ID")}`,
      label: "Jumlah Komunitas",
    },
  ]

  const supabase = await createClient()

  const { data: realActivities } = await supabase
    .from("activities").select("*").eq("status", "published")
    .order("created_at", { ascending: false }).limit(3)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featuredActivities: any[] = (realActivities ?? []).map(d => ({
    ...d,
    image: d.cover_image_url || "/placeholder.jpg",
    date: formatDate(d.start_date || new Date().toISOString()),
    location: d.location || "Online",
    volunteers: d.volunteer_count || 0,
  }))

  const { data: realCompletedActivities } = await supabase
    .from("activities").select("*").eq("status", "completed").eq("is_featured", true)
    .order("updated_at", { ascending: false }).limit(3)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedActivities: any[] = (realCompletedActivities ?? []).map(d => ({
    ...d,
    image: d.cover_image_url || "/placeholder.jpg",
    date: formatDate(d.start_date || new Date().toISOString()),
    location: d.location || "Online",
    volunteers: d.volunteer_count || 0,
  }))

  const { data: realCommunities } = await supabase
    .from("communities").select("*").eq("is_verified", true)
    .order("member_count", { ascending: false }).limit(3)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featuredCommunities: any[] = (realCommunities ?? []).map(c => ({
    ...c,
    avatar: c.logo_url || "/placeholder-logo.png",
  }))

  return (
    <div className="sl-marketing">
      <Navigation />
      <main style={{ flex: 1 }}>

        {/* ── HERO ── */}
        <section className="sl-hero">
          <div className="sl-hero-bg" style={{ backgroundImage: "url('/images/hero-ocean.jpg')" }} />
          <div className="sl-hero-overlay" />
          <div className="sl-hero-particles" />

          <div className="sl-hero-content">
            <div className="sl-badge sl-badge-cyan">
              <Sparkles style={{ width: 12, height: 12 }} />
              Platform Konservasi Laut Indonesia
            </div>

            <div className="sl-hero-logo">
              <Image src="/images/SinergiLautLogo-transparent.png" alt="SinergiLaut Logo" width={64} height={64} style={{ width: "100%", height: "auto", objectFit: "contain" }} priority />
            </div>

            <h1 className="sl-hero-title">
              Bersama Jaga<br />
              <span className="sl-shimmer">Laut Indonesia</span>
            </h1>
            <p className="sl-hero-desc">
              Terhubung dengan komunitas konservasi, relawan, dan donatur untuk menciptakan dampak nyata bagi ekosistem laut Nusantara.
            </p>
            <div className="sl-hero-btns">
              <Link href="/activities" className="sl-btn sl-btn-primary sl-btn-lg">
                Lihat Kegiatan <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
              <Link href="/register" className="sl-btn sl-btn-ghost-dark sl-btn-lg">
                Daftar Gratis
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="sl-stats-wrapper">
              <section className="sl-stats-bar">
                <div className="sl-stats-inner">
                  {stats.map((s) => (
                    <div key={s.label} className="sl-stat-item">
                      <div className="sl-stat-icon">
                        <s.icon style={{ width: 22, height: 22, color: "rgba(255,255,255,0.95)" }} />
                      </div>
                      <div className="sl-stat-val">{s.value}</div>
                      <div className="sl-stat-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="sl-hero-wave">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,80 L0,80 Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ── INTRO ── */}
        <section className="sl-section">
          <div className="sl-container">
            <div className="sl-intro-card">
              <div className="sl-eyebrow is-center sl-mx-auto">Tentang SinergiLaut</div>
              <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.25rem)", fontWeight: 800, color: "var(--sl-ink)", letterSpacing: "-0.02em", marginBottom: "1rem" }}>
                Mengenal SinergiLaut Lebih Dekat
              </h2>
              <p style={{ fontSize: "1.0625rem", color: "var(--sl-body)", lineHeight: 1.75, marginBottom: "2rem", maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
                SinergiLaut hadir sebagai wadah kolaboratif yang menghubungkan berbagai elemen masyarakat — dari relawan, donatur, hingga komunitas lokal — untuk bersinergi melindungi dan menjaga kelestarian ekosistem laut Nusantara melalui aksi nyata dan berkesinambungan.
              </p>
              <Link href="/about" className="sl-btn sl-btn-brand sl-btn-md">
                Pelajari Lebih Lanjut <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── PILLARS ── */}
        <section className="sl-section-alt">
          <div className="sl-container">
            <div className="sl-text-center" style={{ marginBottom: "3rem" }}>
              <div className="sl-eyebrow is-center sl-mx-auto">Nilai Kami</div>
              <h2 className="sl-section-title">Dibangun di Atas Tiga Prinsip</h2>
              <p className="sl-section-desc is-center sl-mx-auto">
                Fondasi kuat yang membuat setiap langkah konservasi kami bermakna dan berdampak.
              </p>
            </div>
            <div className="sl-grid-pillars">
              {pillars.map((p) => (
                <div key={p.title} className="sl-pillar-card" style={{ "--sl-pillar-stripe": p.color } as React.CSSProperties}>
                  <div className="sl-pillar-icon" style={{ background: p.bg }}>
                    <p.icon style={{ width: 26, height: 26, color: p.color }} />
                  </div>
                  <h3 className="sl-pillar-title">{p.title}</h3>
                  <p className="sl-pillar-desc">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED ACTIVITIES ── */}
        <section className="sl-section">
          <div className="sl-container">
            <div className="sl-text-center" style={{ marginBottom: "3rem" }}>
              <div className="sl-eyebrow is-center sl-mx-auto">Kegiatan Unggulan</div>
              <h2 className="sl-section-title">Kegiatan Konservasi Terbaru</h2>
              <p className="sl-section-desc is-center sl-mx-auto">
                Temukan cara bermakna untuk berkontribusi bagi pelestarian laut melalui berbagai program kami.
              </p>
            </div>

            {featuredActivities.length > 0 ? (
              <div className="sl-grid-acts">
                {featuredActivities.map((activity) => {
                  const pct = activity.funding_goal > 0
                    ? Math.min(Math.round((activity.funding_raised / activity.funding_goal) * 100), 100)
                    : 0
                  return (
                    <Link key={activity.id} href={`/activities/${activity.id}`} className="sl-act-card">
                      <div className="sl-act-img">
                        <Image src={activity.image} alt={activity.title} fill className="object-cover" />
                        <span className="sl-act-badge">{activity.category || "Konservasi"}</span>
                        <span className="sl-act-status-badge">Aktif</span>
                      </div>
                      <div className="sl-act-body">
                        <div className="sl-act-header">
                          <div className="sl-act-icon">
                            <Leaf style={{ width: 20, height: 20, color: "#06958a" }} />
                          </div>
                          <h3 className="sl-act-title">{activity.title}</h3>
                        </div>
                        <p className="sl-act-desc">{activity.description}</p>
                        <div className="sl-act-meta">
                          <div className="sl-act-meta-item">
                            <Calendar style={{ width: 14, height: 14, color: "#06958a" }} />
                            {activity.date}
                          </div>
                          <div className="sl-act-meta-item">
                            <MapPin style={{ width: 14, height: 14, color: "#06958a" }} />
                            {activity.location}
                          </div>
                          <div className="sl-act-meta-item">
                            <Users style={{ width: 14, height: 14, color: "#06958a" }} />
                            {activity.volunteers} / {activity.volunteer_quota || 0} relawan
                          </div>
                        </div>
                        <div className="sl-act-progress">
                          <div className="sl-act-progress-header">
                            <Banknote style={{ width: 14, height: 14, color: "#06958a" }} />
                            <span className="sl-act-progress-label">Progres Pendanaan</span>
                            <span className="sl-act-progress-pct">{pct}%</span>
                          </div>
                          <div className="sl-act-progress-track">
                            <div className="sl-act-progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="sl-act-progress-amounts">
                            <span>{formatCurrency(activity.funding_raised || 0)}</span>
                            <span className="sl-act-progress-goal">target {formatCurrency(activity.funding_goal || 0)}</span>
                          </div>
                        </div>
                        <div className="sl-act-btns">
                          <span className="sl-act-btn-primary">
                            <Users style={{ width: 14, height: 14 }} /> Relawan
                          </span>
                          <span className="sl-act-btn-ghost">
                            <Heart style={{ width: 14, height: 14 }} /> Donasi
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--sl-body-2)" }}>
                <Leaf style={{ width: 48, height: 48, margin: "0 auto 1rem", color: "var(--sl-mute)" }} />
                <p>Belum ada kegiatan yang dipublikasikan.</p>
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <Link href="/activities#active" className="sl-btn sl-btn-brand sl-btn-md">
                Lihat Semua Kegiatan <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── COMPLETED ACTIVITIES ── */}
        {completedActivities.length > 0 && (
          <section className="sl-section-alt">
            <div className="sl-container">
              <div className="sl-text-center" style={{ marginBottom: "3rem" }}>
                <div className="sl-eyebrow is-success is-center sl-mx-auto">Keberhasilan Kami</div>
                <h2 className="sl-section-title">Konservasi yang Berhasil</h2>
                <p className="sl-section-desc is-center sl-mx-auto">
                  Aksi nyata yang telah berhasil diselesaikan berkat dukungan donatur dan relawan luar biasa kami.
                </p>
              </div>
              <div className="sl-grid-comps">
                {completedActivities.map((activity) => {
                  const pct = activity.funding_goal > 0
                    ? Math.min(Math.round((activity.funding_raised / activity.funding_goal) * 100), 100)
                    : 0
                  return (
                    <Link key={activity.id} href={`/activities/${activity.id}#reports`} className="sl-comp-card">
                      <div className="sl-comp-img">
                        <Image src={activity.image} alt={activity.title} fill className="object-cover" />
                        <span className="sl-comp-cat-badge">{activity.category || "Konservasi"}</span>
                        <div className="sl-comp-badge">
                          <CheckCircle style={{ width: 10, height: 10 }} /> Selesai
                        </div>
                      </div>
                      <div className="sl-comp-body">
                        <div className="sl-comp-header">
                          <div className="sl-comp-icon">
                            <Leaf style={{ width: 20, height: 20, color: "#64748b" }} />
                          </div>
                          <h3 className="sl-comp-title">{activity.title}</h3>
                        </div>
                        <p className="sl-comp-desc">{activity.description}</p>
                        <div className="sl-comp-meta">
                          <span className="sl-comp-meta-item">
                            <Calendar style={{ width: 13, height: 13, color: "var(--sl-success)" }} /> {activity.date}
                          </span>
                          <span className="sl-comp-meta-item">
                            <MapPin style={{ width: 13, height: 13, color: "var(--sl-success)" }} /> {activity.location.split(",")[0]}
                          </span>
                          <span className="sl-comp-meta-item">
                            <Users style={{ width: 13, height: 13, color: "var(--sl-success)" }} /> {activity.volunteers} relawan
                          </span>
                        </div>
                        <div className="sl-comp-progress">
                          <div className="sl-comp-progress-header">
                            <Target style={{ width: 14, height: 14, color: "var(--sl-success)" }} />
                            <span className="sl-comp-progress-label">Hasil Akhir</span>
                            <span className="sl-comp-progress-pct">{pct}%</span>
                          </div>
                          <div className="sl-comp-progress-track">
                            <div className="sl-comp-progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="sl-comp-progress-amount">Terkumpul {formatCurrency(activity.funding_raised || 0)}</span>
                        </div>
                        <span className="sl-comp-btn">
                          Lihat Laporan <ArrowRight style={{ width: 13, height: 13 }} />
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
              <div style={{ textAlign: "center", marginTop: "3rem" }}>
                <Link href="/activities#completed" className="sl-btn sl-btn-brand sl-btn-md">
                  Lihat Semua Konservasi yang Berhasil <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── COMMUNITIES ── */}
        {featuredCommunities.length > 0 && (
          <section className="sl-section">
            <div className="sl-container">
              <div className="sl-text-center" style={{ marginBottom: "3rem" }}>
                <div className="sl-eyebrow is-center sl-mx-auto">Komunitas Kami</div>
                <h2 className="sl-section-title">Digerakkan oleh Komunitas Lokal</h2>
                <p className="sl-section-desc is-center sl-mx-auto">
                  Komunitas terverifikasi yang memimpin aksi konservasi laut di berbagai wilayah Indonesia.
                </p>
              </div>
              <div className="sl-grid-comm">
                {featuredCommunities.map((community) => (
                  <Link key={community.id} href={`/community/${community.id}`} className="sl-comm-card">
                    <div className="sl-comm-header">
                      <div className="sl-comm-avatar">
                        <Image src={community.avatar} alt={community.name} fill className="object-cover" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {community.is_verified && (
                          <div className="sl-comm-verified">
                            <ShieldCheck style={{ width: 10, height: 10 }} /> Terverifikasi
                          </div>
                        )}
                        <h3 className="sl-comm-name">{community.name}</h3>
                        <div className="sl-comm-loc">
                          <MapPin style={{ width: 12, height: 12, color: "#06958a" }} />
                          {community.location || "Tanpa Lokasi"}
                        </div>
                      </div>
                    </div>
                    <p className="sl-comm-desc">{community.description || "Tidak ada deskripsi"}</p>
                    {(community.focus_areas || []).length > 0 && (
                      <div className="sl-comm-tags">
                        {(community.focus_areas || []).slice(0, 3).map((f: string) => (
                          <span key={f} className="sl-comm-tag">{f}</span>
                        ))}
                      </div>
                    )}
                    <div className="sl-comm-meta">
                      <span className="sl-comm-meta-item">
                        <Users style={{ width: 13, height: 13, color: "#06958a" }} />
                        {community.member_count || 0} anggota
                      </span>
                      <span className="sl-comm-meta-item">
                        <Activity style={{ width: 13, height: 13, color: "#06958a" }} />
                        Aktif
                      </span>
                    </div>
                    <span className="sl-comm-btn">
                      Lihat Komunitas <ArrowRight style={{ width: 14, height: 14 }} />
                    </span>
                  </Link>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: "3rem" }}>
                <Link href="/community" className="sl-btn sl-btn-brand sl-btn-md">
                  Lihat Semua Komunitas <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── MISSION ── */}
        <section className="sl-section">
          <div className="sl-container">
            <div className="sl-grid-mission">
              <div>
                <div className="sl-eyebrow">Misi Kami</div>
                <h2 className="sl-section-title">Konservasi Laut yang Berkelanjutan</h2>
                <p className="sl-section-desc" style={{ marginBottom: "0.5rem" }}>
                  SinergiLaut menyatukan individu, organisasi, dan korporasi yang peduli untuk menciptakan perubahan positif jangka panjang bagi ekosistem laut kita.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "2rem" }}>
                  {missionFeatures.map((f) => (
                    <div key={f.title} className="sl-feat-row">
                      <div className="sl-feat-icon">
                        <f.icon style={{ width: 20, height: 20, color: "var(--sl-teal)" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--sl-ink)", marginBottom: "0.25rem" }}>{f.title}</p>
                        <p style={{ fontSize: "0.8125rem", color: "var(--sl-body-2)", lineHeight: 1.55 }}>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ borderRadius: "1.5rem", overflow: "hidden", height: 420, position: "relative", boxShadow: "var(--sl-shadow-hero)" }}>
                <Image src="/images/mission-ocean.jpg" alt="Ocean conservation in action" fill className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW TO DONATE ── */}
        <section className="sl-section-alt">
          <div className="sl-container">
            <div className="sl-text-center" style={{ marginBottom: "3rem" }}>
              <div className="sl-eyebrow is-center sl-mx-auto">Cara Berdonasi</div>
              <h2 className="sl-section-title">Mudah &amp; Transparan dalam 4 Langkah</h2>
              <p className="sl-section-desc is-center sl-mx-auto">
                Langkah sederhana untuk ikut berkontribusi dalam menjaga kelestarian laut Indonesia.
              </p>
            </div>
            <div className="sl-grid-how">
              {donationSteps.map((d) => (
                <div key={d.step} className="sl-how-card">
                  <div className="sl-how-step">{d.step}</div>
                  <div className="sl-how-icon">
                    <d.icon style={{ width: 26, height: 26, color: "var(--sl-teal)" }} />
                  </div>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--sl-ink)", marginBottom: "0.5rem" }}>{d.title}</h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--sl-body-2)", lineHeight: 1.65 }}>{d.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <Link href="/activities" className="sl-btn sl-btn-brand sl-btn-md">
                Mulai Berdonasi Sekarang <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="sl-cta">
          <div className="sl-cta-dots" />
          <div className="sl-cta-glow" />
          <div className="sl-cta-inner">
            <div className="sl-badge sl-badge-cyan" style={{ marginBottom: "1.5rem" }}>
              <Zap style={{ width: 12, height: 12 }} />
              Bergabung Sekarang
            </div>
            <h2 className="sl-cta-title">Jadilah Bagian dari<br />Gerakan Laut Bersih</h2>
            <p className="sl-cta-desc">
              Daftarkan diri atau komunitasmu dan mulai berkontribusi nyata bagi kelestarian ekosistem laut Indonesia hari ini.
            </p>
            <div className="sl-cta-btns">
              <Link href="/register" className="sl-btn sl-btn-primary sl-btn-lg is-cta-on-dark">
                Daftar Gratis <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/activities" className="sl-btn sl-btn-ghost-dark sl-btn-lg">
                Lihat Kegiatan
              </Link>
            </div>
            <div className="sl-trust">
              {["100% Transparan", "Komunitas Terverifikasi", "Dampak Nyata", "Gratis Bergabung"].map(t => (
                <div key={t} className="sl-trust-item">
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
