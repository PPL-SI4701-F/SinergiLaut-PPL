"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import {
  ShieldAlert, BarChart3, RefreshCw, Building2, Activity, Users, Banknote,
  CheckCircle2, XCircle, Clock, AlertTriangle, Ban, RotateCcw, Loader2,
  FileText, UserCheck, TrendingUp, Eye
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import {
  getPlatformMonitoringStats,
  getAdminAuditLog,
  getAllCommunities,
  suspendCommunityAction,
  unsuspendCommunityAction,
} from "@/lib/actions/dashboard.actions"
import { formatCurrency } from "@/lib/utils/helpers"

type Tab = "audit" | "communities"

type AuditEntry = {
  id: string
  timestamp: string
  type: "report" | "community" | "activity" | "volunteer"
  label: string
  sub: string
  status: string
}

function buildAuditLog(data: Awaited<ReturnType<typeof getAdminAuditLog>>): AuditEntry[] {
  const entries: AuditEntry[] = []

  for (const r of data.reports) {
    entries.push({
      id: `report-${r.id}`,
      timestamp: (r as any).reviewed_at ?? (r as any).updated_at ?? "",
      type: "report",
      label: (r as any).title ?? "Laporan",
      sub: (r as any).community?.name ?? "—",
      status: r.status,
    })
  }
  for (const c of data.communities) {
    entries.push({
      id: `community-${c.id}`,
      timestamp: c.updated_at ?? "",
      type: "community",
      label: c.name,
      sub: "Komunitas",
      status: c.verification_status,
    })
  }
  for (const a of data.activities) {
    entries.push({
      id: `activity-${a.id}`,
      timestamp: (a as any).updated_at ?? "",
      type: "activity",
      label: (a as any).title ?? "Kegiatan",
      sub: (a as any).community?.name ?? "—",
      status: a.status,
    })
  }
  for (const v of data.volunteers) {
    entries.push({
      id: `volunteer-${v.id}`,
      timestamp: v.updated_at ?? "",
      type: "volunteer",
      label: v.full_name ?? "Pengguna",
      sub: "Verifikasi Relawan",
      status: v.volunteer_status,
    })
  }

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    validated:  { label: "Divalidasi",  cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    approved:   { label: "Disetujui",   cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    published:  { label: "Dipublikasi", cls: "bg-blue-100 text-blue-700 border-blue-200" },
    rejected:   { label: "Ditolak",     cls: "bg-rose-100 text-rose-700 border-rose-200" },
    draft:      { label: "Ditolak",     cls: "bg-rose-100 text-rose-700 border-rose-200" },
    suspended:  { label: "Disuspend",   cls: "bg-orange-100 text-orange-700 border-orange-200" },
    pending:    { label: "Pending",     cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  }
  const s = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600 border-slate-200" }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>
      {s.label}
    </span>
  )
}

function TypeIcon({ type }: { type: AuditEntry["type"] }) {
  const map = {
    report:    { icon: FileText,   cls: "bg-green-100 text-green-600" },
    community: { icon: Building2,  cls: "bg-yellow-100 text-yellow-600" },
    activity:  { icon: Activity,   cls: "bg-blue-100 text-blue-600" },
    volunteer: { icon: UserCheck,  cls: "bg-purple-100 text-purple-600" },
  }
  const { icon: Icon, cls } = map[type]
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cls}`}>
      <Icon className="w-4 h-4" />
    </div>
  )
}

export default function AdminMonitoringPage() {
  const [tab, setTab] = useState<Tab>("audit")
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getPlatformMonitoringStats>> | null>(null)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [communities, setCommunities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    const [s, audit, comms] = await Promise.all([
      getPlatformMonitoringStats(),
      getAdminAuditLog(),
      getAllCommunities(),
    ])
    setStats(s)
    setAuditLog(buildAuditLog(audit))
    setCommunities(comms)
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSuspend(id: string, name: string) {
    if (!confirm(`Suspend komunitas "${name}"? Komunitas tidak dapat membuat kegiatan baru.`)) return
    setActionLoading(id + "_suspend")
    const res = await suspendCommunityAction(id)
    if (res.success) {
      toast.success(`Komunitas "${name}" berhasil disuspend.`)
      setCommunities(prev => prev.map(c => c.id === id ? { ...c, verification_status: "suspended", is_verified: false } : c))
    } else {
      toast.error(res.error ?? "Gagal mensuspend komunitas.")
    }
    setActionLoading(null)
  }

  async function handleUnsuspend(id: string, name: string) {
    setActionLoading(id + "_unsuspend")
    const res = await unsuspendCommunityAction(id)
    if (res.success) {
      toast.success(`Komunitas "${name}" berhasil diaktifkan kembali.`)
      setCommunities(prev => prev.map(c => c.id === id ? { ...c, verification_status: "approved", is_verified: true } : c))
    } else {
      toast.error(res.error ?? "Gagal mengaktifkan komunitas.")
    }
    setActionLoading(null)
  }

  const statCards = stats ? [
    {
      label: "Total Donasi Terkumpul",
      value: formatCurrency(stats.totalDonations),
      sub: `+ ${formatCurrency(stats.pendingDonations)} pending`,
      icon: Banknote,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Pengguna",
      value: stats.totalUsers,
      sub: `${stats.totalVolunteers} relawan terverifikasi`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Komunitas",
      value: stats.communityStats.total,
      sub: `${stats.communityStats.approved} aktif · ${stats.communityStats.pending} pending · ${stats.communityStats.suspended} suspend`,
      icon: Building2,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      label: "Kegiatan",
      value: stats.activityStats.total,
      sub: `${stats.activityStats.published} aktif · ${stats.activityStats.completed} selesai · ${stats.activityStats.pendingReview} review`,
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ] : []

  return (
    <div className="flex-1 bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Monitoring & Audit</h1>
              <p className="text-sm text-slate-500">Pantau aktivitas platform dan rekam aksi admin</p>
            </div>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-teal-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
                  <div className="h-7 bg-slate-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              ))
            : statCards.map(card => (
                <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{card.label}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" /> {card.sub}
                      </p>
                    </div>
                    <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {([
            { key: "audit",       label: "Audit Log",          icon: BarChart3 },
            { key: "communities", label: "Kelola Komunitas",    icon: Building2 },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Audit Log */}
        {tab === "audit" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-800">Riwayat Aksi Admin</h2>
              <span className="ml-auto text-xs text-slate-400">{auditLog.length} entri terbaru</span>
            </div>
            {isLoading ? (
              <div className="divide-y divide-slate-50">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                    </div>
                    <div className="h-5 bg-slate-200 rounded-full w-20" />
                  </div>
                ))}
              </div>
            ) : auditLog.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Belum ada aktivitas yang tercatat</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {auditLog.map(entry => (
                  <div key={entry.id} className="px-5 py-4 flex items-center gap-3 hover:bg-slate-50/60 transition-colors">
                    <TypeIcon type={entry.type} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{entry.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{entry.sub}</p>
                    </div>
                    <StatusBadge status={entry.status} />
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                      {entry.timestamp
                        ? format(new Date(entry.timestamp), "dd MMM yyyy, HH:mm", { locale: localeID })
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Kelola Komunitas (Suspend) */}
        {tab === "communities" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-800">Kelola Komunitas</h2>
              <span className="ml-auto text-xs text-slate-400">{communities.length} komunitas</span>
            </div>
            {isLoading ? (
              <div className="divide-y divide-slate-50">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                    </div>
                    <div className="h-8 bg-slate-200 rounded-xl w-24" />
                  </div>
                ))}
              </div>
            ) : communities.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Tidak ada komunitas terdaftar.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {communities.map(c => (
                  <div key={c.id} className="px-5 py-4 flex items-center gap-3 hover:bg-slate-50/60 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {c.logo_url
                        ? <img src={c.logo_url} alt="" className="w-full h-full object-cover" />
                        : <Building2 className="w-5 h-5 text-teal-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.location ?? "—"}</p>
                    </div>
                    <StatusBadge status={c.verification_status ?? "pending"} />
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <Link
                        href={`/admin/communities`}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {c.verification_status === "suspended" ? (
                        <button
                          onClick={() => handleUnsuspend(c.id, c.name)}
                          disabled={actionLoading !== null}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {actionLoading === c.id + "_unsuspend"
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <RotateCcw className="w-3 h-3" />}
                          Aktifkan
                        </button>
                      ) : c.verification_status === "approved" ? (
                        <button
                          onClick={() => handleSuspend(c.id, c.name)}
                          disabled={actionLoading !== null}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {actionLoading === c.id + "_suspend"
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Ban className="w-3 h-3" />}
                          Suspend
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic px-3">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
