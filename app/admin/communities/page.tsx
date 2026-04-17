"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Building2, CheckCircle2, X, AlertTriangle, Search,
  Eye, MoreHorizontal, AlertCircle, Clock, Loader2
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils/helpers"
import { toast } from "sonner"
import {
  getPendingCommunities, getAllCommunities,
  approveCommunityAction, rejectCommunityAction
} from "@/lib/actions/dashboard.actions"

interface SanctionModal { open: boolean; communityId: string | null; communityName: string }

export default function AdminCommunitiesPage() {
  const [search, setSearch] = useState("")
  const [pendingCommunities, setPendingCommunities] = useState<any[]>([])
  const [allCommunities, setAllCommunities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sanctionModal, setSanctionModal] = useState<SanctionModal>({ open: false, communityId: null, communityName: "" })
  const [sanctionForm, setSanctionForm] = useState({ type: "warning", reason: "" })

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const [pc, ac] = await Promise.all([getPendingCommunities(), getAllCommunities()])
      setPendingCommunities(pc)
      setAllCommunities(ac)
      setIsLoading(false)
    }
    load()
  }, [])

  const handleApprove = async (id: string) => {
    const result = await approveCommunityAction(id)
    if (result.success) {
      toast.success("Komunitas berhasil diverifikasi ✅")
      setPendingCommunities(p => p.filter(c => c.id !== id))
      setAllCommunities(prev => prev.map(c => c.id === id ? { ...c, verification_status: "approved", is_verified: true } : c))
    } else toast.error(result.error ?? "Gagal menyetujui.")
  }

  const handleReject = async (id: string) => {
    const result = await rejectCommunityAction(id)
    if (result.success) {
      toast.info("Komunitas ditolak.")
      setPendingCommunities(p => p.filter(c => c.id !== id))
    } else toast.error(result.error ?? "Gagal menolak.")
  }

  const filteredAll = allCommunities.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kelola Komunitas</h1>
              <p className="text-muted-foreground text-sm">Verifikasi dan kelola semua komunitas terdaftar</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Pending Verifikasi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Menunggu Verifikasi
                  {pendingCommunities.length > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-700 ml-1">{pendingCommunities.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>Komunitas yang mengajukan pendaftaran dan perlu diverifikasi</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                ) : pendingCommunities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Tidak ada komunitas yang menunggu verifikasi.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingCommunities.map(c => (
                      <div key={c.id} className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/10 rounded-xl">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground">{c.name}</p>
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs">Pending</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{c.location || "Tanpa Lokasi"} • {c.owner?.email || "—"}</p>
                            {c.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>}
                            <p className="text-xs text-muted-foreground mt-1">Daftar: {formatDate(c.created_at)}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(c.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Verifikasi
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(c.id)}>
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

            {/* Semua Komunitas */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle>Semua Komunitas</CardTitle>
                    <CardDescription>Daftar lengkap komunitas terdaftar di platform</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari komunitas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {["Komunitas", "Lokasi", "Anggota", "Status", "Aksi"].map(h => (
                            <th key={h} className="text-left py-3 px-3 text-sm font-medium text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAll.length === 0 ? (
                          <tr><td colSpan={5} className="py-10 text-center text-muted-foreground text-sm">Tidak ada komunitas ditemukan.</td></tr>
                        ) : filteredAll.map(c => (
                          <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                            <td className="py-3 px-3">
                              <p className="font-medium text-sm text-foreground">{c.name}</p>
                              <p className="text-xs text-muted-foreground">{c.owner?.email || "—"}</p>
                            </td>
                            <td className="py-3 px-3 text-sm text-muted-foreground">{c.location || "—"}</td>
                            <td className="py-3 px-3 text-sm text-muted-foreground">{c.member_count || 0}</td>
                            <td className="py-3 px-3">
                              {c.is_suspended
                                ? <Badge className="bg-red-100 text-red-700">Disuspend</Badge>
                                : c.is_verified
                                ? <Badge className="bg-green-100 text-green-700">Terverifikasi</Badge>
                                : <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>}
                            </td>
                            <td className="py-3 px-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/community/${c.id}`} className="cursor-pointer">
                                      <Eye className="h-4 w-4 mr-2" /> Lihat Profil
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setSanctionModal({ open: true, communityId: c.id, communityName: c.name })}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-2" /> Beri Sanksi
                                  </DropdownMenuItem>
                                  {c.is_suspended
                                    ? <DropdownMenuItem><CheckCircle2 className="h-4 w-4 mr-2" /> Cabut Suspend</DropdownMenuItem>
                                    : <DropdownMenuItem className="text-destructive"><AlertCircle className="h-4 w-4 mr-2" /> Suspend</DropdownMenuItem>
                                  }
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Sanction Modal */}
      <Dialog open={sanctionModal.open} onOpenChange={open => setSanctionModal({ ...sanctionModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beri Sanksi — {sanctionModal.communityName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Jenis Sanksi</Label>
              <div className="flex gap-2">
                {[{ v: "warning", l: "Peringatan" }, { v: "suspend", l: "Suspend" }, { v: "ban", l: "Ban Permanen" }].map(s => (
                  <button key={s.v} type="button"
                    onClick={() => setSanctionForm({ ...sanctionForm, type: s.v })}
                    className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${sanctionForm.type === s.v ? "border-destructive bg-destructive/5 text-destructive" : "border-border"}`}>
                    {s.l}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Alasan Sanksi</Label>
              <Textarea value={sanctionForm.reason}
                onChange={e => setSanctionForm({ ...sanctionForm, reason: e.target.value })}
                placeholder="Jelaskan alasan pemberian sanksi..." rows={4} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setSanctionModal({ open: false, communityId: null, communityName: "" })}>Batal</Button>
            <Button variant="destructive" className="flex-1" disabled={!sanctionForm.reason}
              onClick={() => { toast.warning(`Sanksi diberikan pada ${sanctionModal.communityName}`); setSanctionModal({ open: false, communityId: null, communityName: "" }) }}>
              <AlertTriangle className="h-4 w-4 mr-2" /> Berikan Sanksi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
