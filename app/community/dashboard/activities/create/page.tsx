"use client"

import { useState, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, Calendar, MapPin, Users, Banknote, Image as ImageIcon, Package, X, Plus, Trash2, Receipt } from "lucide-react"
import Link from "next/link"
import { ACTIVITY_CATEGORIES } from "@/lib/constants"
import { toast } from "sonner"

// Import MapPicker dynamically to avoid SSR issues
const MapPicker = dynamic(() => import("@/components/map/map-picker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-secondary animate-pulse rounded-xl flex items-center justify-center text-muted-foreground">Memuat peta...</div>
})

interface NeededItem {
  item_name: string
  target: number
  unit_price: number
  donated: number
}

export default function CreateActivityPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // --- Cover Image ---
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // --- Nota / Receipt images ---
  const notaInputRef = useRef<HTMLInputElement>(null)
  const [notaFiles, setNotaFiles] = useState<File[]>([])
  const [notaPreviews, setNotaPreviews] = useState<string[]>([])
  const [isDraggingNota, setIsDraggingNota] = useState(false)

  // --- Needed items ---
  const [neededItems, setNeededItems] = useState<NeededItem[]>([
    { item_name: "", target: 1, unit_price: 0, donated: 0 },
  ])

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "cleanup",
    startDate: "",
    endDate: "",
    executionDate: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    volunteerQuota: "",
    fundingGoal: "",
    allowItemDonation: false,
  })

  // ── Validasi Min Date ─────────────────────────────────────
  const [minStartDateTime, setMinStartDateTime] = useState("")

  useEffect(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 6)
    const offset = d.getTimezoneOffset() * 60000
    setMinStartDateTime((new Date(d.getTime() - offset)).toISOString().slice(0, 16))
  }, [])

  // ── Cover Image Handlers ──────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCoverFileSelected(e.dataTransfer.files[0])
    }
  }
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleCoverFileSelected(e.target.files[0])
  }
  const handleCoverFileSelected = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran file maksimal 5MB"); return }
    setCoverImage(file)
    setImagePreview(URL.createObjectURL(file))
  }
  const clearCoverImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCoverImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ── Nota / Receipt Handlers ───────────────────────────────
  const handleNotaDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingNota(true) }
  const handleNotaDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingNota(false) }
  const handleNotaDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingNota(false)
    const files = Array.from(e.dataTransfer.files)
    handleNotaFilesSelected(files)
  }
  const handleNotaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleNotaFilesSelected(Array.from(e.target.files))
  }
  const handleNotaFilesSelected = (files: File[]) => {
    const valid = files.filter(f => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`File "${f.name}" melebihi batas 5MB`); return false }
      return true
    })
    if (notaFiles.length + valid.length > 5) {
      toast.error("Maksimal 5 foto nota")
      return
    }
    setNotaFiles(prev => [...prev, ...valid])
    setNotaPreviews(prev => [...prev, ...valid.map(f => URL.createObjectURL(f))])
  }
  const removeNota = (idx: number) => {
    setNotaFiles(prev => prev.filter((_, i) => i !== idx))
    setNotaPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Needed Items Handlers ────────────────────────────────
  const addItem = () => {
    setNeededItems(prev => [...prev, { item_name: "", target: 1, unit_price: 0, donated: 0 }])
  }
  const removeItem = (idx: number) => {
    setNeededItems(prev => prev.filter((_, i) => i !== idx))
  }
  const updateItem = (idx: number, field: keyof NeededItem, value: string | number) => {
    setNeededItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  // ── Form Change ───────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm({ ...form, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value })
  }

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // ── Validasi Waktu Kegiatan ────────────────────────────────
      const minExecution = new Date()
      minExecution.setMonth(minExecution.getMonth() + 6)
      minExecution.setSeconds(0, 0) // clear sec/mins for accurate comparison

      const startD = new Date(form.startDate)
      
      if (form.endDate) {
        const endD = new Date(form.endDate)
        if (endD < startD) {
          throw new Error("Waktu selesai pengumpulan dana tidak boleh sebelum waktu mulai.")
        }
      }

      if (!form.executionDate) {
        throw new Error("Tanggal Pelaksanaan Kegiatan harus diisi.")
      }

      const execD = new Date(form.executionDate)
      if (execD < minExecution) {
        throw new Error("Tanggal Pelaksanaan Kegiatan harus minimal 6 bulan dari sekarang.")
      }
      if (form.endDate && execD < new Date(form.endDate)) {
        throw new Error("Tanggal Pelaksanaan tidak boleh sebelum masa pengumpulan dana berakhir.")
      } else if (execD < startD) {
        throw new Error("Tanggal Pelaksanaan tidak boleh sebelum masa pengumpulan dana dimulai.")
      }

      const supabase = createClient()
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError || !userData.user) throw new Error("Gagal mengambil sesi pengguna. Pastikan Anda sudah login.")

      const user = userData.user

      // Check community
      const { data: community, error: commError } = await supabase
        .from("communities")
        .select("id")
        .eq("owner_id", user.id)
        .single()

      if (commError || !community) {
        throw new Error("Akun ini tidak memiliki profil komunitas. Pastikan Anda login dengan akun komunitas yang valid.")
      }

      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.replace(" ", "") || "sinergilaut-assets"

      // Upload cover image
      let cover_image_url = null
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop()
        const fileName = `activity_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(`activities/${fileName}`, coverImage)
        if (uploadError) throw new Error("Gagal mengupload gambar sampul. (Pastikan bucket storage tersedia)")
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(`activities/${fileName}`)
        cover_image_url = publicUrlData.publicUrl
      }

      // Upload nota images
      const nota_urls: string[] = []
      if (form.allowItemDonation && notaFiles.length > 0) {
        for (const nota of notaFiles) {
          const ext = nota.name.split('.').pop()
          const notaName = `nota_${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`
          const { error: notaUploadErr } = await supabase.storage
            .from(bucketName)
            .upload(`activity-receipts/${notaName}`, nota)
          if (notaUploadErr) {
            console.error("Nota upload error:", notaUploadErr)
            toast.warning(`Gagal mengupload nota "${nota.name}", dilewati.`)
            continue
          }
          const { data: notaUrlData } = supabase.storage.from(bucketName).getPublicUrl(`activity-receipts/${notaName}`)
          nota_urls.push(notaUrlData.publicUrl)
        }
      }

      // Build items_needed JSON
      const items_needed = form.allowItemDonation
        ? neededItems
            .filter(item => item.item_name.trim() !== "")
            .map(item => ({
              item_name: item.item_name.trim(),
              target: Math.max(1, Number(item.target)),
              unit_price: Math.max(0, Number(item.unit_price)),
              donated: 0,
            }))
        : []

      const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()

      const { error: insertError } = await supabase
        .from("activities")
        .insert({
          community_id: community.id,
          title: form.title,
          slug,
          description: form.description,
          category: form.category,
          status: isDraft ? 'draft' : 'pending_review',
          start_date: new Date(form.startDate).toISOString(),
          end_date: form.endDate ? new Date(form.endDate).toISOString() : null,
          execution_date: new Date(form.executionDate).toISOString(),
          location: form.location,
          latitude: form.latitude,
          longitude: form.longitude,
          volunteer_quota: parseInt(form.volunteerQuota) || 0,
          funding_goal: parseInt(form.fundingGoal) || 0,
          allow_item_donation: form.allowItemDonation,
          items_needed: items_needed.length > 0 ? items_needed : null,
          receipt_urls: nota_urls.length > 0 ? nota_urls : null,
          cover_image_url,
        })

      if (insertError) throw insertError

      if (isDraft) {
        toast.success("Kegiatan disimpan sebagai draft.")
      } else {
        toast.success("Kegiatan diajukan untuk review admin. Tunggu persetujuan dalam 1-2 hari kerja.")
      }
      router.push("/community/dashboard")
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menyimpan kegiatan.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <Link href="/community/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Buat Kegiatan Baru</h1>
            <p className="text-muted-foreground mt-1">Kegiatan akan direview admin sebelum dipublikasikan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Informasi Dasar</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Kegiatan *</Label>
                  <Input id="title" name="title" value={form.title} onChange={handleChange} required placeholder="Contoh: Bersih-bersih Pantai Ancol" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <select id="category" name="category" value={form.category} onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm">
                    {ACTIVITY_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Kegiatan *</Label>
                  <Textarea id="description" name="description" value={form.description} onChange={handleChange} required
                    placeholder="Jelaskan tujuan, rencana kegiatan, dan apa yang akan dilakukan..." rows={6} />
                </div>
              </CardContent>
            </Card>

            {/* Schedule & Location */}
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-5 w-5" /> Waktu & Lokasi</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Mulai Pengumpulan Dana *</Label>
                    <Input id="startDate" name="startDate" type="datetime-local" value={form.startDate} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Tutup Pengumpulan Dana</Label>
                    <Input id="endDate" name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} min={form.startDate} />
                  </div>
                </div>
                <div className="space-y-2">
                   <Label htmlFor="executionDate">Tanggal Pelaksanaan Kegiatan *</Label>
                   <Input id="executionDate" name="executionDate" type="datetime-local" value={form.executionDate} onChange={handleChange} min={minStartDateTime} required />
                   <p className="text-xs text-muted-foreground mt-1">Kegiatan fisik harus direncanakan minimal 6 bulan dari sekarang.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lokasi Kegiatan *</Label>
                  <div className="relative mb-3">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="location" name="location" value={form.location} onChange={handleChange} required
                      placeholder="Nama tempat, Kota" className="pl-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Pin lokasi di peta (opsional namun disarankan)
                    </Label>
                    <MapPicker 
                      lat={form.latitude} 
                      lng={form.longitude} 
                      onChange={(lat, lng) => setForm(prev => ({ ...prev, latitude: lat, longitude: lng }))} 
                    />
                    {form.latitude && form.longitude && (
                      <p className="text-[10px] text-muted-foreground">
                        Koordinat terpilih: {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Volunteer & Funding */}
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> Relawan & Dana</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="volunteerQuota">Kuota Relawan</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="volunteerQuota" name="volunteerQuota" type="number" min="0" value={form.volunteerQuota}
                        onChange={handleChange} placeholder="0 = tidak terbatas" className="pl-10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fundingGoal">Target Dana (IDR)</Label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="fundingGoal" name="fundingGoal" type="number" min="0" value={form.fundingGoal}
                        onChange={handleChange} placeholder="0 = tidak ada target" className="pl-10" />
                    </div>
                  </div>
                </div>

                {/* Checkbox: Terima Donasi Barang */}
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                  <input type="checkbox" id="allowItemDonation" name="allowItemDonation"
                    checked={form.allowItemDonation} onChange={handleChange} />
                  <div>
                    <Label htmlFor="allowItemDonation" className="flex items-center gap-2 cursor-pointer">
                      <Package className="h-4 w-4" /> Terima Donasi Barang
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Izinkan donatur menyumbangkan barang fisik untuk kegiatan ini</p>
                  </div>
                </div>

                {/* ── Expanded Section: Item Donation ── */}
                {form.allowItemDonation && (
                  <div className="space-y-5 pt-2 border-t border-border">

                    {/* Daftar Barang yang Diperlukan */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-sm text-foreground">Daftar Barang yang Diperlukan</p>
                          <p className="text-xs text-muted-foreground">Tambahkan barang beserta jumlah dan harga satuan asli</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
                          <Plus className="h-3.5 w-3.5" /> Tambah Barang
                        </Button>
                      </div>

                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          <strong>💡 Info Tambahan:</strong> Masukkan harga barang sesuai aslinya. Sistem akan otomatis memberikan <strong>markup penambahan harga sebesar 10%</strong> dari harga yang dimasukkan, setelah kegiatan disetujui. Markup ini untuk penyesuaian biaya operasional SinergiLaut.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {neededItems.map((item, idx) => (
                          <div key={idx} className="p-4 border border-border rounded-xl bg-background/50 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Barang #{idx + 1}</p>
                              {neededItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItem(idx)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                  aria-label="Hapus barang"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-1 space-y-1.5">
                                <Label className="text-xs">Nama Barang *</Label>
                                <Input
                                  value={item.item_name}
                                  onChange={e => updateItem(idx, "item_name", e.target.value)}
                                  placeholder="Contoh: Kantong Sampah"
                                  className="text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs">Jumlah (unit) *</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={item.target || ""}
                                  onChange={e => updateItem(idx, "target", e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                                  placeholder="0"
                                  className="text-sm"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs">Harga per Unit (IDR) *</Label>
                                <div className="relative">
                                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    min={0}
                                    value={item.unit_price === 0 ? "" : item.unit_price}
                                    onChange={e => updateItem(idx, "unit_price", e.target.value === "" ? 0 : parseInt(e.target.value, 10))}
                                    placeholder="0"
                                    className="text-sm pl-9"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Subtotal hint */}
                            {item.item_name && item.unit_price > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Estimasi nilai: <span className="font-medium text-foreground">
                                  Rp {(item.unit_price * item.target).toLocaleString("id-ID")}
                                </span> ({item.target} unit × Rp {Number(item.unit_price).toLocaleString("id-ID")})
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upload Foto Nota */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium text-sm text-foreground">Foto Nota / Kwitansi</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Upload bukti nota pembelian atau survey harga untuk verifikasi oleh tim admin. Maks. 5 foto.
                      </p>

                      {/* Preview uploaded notas */}
                      {notaPreviews.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {notaPreviews.map((preview, idx) => (
                            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                              <img src={preview} alt={`Nota ${idx + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeNota(idx)}
                                  className="text-white"
                                  aria-label="Hapus nota"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                                Nota {idx + 1}
                              </div>
                            </div>
                          ))}
                          {notaFiles.length < 5 && (
                            <button
                              type="button"
                              onClick={() => notaInputRef.current?.click()}
                              className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Plus className="h-5 w-5" />
                              <span className="text-[10px] mt-1">Tambah</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Drop zone (only shown when no nota yet) */}
                      {notaPreviews.length === 0 && (
                        <div
                          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                            isDraggingNota ? "border-primary bg-primary/5" : "border-border hover:border-primary"
                          }`}
                          onDragOver={handleNotaDragOver}
                          onDragLeave={handleNotaDragLeave}
                          onDrop={handleNotaDrop}
                          onClick={() => notaInputRef.current?.click()}
                        >
                          <Receipt className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Klik atau drag & drop foto nota di sini</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP • Maks. 5MB per file • Maks. 5 foto</p>
                          <Button type="button" variant="outline" size="sm" className="mt-3">Pilih File</Button>
                        </div>
                      )}

                      <input
                        type="file"
                        ref={notaInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        multiple
                        onChange={handleNotaFileChange}
                      />

                      <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <Receipt className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          <strong>Catatan untuk Admin:</strong> Foto nota diperlukan sebagai bukti verifikasi harga barang sebelum kegiatan dipublikasikan.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Foto Kegiatan</CardTitle></CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer relative overflow-hidden ${
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleCoverFileChange}
                  />

                  {imagePreview ? (
                    <div className="absolute inset-0 w-full h-full">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button type="button" variant="destructive" size="sm" onClick={clearCoverImage}>
                          <X className="h-4 w-4 mr-2" /> Ganti Foto
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Klik atau drag & drop untuk upload foto utama</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP • Maks. 5MB</p>
                      <Button type="button" variant="outline" size="sm" className="mt-3">Pilih File</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={(e) => handleSubmit(e, true)} disabled={isLoading}>
                Simpan sebagai Draft
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : "Ajukan untuk Review"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
