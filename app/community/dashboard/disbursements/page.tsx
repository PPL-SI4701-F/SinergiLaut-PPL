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
import { useAuth } from "@/contexts/auth-context"
import {
  Banknote, Loader2, RefreshCw, Clock, ArrowRight, CheckCircle2,
  XCircle, AlertTriangle, Building2, Calendar, Wallet
} from "lucide-react"
import { getCommunityProfile } from "@/lib/actions/dashboard.actions"
import { getCommunityDisbursements } from "@/lib/actions/disbursement.actions"
import { formatCurrency, formatDate } from "@/lib/utils/helpers"
import { toast } from "sonner"

type Disbursement = Awaited<ReturnType<typeof getCommunityDisbursements>>["data"][number]

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
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")

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
    const result = await getCommunityDisbursements(profileResult.data.id)
    if (result.success) {
      setDisbursements(result.data as Disbursement[])
    } else {
      toast.error(result.error ?? "Gagal memuat data pencairan dana.")
    }
    setIsLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

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
            <button
              onClick={load}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-teal-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
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
    </div>
  )
}
