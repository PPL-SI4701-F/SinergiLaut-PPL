"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import {
  ShieldAlert, BarChart3, RefreshCw, Building2, Activity,
  Clock, FileText, UserCheck
} from "lucide-react"
import { getAdminAuditLog } from "@/lib/actions/dashboard.actions"

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
      status: (c as any).is_suspended ? "suspended" : c.verification_status,
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
    cancelled:  { label: "Dibatalkan",  cls: "bg-rose-100 text-rose-700 border-rose-200" },
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
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const audit = await getAdminAuditLog() as any
    if (audit.error) {
      alert("Error: " + audit.error + "\n" + audit.stack)
    }
    setAuditLog(buildAuditLog(audit))
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

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
              <h1 className="text-2xl font-bold text-slate-900">Riwayat Aktivitas Admin</h1>
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

        {/* Audit Log */}
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

      </main>
    </div>
  )
}
