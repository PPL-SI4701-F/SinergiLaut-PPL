"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users, Heart, Calendar, MapPin, Banknote, Package, Search, Filter
} from "lucide-react"
import { formatCurrency, formatDateShort } from "@/lib/utils/helpers"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type UserTab = "overview" | "volunteer" | "donations"

const statusConfig: Record<string, { label: string; className: string }> = {
  approved:  { label: "Disetujui",  className: "bg-green-100 text-green-700" },
  pending:   { label: "Menunggu",   className: "bg-yellow-100 text-yellow-700" },
  rejected:  { label: "Ditolak",    className: "bg-red-100 text-red-700" },
  completed: { label: "Selesai",    className: "bg-blue-100 text-blue-700" },
  attended:  { label: "Hadir",      className: "bg-green-100 text-green-700" },
}

interface VolunteerItem {
  id: string
  status: string
  created_at: string
  activity: {
    id: string
    title: string
    slug: string
    start_date: string | null
    location: string | null
    cover_image_url: string | null
    status: string
    community: { name: string; logo_url: string | null } | null
  } | null
}

interface DonationItem {
  id: string
  type: string
  amount: number | null
  status: string
  created_at: string
  is_anonymous: boolean
  note: string | null
  activity: { id: string; title: string; slug: string } | null
  items: { item_name: string; quantity: number }[]
}

interface DashboardClientProps {
  volunteers: VolunteerItem[]
  donations: DonationItem[]
}

export function DashboardClient({ volunteers, donations }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<UserTab>("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredVolunteers = volunteers.filter((v) => {
    const matchesSearch = v.activity?.title.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  })

  const tabs = [
    { id: "overview",   label: "Ringkasan" },
    { id: "volunteer",  label: "Riwayat Relawan" },
    { id: "donations",  label: "Riwayat Donasi" },
  ]

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.id as UserTab)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Kegiatan Relawan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Kegiatan Relawan</CardTitle>
                <CardDescription>Kegiatan yang Anda ikuti</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("volunteer")}>
                Lihat Semua
              </Button>
            </CardHeader>
            <CardContent>
              {volunteers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada riwayat pendaftaran relawan.
                </p>
              ) : (
                <div className="space-y-3">
                  {volunteers.slice(0, 3).map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {v.activity?.title ?? "—"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {v.activity?.start_date ? formatDateShort(v.activity.start_date) : "—"}
                          {v.activity?.location && (
                            <>
                              <MapPin className="h-3 w-3 ml-1" />
                              {v.activity.location}
                            </>
                          )}
                        </div>
                      </div>
                      <Badge className={statusConfig[v.status]?.className}>
                        {statusConfig[v.status]?.label ?? v.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Riwayat Donasi */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Riwayat Donasi</CardTitle>
                <CardDescription>Donasi uang dan barang Anda</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("donations")}>
                Lihat Semua
              </Button>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Belum ada riwayat donasi.
                </p>
              ) : (
                <div className="space-y-3">
                  {donations.slice(0, 3).map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {d.activity?.title ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {d.type === "money"
                            ? formatCurrency(d.amount ?? 0)
                            : d.items?.map((i) => `${i.item_name} (${i.quantity})`).join(", ") || "Barang"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={d.type === "money" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent-foreground"}>
                          {d.type === "money" ? <Banknote className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                        </Badge>
                        <Badge className={statusConfig[d.status]?.className}>
                          {statusConfig[d.status]?.label ?? d.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Volunteer History */}
      {activeTab === "volunteer" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Riwayat Relawan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kegiatan..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="attended">Hadir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredVolunteers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-40" />
                <p className="text-muted-foreground">Tidak ada riwayat kegiatan yang sesuai.</p>
                <Button asChild className="mt-4">
                  <Link href="/activities">Cari Kegiatan Lain</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVolunteers.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 border border-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {v.activity?.title ?? "—"}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                        {v.activity?.start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateShort(v.activity.start_date)}
                          </span>
                        )}
                        {v.activity?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {v.activity.location}
                          </span>
                        )}
                        {v.activity?.community?.name && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {v.activity.community.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={statusConfig[v.status]?.className}>
                      {statusConfig[v.status]?.label ?? v.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Donation History */}
      {activeTab === "donations" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" /> Riwayat Donasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Belum ada riwayat donasi.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="text-sm font-medium text-muted-foreground py-3 px-4">Kegiatan</th>
                      <th className="text-sm font-medium text-muted-foreground py-3 px-4">Jenis</th>
                      <th className="text-sm font-medium text-muted-foreground py-3 px-4">Nilai</th>
                      <th className="text-sm font-medium text-muted-foreground py-3 px-4">Tanggal</th>
                      <th className="text-sm font-medium text-muted-foreground py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d) => (
                      <tr key={d.id} className="border-b border-border last:border-0">
                        <td className="py-4 px-4 text-sm font-medium text-foreground max-w-[200px] truncate">
                          {d.activity?.title ?? "—"}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={d.type === "money" ? "bg-primary/10 text-primary" : "bg-accent/10"}>
                            {d.type === "money" ? "Uang" : "Barang"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {d.type === "money"
                            ? formatCurrency(d.amount ?? 0)
                            : d.items?.map((i) => `${i.item_name} (${i.quantity})`).join(", ") || "—"}
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {formatDateShort(d.created_at)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={statusConfig[d.status]?.className}>
                            {statusConfig[d.status]?.label ?? d.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
