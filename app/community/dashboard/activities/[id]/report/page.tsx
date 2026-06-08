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
import {
  ArrowLeft, Plus, Trash2, Loader2, FileText, Upload,
  CheckCircle2, Clock, XCircle, AlertCircle, Send, Save, Paperclip, X
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
    </div>
  )
}
