import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import {
  ArrowRight, Users, Heart, Leaf, Calendar, MapPin,
  CheckCircle, Search, Gift, LineChart, FileText,
  Sparkles, Anchor, Zap, ShieldCheck, TrendingUp, Globe,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { formatDate } from "@/lib/utils/helpers"

const pillars = [
  { icon: ShieldCheck, title: "100% Transparan",  description: "Setiap donasi dan kegiatan dipantau secara publik. Laporan real-time tersedia untuk semua kontributor.", color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  { icon: Users,       title: "Komunitas Lokal",  description: "Dipimpin oleh komunitas yang memahami kebutuhan nyata ekosistem laut di wilayah mereka.",             color: "#06958a", bg: "rgba(6,149,138,0.08)"  },
  { icon: TrendingUp,  title: "Dampak Nyata",     description: "Dari pembersihan pantai hingga restorasi terumbu karang — setiap aksi meninggalkan jejak positif.",   color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
]

const donationSteps = [
  { step: "01", icon: Search,    title: "Pilih Kegiatan",   desc: "Telusuri dan pilih aksi pelestarian lingkungan atau pesisir yang ingin Anda dukung." },
  { step: "02", icon: Gift,      title: "Pilih Jenis Donasi", desc: "Sumbangkan sejumlah dana atau belikan barang yang sedang dibutuhkan oleh relawan." },
  { step: "03", icon: LineChart, title: "Pantau Eksekusi",  desc: "Lacak setiap progres pendanaan dan persiapan aksi secara transparan dan real-time." },
  { step: "04", icon: FileText,  title: "Terima Laporan",   desc: "Buka tab laporan untuk melihat bukti dokumen RAB dan galeri foto hasil kegiatan." },
]

const missionFeatures = [
  { icon: Users, title: "Komunitas di Garis Depan", desc: "Kami memberdayakan komunitas lokal untuk memimpin upaya konservasi di wilayah mereka." },
  { icon: Heart, title: "Dampak Transparan",        desc: "Setiap donasi dan usaha dilacak dan dilaporkan secara terbuka kepada publik." },
  { icon: Leaf,  title: "Aksi Berkesinambungan",    desc: "Program-program dirancang untuk menciptakan perubahan jangka panjang, bukan hanya aksi sesaat." },
]

export default async function HomePage() {
  const supabase = await createClient()

  // Redirect user yang sudah login ke dashboard masing-masing
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    const role = session.user.user_metadata?.role
    if (role === "admin")     redirect("/admin/dashboard")
    if (role === "community") redirect("/community/dashboard")
    redirect("/user/dashboard")
  }

  const [
    { count: userCount },
    { count: publishedCount },
    { count: completedCount },
    { data: fundingData },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("activities").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("activities").select("funding_raised"),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalFunding = (fundingData as any[])?.reduce((sum: number, a: any) => sum + (a.funding_raised || 0), 0) ?? 0
  const formatFunding = (amount: number) => {
    if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M+`
    if (amount >= 1_000_000)     return `Rp ${(amount / 1_000_000).toFixed(0)}Jt+`
    if (amount >= 1_000)         return `Rp ${(amount / 1_000).toFixed(0)}Rb+`
    return `Rp ${amount}`
  }

  const stats = [
    { icon: Users,  value: `${userCount ?? 0}+`,       label: "Relawan Aktif" },
    { icon: Globe,  value: `${publishedCount ?? 0}+`,   label: "Kegiatan Berlangsung" },
    { icon: Anchor, value: `${completedCount ?? 0}+`,   label: "Kegiatan Selesai" },
    { icon: Heart,  value: formatFunding(totalFunding), label: "Dana Terkumpul" },
  ]

  const { data: realActivities } = await supabase
    .from("activities").select("*").eq("status", "published")
    .order("created_at", { ascending: false }).limit(3)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const featuredActivities: any[] = (realActivities ?? []).map(d => ({
    ...d,
    image: d.cover_image_url || "/images/placeholder.jpg",
    date: formatDate(d.start_date || new Date().toISOString()),
    location: d.location || "Online",
    volunteers: d.volunteer_count || 0,
  }))

  const { data: realCompletedActivities } = await supabase
    .from("activities").select("*").eq("status", "completed")
    .order("start_date", { ascending: false }).limit(2)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedActivities: any[] = (realCompletedActivities ?? []).map(d => ({
    ...d,
    image: d.cover_image_url || "/images/placeholder.jpg",
    date: formatDate(d.start_date || new Date().toISOString()),
    location: d.location || "Online",
    volunteers: d.volunteer_count || 0,
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
              <div className="sl-eyebrow sl-eyebrow is-center">Tentang SinergiLaut</div>
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
                {featuredActivities.map((activity) => (
                  <Link key={activity.id} href={`/activities/${activity.id}`} className="sl-act-card">
                    <div className="sl-act-img">
                      <Image src={activity.image} alt={activity.title} fill className="object-cover" />
                      <span className="sl-act-badge">{activity.category || "Konservasi"}</span>
                    </div>
                    <div className="sl-act-body">
                      <h3 className="sl-act-title">{activity.title}</h3>
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
                          {activity.volunteers} relawan
                        </div>
                      </div>
                      <span className="sl-btn sl-btn-outline sl-btn-sm" style={{ marginTop: "auto" }}>
                        Lihat Detail <ArrowRight style={{ width: 14, height: 14 }} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--sl-body-2)" }}>
                <Leaf style={{ width: 48, height: 48, margin: "0 auto 1rem", color: "var(--sl-mute)" }} />
                <p>Belum ada kegiatan yang dipublikasikan.</p>
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <Link href="/activities" className="sl-btn sl-btn-brand sl-btn-md">
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
                {completedActivities.map((activity) => (
                  <div key={activity.id} className="sl-comp-card">
                    <div className="sl-comp-img">
                      <Image src={activity.image} alt={activity.title} fill className="object-cover" />
                      <div className="sl-comp-badge">
                        <CheckCircle style={{ width: 10, height: 10 }} /> Selesai
                      </div>
                    </div>
                    <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--sl-ink)", marginBottom: "0.5rem", lineHeight: 1.3 }}>{activity.title}</h3>
                      <p style={{ fontSize: "0.8125rem", color: "var(--sl-body-2)", lineHeight: 1.65, marginBottom: "1rem", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{activity.description}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.8rem", color: "var(--sl-body-2)", marginBottom: "1rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Users style={{ width: 13, height: 13, color: "var(--sl-success)" }} /> {activity.volunteers} relawan
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin style={{ width: 13, height: 13, color: "var(--sl-success)" }} /> {activity.location.split(",")[0]}
                        </span>
                      </div>
                      <Link href={`/activities/${activity.id}`} className="sl-btn sl-btn-primary sl-btn-sm" style={{ background: "var(--sl-grad-success)", boxShadow: "0 2px 8px rgba(22,163,74,0.3)" }}>
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
