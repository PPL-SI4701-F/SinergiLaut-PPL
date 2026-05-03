"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Users, Building2, FileText, Banknote, Activity,
  CheckCircle2, X, TrendingUp, Clock, UserCheck, Shield, ArrowRight
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils/helpers"
import { toast } from "sonner"
import {
  getAdminDashboardStats,
  getPendingCommunities,
  getPendingActivities,
  getPendingReports,
  approveCommunityAction, rejectCommunityAction,
  approveActivityAction, rejectActivityAction,
} from "@/lib/actions/dashboard.actions"
import { getVolunteersPendingVerification } from "@/lib/actions/volunteer-verification.actions"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalCommunities: 0, totalUsers: 0, totalActivities: 0, totalEndowment: 0 })
  const [pendingCommunities, setPendingCommunities] = useState<any[]>([])
  const [pendingActivities, setPendingActivities] = useState<any[]>([])
  const [pendingReports, setPendingReports] = useState<any[]>([])
  const [pendingVolunteers, setPendingVolunteers] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const [st, pc, pa, pr, pv] = await Promise.all([
        getAdminDashboardStats(),
        getPendingCommunities(),
        getPendingActivities(),
        getPendingReports(),
        getVolunteersPendingVerification("pending"),
      ])
      setStats(st)
      setPendingCommunities(pc)
      setPendingActivities(pa)
      setPendingReports(pr)
      setPendingVolunteers(pv.success ? (pv.data as any[]).length : 0)
      setIsLoading(false)
    }
    load()
  }, [])

  const handleApprove = async (entity: "Komunitas" | "Kegiatan", id: string) => {
    const result = entity === "Komunitas" ? await approveCommunityAction(id) : await approveActivityAction(id)
    if (result.success) {
      toast.success(`${entity} berhasil disetujui ✅`)
      if (entity === "Komunitas") setPendingCommunities(p => p.filter(c => c.id !== id))
      else setPendingActivities(p => p.filter(a => a.id !== id))
    } else toast.error(result.error ?? "Gagal.")
  }

  const handleReject = async (entity: "Komunitas" | "Kegiatan", id: string) => {
    const result = entity === "Komunitas" ? await rejectCommunityAction(id) : await rejectActivityAction(id)
    if (result.success) {
      toast.info(`${entity} ditolak.`)
      if (entity === "Komunitas") setPendingCommunities(p => p.filter(c => c.id !== id))
      else setPendingActivities(p => p.filter(a => a.id !== id))
    } else toast.error(result.error ?? "Gagal.")
  }

  const statCards = [
    { label: "Total Komunitas", value: stats.totalCommunities, icon: Building2, color: "text-primary" },
    { label: "Pengguna Aktif", value: stats.totalUsers, icon: Users, color: "text-blue-600" },
    { label: "Kegiatan Aktif", value: stats.totalActivities, icon: Activity, color: "text-green-600" },
    { label: "Total Dana Abadi", value: formatCurrency(stats.totalEndowment), icon: Banknote, color: "text-amber-600" },
  ]

  const alertCards = [
    { label: `${pendingCommunities.length} komunitas`, sub: "Menunggu verifikasi", color: "bg-yellow-50 border-yellow-200 text-yellow-800", icon: "🏢", href: "/admin/communities" },
    { label: `${pendingActivities.length} kegiatan`, sub: "Menunggu persetujuan", color: "bg-blue-50 border-blue-200 text-blue-800", icon: "📋", href: "/admin/activities" },
    { label: `${pendingReports.length} laporan`, sub: "Menunggu validasi", color: "bg-green-50 border-green-200 text-green-800", icon: "📄", href: "/admin/activities" },
    { label: `${pendingVolunteers} pengguna`, sub: "Menunggu verifikasi data diri", color: "bg-purple-50 border-purple-200 text-purple-800", icon: "👤", href: "/admin/users" },
  ]

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Ringkasan aktivitas platform SinergiLaut</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map(stat => (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" /> Live
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Alert Summary Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {alertCards.map(a => (
              <Link key={a.href + a.label} href={a.href}
                className={`p-4 ${a.color} border rounded-xl flex items-center gap-3 hover:shadow-md transition-all group`}>
                <span className="text-2xl">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{a.label}</p>
                  <p className="text-xs opacity-80">{a.sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Komunitas Pending */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" /> Komunitas Pending
                  </CardTitle>
                  <CardDescription>Perlu tindakan admin</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/communities">Lihat Semua <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {pendingCommunities.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <CheckCircle2 className="h-7 w-7 mx-auto mb-2 opacity-30" />Tidak ada yang pending.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingCommunities.slice(0, 3).map(c => (
                      <div key={c.id} className="flex items-center justify-between gap-3 p-3 bg-secondary rounded-lg border-l-4 border-l-yellow-400">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(c.created_at)}</p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-xs" onClick={() => handleApprove("Komunitas", c.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Setujui
                          </Button>
                          <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => handleReject("Komunitas", c.id)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Kegiatan Pending */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" /> Kegiatan Pending
                  </CardTitle>
                  <CardDescription>Menunggu moderasi</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/activities">Lihat Semua <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {pendingActivities.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <CheckCircle2 className="h-7 w-7 mx-auto mb-2 opacity-30" />Tidak ada yang pending.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingActivities.slice(0, 3).map(a => (
                      <div key={a.id} className="flex items-center justify-between gap-3 p-3 bg-secondary rounded-lg border-l-4 border-l-blue-400">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{a.title}</p>
                          <p className="text-xs text-muted-foreground">{a.community?.name} • {formatDate(a.start_date)}</p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" asChild>
                            <Link href={`/admin/activities/${a.id}/review`}>Review</Link>
                          </Button>
                          <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-xs" onClick={() => handleApprove("Kegiatan", a.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => handleReject("Kegiatan", a.id)}>
                            <X className="h-3.5 w-3.5" />
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
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" /> Laporan Pending
                  </CardTitle>
                  <CardDescription>Menunggu validasi admin</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/activities">Lihat Semua <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {pendingReports.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <CheckCircle2 className="h-7 w-7 mx-auto mb-2 opacity-30" />Tidak ada laporan pending.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingReports.slice(0, 3).map(r => (
                      <div key={r.id} className="flex items-center justify-between gap-3 p-3 bg-secondary rounded-lg border-l-4 border-l-green-400">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{r.activity?.title || "Kegiatan"}</p>
                          <p className="text-xs text-muted-foreground">{r.community?.name} • {formatDate(r.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Volunteer Pending */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-purple-500" /> Verifikasi Pengguna
                  </CardTitle>
                  <CardDescription>Data diri perlu diverifikasi</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/users">Lihat Semua <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-purple-700">{pendingVolunteers}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">pengguna menunggu verifikasi data diri</p>
                  {pendingVolunteers > 0 && (
                    <Button size="sm" className="mt-3" asChild>
                      <Link href="/admin/users">Verifikasi Sekarang</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
