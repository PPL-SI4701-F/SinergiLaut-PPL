"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import {
  Users, Heart, Calendar, MapPin, Banknote, Package, ArrowRight, Search
} from "lucide-react"
import { formatCurrency, formatDateShort } from "@/lib/utils/helpers"

type UserTab = "overview" | "volunteer" | "donations"

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  approved:  { label: "Disetujui", color: "#34d399", bg: "rgba(52,211,153,0.15)",  border: "rgba(52,211,153,0.35)"  },
  pending:   { label: "Menunggu",  color: "#fbbf24", bg: "rgba(251,191,36,0.15)",  border: "rgba(251,191,36,0.35)"  },
  rejected:  { label: "Ditolak",  color: "#f87171", bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.35)" },
  completed: { label: "Selesai",  color: "#60a5fa", bg: "rgba(96,165,250,0.15)",  border: "rgba(96,165,250,0.35)"  },
  attended:  { label: "Hadir",    color: "#34d399", bg: "rgba(52,211,153,0.15)",  border: "rgba(52,211,153,0.35)"  },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status]
  if (!cfg) return <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">{status}</span>
  return (
    <span className="text-[10px] font-bold uppercase tracking-tight px-2.5 py-0.5 rounded-full"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  )
}

interface VolunteerItem {
  id: string
  status: string
  created_at: string
  activity: {
    id: string
    title: string
    slug: string
    start_date: string | null
    location: string | null
    cover_image_url: string | null
    status: string
    community: { name: string; logo_url: string | null } | null
  } | null
}

interface DonationItem {
  id: string
  type: string
  amount: number | null
  status: string
  created_at: string
  is_anonymous: boolean
  note: string | null
  activity: { id: string; title: string; slug: string } | null
  items: { item_name: string; quantity: number }[]
}

interface ActivityItem {
  id: string
  title: string
  description: string | null
  location: string | null
  start_date: string | null
  volunteer_quota: number | null
  volunteer_count: number | null
  category: string | null
  cover_image_url: string | null
  community: { name: string; logo_url: string | null } | null
}

interface DashboardClientProps {
  volunteers: VolunteerItem[]
  donations: DonationItem[]
  availableActivities?: ActivityItem[]
}

