"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import Link from "next/link"
import {
  FileText, Search, CheckCircle2, XCircle, Clock, AlertCircle,
  FileBarChart, ThumbsUp, ThumbsDown, Loader2, RefreshCw, Eye
} from "lucide-react"
import { toast } from "sonner"
import { approveReportAction, rejectReportAction } from "@/lib/actions/dashboard.actions"

type Report = {
  id: string
  title: string
  summary: string
  status: string
  created_at: string
  activity_id: string | null
  community: { name: string } | null
  profiles: { full_name: string } | null
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("reports")
      .select(`
        id, title, summary, status, created_at, activity_id,
        community:communities(name),
        profiles!reports_submitted_by_fkey(full_name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Gagal memuat laporan:", error)
      toast.error("Gagal memuat laporan")
    } else {
      setReports(data as unknown as Report[])
    }
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchReports() }, [fetchReports])

  const handleApprove = async (id: string) => {
    setActionLoading(id + "_approve")
    const result = await approveReportAction(id)
    if (result.success) {
      toast.success("Laporan berhasil divalidasi! Notifikasi telah dikirim ke komunitas.")
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: "validated" } : r))
    } else {
      toast.error(result.error ?? "Gagal memvalidasi laporan.")
    }
    setActionLoading(null)
  }

  const handleReject = async (id: string) => {
    setActionLoading(id + "_reject")
    const result = await rejectReportAction(id)
    if (result.success) {
      toast.info("Laporan ditolak. Notifikasi telah dikirim ke komunitas.")
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: "rejected" } : r))
    } else {
      toast.error(result.error ?? "Gagal menolak laporan.")
    }
    setActionLoading(null)
  }

  const filteredReports = reports.filter(r => {
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.community?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === "all" || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const statusCounts = {
    all: reports.length,
    submitted: reports.filter(r => r.status === "submitted").length,
    validated: reports.filter(r => r.status === "validated").length,
    rejected: reports.filter(r => r.status === "rejected").length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" />Divalidasi</span>
      case "rejected":  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"><XCircle className="w-3 h-3 mr-1" />Ditolak</span>
      case "submitted": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200"><Clock className="w-3 h-3 mr-1" />Menunggu Review</span>
      default:          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"><AlertCircle className="w-3 h-3 mr-1" />Draft</span>
    }
  }

  return (
    <div className="flex-1 bg-slate-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileBarChart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kelola Laporan</h1>
              <p className="text-sm text-slate-500">Validasi laporan pertanggungjawaban kegiatan komunitas</p>
            </div>
          </div>
          <button onClick={fetchReports} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-teal-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: "all",       label: "Semua",      count: statusCounts.all },
            { key: "submitted", label: "Menunggu",   count: statusCounts.submitted },
            { key: "validated", label: "Divalidasi", count: statusCounts.validated },
            { key: "rejected",  label: "Ditolak",    count: statusCounts.rejected },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                filterStatus === tab.key
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                filterStatus === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            placeholder="Cari judul laporan atau nama komunitas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Laporan", "Komunitas", "Tanggal", "Status", "Aksi"].map(h => (
                  <th key={h} className={`px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider ${h === "Aksi" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-3/4 mb-1" /><div className="h-3 bg-slate-100 rounded w-1/2" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="px-5 py-4"><div className="h-5 bg-slate-200 rounded-full w-24" /></td>
                    <td className="px-5 py-4"><div className="h-8 bg-slate-200 rounded-xl w-32 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-semibold text-slate-500">Tidak ada laporan ditemukan</p>
                  </td>
                </tr>
              ) : filteredReports.map(report => (
                <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900 truncate max-w-[240px]">{report.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[240px]">{report.summary || "—"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-700">{report.community?.name ?? "—"}</p>
                    <p className="text-xs text-slate-400">Oleh: {report.profiles?.full_name ?? "—"}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {report.created_at ? format(new Date(report.created_at), "dd MMM yyyy", { locale: localeID }) : "—"}
                  </td>
                  <td className="px-5 py-4">{getStatusBadge(report.status)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/reports/${report.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3 h-3" /> Lihat Detail
                      </Link>
                      {report.status === "submitted" && (
                        <>
                          <button
                            onClick={() => handleApprove(report.id)}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading === report.id + "_approve"
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <ThumbsUp className="w-3 h-3" />}
                            Validasi
                          </button>
                          <button
                            onClick={() => handleReject(report.id)}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading === report.id + "_reject"
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <ThumbsDown className="w-3 h-3" />}
                            Tolak
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
