"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import {
  ArrowLeft, Plus, Trash2, Loader2, FileText, Upload,
  CheckCircle2, Clock, XCircle, AlertCircle, Send, Save, Paperclip, X,
  Users, UserCheck, UserX, Camera, Image as ImageIcon
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils/helpers"
import { getCommunityActivitySummary } from "@/lib/actions/activity.actions"
import {
  getActivityReport,
  createReport,
  updateReport,
  submitReport,
  uploadReportFile,
  deleteReportFile,
  type FundUsageItem,
} from "@/lib/actions/report.actions"
import { getActivityVolunteers, markVolunteerAttended, markVolunteerAbsent } from "@/lib/actions/volunteer.actions"

type CompletionStatus = "partial" | "completed"

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  draft:     { label: "Draft",            icon: Clock,         className: "bg-gray-100 text-gray-700" },
  submitted: { label: "Menunggu Review",  icon: Clock,         className: "bg-blue-100 text-blue-700" },
  validated: { label: "Tervalidasi",      icon: CheckCircle2,  className: "bg-green-100 text-green-700" },
  rejected:  { label: "Ditolak",          icon: XCircle,       className: "bg-red-100 text-red-700" },
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const { profile } = useAuth()
  const activityId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [activity, setActivity] = useState<{ title: string; status: string; community_id: string } | null>(null)
  const [existingReport, setExistingReport] = useState<any>(null)
  const [reportFiles, setReportFiles] = useState<any[]>([])

  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>("completed")
  const [fundUsage, setFundUsage] = useState<FundUsageItem[]>([
    { category: "", amount: 0, description: "" }
  ])

  // Kehadiran volunteer
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [loadingVolunteers, setLoadingVolunteers] = useState(true)
  const [updatingVolunteerId, setUpdatingVolunteerId] = useState<string | null>(null)
  const [attendanceModal, setAttendanceModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" })
  const [attendanceProof, setAttendanceProof] = useState<File | null>(null)
  const [attendanceProofPreview, setAttendanceProofPreview] = useState<string | null>(null)
  const [submittingAttendance, setSubmittingAttendance] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!activityId) return
    loadData()
  }, [activityId])

  async function loadData() {
    setIsLoading(true)
    const activityResult = await getCommunityActivitySummary(activityId)
    if (activityResult.success && activityResult.data) {
      setActivity({
        title: activityResult.data.title,
        status: activityResult.data.status,
        community_id: activityResult.data.community_id,
      })
    } else {
      toast.error(activityResult.error ?? "Gagal memuat data kegiatan.")
      setActivity(null)
    }

    const result = await getActivityReport(activityId)
    if (result.success && result.data) {
      const r = result.data
      setExistingReport(r)
      setTitle(r.title ?? "")
      setSummary(r.summary ?? "")
      setCompletionStatus(r.completion_status ?? "completed")
      setFundUsage(
        Array.isArray(r.fund_usage) && r.fund_usage.length > 0
          ? r.fund_usage
          : [{ category: "", amount: 0, description: "" }]
      )
      setReportFiles(r.report_files ?? [])
    }

    setIsLoading(false)
    loadVolunteers()
  }

  async function loadVolunteers() {
    setLoadingVolunteers(true)
    const result = await getActivityVolunteers(activityId)
    if (result.success) {
      setVolunteers((result.data as any[]).filter(v => v.status === "approved" || v.status === "attended" || v.status === "absent"))
    } else {
      toast.error(result.error ?? "Gagal memuat data relawan.")
    }
    setLoadingVolunteers(false)
  }

  function openAttendanceModal(id: string, name: string) {
    setAttendanceProof(null)
    setAttendanceProofPreview(null)
    setAttendanceModal({ open: true, id, name })
  }

  function closeAttendanceModal() {
    if (attendanceProofPreview) URL.revokeObjectURL(attendanceProofPreview)
    setAttendanceProof(null)
    setAttendanceProofPreview(null)
    setAttendanceModal({ open: false, id: "", name: "" })
  }

  function handleAttendanceProofChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Bukti kehadiran harus berupa file gambar.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran bukti kehadiran maksimal 5MB.")
      return
    }
    if (attendanceProofPreview) URL.revokeObjectURL(attendanceProofPreview)
    setAttendanceProof(file)
    setAttendanceProofPreview(URL.createObjectURL(file))
  }

  async function handleConfirmAttendance() {
    if (!attendanceProof) {
      toast.error("Mohon unggah bukti foto kehadiran terlebih dahulu.")
      return
    }
    const id = attendanceModal.id
    setSubmittingAttendance(true)
    setUpdatingVolunteerId(id)
    const result = await markVolunteerAttended(id, attendanceProof)
    if (result.success) {
      setVolunteers(prev =>
        prev.map(v => v.id === id ? { ...v, status: "attended", attendance_proof_url: (result.data as any)?.attendance_proof_url ?? v.attendance_proof_url } : v)
      )
      toast.success("Kehadiran relawan berhasil dikonfirmasi.")
      closeAttendanceModal()
    } else {
      toast.error(result.error ?? "Gagal mengkonfirmasi kehadiran.")
    }
    setSubmittingAttendance(false)
    setUpdatingVolunteerId(null)
  }

  async function handleMarkAbsent(id: string) {
    setUpdatingVolunteerId(id)
    const result = await markVolunteerAbsent(id)
    if (result.success) {
      setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: "absent", attendance_proof_url: null } : v))
      toast.success("Relawan ditandai tidak hadir.")
    } else {
      toast.error(result.error ?? "Gagal menandai ketidakhadiran relawan.")
    }
    setUpdatingVolunteerId(null)
  }

  function addFundItem() {
    setFundUsage(prev => [...prev, { category: "", amount: 0, description: "" }])
  }

  function removeFundItem(index: number) {
    setFundUsage(prev => prev.filter((_, i) => i !== index))
  }

  function updateFundItem(index: number, field: keyof FundUsageItem, value: string | number) {
    setFundUsage(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const totalFund = fundUsage.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  const isReadOnly = existingReport?.status === "submitted" || existingReport?.status === "validated"

  async function handleSaveDraft() {
    if (!title.trim()) { toast.error("Judul laporan wajib diisi."); return }
    if (!summary.trim()) { toast.error("Ringkasan kegiatan wajib diisi."); return }

    setIsSaving(true)
    const payload = { title, summary, fundUsage, completionStatus }

    let result
    if (existingReport) {
      result = await updateReport(existingReport.id, payload)
    } else {
      if (!activity) { toast.error("Data kegiatan tidak ditemukan."); setIsSaving(false); return }
      result = await createReport({
        activityId,
        communityId: activity.community_id,
        ...payload,
      })
    }

    if (result.success) {
      toast.success("Draft laporan berhasil disimpan.")
      if (!existingReport && result.data) {
        setExistingReport(result.data)
      }
    } else {
      toast.error(result.error ?? "Gagal menyimpan draft.")
    }
    setIsSaving(false)
  }

  async function handleSubmit() {
    if (!existingReport) {
      toast.error("Simpan draft terlebih dahulu sebelum mengajukan.")
      return
    }
    if (!title.trim() || !summary.trim()) {
      toast.error("Pastikan judul dan ringkasan sudah terisi.")
      return
    }

    setIsSubmitting(true)
    // Simpan dulu perubahan terakhir
    await updateReport(existingReport.id, { title, summary, fundUsage, completionStatus })
    const result = await submitReport(existingReport.id)

    if (result.success) {
      toast.success("Laporan berhasil diajukan ke admin!")
      setExistingReport((prev: any) => ({ ...prev, status: "submitted" }))
    } else {
      toast.error(result.error ?? "Gagal mengajukan laporan.")
    }
    setIsSubmitting(false)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (!existingReport) {
      toast.error("Simpan draft terlebih dahulu sebelum upload file.")
      return
    }

    setIsUploading(true)
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" melebihi batas 10MB.`)
        continue
      }
      const result = await uploadReportFile(existingReport.id, file)
      if (result.success) {
        setReportFiles(prev => [...prev, { file_name: file.name, file_url: result.fileUrl, file_type: file.type, file_size: file.size }])
        toast.success(`"${file.name}" berhasil diupload.`)
      } else {
        toast.error(`Gagal upload "${file.name}": ${result.error}`)
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
    setIsUploading(false)
  }

  async function handleDeleteFile(fileId: string, fileName: string) {
    const result = await deleteReportFile(fileId)
    if (result.success) {
      setReportFiles(prev => prev.filter((f: any) => f.id !== fileId))
      toast.success(`"${fileName}" dihapus.`)
    } else {
      toast.error("Gagal menghapus file.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Kegiatan tidak ditemukan.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/community/dashboard">Kembali ke Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (activity.status !== "completed") {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-orange-500" />
          <h2 className="font-semibold text-foreground mb-2">Kegiatan Belum Selesai</h2>
          <p className="text-muted-foreground text-sm">Laporan hanya dapat dibuat setelah kegiatan berstatus <strong>Completed</strong>.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/community/dashboard">Kembali ke Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const currentStatus = existingReport?.status
  const StatusIcon = currentStatus ? statusConfig[currentStatus]?.icon : null

  return (
    <div className="flex-1 bg-slate-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
            <Link href="/community/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Kembali ke Dashboard
            </Link>
          </Button>

          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Laporan Kegiatan</h1>
                <p className="text-sm text-muted-foreground">{activity.title}</p>
              </div>
            </div>
            {currentStatus && (
              <Badge className={`${statusConfig[currentStatus]?.className} flex items-center gap-1.5 px-3 py-1`}>
                {StatusIcon && <StatusIcon className="h-3.5 w-3.5" />}
                {statusConfig[currentStatus]?.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Info: ditolak */}
        {currentStatus === "rejected" && existingReport?.admin_note && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Laporan Ditolak</p>
              <p className="text-red-700 text-sm mt-1">{existingReport.admin_note}</p>
              <p className="text-red-600 text-xs mt-2">Silakan perbaiki dan ajukan ulang.</p>
            </div>
          </div>
        )}

        {/* Info: sudah submitted/validated */}
        {(currentStatus === "submitted" || currentStatus === "validated") && (
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${
            currentStatus === "validated"
              ? "bg-green-50 border-green-200"
              : "bg-blue-50 border-blue-200"
          }`}>
            {currentStatus === "validated"
              ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              : <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className={`font-semibold text-sm ${currentStatus === "validated" ? "text-green-800" : "text-blue-800"}`}>
                {currentStatus === "validated" ? "Laporan Tervalidasi" : "Laporan Sedang Ditinjau Admin"}
              </p>
              <p className={`text-sm mt-1 ${currentStatus === "validated" ? "text-green-700" : "text-blue-700"}`}>
                {currentStatus === "validated"
                  ? "Laporan Anda telah divalidasi. Proses pencairan dana dapat dilanjutkan."
                  : "Laporan Anda sedang dalam antrian review admin. Anda tidak dapat mengedit laporan saat ini."}
              </p>
            </div>
          </div>
        )}

        {/* Form Laporan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Laporan</CardTitle>
            <CardDescription>Isi laporan pertanggungjawaban kegiatan yang telah dilaksanakan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Judul */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul Laporan <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="cth: Laporan Kegiatan Bersih Pantai Ancol 2026"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            {/* Ringkasan */}
            <div className="space-y-2">
              <Label htmlFor="summary">Ringkasan Kegiatan <span className="text-destructive">*</span></Label>
              <Textarea
                id="summary"
                placeholder="Deskripsikan jalannya kegiatan, jumlah peserta, hasil yang dicapai, dan hal-hal penting lainnya..."
                value={summary}
                onChange={e => setSummary(e.target.value)}
                rows={5}
                disabled={isReadOnly}
              />
            </div>

            {/* Status Penyelesaian */}
            <div className="space-y-2">
              <Label>Status Penyelesaian <span className="text-destructive">*</span></Label>
              <div className="flex gap-3">
                {([
                  { value: "completed", label: "Selesai Penuh", desc: "Semua target tercapai" },
                  { value: "partial",   label: "Sebagian",      desc: "Sebagian target tercapai" },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => setCompletionStatus(opt.value)}
                    className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                      completionStatus === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    } ${isReadOnly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <p className={`font-semibold text-sm ${completionStatus === opt.value ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kehadiran Volunteer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Kehadiran Volunteer
            </CardTitle>
            <CardDescription>Konfirmasi kehadiran setiap relawan beserta bukti foto kehadirannya</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingVolunteers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : volunteers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Belum ada relawan yang disetujui untuk kegiatan ini.
              </div>
            ) : (
              <div className="space-y-3">
                {volunteers.map(v => (
                  <div key={v.id} className="border border-border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm shrink-0">
                        {v.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{v.full_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {v.status === "attended" && (
                            <Badge className="bg-green-100 text-green-700 flex items-center gap-1"><UserCheck className="h-3 w-3" /> Hadir</Badge>
                          )}
                          {v.status === "absent" && (
                            <Badge className="bg-red-100 text-red-700 flex items-center gap-1"><UserX className="h-3 w-3" /> Tidak Hadir</Badge>
                          )}
                          {v.status === "approved" && (
                            <Badge className="bg-slate-100 text-slate-600 flex items-center gap-1"><Clock className="h-3 w-3" /> Belum dikonfirmasi</Badge>
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
                    <div className="flex gap-2 pl-12 sm:pl-0">
                      <Button size="sm"
                        variant={v.status === "attended" ? "default" : "outline"}
                        className={v.status === "attended" ? "bg-green-600 hover:bg-green-700" : "text-green-700 border-green-200 hover:bg-green-50"}
                        disabled={updatingVolunteerId === v.id}
                        onClick={() => openAttendanceModal(v.id, v.full_name)}>
                        {updatingVolunteerId === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                        <span className="ml-1">Hadir</span>
                      </Button>
                      <Button size="sm"
                        variant={v.status === "absent" ? "default" : "outline"}
                        className={v.status === "absent" ? "bg-red-600 hover:bg-red-700" : "text-red-700 border-red-200 hover:bg-red-50"}
                        disabled={updatingVolunteerId === v.id}
                        onClick={() => handleMarkAbsent(v.id)}>
                        {updatingVolunteerId === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
                        <span className="ml-1">Tidak Hadir</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rincian Penggunaan Dana */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Rincian Penggunaan Dana</CardTitle>
                <CardDescription>Catat setiap pengeluaran yang dilakukan selama kegiatan</CardDescription>
              </div>
              {!isReadOnly && (
                <Button type="button" variant="outline" size="sm" onClick={addFundItem}>
                  <Plus className="h-4 w-4 mr-1.5" /> Tambah
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {fundUsage.map((item, index) => (
              <div key={index} className="p-4 border border-border rounded-xl bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Item #{index + 1}</span>
                  {!isReadOnly && fundUsage.length > 1 && (
                    <button type="button" onClick={() => removeFundItem(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Kategori</Label>
                    <Input
                      placeholder="cth: Konsumsi, Transportasi, Perlengkapan"
                      value={item.category}
                      onChange={e => updateFundItem(index, "category", e.target.value)}
                      disabled={isReadOnly}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Jumlah (Rp)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={item.amount || ""}
                      onChange={e => updateFundItem(index, "amount", Number(e.target.value))}
                      disabled={isReadOnly}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Keterangan</Label>
                  <Input
                    placeholder="Deskripsi singkat pengeluaran ini"
                    value={item.description}
                    onChange={e => updateFundItem(index, "description", e.target.value)}
                    disabled={isReadOnly}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm font-semibold text-muted-foreground">Total Penggunaan Dana</span>
              <span className="text-lg font-bold text-foreground">{formatCurrency(totalFund)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Upload Dokumentasi */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Dokumentasi</CardTitle>
                <CardDescription>Upload foto, video, atau dokumen pendukung (maks. 10MB/file)</CardDescription>
              </div>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || !existingReport}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Upload className="h-4 w-4 mr-1.5" />}
                  Upload
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />

            {!existingReport && !isReadOnly && (
              <p className="text-sm text-muted-foreground text-center py-4">
                <AlertCircle className="h-4 w-4 inline mr-1.5 text-orange-500" />
                Simpan draft terlebih dahulu untuk mengupload file.
              </p>
            )}

            {reportFiles.length === 0 && (existingReport || isReadOnly) && (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada file yang diupload.</p>
            )}

            {reportFiles.length > 0 && (
              <div className="space-y-2">
                {reportFiles.map((file: any) => (
                  <div key={file.id ?? file.file_url} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-secondary/30">
                    <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file_name}</p>
                      {file.file_size && (
                        <p className="text-xs text-muted-foreground">{(file.file_size / 1024).toFixed(0)} KB</p>
                      )}
                    </div>
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex-shrink-0">
                      Lihat
                    </a>
                    {!isReadOnly && file.id && (
                      <button type="button" onClick={() => handleDeleteFile(file.id, file.file_name)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!isReadOnly && (
          <div className="flex gap-3 pb-8">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving || isSubmitting}
              className="flex-1"
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Simpan Draft
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving || isSubmitting || !existingReport}
              className="flex-1"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Ajukan ke Admin
            </Button>
          </div>
        )}

      </main>

      {/* Modal Konfirmasi Kehadiran */}
      <Dialog open={attendanceModal.open} onOpenChange={(open) => { if (!open) closeAttendanceModal() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" /> Konfirmasi Kehadiran
            </DialogTitle>
            <DialogDescription>
              Tandai <span className="font-semibold text-foreground">{attendanceModal.name}</span> sebagai hadir. Unggah bukti foto kehadiran relawan untuk melanjutkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Bukti Foto Kehadiran *</Label>
            {attendanceProofPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={attendanceProofPreview} alt="Pratinjau bukti kehadiran" className="w-full max-h-64 object-cover" />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-8 cursor-pointer text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Camera className="h-7 w-7" />
                <span className="text-sm font-medium">Klik untuk unggah foto</span>
                <span className="text-xs">Format JPG/PNG, maks. 5MB</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAttendanceProofChange} disabled={submittingAttendance} />
              </label>
            )}
            {attendanceProofPreview && (
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer hover:underline">
                <Camera className="h-3.5 w-3.5" /> Ganti foto
                <input type="file" accept="image/*" className="hidden" onChange={handleAttendanceProofChange} disabled={submittingAttendance} />
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAttendanceModal} disabled={submittingAttendance}>Batal</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleConfirmAttendance} disabled={submittingAttendance || !attendanceProof}>
              {submittingAttendance ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <UserCheck className="h-4 w-4 mr-1.5" />}
              Konfirmasi Hadir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
