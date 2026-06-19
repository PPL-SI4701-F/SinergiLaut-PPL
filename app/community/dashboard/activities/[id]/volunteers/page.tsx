"use client"

/**
 * Halaman Manajemen Relawan (Community Dashboard)
 * Route: /community/dashboard/activities/[id]/volunteers
 * Hanya bisa diakses oleh pengelola komunitas.
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import {
  ArrowLeft, Search, Users, CheckCircle, XCircle, UserCheck,
  Loader2, Phone, Mail, Shirt, Brain, AlertCircle, Download, Banknote,
  MapPin, Calendar, Clock, Camera, Image as ImageIcon
} from "lucide-react"
import { getCommunityActivitySummary } from "@/lib/actions/activity.actions"
import { getActivityVolunteers, updateVolunteerStatus, markVolunteerAttended } from "@/lib/actions/volunteer.actions"
import { formatDate, formatCurrency } from "@/lib/utils/helpers"
import { toast } from "sonner"
import type { VolunteerRegistration } from "@/lib/types"

type VolunteerWithUser = VolunteerRegistration & {
  user?: { id: string; full_name: string | null; avatar_url: string | null; email: string; phone: string | null }
  emergency_contact_name?: string
  emergency_contact_phone?: string
  skills?: string[]
  t_shirt_size?: string
  attendance_proof_url?: string | null
}

// Urutan status yang ditampilkan: menunggu → diterima → hadir → ditolak
const statusOrder: Record<string, number> = { pending: 0, approved: 1, attended: 2, rejected: 3 }

const statusConfig = {
  pending: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Diterima", className: "bg-green-100 text-green-700" },
  rejected: { label: "Ditolak", className: "bg-red-100 text-red-700" },
  attended: { label: "Hadir", className: "bg-blue-100 text-blue-700" },
  absent: { label: "Tidak Hadir", className: "bg-gray-100 text-gray-700" },
}

const activityStatusConfig: Record<string, { label: string; className: string }> = {
  published: { label: "Aktif", className: "bg-green-100 text-green-700" },
  pending_review: { label: "Menunggu Review", className: "bg-yellow-100 text-yellow-700" },
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  completed: { label: "Selesai", className: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
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
  const [attendanceModal, setAttendanceModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" })
  const [attendanceProof, setAttendanceProof] = useState<File | null>(null)
  const [attendanceProofPreview, setAttendanceProofPreview] = useState<string | null>(null)
  const [submittingAttendance, setSubmittingAttendance] = useState(false)
  const [activity, setActivity] = useState<{
    title: string
    description: string | null
    cover_image_url: string | null
    funding_raised: number
    funding_goal: number
    volunteer_count: number
    volunteer_quota: number
    status: string
    location: string
    start_date: string
    end_date: string | null
    execution_date: string | null
  } | null>(null)

  useEffect(() => {
    if (!authLoading && !isCommunity && !isAdmin) {
      router.push("/login")
    }
  }, [authLoading, isCommunity, isAdmin, router])

  useEffect(() => {
    if (!params.id) return

    async function loadActivity() {
      const result = await getCommunityActivitySummary(params.id as string)
      if (result.success && result.data) {
        setActivity(result.data)
      } else {
        toast.error(result.error ?? "Kegiatan tidak ditemukan atau bukan milik komunitas Anda.")
        router.push("/community/dashboard")
      }
    }

    loadActivity()
  }, [params.id])

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

  const isQuotaFull = activity ? activity.volunteer_count >= activity.volunteer_quota : false;

  async function handleStatusUpdate(
    id: string,
    status: "approved" | "rejected"
  ) {
    if (status === "approved" && isQuotaFull) {
      toast.error("Kuota penuh. Kapasitas maksimum relawan telah tercapai.");
      return;
    }
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
      toast.error("Mohon unggah bukti foto/gambar kehadiran terlebih dahulu.")
      return
    }
    const id = attendanceModal.id
    setSubmittingAttendance(true)
    setUpdatingId(id)
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
    setUpdatingId(null)
  }

  const filtered = volunteers
    .filter(v => {
      const matchSearch =
        v.full_name.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase()) ||
        v.phone.includes(search)
      const matchStatus = filterStatus === "all" || v.status === filterStatus
      return matchSearch && matchStatus
    })
    .sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99))

  const counts = {
    all: volunteers.length,
    pending: volunteers.filter(v => v.status === "pending").length,
    approved: volunteers.filter(v => v.status === "approved").length,
    rejected: volunteers.filter(v => v.status === "rejected").length,
    attended: volunteers.filter(v => v.status === "attended").length,
  }

  return (
    <div className="flex-1 bg-slate-50">
      <main>
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

          {/* Ringkasan Kegiatan */}
          {activity && (
            <Card className="mb-6 overflow-hidden">
              <div className="sm:flex">
                {activity.cover_image_url && (
                  <div className="sm:w-64 aspect-video sm:aspect-auto shrink-0">
                    <img src={activity.cover_image_url} alt={activity.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-5 flex-1 space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h2 className="font-semibold text-foreground">{activity.title}</h2>
                      <Badge className={`shrink-0 ${activityStatusConfig[activity.status]?.className ?? "bg-gray-100 text-gray-700"}`}>
                        {activityStatusConfig[activity.status]?.label ?? activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{activity.description || "Belum ada deskripsi."}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>
                        Waktu pelaksanaan:{" "}
                        <span className="text-foreground font-medium">
                          {activity.execution_date ? formatDate(activity.execution_date) : "Belum ditentukan"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>
                        Lokasi: <span className="text-foreground font-medium">{activity.location || "Belum ditentukan"}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        Periode penggalangan donasi & pendaftaran relawan:{" "}
                        <span className="text-foreground font-medium">
                          {formatDate(activity.start_date)}
                          {activity.end_date ? ` – ${formatDate(activity.end_date)}` : ""}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Banknote className="h-4 w-4" /> Total Donasi</span>
                        <span className="font-semibold text-foreground">{formatCurrency(activity.funding_raised || 0)}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${activity.funding_goal ? Math.min(100, Math.round((activity.funding_raised / activity.funding_goal) * 100)) : 0}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">dari target {formatCurrency(activity.funding_goal || 0)}</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Users className="h-4 w-4" /> Total Relawan</span>
                        <span className="font-semibold text-foreground">{activity.volunteer_count || 0}/{activity.volunteer_quota || 0}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${activity.volunteer_quota ? Math.min(100, Math.round((activity.volunteer_count / activity.volunteer_quota) * 100)) : 0}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">slot relawan terisi</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {(["pending", "approved", "attended", "rejected"] as const).map(s => (
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
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                disabled={isQuotaFull || updatingId === v.id}
                                onClick={() => handleStatusUpdate(v.id, "approved")}>
                                {updatingId === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                <span className="ml-1">Terima</span>
                              </Button>
                            </>
                          )}
                          {v.status === "approved" && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
                              disabled={updatingId === v.id}
                              onClick={() => openAttendanceModal(v.id, v.full_name)}>
                              {updatingId === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                              <span className="ml-1">Tandai Hadir</span>
                            </Button>
                          )}
                          {v.status === "attended" && (
                            v.attendance_proof_url ? (
                              <a href={v.attendance_proof_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors">
                                <ImageIcon className="h-3.5 w-3.5" /> Lihat Bukti Hadir
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground self-center">—</span>
                            )
                          )}
                          {v.status === "rejected" && (
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

      {/* Modal Konfirmasi Kehadiran */}
      <Dialog open={attendanceModal.open} onOpenChange={(open) => { if (!open) closeAttendanceModal() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" /> Konfirmasi Kehadiran
            </DialogTitle>
            <DialogDescription>
              Tandai <span className="font-semibold text-foreground">{attendanceModal.name}</span> sebagai hadir. Unggah bukti foto/gambar kehadiran relawan untuk melanjutkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Bukti Foto/Gambar Kehadiran *</Label>
            {attendanceProofPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={attendanceProofPreview} alt="Pratinjau bukti kehadiran" className="w-full max-h-64 object-cover" />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-8 cursor-pointer text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Camera className="h-7 w-7" />
                <span className="text-sm font-medium">Klik untuk unggah foto/gambar</span>
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
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleConfirmAttendance} disabled={submittingAttendance || !attendanceProof}>
              {submittingAttendance ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <UserCheck className="h-4 w-4 mr-1.5" />}
              Konfirmasi Hadir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
