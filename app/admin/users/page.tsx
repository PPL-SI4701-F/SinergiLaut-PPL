"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Users, UserCheck, ShieldCheck, ShieldX, CheckCircle2, X,
  ChevronDown, Calendar, CreditCard, MapPin, Phone, Mail,
  ImageIcon, Loader2, Search
} from "lucide-react"
import { User as UserIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import {
  getVolunteersPendingVerification,
  approveVolunteerVerification,
  rejectVolunteerVerification,
} from "@/lib/actions/volunteer-verification.actions"
import type { Profile } from "@/lib/types"

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [volunteers, setVolunteers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; userId: string; userName: string }>({ open: false, userId: "", userName: "" })
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => { loadVolunteers() }, [filter])

  async function loadVolunteers() {
    setIsLoading(true)
    const statusArg = filter === "all" ? undefined : filter
    const result = await getVolunteersPendingVerification(statusArg as any)
    if (result.success) setVolunteers(result.data as Profile[])
    setIsLoading(false)
  }

  async function handleApprove(userId: string) {
    if (!user) return
    setUpdatingId(userId)
    const result = await approveVolunteerVerification(userId)
    if (result.success) {
      toast.success("Volunteer berhasil diverifikasi ✅")
      setVolunteers(prev => prev.map(v => v.id === userId ? { ...v, volunteer_status: "approved" as const } : v))
    } else toast.error(result.error ?? "Gagal memverifikasi.")
    setUpdatingId(null)
  }

  async function handleReject() {
    if (!user || !rejectDialog.userId) return
    if (!rejectReason.trim()) { toast.error("Harap isi alasan penolakan."); return }
    setUpdatingId(rejectDialog.userId)
    const result = await rejectVolunteerVerification(rejectDialog.userId, rejectReason)
    if (result.success) {
      toast.info("Verifikasi volunteer ditolak.")
      setVolunteers(prev => prev.map(v => v.id === rejectDialog.userId ? {
        ...v, volunteer_status: "rejected" as const, volunteer_reject_note: rejectReason
      } : v))
      setRejectDialog({ open: false, userId: "", userName: "" })
      setRejectReason("")
    } else toast.error(result.error ?? "Gagal menolak.")
    setUpdatingId(null)
  }

  const filtered = volunteers.filter(v => {
    return !search ||
      v.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.nik?.includes(search)
  })

  const counts = {
    all: volunteers.length,
    pending: volunteers.filter(v => v.volunteer_status === "pending").length,
    approved: volunteers.filter(v => v.volunteer_status === "approved").length,
    rejected: volunteers.filter(v => v.volunteer_status === "rejected").length,
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kelola Pengguna</h1>
              <p className="text-muted-foreground text-sm">Verifikasi data diri volunteer dan kelola pengguna platform</p>
            </div>
          </div>

          {/* Verifikasi Volunteer */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-purple-500" />
                    Verifikasi Data Diri Volunteer
                    {counts.pending > 0 && <Badge className="bg-purple-100 text-purple-700">{counts.pending} pending</Badge>}
                  </CardTitle>
                  <CardDescription>Review KTP, NIK, dan data diri volunteer sebelum mereka bisa mendaftar kegiatan</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Cari nama / email / NIK..." value={search}
                    onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filter chips */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {([
                  { key: "all", label: "Semua" },
                  { key: "pending", label: "Menunggu" },
                  { key: "approved", label: "Disetujui" },
                  { key: "rejected", label: "Ditolak" },
                ] as const).map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      filter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}>
                    {f.label} ({counts[f.key]})
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <UserCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Tidak ada volunteer yang ditemukan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map(v => (
                    <div key={v.id} className={`border rounded-xl overflow-hidden transition-all ${
                      v.volunteer_status === "pending" ? "border-yellow-300 bg-yellow-50/30 dark:bg-yellow-950/10" :
                      v.volunteer_status === "rejected" ? "border-red-200 bg-red-50/20 dark:bg-red-950/10" : "border-border"
                    }`}>
                      <button type="button"
                        onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                            {(v.full_name ?? "?")[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground text-sm">{v.full_name ?? "—"}</p>
                              <Badge className={
                                v.volunteer_status === "approved" ? "bg-green-100 text-green-700" :
                                v.volunteer_status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                              }>
                                {v.volunteer_status === "approved" ? "Disetujui" :
                                 v.volunteer_status === "rejected" ? "Ditolak" : "Menunggu"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{v.email} • NIK: {v.nik ?? "—"}</p>
                          </div>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === v.id ? "rotate-180" : ""}`} />
                      </button>

                      {expandedId === v.id && (
                        <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            {[
                              { icon: UserIcon, label: "Nama Lengkap", value: v.full_name ?? "—" },
                              { icon: Mail, label: "Email", value: v.email },
                              { icon: Phone, label: "Telepon", value: v.phone ?? "—" },
                              { icon: CreditCard, label: "NIK", value: v.nik ?? "—" },
                              { icon: Calendar, label: "Tanggal Lahir", value: v.date_of_birth ?? "—" },
                              { icon: Users, label: "Jenis Kelamin", value: v.gender === "male" ? "Laki-laki" : v.gender === "female" ? "Perempuan" : "—" },
                            ].map(({ icon: Icon, label, value }) => (
                              <div key={label} className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground">{label}</p>
                                  <p className="font-medium">{value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Alamat</p>
                              <p className="font-medium">{v.address ?? "—"}</p>
                            </div>
                          </div>

                          {v.ktp_url && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                <ImageIcon className="h-3.5 w-3.5" /> Foto KTP
                              </p>
                              <a href={v.ktp_url} target="_blank" rel="noopener noreferrer"
                                className="inline-block border border-border rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                                <img src={v.ktp_url} alt="Foto KTP" className="max-w-xs max-h-48 object-contain" />
                              </a>
                            </div>
                          )}

                          {v.volunteer_status === "rejected" && v.volunteer_reject_note && (
                            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm">
                              <p className="text-xs text-red-600 font-medium mb-1">Alasan Penolakan:</p>
                              <p className="text-red-700 dark:text-red-300">{v.volunteer_reject_note}</p>
                            </div>
                          )}

                          {v.volunteer_status === "pending" && (
                            <div className="flex gap-2 pt-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1"
                                disabled={updatingId === v.id} onClick={() => handleApprove(v.id)}>
                                {updatingId === v.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <ShieldCheck className="h-3.5 w-3.5 mr-1" />}
                                Setujui Verifikasi
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                                onClick={() => setRejectDialog({ open: true, userId: v.id, userName: v.full_name ?? "Volunteer" })}>
                                <ShieldX className="h-3.5 w-3.5 mr-1" /> Tolak
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={open => { if (!open) { setRejectDialog({ open: false, userId: "", userName: "" }); setRejectReason("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Verifikasi — {rejectDialog.userName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Alasan Penolakan *</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Jelaskan alasan penolakan kepada volunteer..." rows={4} />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setRejectDialog({ open: false, userId: "", userName: "" })}>Batal</Button>
            <Button variant="destructive" className="flex-1" onClick={handleReject}
              disabled={!rejectReason.trim() || !!updatingId}>
              {updatingId ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <X className="h-4 w-4 mr-1" />}
              Konfirmasi Tolak
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
