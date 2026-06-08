"use client"

/**
 * Halaman Pencairan Dana (Community Dashboard)
 * Route: /community/dashboard/disbursements
 * Menampilkan riwayat dan status pencairan dana donasi ke rekening komunitas.
 */

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import {
  Banknote, Loader2, RefreshCw, Clock, ArrowRight, CheckCircle2,
  XCircle, AlertTriangle, Building2, Calendar, Wallet, Plus, Info, CreditCard
} from "lucide-react"
import { getCommunityProfile, getCommunityActivities } from "@/lib/actions/dashboard.actions"
import { getCommunityDisbursements, getActivityFinanceSummary, requestDisbursement } from "@/lib/actions/disbursement.actions"
import { formatCurrency, formatDate } from "@/lib/utils/helpers"
import { toast } from "sonner"

type Disbursement = Awaited<ReturnType<typeof getCommunityDisbursements>>["data"][number]
type CommunityProfile = Awaited<ReturnType<typeof getCommunityProfile>>["data"]

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700", icon: Clock },
  processing: { label: "Diproses", className: "bg-blue-100 text-blue-700", icon: ArrowRight },
  completed: { label: "Selesai", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  failed: { label: "Gagal", className: "bg-red-100 text-red-700", icon: XCircle },
}

type FilterStatus = "all" | "pending" | "processing" | "completed" | "failed"

