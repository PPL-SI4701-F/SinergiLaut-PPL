"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import {
  Banknote, RefreshCw, Plus, CheckCircle2, XCircle, Clock,
  AlertTriangle, Loader2, CreditCard, Building2, ArrowRight, Info,
  Wallet, ArrowDownCircle, ArrowUpCircle, TrendingUp
} from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  getAllDisbursements,
  createDisbursement,
  updateDisbursementStatus,
  getActivityFinanceSummary,
  getDisbursementOverview,
} from "@/lib/actions/disbursement.actions"
import { getOngoingActivities } from "@/lib/actions/dashboard.actions"
import { formatCurrency } from "@/lib/utils/helpers"

type Disbursement = Awaited<ReturnType<typeof getAllDisbursements>>["data"][number]
type StatusFilter = "all" | "pending" | "processing" | "completed" | "failed"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    pending:    { label: "Menunggu",   icon: Clock,         cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    processing: { label: "Diproses",   icon: ArrowRight,    cls: "bg-blue-100 text-blue-700 border-blue-200" },
    completed:  { label: "Selesai",    icon: CheckCircle2,  cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    failed:     { label: "Gagal",      icon: XCircle,       cls: "bg-rose-100 text-rose-700 border-rose-200" },
  }
  const s = map[status] ?? { label: status, icon: AlertTriangle, cls: "bg-slate-100 text-slate-600 border-slate-200" }
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${s.cls}`}>
      <Icon className="w-3 h-3" /> {s.label}
    </span>
  )
}

export default function AdminDisbursementsPage() {
  const [disbursements, setDisbursements] = useState<Disbursement[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof getDisbursementOverview>>>({ balance: 0, income: 0, expense: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>("all")

  // Create modal
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({
    activityId: "", communityId: "", amount: "", platformFee: "",
    bankName: "", accountNumber: "", accountName: "", notes: "",
  })
  const [financeSummary, setFinanceSummary] = useState<Awaited<ReturnType<typeof getActivityFinanceSummary>> | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [creating, setCreating] = useState(false)

  // Update status modal
  const [statusModal, setStatusModal] = useState<{
    open: boolean; id: string; currentStatus: string; label: string
  }>({ open: false, id: "", currentStatus: "", label: "" })
  const [refNumber, setRefNumber] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    const [dis, acts, ov] = await Promise.all([getAllDisbursements(), getOngoingActivities(), getDisbursementOverview()])
    setDisbursements(dis.data as Disbursement[])
    setActivities(acts)
    setOverview(ov)
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function onActivityChange(activityId: string) {
    const act = activities.find(a => a.id === activityId)
    setCreateForm(f => ({
      ...f,
      activityId,
      communityId: act?.community_id ?? "",
    }))
    if (!activityId) { setFinanceSummary(null); return }
    setLoadingSummary(true)
    const summary = await getActivityFinanceSummary(activityId)
    setFinanceSummary(summary)
    setLoadingSummary(false)
  }

  async function handleCreate() {
    if (!createForm.activityId || !createForm.amount || !createForm.bankName || !createForm.accountNumber || !createForm.accountName) {
      toast.error("Mohon lengkapi semua field wajib.")
      return
    }
    setCreating(true)
    const result = await createDisbursement({
      activityId: createForm.activityId,
      communityId: createForm.communityId,
      amount: Number(createForm.amount),
      platformFee: createForm.platformFee ? Number(createForm.platformFee) : 0,
      bankName: createForm.bankName,
      accountNumber: createForm.accountNumber,
      accountName: createForm.accountName,
      notes: createForm.notes || undefined,
    })
    if (result.success) {
      toast.success("Pencairan dana berhasil dibuat!")
      const selectedActivity = activities.find(a => a.id === createForm.activityId)
      const optimisticDisb = {
        ...(result.data as any),
        activity: selectedActivity ? { id: selectedActivity.id, title: selectedActivity.title } : null,
        community: selectedActivity?.community ?? null,
        admin: null,
      } as Disbursement
      setDisbursements(prev => [optimisticDisb, ...prev])
      setShowCreate(false)
      setCreateForm({ activityId: "", communityId: "", amount: "", platformFee: "", bankName: "", accountNumber: "", accountName: "", notes: "" })
      setFinanceSummary(null)
    } else {
      toast.error(result.error ?? "Gagal membuat pencairan.")
    }
    setCreating(false)
  }

  async function handleUpdateStatus(newStatus: "processing" | "completed" | "failed") {
    setUpdatingStatus(true)
    const result = await updateDisbursementStatus(statusModal.id, newStatus, refNumber || undefined)
    if (result.success) {
      const labels = { processing: "diproses", completed: "selesai", failed: "gagal" }
      toast.success(`Pencairan ditandai ${labels[newStatus]}.`)
      setDisbursements(prev => prev.map(d => d.id === statusModal.id ? { ...d, status: newStatus } as any : d))
      setStatusModal({ open: false, id: "", currentStatus: "", label: "" })
      setRefNumber("")
    } else {
      toast.error(result.error ?? "Gagal mengupdate status.")
    }
    setUpdatingStatus(false)
  }

  const filtered = disbursements.filter(d => filter === "all" || d.status === filter)
  const counts = {
    all: disbursements.length,
    pending: disbursements.filter(d => d.status === "pending").length,
    processing: disbursements.filter(d => d.status === "processing").length,
    completed: disbursements.filter(d => d.status === "completed").length,
    failed: disbursements.filter(d => d.status === "failed").length,
  }

  return (
    <div className="flex-1 bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Banknote className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Pencairan Dana</h1>
              <p className="text-sm text-slate-500">Kelola disbursement ke rekening komunitas</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-teal-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Buat Pencairan
            </button>
          </div>
        </div>

        {/* Finance Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Saldo",       value: overview.balance, icon: Wallet,          color: "text-teal-600",   bg: "bg-teal-50"   },
            { label: "Pemasukan",   value: overview.income,  icon: ArrowDownCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Pengeluaran", value: overview.expense, icon: ArrowUpCircle,   color: "text-rose-600",   bg: "bg-rose-50"   },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(s.value)}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" /> Live
                  </p>
                </div>
                <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: "all",        label: "Semua" },
            { key: "pending",    label: "Menunggu" },
            { key: "processing", label: "Diproses" },
            { key: "completed",  label: "Selesai" },
            { key: "failed",     label: "Gagal" },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === tab.key
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                filter === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Komunitas / Kegiatan", "Jumlah", "Bank Tujuan", "Status", "Tanggal", "Aksi"].map(h => (
                  <th key={h} className={`px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider ${h === "Aksi" ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-3/4 mb-1" /><div className="h-3 bg-slate-100 rounded w-1/2" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                    <td className="px-5 py-4"><div className="h-5 bg-slate-200 rounded-full w-20" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="px-5 py-4"><div className="h-8 bg-slate-200 rounded-xl w-28 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Banknote className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-semibold text-slate-500">Tidak ada pencairan ditemukan</p>
                  </td>
                </tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900 truncate max-w-[200px]">{(d as any).community?.name ?? "—"}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{(d as any).activity?.title ?? "—"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">{formatCurrency(d.amount ?? 0)}</p>
                    {(d.platform_fee ?? 0) > 0 && (
                      <p className="text-xs text-slate-400">Fee: {formatCurrency(d.platform_fee ?? 0)}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-700">{d.bank_name ?? "—"}</p>
                    <p className="text-xs text-slate-400">{d.account_number} · {d.account_name}</p>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {d.created_at ? format(new Date(d.created_at), "dd MMM yyyy", { locale: localeID }) : "—"}
                    {d.disbursed_at && (
                      <p className="text-slate-400 mt-0.5">Selesai: {format(new Date(d.disbursed_at), "dd MMM yyyy")}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {d.status === "pending" && (
                        <button
                          onClick={() => setStatusModal({ open: true, id: d.id, currentStatus: "pending", label: (d as any).community?.name ?? "" })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <ArrowRight className="w-3 h-3" /> Tinjau
                        </button>
                      )}
                      {d.status === "processing" && (
                        <button
                          onClick={() => setStatusModal({ open: true, id: d.id, currentStatus: "processing", label: (d as any).community?.name ?? "" })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Update Status
                        </button>
                      )}
                      {(d.status === "completed" || d.status === "failed") && (
                        <span className="text-xs text-slate-400 italic">
                          {d.reference_number ? `Ref: ${d.reference_number}` : "—"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>

      {/* Create Disbursement Modal */}
      <Dialog open={showCreate} onOpenChange={open => { if (!open) { setShowCreate(false); setFinanceSummary(null); setCreateForm({ activityId: "", communityId: "", amount: "", platformFee: "", bankName: "", accountNumber: "", accountName: "", notes: "" }) } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-amber-600" /> Buat Pencairan Dana Baru
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Pilih Kegiatan *</Label>
              <select
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                value={createForm.activityId}
                onChange={e => onActivityChange(e.target.value)}
              >
                <option value="">-- Pilih Kegiatan --</option>
                {activities.map(a => (
                  <option key={a.id} value={a.id}>{a.title} — {a.community?.name}</option>
                ))}
              </select>
            </div>

            {/* Finance Summary */}
            {createForm.activityId && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-sm">
                {loadingSummary ? (
                  <div className="flex items-center gap-2 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /> Memuat ringkasan keuangan...</div>
                ) : financeSummary ? (
                  <>
                    <p className="font-semibold text-slate-700 flex items-center gap-1.5"><Info className="w-4 h-4 text-blue-500" /> Ringkasan Keuangan Kegiatan</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-1">
                      <span className="text-slate-500">Total Terkumpul</span>
                      <span className="font-semibold text-emerald-700">{formatCurrency(financeSummary.totalCollected)}</span>
                      <span className="text-slate-500">Sudah Dicairkan</span>
                      <span className="font-semibold text-rose-600">{formatCurrency(financeSummary.totalDisbursed)}</span>
                      <span className="text-slate-500">Pending Donasi</span>
                      <span className="font-medium text-yellow-600">{formatCurrency(financeSummary.pendingPayments)}</span>
                      <span className="text-slate-700 font-bold">Saldo Tersedia</span>
                      <span className="font-bold text-teal-700">{formatCurrency(financeSummary.availableBalance)}</span>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Jumlah Pencairan (Rp) *</Label>
                <Input type="number" min={0} value={createForm.amount} onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Platform Fee (Rp)</Label>
                <Input type="number" min={0} value={createForm.platformFee} onChange={e => setCreateForm(f => ({ ...f, platformFee: e.target.value }))} placeholder="0" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Bank Tujuan *</Label>
              <Input value={createForm.bankName} onChange={e => setCreateForm(f => ({ ...f, bankName: e.target.value }))} placeholder="Contoh: BCA, Mandiri, BRI..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>No. Rekening *</Label>
                <Input value={createForm.accountNumber} onChange={e => setCreateForm(f => ({ ...f, accountNumber: e.target.value }))} placeholder="1234567890" />
              </div>
              <div className="space-y-1.5">
                <Label>Nama Pemilik *</Label>
                <Input value={createForm.accountName} onChange={e => setCreateForm(f => ({ ...f, accountName: e.target.value }))} placeholder="Nama rekening" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Catatan (opsional)</Label>
              <Textarea value={createForm.notes} onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))} placeholder='Contoh: "Dana Abadi" atau catatan transfer...' rows={2} />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                Batal
              </button>
              <button onClick={handleCreate} disabled={creating} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                {creating ? "Memproses..." : "Buat Pencairan"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={statusModal.open} onOpenChange={open => { if (!open) { setStatusModal({ open: false, id: "", currentStatus: "", label: "" }); setRefNumber("") } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Status Pencairan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600">
              Komunitas: <strong>{statusModal.label}</strong>
            </p>
            <div className="space-y-1.5">
              <Label>Nomor Referensi Transfer (opsional)</Label>
              <Input value={refNumber} onChange={e => setRefNumber(e.target.value)} placeholder="Contoh: TRF-20240520-001" />
            </div>

            {statusModal.currentStatus === "pending" && (
              <div className="flex gap-2 pt-1">
                <button onClick={() => handleUpdateStatus("processing")} disabled={updatingStatus}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                  {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Setujui &amp; Proses
                </button>
                <button onClick={() => handleUpdateStatus("failed")} disabled={updatingStatus}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                  {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Tolak
                </button>
              </div>
            )}

            {statusModal.currentStatus === "processing" && (
              <div className="flex gap-2 pt-1">
                <button onClick={() => handleUpdateStatus("completed")} disabled={updatingStatus}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                  {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Tandai Selesai
                </button>
                <button onClick={() => handleUpdateStatus("failed")} disabled={updatingStatus}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                  {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Tandai Gagal
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
