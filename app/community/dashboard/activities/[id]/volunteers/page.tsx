"use client"

/**
 * Halaman Manajemen Relawan (Community Dashboard)
 * Route: /community/dashboard/activities/[id]/volunteers
 * Hanya bisa diakses oleh pengelola komunitas.
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import {
  ArrowLeft, Search, Users, CheckCircle, XCircle, UserCheck,
  Loader2, Phone, Mail, Shirt, Brain, AlertCircle, Download
} from "lucide-react"
import { getActivityVolunteers, updateVolunteerStatus } from "@/lib/actions/volunteer.actions"
import { formatDate } from "@/lib/utils/helpers"
import { toast } from "sonner"
import type { VolunteerRegistration } from "@/lib/types"

type VolunteerWithUser = VolunteerRegistration & {
  user?: { id: string; full_name: string | null; avatar_url: string | null; email: string; phone: string | null }
  emergency_contact_name?: string
  emergency_contact_phone?: string
  skills?: string[]
  t_shirt_size?: string
}

const statusConfig = {
  pending: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Diterima", className: "bg-green-100 text-green-700" },
  rejected: { label: "Ditolak", className: "bg-red-100 text-red-700" },
  attended: { label: "Hadir", className: "bg-blue-100 text-blue-700" },
}

type FilterStatus = "all" | "pending" | "approved" | "rejected" | "attended"

export default function VolunteersManagementPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isCommunity, isAdmin, isLoading: authLoading } = useAuth()

  const [volunteers, setVolunteers] = useState<VolunteerWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [activityTitle, setActivityTitle] = useState("")

  useEffect(() => {
    if (!authLoading && !isCommunity && !isAdmin) {
      router.push("/login")
    }
  }, [authLoading, isCommunity, isAdmin, router])

  useEffect(() => {
    if (!params.id) return

    async function loadData() {
      setIsLoading(true)
      const result = await getActivityVolunteers(params.id as string)
      if (result.success) {
        setVolunteers(result.data as VolunteerWithUser[])
      } else {
        toast.error(result.error ?? "Gagal memuat data relawan.")
      }
      setIsLoading(false)
    }

    loadData()
  }, [params.id])

  async function handleStatusUpdate(
    id: string,
    status: "approved" | "rejected" | "attended"
  ) {
    setUpdatingId(id)
    const result = await updateVolunteerStatus(id, status)
    if (result.success) {
      setVolunteers(prev =>
        prev.map(v => v.id === id ? { ...v, status } : v)
      )
      toast.success(`Status relawan berhasil diubah menjadi ${statusConfig[status].label}.`)
    } else {
      toast.error(result.error ?? "Gagal mengupdate status.")
    }
    setUpdatingId(null)
  }

  const filtered = volunteers.filter(v => {
    const matchSearch =
      v.full_name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.includes(search)
    const matchStatus = filterStatus === "all" || v.status === filterStatus
    return matchSearch && matchStatus
  })

  const counts = {
    all: volunteers.length,
    pending: volunteers.filter(v => v.status === "pending").length,
    approved: volunteers.filter(v => v.status === "approved").length,
    rejected: volunteers.filter(v => v.status === "rejected").length,
    attended: volunteers.filter(v => v.status === "attended").length,
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <Link href="/community/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
                <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" /> Manajemen Relawan
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Kelola pendaftaran dan kehadiran relawan kegiatan ini
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {(["pending", "approved", "rejected", "attended"] as const).map(s => (
              <Card key={s} className={`cursor-pointer transition-all ${filterStatus === s ? "ring-2 ring-primary" : "hover:shadow-md"}`}
                onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground capitalize">{statusConfig[s].label}</p>
                  <p className="text-2xl font-bold text-foreground">{counts[s]}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle>Daftar Relawan</CardTitle>
                  <CardDescription>
                    {filtered.length} dari {volunteers.length} relawan ditampilkan
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari nama / email / telepon..." value={search}
                      onChange={e => setSearch(e.target.value)} className="pl-9" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Tidak ada relawan yang ditemukan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((v) => (
                    <div key={v.id} className="border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Info Relawan */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                              {v.full_name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground">{v.full_name}</p>
                                <Badge className={statusConfig[v.status]?.className}>{statusConfig[v.status]?.label}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">Daftar: {formatDate(v.created_at)}</p>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground pl-12">
                            <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {v.email}</div>
                            <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {v.phone}</div>
                            {v.t_shirt_size && (
                              <div className="flex items-center gap-1.5"><Shirt className="h-3.5 w-3.5" /> Kaos: {v.t_shirt_size}</div>
                            )}
                            {v.emergency_contact_name && (
                              <div className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> Darurat: {v.emergency_contact_name} ({v.emergency_contact_phone})</div>
                            )}
                          </div>

                          {v.skills && v.skills.length > 0 && (
                            <div className="pl-12 flex flex-wrap gap-1">
                              {v.skills.map(skill => (
                                <Badge key={skill} className="text-xs bg-primary/10 text-primary">{skill}</Badge>
                              ))}
                            </div>
                          )}

                          {v.reason && (
                            <div className="pl-12">
                              <p className="text-xs text-muted-foreground italic">"{v.reason}"</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pl-12 sm:pl-0">
                          {v.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                disabled={updatingId === v.id}
                                onClick={() => handleStatusUpdate(v.id, "rejected")}>
                                {updatingId === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                                <span className="ml-1">Tolak</span>
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700"
                                disabled={updatingId === v.id}
                                onClick={() => handleStatusUpdate(v.id, "approved")}>
                                {updatingId === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                <span className="ml-1">Terima</span>
                              </Button>
                            </>
                          )}
                          {v.status === "approved" && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
                              disabled={updatingId === v.id}
                              onClick={() => handleStatusUpdate(v.id, "attended")}>
                              {updatingId === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                              <span className="ml-1">Tandai Hadir</span>
                            </Button>
                          )}
                          {(v.status === "attended" || v.status === "rejected") && (
                            <span className="text-xs text-muted-foreground self-center">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
