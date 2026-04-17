"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import {
  Plus, Search, Calendar, Users, Heart, Banknote, FileText,
  Eye, Edit, MoreHorizontal, CheckCircle2, AlertCircle,
  Upload, TrendingUp
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate } from "@/lib/utils/helpers"
import { getCommunityDashboardStats, getCommunityActivities } from "@/lib/actions/dashboard.actions"

// Dummy data removed, fetched directly from Supabase.

const statusConfig: Record<string, { label: string; className: string }> = {
  published: { label: "Aktif", className: "bg-green-100 text-green-700" },
  pending_review: { label: "Menunggu Review", className: "bg-yellow-100 text-yellow-700" },
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  completed: { label: "Selesai", className: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
  validated: { label: "Valid", className: "bg-green-100 text-green-700" },
  submitted: { label: "Disubmit", className: "bg-blue-100 text-blue-700" },
}

export default function CommunityDashboardPage() {
  const { profile } = useAuth()
  const [search, setSearch] = useState("")
  const [stats, setStats] = useState({ totalActivities: 0, totalVolunteers: 0, totalDonations: 0, verifiedReports: "0/0" })
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    if (profile?.id) {
       getCommunityDashboardStats(profile.id).then(setStats)
       getCommunityActivities(profile.id).then(setActivities)
    }
  }, [profile?.id])

  const filtered = activities.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  )

  const communityStats = [
    { label: "Total Kegiatan", value: stats.totalActivities, icon: Calendar, change: "Live" },
    { label: "Total Relawan", value: stats.totalVolunteers, icon: Users, change: "Live" },
    { label: "Total Donasi", value: formatCurrency(stats.totalDonations), icon: Banknote, change: "Live" },
    { label: "Laporan Terverifikasi", value: stats.verifiedReports, icon: FileText, change: "Live" },
  ]

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-primary font-medium">Komunitas Terverifikasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard Komunitas</h1>
            <p className="text-muted-foreground mt-1">Kelola kegiatan, relawan, dan laporan komunitas Anda</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {communityStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" /> {stat.change}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Kelola Kegiatan */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><CardTitle>Kelola Kegiatan</CardTitle><CardDescription>Katalog kegiatan komunitas Anda</CardDescription></div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari kegiatan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-56" />
                  </div>
                  <Button asChild><Link href="/community/dashboard/activities/create"><Plus className="mr-2 h-4 w-4" /> Buat Kegiatan</Link></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {filtered.map((a) => (
                  <div key={a.id} className="p-5 border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all bg-background">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2">{a.title}</h3>
                      <Badge className={`shrink-0 ${statusConfig[a.status]?.className}`}>{statusConfig[a.status]?.label}</Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(a.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {a.volunteer_count || 0}/{a.volunteer_quota || 0} relawan</span>
                        <span className="flex items-center gap-1"><Banknote className="h-3.5 w-3.5" /> {formatCurrency(a.funding_raised || 0)}</span>
                      </div>
                      {a.reports && a.reports.length > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Laporan:</span>
                          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${statusConfig[a.reports[0].status]?.className}`}>{statusConfig[a.reports[0].status]?.label}</Badge>
                        </div>
                      )}
                      {(!a.reports || a.reports.length === 0) && a.status === "completed" && (
                        <div className="flex items-center gap-2 text-xs">
                          <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                          <span className="text-orange-600">Laporan belum diupload</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border flex gap-2">
                      <Button size="sm" className="flex-1 text-xs h-9" asChild>
                        <Link href={`/activities/${a.id}`}><Eye className="h-3.5 w-3.5 mr-1.5" /> Kelola</Link>
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs h-9 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40" asChild>
                        <Link href={`/community/dashboard/activities/${a.id}/edit`}><Edit className="h-3.5 w-3.5 mr-1.5" /> Edit</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground text-sm">Tidak ada kegiatan ditemukan.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
