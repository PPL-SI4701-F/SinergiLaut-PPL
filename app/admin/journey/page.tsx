"use client"

/**
 * Admin — Kelola "Perjalanan Kami" (Journey Milestones)
 * Route: /admin/journey
 * CRUD untuk tabel journey_milestones di Supabase.
 * Hanya bisa diakses oleh admin.
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import {
  Plus, Edit, Trash2, Loader2, ArrowLeft, Eye, EyeOff,
  GripVertical, Save, X, Award
} from "lucide-react"
import {
  getAllMilestones, createMilestone, updateMilestone, deleteMilestone,
  type JourneyMilestone, type UpsertMilestonePayload
} from "@/lib/actions/journey.actions"
import { toast } from "sonner"

const LUCIDE_ICONS = [
  "Waves", "Users", "Award", "Leaf", "Globe", "Zap", "Banknote",
  "CheckCircle", "Star", "Target", "Heart", "TrendingUp", "BookOpen",
]

const emptyForm: UpsertMilestonePayload = {
  year: new Date().getFullYear(),
  title: "",
  description: "",
  impact_stat: "",
  icon: "Award",
  order_index: 99,
  is_published: true,
}

export default function AdminJourneyPage() {
  const router = useRouter()
  const { isAdmin, isLoading: authLoading } = useAuth()

  const [milestones, setMilestones] = useState<JourneyMilestone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<UpsertMilestonePayload>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push("/login")
  }, [authLoading, isAdmin, router])

  useEffect(() => {
    loadMilestones()
  }, [])

  async function loadMilestones() {
    setIsLoading(true)
    const result = await getAllMilestones()
    if (result.success) setMilestones(result.data)
    else toast.error(result.error ?? "Gagal memuat data.")
    setIsLoading(false)
  }

  function openCreate() {
    setForm({ ...emptyForm, order_index: milestones.length + 1 })
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(m: JourneyMilestone) {
    setForm({
      year: m.year,
      title: m.title,
      description: m.description,
      impact_stat: m.impact_stat ?? "",
      icon: m.icon,
      order_index: m.order_index,
      is_published: m.is_published,
    })
    setEditingId(m.id)
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Judul dan deskripsi harus diisi.")
      return
    }

    setIsSaving(true)
    let result

    if (editingId) {
      result = await updateMilestone(editingId, form)
    } else {
      result = await createMilestone(form)
    }

    if (result.success) {
      toast.success(editingId ? "Milestone berhasil diupdate." : "Milestone baru berhasil dibuat.")
      cancelForm()
      await loadMilestones()
    } else {
      toast.error(result.error ?? "Gagal menyimpan.")
    }

    setIsSaving(false)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Hapus milestone "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return

    setDeletingId(id)
    const result = await deleteMilestone(id)
    if (result.success) {
      toast.success("Milestone berhasil dihapus.")
      setMilestones(prev => prev.filter(m => m.id !== id))
    } else {
      toast.error(result.error ?? "Gagal menghapus.")
    }
    setDeletingId(null)
  }

  async function togglePublish(m: JourneyMilestone) {
    const result = await updateMilestone(m.id, { is_published: !m.is_published })
    if (result.success) {
      setMilestones(prev => prev.map(item => item.id === m.id ? { ...item, is_published: !m.is_published } : item))
      toast.success(`Milestone "${m.title}" ${!m.is_published ? "dipublish" : "disembunyikan"}.`)
    } else {
      toast.error(result.error ?? "Gagal mengupdate status.")
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
                <ArrowLeft className="h-4 w-4" /> Kembali ke Admin Panel
              </Link>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" /> Kelola Perjalanan Kami
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Tambah, edit, dan atur urutan milestone yang tampil di halaman About.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/about#perjalanan-kami" target="_blank">Lihat di Website</Link>
              </Button>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" /> Tambah Milestone
              </Button>
            </div>
          </div>

          {/* Form Tambah/Edit */}
          {showForm && (
            <Card className="mb-6 border-primary/30">
              <CardHeader>
                <CardTitle className="text-base">
                  {editingId ? "Edit Milestone" : "Tambah Milestone Baru"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tahun *</Label>
                    <Input type="number" value={form.year} min={2000} max={2100}
                      onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label>Judul Milestone *</Label>
                    <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="Contoh: Platform Diluncurkan" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Deskripsi *</Label>
                  <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3} placeholder="Ceritakan apa yang terjadi di tahun ini..." />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Statistik Dampak</Label>
                    <Input value={form.impact_stat} onChange={e => setForm({ ...form, impact_stat: e.target.value })}
                      placeholder="Contoh: 500+ relawan bergabung" />
                  </div>
                  <div className="space-y-2">
                    <Label>Urutan Tampil</Label>
                    <Input type="number" min={1} value={form.order_index}
                      onChange={e => setForm({ ...form, order_index: parseInt(e.target.value) })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ikon (Lucide React)</Label>
                  <div className="flex flex-wrap gap-2">
                    {LUCIDE_ICONS.map(icon => (
                      <button key={icon} type="button" onClick={() => setForm({ ...form, icon })}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${form.icon === icon ? "border-primary bg-primary/5 font-semibold text-primary" : "border-border hover:border-primary/40"}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Dipilih: <strong>{form.icon}</strong></p>
                </div>

                <div className="flex items-center gap-2">
                  <input id="is_published" type="checkbox" checked={form.is_published}
                    onChange={e => setForm({ ...form, is_published: e.target.checked })}
                    className="w-4 h-4 accent-primary" />
                  <Label htmlFor="is_published" className="cursor-pointer">Publish (tampilkan di website)</Label>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyimpan...</> : <><Save className="h-4 w-4 mr-2" />Simpan</>}
                  </Button>
                  <Button variant="outline" onClick={cancelForm}>
                    <X className="h-4 w-4 mr-2" /> Batal
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daftar Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Milestone</CardTitle>
              <CardDescription>{milestones.length} milestone terdaftar · {milestones.filter(m => m.is_published).length} dipublish</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : milestones.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Award className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Belum ada milestone. Klik "Tambah Milestone" untuk memulai.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.map((m) => (
                    <div key={m.id} className={`border rounded-xl p-4 transition-colors ${m.is_published ? "border-border" : "border-border/50 opacity-60"}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 cursor-grab" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Badge className="bg-primary/10 text-primary text-xs">{m.year}</Badge>
                              <span className="font-medium text-foreground">{m.title}</span>
                              {!m.is_published && (
                                <Badge variant="outline" className="text-xs">Tersembunyi</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>
                            {m.impact_stat && (
                              <p className="text-xs text-primary mt-1 font-medium">📊 {m.impact_stat}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Ikon: {m.icon} · Urutan: #{m.order_index}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => togglePublish(m)}
                            title={m.is_published ? "Sembunyikan" : "Publish"}>
                            {m.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(m)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(m.id, m.title)} disabled={deletingId === m.id}>
                            {deletingId === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
      </main>
    </div>
  )
}