export default function CommunityDisbursementsPage() {
  const router = useRouter()
  const { isCommunity, isAdmin, isLoading: authLoading } = useAuth()

  const [disbursements, setDisbursements] = useState<Disbursement[]>([])
  const [community, setCommunity] = useState<CommunityProfile>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")

  // Request modal
  const [showRequest, setShowRequest] = useState(false)
  const [requestForm, setRequestForm] = useState({ activityId: "", amount: "", notes: "" })
  const [financeSummary, setFinanceSummary] = useState<Awaited<ReturnType<typeof getActivityFinanceSummary>> | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isCommunity && !isAdmin) {
      router.push("/login")
    }
  }, [authLoading, isCommunity, isAdmin, router])

  const load = useCallback(async () => {
    setIsLoading(true)
    const profileResult = await getCommunityProfile()
    if (!profileResult.success || !profileResult.data) {
      toast.error(profileResult.error ?? "Gagal memuat data komunitas.")
      setIsLoading(false)
      return
    }
    setCommunity(profileResult.data)
    const [result, communityActivities] = await Promise.all([
      getCommunityDisbursements(profileResult.data.id),
      getCommunityActivities(profileResult.data.owner_id),
    ])
    if (result.success) {
      setDisbursements(result.data as Disbursement[])
    } else {
      toast.error(result.error ?? "Gagal memuat data pencairan dana.")
    }
    setActivities((communityActivities as any[]).filter(a => !["draft", "pending_review", "cancelled"].includes(a.status)))
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function resetRequestForm() {
    setRequestForm({ activityId: "", amount: "", notes: "" })
    setFinanceSummary(null)
  }

  async function onRequestActivityChange(activityId: string) {
    setRequestForm(f => ({ ...f, activityId }))
    if (!activityId) { setFinanceSummary(null); return }
    setLoadingSummary(true)
    const summary = await getActivityFinanceSummary(activityId)
    setFinanceSummary(summary)
    setLoadingSummary(false)
  }

  async function handleSubmitRequest() {
    if (!community) return
    if (!requestForm.activityId || !requestForm.amount) {
      toast.error("Mohon pilih kegiatan dan isi jumlah pengajuan.")
      return
    }
    setSubmitting(true)
    const result = await requestDisbursement({
      activityId: requestForm.activityId,
      communityId: community.id,
      amount: Number(requestForm.amount),
      notes: requestForm.notes || undefined,
    })
    if (result.success) {
      toast.success("Pengajuan pencairan dana berhasil dikirim. Menunggu persetujuan admin.")
      setShowRequest(false)
      resetRequestForm()
      await load()
    } else {
      toast.error(result.error ?? "Gagal mengajukan pencairan dana.")
    }
    setSubmitting(false)
  }

  const hasBankAccount = !!(community?.bank_name && community?.bank_account_number && community?.bank_account_name)

  const filtered = disbursements.filter(d => filterStatus === "all" || d.status === filterStatus)
  const counts = {
    all: disbursements.length,
    pending: disbursements.filter(d => d.status === "pending").length,
    processing: disbursements.filter(d => d.status === "processing").length,
    completed: disbursements.filter(d => d.status === "completed").length,
    failed: disbursements.filter(d => d.status === "failed").length,
  }

  const totalDisbursed = disbursements
    .filter(d => d.status === "completed")
    .reduce((sum, d) => sum + (d.net_amount ?? d.amount ?? 0), 0)
  const totalPending = disbursements
    .filter(d => d.status === "pending" || d.status === "processing")
    .reduce((sum, d) => sum + (d.amount ?? 0), 0)

  return (
    <div className="flex-1 bg-slate-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Banknote className="h-6 w-6 text-primary" /> Pencairan Dana
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Pantau status pencairan dana donasi ke rekening komunitas Anda
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={load}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-teal-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button
                onClick={() => setShowRequest(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Ajukan Pencairan
              </button>
            </div>
          </div>

          {/* Ringkasan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><Wallet className="h-4 w-4" /> Total Sudah Dicairkan</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalDisbursed)}</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><Clock className="h-4 w-4" /> Sedang Diajukan / Diproses</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPending)}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap mb-6">
            {([
              { key: "all", label: "Semua" },
              { key: "pending", label: "Menunggu" },
              { key: "processing", label: "Diproses" },
              { key: "completed", label: "Selesai" },
              { key: "failed", label: "Gagal" },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filterStatus === tab.key
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  filterStatus === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>{counts[tab.key]}</span>
              </button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pencairan</CardTitle>
              <CardDescription>
                {filtered.length} dari {disbursements.length} pencairan ditampilkan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Banknote className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Belum ada pencairan dana untuk ditampilkan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((d) => {
                    const status = statusConfig[d.status] ?? { label: d.status, className: "bg-gray-100 text-gray-700", icon: AlertTriangle }
                    const StatusIcon = status.icon
                    return (
                      <div key={d.id} className="border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-foreground">{(d as any).activity?.title ?? "Kegiatan tidak ditemukan"}</p>
                              <Badge className={`${status.className} flex items-center gap-1`}>
                                <StatusIcon className="h-3 w-3" /> {status.label}
                              </Badge>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5"><Banknote className="h-3.5 w-3.5" /> Jumlah: <span className="font-medium text-foreground">{formatCurrency(d.amount ?? 0)}</span></div>
                              <div className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> Diterima bersih: <span className="font-medium text-foreground">{formatCurrency(d.net_amount ?? (d.amount ?? 0) - (d.platform_fee ?? 0))}</span></div>
                              <div className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {d.bank_name} · {d.account_number} a.n. {d.account_name}</div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" /> Diajukan: {d.created_at ? formatDate(d.created_at) : "—"}
                                {d.disbursed_at && <span> · Selesai: {formatDate(d.disbursed_at)}</span>}
                              </div>
                            </div>
                            {d.reference_number && (
                              <p className="text-xs text-muted-foreground">No. Referensi Transfer: <span className="font-medium text-foreground">{d.reference_number}</span></p>
                            )}
                            {d.notes && (
                              <p className="text-xs text-muted-foreground italic">"{d.notes}"</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Request Disbursement Modal */}
      <Dialog open={showRequest} onOpenChange={open => { if (!open) { setShowRequest(false); resetRequestForm() } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-teal-600" /> Ajukan Pencairan Dana
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!hasBankAccount && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  Rekening bank komunitas Anda belum lengkap. Lengkapi data rekening pada halaman{" "}
                  <strong>Profil Komunitas</strong> sebelum mengajukan pencairan.
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Pilih Kegiatan *</Label>
              <select
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                value={requestForm.activityId}
                onChange={e => onRequestActivityChange(e.target.value)}
              >
                <option value="">-- Pilih Kegiatan --</option>
                {activities.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>

            {/* Finance Summary */}
            {requestForm.activityId && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-sm">
                {loadingSummary ? (
                  <div className="flex items-center gap-2 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Memuat ringkasan keuangan...</div>
                ) : financeSummary ? (
                  <>
                    <p className="font-semibold text-slate-700 flex items-center gap-1.5"><Info className="w-4 h-4 text-blue-500" /> Ringkasan Keuangan Kegiatan</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-1">
                      <span className="text-slate-500">Total Terkumpul</span>
                      <span className="font-semibold text-emerald-700">{formatCurrency(financeSummary.totalCollected)}</span>
                      <span className="text-slate-500">Sudah/Sedang Dicairkan</span>
                      <span className="font-semibold text-rose-600">{formatCurrency(financeSummary.totalDisbursed)}</span>
                      <span className="text-slate-700 font-bold">Saldo Tersedia</span>
                      <span className="font-bold text-teal-700">{formatCurrency(financeSummary.availableBalance)}</span>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Jumlah Pengajuan (Rp) *</Label>
              <Input type="number" min={0} value={requestForm.amount} onChange={e => setRequestForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Rekening Tujuan</Label>
              {hasBankAccount ? (
                <div className="flex items-center gap-2 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {community?.bank_name} · {community?.bank_account_number} a.n. {community?.bank_account_name}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Belum ada rekening terdaftar pada profil komunitas.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Catatan (opsional)</Label>
              <Textarea value={requestForm.notes} onChange={e => setRequestForm(f => ({ ...f, notes: e.target.value }))} placeholder="Contoh: Dana untuk operasional kegiatan..." rows={2} />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowRequest(false); resetRequestForm() }} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                Batal
              </button>
              <button onClick={handleSubmitRequest} disabled={submitting || !hasBankAccount} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                {submitting ? "Mengirim..." : "Ajukan Pencairan"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
