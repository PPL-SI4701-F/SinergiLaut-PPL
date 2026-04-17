"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Activity, CheckCircle2, X, Eye, Clock, FileText, Loader2, Users, Banknote
} from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils/helpers"
import { toast } from "sonner"
import {
  getPendingActivities, getPendingReports, getOngoingActivities,
  approveActivityAction, rejectActivityAction,
  approveReportAction, rejectReportAction
} from "@/lib/actions/dashboard.actions"

export default function AdminActivitiesPage() {
  const [pendingActivities, setPendingActivities] = useState<any[]>([])
  const [pendingReports, setPendingReports] = useState<any[]>([])
  const [ongoingActivities, setOngoingActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const [pa, pr, oa] = await Promise.all([getPendingActivities(), getPendingReports(), getOngoingActivities()])
      setPendingActivities(pa)
      setPendingReports(pr)
      setOngoingActivities(oa)
      setIsLoading(false)
    }
    load()
  }, [])

  const handleApproveActivity = async (id: string) => {
    const result = await approveActivityAction(id)
    if (result.success) {
      toast.success("Kegiatan berhasil dipublikasikan ✅")
      setPendingActivities(p => p.filter(a => a.id !== id))
    } else toast.error(result.error ?? "Gagal menyetujui.")
  }

  const handleRejectActivity = async (id: string) => {
    const result = await rejectActivityAction(id)
    if (result.success) {
      toast.info("Kegiatan ditolak.")
      setPendingActivities(p => p.filter(a => a.id !== id))
    } else toast.error(result.error ?? "Gagal menolak.")
  }

  const handleApproveReport = async (id: string) => {
    const result = await approveReportAction(id)
    if (result.success) {
      toast.success("Laporan berhasil divalidasi ✅")
      setPendingReports(p => p.filter(r => r.id !== id))
    } else toast.error(result.error ?? "Gagal memvalidasi.")
  }

  const handleRejectReport = async (id: string) => {
    const result = await rejectReportAction(id)
    if (result.success) {
      toast.info("Laporan ditolak.")
      setPendingReports(p => p.filter(r => r.id !== id))
    } else toast.error(result.error ?? "Gagal menolak.")
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kelola Kegiatan</h1>
              <p className="text-muted-foreground text-sm">Moderasi kegiatan dan validasi laporan pasca kegiatan</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Kegiatan Pending */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Kegiatan Menunggu Persetujuan
                  {pendingActivities.length > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 ml-1">{pendingActivities.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>Kegiatan yang diajukan komunitas dan perlu dimoderasi</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                ) : pendingActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Tidak ada kegiatan yang menunggu persetujuan.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingActivities.map(a => (
                      <div key={a.id} className="p-4 border border-blue-200 bg-blue-50/30 dark:bg-blue-950/10 rounded-xl">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{a.title}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {a.community?.name || "Komunitas"} • {formatDate(a.start_date)} • Target: {formatCurrency(a.funding_goal || 0)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-primary/10 text-primary capitalize text-xs">{a.category}</Badge>
                              {a.allow_item_donation && (
                                <Badge className="bg-purple-100 text-purple-700 text-xs">Donasi Barang</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/activities/${a.id}/review`}>
                                <Eye className="h-4 w-4 mr-1" /> Review
                              </Link>
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveActivity(a.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Publis
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRejectActivity(a.id)}>
                              <X className="h-4 w-4 mr-1" /> Tolak
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Kegiatan Berjalan (Monitoring) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Monitoring Kegiatan Berjalan
                  {ongoingActivities.length > 0 && (
                    <Badge className="bg-primary/10 text-primary ml-1">{ongoingActivities.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>Pantau kegiatan yang sedang berjalan atau sudah selesai</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                ) : ongoingActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Tidak ada kegiatan yang sedang berjalan.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ongoingActivities.map(a => (
                      <div key={a.id} className="p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{a.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {a.community?.name || "Komunitas"} • {formatDate(a.start_date)}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3"/> {a.volunteer_count} / {a.volunteer_quota}</span>
                            <span className="flex items-center gap-1"><Banknote className="h-3 w-3"/> {formatCurrency(a.funding_raised || 0)}</span>
                            <Badge variant="outline" className={a.status === "published" ? "text-green-600 border-green-200" : "text-gray-500"}>
                              {a.status === "published" ? "Aktif" : "Selesai"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/activities/${a.id}`}>
                              <Eye className="h-4 w-4 mr-1" /> Pantau Detail
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Laporan Pending */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  Laporan Menunggu Validasi
                  {pendingReports.length > 0 && (
                    <Badge className="bg-green-100 text-green-700 ml-1">{pendingReports.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>Laporan pasca kegiatan yang perlu divalidasi admin</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                ) : pendingReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Tidak ada laporan yang menunggu validasi.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingReports.map(r => (
                      <div key={r.id} className="p-4 border border-green-200 bg-green-50/30 dark:bg-green-950/10 rounded-xl">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{r.activity?.title || "Kegiatan"}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {r.community?.name || "Komunitas"} • Dibuat: {formatDate(r.created_at)}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/activities/${r.activity_id}`}>
                                <Eye className="h-4 w-4 mr-1" /> Buka
                              </Link>
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveReport(r.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Validasi
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRejectReport(r.id)}>
                              <X className="h-4 w-4 mr-1" /> Tolak
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
