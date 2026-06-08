"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import {
  ArrowLeft, FileText, CheckCircle2, XCircle, Clock, AlertCircle,
  Building2, User, Calendar, Banknote, Paperclip, ThumbsUp, ThumbsDown,
  Loader2, ExternalLink, Users, UserCheck, UserX, Image as ImageIcon
} from "lucide-react"
import { toast } from "sonner"
import { approveReportAction, rejectReportAction } from "@/lib/actions/dashboard.actions"
import { getActivityVolunteers } from "@/lib/actions/volunteer.actions"
import { formatCurrency } from "@/lib/utils/helpers"

type ReportDetail = {
  id: string
  title: string
  summary: string
  status: string
  completion_status: string
  fund_usage: { category: string; amount: number; description: string }[]
  admin_note: string | null
  created_at: string
  reviewed_at: string | null
  activity_id: string | null
  activity: { title: string } | null
  community: { name: string } | null
  profiles: { full_name: string } | null
  report_files: { id: string; file_name: string; file_url: string; file_type: string; file_size: number }[]
}

export default function AdminReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string

  const [report, setReport] = useState<ReportDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isActioning, setIsActioning] = useState<"approve" | "reject" | null>(null)

  const [volunteers, setVolunteers] = useState<any[]>([])
  const [loadingVolunteers, setLoadingVolunteers] = useState(false)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectNote, setRejectNote] = useState("")

  useEffect(() => {
    if (!reportId) return
    loadReport()
  }, [reportId])

  async function loadReport() {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("reports")
      .select(`
        id, title, summary, status, completion_status, fund_usage,
        admin_note, created_at, reviewed_at, activity_id,
        activity:activities(title),
        community:communities(name),
        profiles!reports_submitted_by_fkey(full_name),
        report_files(id, file_name, file_url, file_type, file_size)
      `)
      .eq("id", reportId)
      .single()

    if (error || !data) {
      toast.error("Laporan tidak ditemukan")
      router.push("/admin/reports")
      return
    }
    const reportData = data as unknown as ReportDetail
    setReport(reportData)
    setIsLoading(false)

    if (reportData.activity_id) {
      loadVolunteers(reportData.activity_id)
    }
  }

  async function loadVolunteers(activityId: string) {
    setLoadingVolunteers(true)
    const result = await getActivityVolunteers(activityId)
    if (result.success) {
      setVolunteers((result.data as any[]).filter(v => v.status === "approved" || v.status === "attended" || v.status === "absent"))
    }
    setLoadingVolunteers(false)
  }

  async function handleApprove() {
    setIsActioning("approve")
    const result = await approveReportAction(reportId)
    if (result.success) {
      toast.success("Laporan berhasil divalidasi!")
      setReport(prev => prev ? { ...prev, status: "validated" } : prev)
    } else {
      toast.error(result.error ?? "Gagal memvalidasi laporan.")
    }
    setIsActioning(null)
  }

  async function handleRejectConfirm() {
    setIsActioning("reject")
    const result = await rejectReportAction(reportId, rejectNote)
    if (result.success) {
      toast.info("Laporan ditolak. Notifikasi dikirim ke komunitas.")
      setReport(prev => prev ? { ...prev, status: "rejected", admin_note: rejectNote || null } : prev)
      setShowRejectModal(false)
      setRejectNote("")
    } else {
      toast.error(result.error ?? "Gagal menolak laporan.")
    }
    setIsActioning(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validated": return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-4 h-4" />Divalidasi</span>
      case "rejected":  return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-rose-100 text-rose-800 border border-rose-200"><XCircle className="w-4 h-4" />Ditolak</span>
      case "submitted": return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200"><Clock className="w-4 h-4" />Menunggu Review</span>
      default:          return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-700 border border-slate-200"><AlertCircle className="w-4 h-4" />Draft</span>
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!report) return null

  const totalFund = (report.fund_usage ?? []).reduce((sum, i) => sum + (Number(i.amount) || 0), 0)

  return (
    <div className="flex-1 bg-slate-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div>
          <button
            onClick={() => router.push("/admin/reports")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-600 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Laporan
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{report.title}</h1>
                <p className="text-sm text-slate-500 mt-0.5">{report.activity?.title ?? "—"}</p>
              </div>
            </div>
            {getStatusBadge(report.status)}
          </div>
        </div>

        {/* Info Penolakan */}
        {report.status === "rejected" && report.admin_note && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <XCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-800 text-sm">Catatan Penolakan</p>
              <p className="text-rose-700 text-sm mt-1">{report.admin_note}</p>
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Komunitas</p>
              <p className="font-semibold text-slate-800 text-sm">{report.community?.name ?? "—"}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <User className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Diajukan oleh</p>
              <p className="font-semibold text-slate-800 text-sm">{report.profiles?.full_name ?? "—"}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Tanggal Pengajuan</p>
              <p className="font-semibold text-slate-800 text-sm">
                {report.created_at ? format(new Date(report.created_at), "dd MMM yyyy", { locale: localeID }) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-3">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Ringkasan Kegiatan</h2>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{report.summary || "—"}</p>
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">Status Penyelesaian: </span>
            <span className={`text-xs font-bold ${report.completion_status === "completed" ? "text-emerald-600" : "text-amber-600"}`}>
              {report.completion_status === "completed" ? "Selesai Penuh" : "Sebagian"}
            </span>
          </div>
        </div>

        {/* Rincian Dana */}
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Banknote className="h-4 w-4 text-slate-400" />
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Rincian Penggunaan Dana</h2>
          </div>
          {!report.fund_usage || report.fund_usage.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Tidak ada data penggunaan dana.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Kategori</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase">Keterangan</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 uppercase">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {report.fund_usage.map((item, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3 font-medium text-slate-700">{item.category || "—"}</td>
                    <td className="px-5 py-3 text-slate-500">{item.description || "—"}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-800">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td colSpan={2} className="px-5 py-3 font-bold text-slate-700">Total</td>
                  <td className="px-5 py-3 text-right font-bold text-teal-700 text-base">{formatCurrency(totalFund)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Kehadiran Volunteer */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Kehadiran Volunteer</h2>
          </div>
          {loadingVolunteers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            </div>
          ) : volunteers.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Belum ada relawan yang disetujui untuk kegiatan ini.</p>
          ) : (
            <div className="space-y-2">
              {volunteers.map(v => (
                <div key={v.id} className="border border-slate-100 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 font-semibold flex items-center justify-center text-sm shrink-0">
                      {v.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{v.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {v.status === "attended" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><UserCheck className="h-3 w-3" /> Hadir</span>
                        )}
                        {v.status === "absent" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700"><UserX className="h-3 w-3" /> Tidak Hadir</span>
                        )}
                        {v.status === "approved" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600"><Clock className="h-3 w-3" /> Belum dikonfirmasi</span>
                        )}
                        {v.status === "attended" && v.attendance_proof_url && (
                          <a href={v.attendance_proof_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline">
                            <ImageIcon className="h-3.5 w-3.5" /> Lihat bukti foto
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dokumentasi */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-slate-400" />
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Dokumentasi</h2>
          </div>
          {!report.report_files || report.report_files.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Tidak ada file dokumentasi.</p>
          ) : (
            <div className="space-y-2">
              {report.report_files.map(file => (
                <a
                  key={file.id}
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 hover:border-teal-200 transition-all group"
                >
                  <Paperclip className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate group-hover:text-teal-700">{file.file_name}</p>
                    {file.file_size && (
                      <p className="text-xs text-slate-400">{(file.file_size / 1024).toFixed(0)} KB</p>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-teal-500 flex-shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {report.status === "submitted" && (
          <div className="flex gap-3 pb-8">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isActioning !== null}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ThumbsDown className="w-4 h-4" /> Tolak Laporan
            </button>
            <button
              onClick={handleApprove}
              disabled={isActioning !== null}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isActioning === "approve"
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <ThumbsUp className="w-4 h-4" />}
              Validasi Laporan
            </button>
          </div>
        )}

      </main>

      {/* Modal Tolak */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Tolak Laporan</h3>
                <p className="text-sm text-slate-500">Berikan alasan penolakan untuk komunitas</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Catatan Penolakan <span className="text-slate-400 font-normal">(opsional)</span></label>
              <textarea
                rows={4}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 resize-none transition-all"
                placeholder="cth: Rincian dana tidak lengkap, mohon sertakan bukti pengeluaran..."
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowRejectModal(false); setRejectNote("") }}
                disabled={isActioning !== null}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={isActioning !== null}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {isActioning === "reject"
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <ThumbsDown className="w-4 h-4" />}
                Ya, Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
