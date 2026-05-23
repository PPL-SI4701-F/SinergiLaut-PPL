import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import {
  Users, Target, Eye, Heart, Globe, Award, Leaf, Zap, Banknote,
  CheckCircle, BookOpen, Star, TrendingUp,
  Anchor, Shield, Sparkles
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"

interface JourneyMilestone {
  id: string; year: number; title: string; description: string;
  impact_stat: string | null; icon: string; order_index: number;
  is_published: boolean; created_at: string; updated_at: string;
}

const iconMap: Record<string, React.ElementType> = {
  Users, Award, Leaf, Globe, Zap, Banknote, CheckCircle,
  BookOpen, Star, TrendingUp, Target, Eye, Heart, Anchor,
}

const teamMembers = [
  { name: "Dr. Arif Wicaksono", role: "Founder & CEO",           image: "/images/testimonial-1.jpg", bio: "Ahli biologi kelautan dengan 15 tahun pengalaman konservasi pesisir." },
  { name: "Sari Puspita",       role: "Head of Community",        image: "/images/testimonial-2.jpg", bio: "Spesialis pemberdayaan komunitas pesisir di seluruh Indonesia." },
  { name: "Reza Mahendra",      role: "Chief Technology Officer", image: "/images/testimonial-3.jpg", bio: "Engineer berpengalaman di bidang platform sosial dan lingkungan." },
]

const values = [
  { icon: Heart, title: "Kolaborasi",    description: "Kami percaya perubahan besar terjadi ketika komunitas, individu, dan organisasi bekerja bersama.", color: "#ef4444", bg: "rgba(239,68,68,0.08)"  },
  { icon: Eye,   title: "Transparansi",  description: "Setiap rupiah donasi dan setiap kegiatan dilaporkan dengan akuntabel dan terbuka untuk publik.",   color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  { icon: Leaf,  title: "Keberlanjutan", description: "Semua program dirancang untuk menciptakan dampak jangka panjang pada ekosistem laut.",             color: "#22c55e", bg: "rgba(34,197,94,0.08)"  },
  { icon: Globe, title: "Inklusif",      description: "Platform kami terbuka untuk semua — dari nelayan tradisional hingga korporat besar.",             color: "#06958a", bg: "rgba(6,149,138,0.08)"  },
]

const fallbackMilestones: JourneyMilestone[] = [
  { id: "1", year: 2026, title: "SinergiLaut Didirikan", description: "SinergiLaut lahir dari keresahan akan sulitnya koordinasi antar komunitas konservasi laut di Indonesia. Platform ini hadir sebagai jembatan digital pertama untuk gerakan konservasi kolaboratif.", impact_stat: "Misi dimulai", icon: "Globe", order_index: 1, is_published: true, created_at: "", updated_at: "" },
]

async function getMilestones(): Promise<JourneyMilestone[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("journey_milestones").select("*")
      .eq("is_published", true).order("order_index", { ascending: true })
    if (error || !data || data.length === 0) return fallbackMilestones
    return data as JourneyMilestone[]
  } catch { return fallbackMilestones }
}

export default async function AboutPage() {
  const milestones = await getMilestones()

  const supabase = await createClient()
  const [
    { count: userCount }, { count: communityCount },
    { count: activityCount }, { data: fundingData },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("communities").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("activities").select("*", { count: "exact", head: true }),
    supabase.from("activities").select("funding_raised"),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalFunding = (fundingData as any[])?.reduce((sum: number, a: any) => sum + (a.funding_raised || 0), 0) ?? 0
  const formatFunding = (n: number) => {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M+`
    if (n >= 1_000_000)     return `Rp ${(n / 1_000_000).toFixed(0)}Jt+`
    if (n >= 1_000)         return `Rp ${(n / 1_000).toFixed(0)}Rb+`
    return `Rp ${n}`
  }

  const stats = [
    { value: `${userCount ?? 0}+`,        label: "Relawan Aktif",  icon: Users    },
    { value: `${communityCount ?? 0}+`,   label: "Komunitas",      icon: Globe    },
    { value: `${activityCount ?? 0}+`,    label: "Kegiatan",       icon: Award    },
    { value: formatFunding(totalFunding), label: "Dana Terhimpun", icon: Banknote },
  ]

  return (
    <div className="sl-marketing">
      {/* Page-specific styles — timeline, values, team (tidak ada di sinergilaut.css) */}
      <style>{`
        .about-mission-grid { display:grid; gap:4rem; align-items:center; }
        @media(min-width:1024px){ .about-mission-grid{ grid-template-columns:1fr 1fr; } }
        .about-mission-image { position:relative; border-radius:1.5rem; overflow:hidden; height:500px; box-shadow:0 25px 60px rgba(14,77,109,0.2); }
        .about-vision-card { margin-top:1.5rem; padding:1.25rem 1.5rem; background:linear-gradient(135deg,rgba(6,149,138,0.06),rgba(14,77,109,0.04)); border:1.5px solid rgba(6,149,138,0.15); border-radius:1rem; display:flex; align-items:flex-start; gap:0.875rem; }
        .about-vision-icon { width:38px; height:38px; background:linear-gradient(135deg,#0e4d6d,#06958a); border-radius:0.625rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .about-values-grid { display:grid; gap:1.5rem; grid-template-columns:1fr; }
        @media(min-width:640px){ .about-values-grid{ grid-template-columns:repeat(2,1fr); } }
        @media(min-width:1024px){ .about-values-grid{ grid-template-columns:repeat(4,1fr); } }
        .about-value-card { background:white; border-radius:1.25rem; padding:1.75rem; border:1.5px solid rgba(0,0,0,0.06); box-shadow:0 2px 8px rgba(0,0,0,0.04); transition:all 0.3s ease; position:relative; overflow:hidden; }
        .about-value-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--vc,transparent); opacity:0; transition:opacity 0.3s; }
        .about-value-card:hover { transform:translateY(-4px); box-shadow:0 12px 30px rgba(0,0,0,0.1); }
        .about-value-card:hover::before { opacity:1; }
        .about-value-icon { width:48px; height:48px; border-radius:0.875rem; display:flex; align-items:center; justify-content:center; margin-bottom:1.125rem; }
        .about-value-title { font-size:1.0625rem; font-weight:700; color:#0e2a3a; margin-bottom:0.5rem; }
        .about-value-desc { font-size:0.875rem; color:#64748b; line-height:1.65; }
        .about-timeline { position:relative; }
        .about-timeline-line { position:absolute; left:24px; top:0; bottom:0; width:2px; background:linear-gradient(to bottom,#06958a,rgba(6,149,138,0.15)); }
        @media(min-width:768px){ .about-timeline-line{ left:50%; transform:translateX(-50%); } }
        .about-timeline-items { display:flex; flex-direction:column; gap:0; }
        .about-timeline-item { position:relative; display:flex; align-items:flex-start; gap:1.5rem; padding-bottom:3rem; }
        @media(min-width:768px){ .about-timeline-item{ justify-content:flex-end; padding-right:calc(50% + 2.5rem); } .about-timeline-item:nth-child(even){ justify-content:flex-start; padding-right:0; padding-left:calc(50% + 2.5rem); } }
        .about-timeline-node { position:absolute; left:24px; top:0; transform:translate(-50%,0); z-index:10; }
        @media(min-width:768px){ .about-timeline-node{ left:50%; } }
        .about-timeline-bubble { width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,#0e4d6d,#06958a); display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 4px rgba(6,149,138,0.15),0 4px 12px rgba(6,149,138,0.3); }
        .about-timeline-card { background:white; border-radius:1.25rem; padding:1.5rem; border:1.5px solid rgba(0,0,0,0.06); box-shadow:0 4px 16px rgba(0,0,0,0.06); transition:all 0.3s ease; max-width:380px; margin-left:3.5rem; }
        @media(min-width:768px){ .about-timeline-card{ margin-left:0; } }
        .about-timeline-card:hover { transform:translateY(-2px); box-shadow:0 12px 30px rgba(6,149,138,0.12); }
        .about-timeline-year { font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:#06958a; margin-bottom:0.5rem; }
        .about-timeline-title { font-size:1rem; font-weight:700; color:#0e2a3a; margin-bottom:0.5rem; }
        .about-timeline-desc { font-size:0.875rem; color:#64748b; line-height:1.6; margin-bottom:0.75rem; }
        .about-timeline-badge { display:inline-flex; align-items:center; background:rgba(6,149,138,0.08); color:#06958a; font-size:0.75rem; font-weight:600; padding:0.25rem 0.75rem; border-radius:9999px; }
        .about-team-grid { display:grid; gap:2rem; grid-template-columns:1fr; }
        @media(min-width:640px){ .about-team-grid{ grid-template-columns:repeat(3,1fr); } }
        .about-team-card { background:white; border-radius:1.5rem; border:1.5px solid rgba(0,0,0,0.06); box-shadow:0 2px 8px rgba(0,0,0,0.05); transition:all 0.3s ease; text-align:center; padding:2rem; }
        .about-team-card:hover { transform:translateY(-6px); box-shadow:0 20px 40px rgba(14,77,109,0.15); }
        .about-team-avatar { position:relative; width:90px; height:90px; border-radius:50%; overflow:hidden; margin:0 auto 1.25rem; box-shadow:0 0 0 4px rgba(6,149,138,0.15),0 8px 20px rgba(0,0,0,0.1); }
        .about-team-name { font-size:1.0625rem; font-weight:700; color:#0e2a3a; margin-bottom:0.3rem; }
        .about-team-role { font-size:0.8125rem; font-weight:600; background:linear-gradient(135deg,#0e4d6d,#06958a); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:0.75rem; }
        .about-team-bio { font-size:0.8125rem; color:#64748b; line-height:1.6; }
      `}</style>

      <Navigation />
      <main style={{ flex: 1 }}>

        {/* ── HERO ── */}
        <section className="sl-hero">
          <div className="sl-hero-bg" style={{ backgroundImage: "url('/images/hero-ocean.jpg')" }} />
          <div className="sl-hero-overlay" />
          <div className="sl-hero-particles" />
          <div className="sl-hero-content">
            <div className="sl-badge sl-badge-cyan">
              <Sparkles style={{ width: 13, height: 13 }} />
              Platform Konservasi Laut Indonesia
            </div>
            <h1 className="sl-hero-title">
              Tentang <span className="sl-shimmer">SinergiLaut</span>
            </h1>
            <p className="sl-hero-desc">
              Platform digital yang mempertemukan komunitas, relawan, dan donatur dalam satu ekosistem terintegrasi untuk melindungi lautan Indonesia.
            </p>
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

        {/* ── MISSION & VISION ── */}
        <section className="sl-section">
          <div className="sl-container">
            <div className="about-mission-grid">
              <div>
                <div className="sl-eyebrow">Misi Kami</div>
                <h2 className="sl-section-title">Melindungi Laut Indonesia,<br />Bersama-sama</h2>
                <p className="sl-section-desc">
                  SinergiLaut hadir sebagai jembatan antara semangat masyarakat peduli lingkungan dan kebutuhan nyata di lapangan. Kami menyediakan infrastruktur digital untuk memudahkan koordinasi kegiatan konservasi, transparansi dana, dan pengembangan komunitas.
                </p>
                <div className="about-vision-card">
                  <div className="about-vision-icon">
                    <Eye style={{ width: 18, height: 18, color: "white" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0e4d6d", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Visi Kami</p>
                    <p style={{ fontSize: "0.9375rem", color: "#374151", lineHeight: 1.65 }}>
                      Indonesia dengan ekosistem laut yang sehat, terlindungi, dan dikelola secara berkelanjutan oleh generasi yang peduli.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
                  {["Koordinasi kegiatan konservasi lintas komunitas", "Transparansi pengelolaan dan pelaporan dana", "Pemberdayaan nelayan dan masyarakat pesisir"].map(txt => (
                    <div key={txt} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem", color: "#374151" }}>
                      <CheckCircle style={{ width: 18, height: 18, color: "#06958a", flexShrink: 0 }} />
                      {txt}
                    </div>
                  ))}
                </div>
              </div>
              <div className="about-mission-image">
                <Image src="/images/mission-ocean.jpg" alt="Konservasi laut Indonesia" fill style={{ objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", right: "1.5rem", background: "rgba(3,28,54,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(103,232,249,0.2)", borderRadius: "1rem", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
                  <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#06958a,#0e4d6d)", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Shield style={{ width: 18, height: 18, color: "white" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "white", marginBottom: "0.15rem" }}>Terverifikasi &amp; Transparan</p>
                    <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.65)" }}>Semua kegiatan &amp; dana terlacak secara real-time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="sl-section-alt">
          <div className="sl-container">
            <div className="sl-text-center" style={{ marginBottom: "3rem" }}>
              <div className="sl-eyebrow is-center sl-mx-auto">Nilai-nilai Kami</div>
              <h2 className="sl-section-title">Prinsip yang Memandu Langkah Kami</h2>
              <p className="sl-section-desc is-center sl-mx-auto">
                Empat pilar utama yang menjadi fondasi seluruh keputusan dan program SinergiLaut.
              </p>
            </div>
            <div className="about-values-grid">
              {values.map((v) => (
                <div key={v.title} className="about-value-card" style={{ "--vc": v.color } as React.CSSProperties}>
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
        <section className="sl-section" id="perjalanan-kami">
          <div className="sl-container-md">
            <div className="sl-text-center" style={{ marginBottom: "4rem" }}>
              <div className="sl-eyebrow is-center sl-mx-auto">Perjalanan Kami</div>
              <h2 className="sl-section-title">Dari Mimpi Kecil Menjadi<br />Gerakan Nyata</h2>
              <p className="sl-section-desc is-center sl-mx-auto">
                Setiap tonggak perjalanan SinergiLaut adalah bukti nyata kekuatan kolaborasi untuk laut Indonesia.
              </p>
            </div>
            <div className="about-timeline" style={{ paddingLeft: "1.5rem" }}>
              <div className="about-timeline-line" />
              <div className="about-timeline-items">
                {milestones.map((m) => {
                  const IconComponent = iconMap[m.icon] ?? Award
                  return (
                    <div key={m.id} className="about-timeline-item">
                      <div className="about-timeline-node">
                        <div className="about-timeline-bubble">
                          <IconComponent style={{ width: 20, height: 20, color: "white" }} />
                        </div>
                      </div>
                      <div className="about-timeline-card">
                        <p className="about-timeline-year">{m.year}</p>
                        <h3 className="about-timeline-title">{m.title}</h3>
                        <p className="about-timeline-desc">{m.description}</p>
                        {m.impact_stat && <span className="about-timeline-badge">{m.impact_stat}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── STRUKTUR ORGANISASI ── */}
        <section className="sl-section-alt">
          <div className="sl-container">
            <div className="sl-text-center" style={{ marginBottom: "3rem" }}>
              <div className="sl-eyebrow is-center sl-mx-auto">Struktur Organisasi</div>
              <h2 className="sl-section-title">Struktur Organisasi Kami</h2>
              <p className="sl-section-desc is-center sl-mx-auto">
                Tim yang berdedikasi membangun SinergiLaut untuk masa depan laut Indonesia.
              </p>
            </div>
            <div className="about-team-grid" style={{ maxWidth: 900, margin: "0 auto" }}>
              {teamMembers.map((member) => (
                <div key={member.name} className="about-team-card">
                  <div className="about-team-avatar">
                    <Image src={member.image} alt={member.name} fill style={{ objectFit: "cover" }} />
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