export function DashboardClient({ volunteers, donations, availableActivities: initialActivities = [] }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<UserTab>("overview")
  const [availableActivities, setAvailableActivities] = useState<ActivityItem[]>(initialActivities)
  const [loadingActivities, setLoadingActivities] = useState(initialActivities.length === 0)

  // Fetch activities client-side sehingga dashboard utama langsung tampil
  useEffect(() => {
    let cancelled = false
    async function fetchActivities() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("activities")
          .select("id, title, description, location, start_date, volunteer_quota, volunteer_count, category, cover_image_url, community:communities(name, logo_url)")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(6)
        if (cancelled) return
        if (!error && data) setAvailableActivities(data as ActivityItem[])
      } catch {
        // ignore network errors — tetap lanjut
      } finally {
        if (!cancelled) setLoadingActivities(false)
      }
    }
    fetchActivities()
    // Timeout fallback: jika 8 detik belum ada jawaban, stop skeleton
    const timeout = setTimeout(() => {
      if (!cancelled) setLoadingActivities(false)
    }, 8000)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [])

  const tabs = [
    { id: "overview",   label: "Ringkasan" },
    { id: "volunteer",  label: "Riwayat Relawan" },
    { id: "donations",  label: "Riwayat Donasi" },
  ]

  return (
    <>
      {/* Tabs */}
      <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl mb-6 w-fit gap-1 shadow-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as UserTab)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                isActive ? "bg-teal-600 text-white shadow-sm shadow-teal-200" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Kegiatan Relawan */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <div>
                <p className="font-bold text-foreground">Kegiatan Relawan</p>
                <p className="text-xs text-muted-foreground">Kegiatan yang Anda ikuti</p>
              </div>
              <button onClick={() => setActiveTab("volunteer")}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline">
                Lihat Semua
              </button>
            </div>
            <div className="p-4">
              {volunteers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada riwayat pendaftaran relawan.
                </p>
              ) : (
                <div className="space-y-2">
                  {volunteers.slice(0, 3).map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-foreground line-clamp-1 mb-1">
                          {v.activity?.title ?? "—"}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-teal-600" />
                            {v.activity?.start_date ? formatDateShort(v.activity.start_date) : "—"}
                          </span>
                          {v.activity?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-teal-600" />
                              {v.activity.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={v.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Riwayat Donasi */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <div>
                <p className="font-bold text-foreground">Riwayat Donasi</p>
                <p className="text-xs text-muted-foreground">Donasi uang dan barang Anda</p>
              </div>
              <button onClick={() => setActiveTab("donations")}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline">
                Lihat Semua
              </button>
            </div>
            <div className="p-4">
              {donations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada riwayat donasi.
                </p>
              ) : (
                <div className="space-y-2">
                  {donations.slice(0, 3).map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-foreground line-clamp-1 mb-0.5">
                          {d.activity?.title ?? "—"}
                        </p>
                        <p className="text-[11px] font-semibold text-teal-600">
                          {d.type === "money"
                            ? formatCurrency(d.amount ?? 0)
                            : d.items?.map((i) => `${i.item_name} (${i.quantity})`).join(", ") || "Barang"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <div className={`p-1.5 rounded-lg ${d.type === "money" ? "bg-emerald-50 text-emerald-600" : "bg-teal-50 text-teal-600"}`}>
                          {d.type === "money" ? <Banknote className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                        </div>
                        <StatusBadge status={d.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Kegiatan Tersedia ── */}
      {activeTab === "overview" && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Kegiatan Tersedia</h2>
              <p className="text-sm text-muted-foreground">Temukan kegiatan yang ingin Anda ikuti</p>
            </div>
            <Link href="/activities" className="flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:underline">
              Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loadingActivities ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse border border-slate-100">
                  <div className="h-36 bg-slate-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                    <div className="h-1.5 bg-slate-200 rounded-full mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : availableActivities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
              <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="font-medium text-muted-foreground">Belum ada kegiatan yang tersedia saat ini.</p>
              <Link href="/activities" className="inline-block mt-3 text-sm text-teal-600 font-bold hover:underline">
                Cek halaman kegiatan →
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableActivities.map((a) => (
                <Link key={a.id} href={`/activities/${a.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  {/* Cover image */}
                  <div className="relative h-36 bg-slate-100 overflow-hidden">
                    {a.cover_image_url ? (
                      <Image src={a.cover_image_url} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="h-10 w-10 text-slate-300" />
                      </div>
                    )}
                    {a.category && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide text-white px-2.5 py-1 rounded-full bg-[#0e4d6d]/80 backdrop-blur-sm">
                        {a.category}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    {a.community?.name && (
                      <div className="flex items-center gap-1.5 mb-2">
                        {a.community.logo_url ? (
                          <Image src={a.community.logo_url} alt={a.community.name} width={16} height={16} className="rounded-full object-cover" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-teal-50 flex items-center justify-center text-[8px] font-bold text-teal-600">
                            {a.community.name[0]}
                          </div>
                        )}
                        <span className="text-[11px] text-muted-foreground font-medium truncate">{a.community.name}</span>
                      </div>
                    )}

                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 flex-1">{a.title}</h3>

                    <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                      {a.start_date && (
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-teal-600 shrink-0" />{formatDateShort(a.start_date)}</span>
                      )}
                      {a.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-teal-600 shrink-0" />{a.location}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-teal-600 shrink-0" />
                        {a.volunteer_count ?? 0}/{a.volunteer_quota ?? "∞"} relawan
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div className="h-1.5 bg-primary rounded-full"
                          style={{ width: `${a.volunteer_quota ? Math.min(100, ((a.volunteer_count ?? 0) / a.volunteer_quota) * 100) : 0}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-teal-600 shrink-0">
                        {a.volunteer_quota ? Math.round(((a.volunteer_count ?? 0) / a.volunteer_quota) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Volunteer History */}
      {activeTab === "volunteer" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Users className="h-5 w-5 text-teal-600" /> Riwayat Relawan
            </h2>
          </div>
          <div className="p-4">
            {volunteers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-8 w-8 mx-auto mb-3 opacity-30 text-muted-foreground" />
                <p className="text-muted-foreground">Belum ada riwayat pendaftaran relawan.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {volunteers.map((v) => (
                  <div key={v.id} className="p-4 bg-secondary/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/50 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">{v.activity?.title ?? "—"}</p>
                      <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground mt-2">
                        {v.activity?.start_date && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-teal-600" />
                            {formatDateShort(v.activity.start_date)}
                          </span>
                        )}
                        {v.activity?.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-teal-600" />
                            {v.activity.location}
                          </span>
                        )}
                        {v.activity?.community?.name && (
                          <span className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-teal-600" />
                            {v.activity.community.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Donation History */}
      {activeTab === "donations" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Heart className="h-5 w-5 text-rose-500" /> Riwayat Donasi
            </h2>
          </div>
          <div className="p-4">
            {donations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Belum ada riwayat donasi.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Kegiatan","Jenis","Nilai","Tanggal","Status"].map(h => (
                        <th key={h} className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider py-3 px-4 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {donations.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-foreground max-w-[200px] truncate">
                          {d.activity?.title ?? "—"}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className={`inline-flex p-1.5 rounded-lg ${d.type === "money" ? "bg-emerald-50 text-emerald-600" : "bg-teal-50 text-teal-600"}`}>
                            {d.type === "money" ? <Banknote className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-bold text-teal-600">
                          {d.type === "money" ? formatCurrency(d.amount ?? 0) : d.items?.map((i) => `${i.item_name} (${i.quantity})`).join(", ") || "—"}
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-xs">
                          {formatDateShort(d.created_at)}
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={d.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
