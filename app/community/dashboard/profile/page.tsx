"use client"

/**
 * Halaman Edit Profil Komunitas
 * Route: /community/dashboard/profile
 * Hanya bisa diakses oleh pengelola komunitas yang sudah login.
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft, Building2, Globe, MapPin, Phone, Mail,
  Instagram, Facebook, Twitter, Save, Loader2, Camera,
  CheckCircle2, Upload
} from "lucide-react"
import { getInitials } from "@/lib/utils/helpers"
import { toast } from "sonner"
import {
  getCommunityProfile,
  updateCommunityProfile,
  uploadCommunityImage,
} from "@/lib/actions/dashboard.actions"

const FOCUS_AREA_OPTIONS = [
  { value: "cleanup", label: "Pembersihan Pantai" },
  { value: "education", label: "Edukasi Masyarakat" },
  { value: "restoration", label: "Restorasi Ekosistem" },
  { value: "research", label: "Riset & Survei" },
  { value: "policy", label: "Advokasi & Kebijakan" },
  { value: "fundraising", label: "Penggalangan Dana" },
]

export default function CommunityProfilePage() {
  const [community, setCommunity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    website: "",
    phone: "",
    email: "",
    instagram: "",
    facebook: "",
    twitter: "",
    focus_areas: [] as string[],
  })

  // Fetch via Server Action — bypass RLS
  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const result = await getCommunityProfile()
      if (!result.success || !result.data) {
        toast.error(result.error ?? "Gagal memuat data komunitas.")
      } else {
        const d = result.data
        setCommunity(d)
        setForm({
          name: d.name ?? "",
          description: d.description ?? "",
          location: d.location ?? "",
          website: d.website ?? "",
          phone: d.phone ?? "",
          email: d.email ?? "",
          instagram: d.instagram ?? "",
          facebook: d.facebook ?? "",
          twitter: d.twitter ?? "",
          focus_areas: d.focus_areas ?? [],
        })
      }
      setIsLoading(false)
    }
    load()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const toggleFocusArea = (value: string) => {
    setForm(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(value)
        ? prev.focus_areas.filter(f => f !== value)
        : [...prev.focus_areas, value],
    }))
  }

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !community) return
    if (file.size > 2 * 1024 * 1024) { toast.error("Ukuran logo maksimal 2MB."); return }

    setIsUploadingLogo(true)
    const result = await uploadCommunityImage(community.id, file, "logo")
    if (!result.success) {
      toast.error("Gagal upload logo: " + result.error)
    } else {
      setCommunity((prev: any) => ({ ...prev, logo_url: result.url }))
      toast.success("Logo berhasil diperbarui!")
    }
    setIsUploadingLogo(false)
  }

  // Handle cover upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !community) return
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran cover maksimal 5MB."); return }

    setIsUploadingCover(true)
    const result = await uploadCommunityImage(community.id, file, "cover")
    if (!result.success) {
      toast.error("Gagal upload cover: " + result.error)
    } else {
      setCommunity((prev: any) => ({ ...prev, cover_url: result.url }))
      toast.success("Gambar cover berhasil diperbarui!")
    }
    setIsUploadingCover(false)
  }

  // Handle save profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!community) return
    if (!form.name.trim()) { toast.error("Nama komunitas tidak boleh kosong."); return }

    setIsSaving(true)
    const result = await updateCommunityProfile(community.id, {
      name: form.name,
      description: form.description,
      location: form.location,
      website: form.website || null,
      phone: form.phone || null,
      email: form.email || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
      twitter: form.twitter || null,
      focus_areas: form.focus_areas,
    })

    if (!result.success) {
      toast.error(result.error ?? "Gagal menyimpan perubahan.")
    } else {
      setCommunity((prev: any) => ({ ...prev, ...form }))
      toast.success("Profil komunitas berhasil diperbarui!")
    }
    setIsSaving(false)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  // No community found
  if (!community) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-4 text-center">
          <div>
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">Data komunitas tidak ditemukan.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/community/dashboard">Kembali ke Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/community/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Edit Profil Komunitas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Perbarui informasi komunitas Anda agar relawan dan donatur lebih mengenal komunitas Anda.
            </p>
          </div>

          <div className="space-y-6">
            {/* Status Verifikasi */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              community.verification_status === "approved"
                ? "bg-green-50 border-green-200"
                : community.verification_status === "rejected"
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200"
            }`}>
              <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${
                community.verification_status === "approved" ? "text-green-600" :
                community.verification_status === "rejected" ? "text-red-500" : "text-yellow-500"
              }`} />
              <p className={`text-sm font-medium ${
                community.verification_status === "approved" ? "text-green-800" :
                community.verification_status === "rejected" ? "text-red-700" : "text-yellow-700"
              }`}>
                {community.verification_status === "approved"
                  ? "✅ Komunitas Anda sudah terverifikasi oleh admin."
                  : community.verification_status === "rejected"
                  ? "❌ Verifikasi komunitas ditolak. Hubungi admin untuk informasi lebih lanjut."
                  : "⏳ Komunitas Anda sedang menunggu verifikasi admin."}
              </p>
            </div>

            {/* Foto & Cover */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Foto & Gambar
                </CardTitle>
                <CardDescription>Upload logo dan gambar sampul komunitas Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Logo */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-secondary border border-border flex-shrink-0">
                    {community.logo_url ? (
                      <img src={community.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                        {getInitials(community.name ?? "K")}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">Logo Komunitas</p>
                    <p className="text-xs text-muted-foreground mb-2">Format JPG/PNG, maks. 2MB. Rasio 1:1 direkomendasikan.</p>
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-dashed rounded-lg cursor-pointer text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      {isUploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      {isUploadingLogo ? "Mengupload..." : "Pilih Logo"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                    </label>
                  </div>
                </div>

                {/* Cover */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Gambar Sampul</p>
                  <p className="text-xs text-muted-foreground">Format JPG/PNG, maks. 5MB. Rasio 16:9 direkomendasikan.</p>
                  {community.cover_url && (
                    <div className="relative h-32 rounded-lg overflow-hidden border border-border">
                      <img src={community.cover_url} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-dashed rounded-lg cursor-pointer text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    {isUploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {isUploadingCover ? "Mengupload..." : community.cover_url ? "Ganti Gambar Sampul" : "Upload Gambar Sampul"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={isUploadingCover} />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informasi Dasar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Informasi Dasar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Komunitas *</Label>
                    <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Nama komunitas Anda" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi Komunitas</Label>
                    <Textarea
                      id="description" name="description" value={form.description}
                      onChange={handleChange} rows={4}
                      placeholder="Ceritakan tentang komunitas Anda, visi misi, dan kegiatan yang dilakukan..."
                    />
                    <p className="text-xs text-muted-foreground">{form.description.length} karakter</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Lokasi
                    </Label>
                    <Input id="location" name="location" value={form.location} onChange={handleChange} placeholder="Contoh: Jakarta, Indonesia" />
                  </div>
                </CardContent>
              </Card>

              {/* Fokus Kegiatan */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Area Fokus Kegiatan</CardTitle>
                  <CardDescription>Pilih satu atau lebih area fokus komunitas Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {FOCUS_AREA_OPTIONS.map((opt) => {
                      const isSelected = form.focus_areas.includes(opt.value)
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleFocusArea(opt.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                          }`}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Kontak */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Informasi Kontak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email Komunitas</Label>
                    <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="komunitas@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Nomor Telepon</Label>
                    <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+62 8xx xxxx xxxx" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Website</Label>
                    <Input id="website" name="website" type="url" value={form.website} onChange={handleChange} placeholder="https://komunitas-anda.org" />
                  </div>
                </CardContent>
              </Card>

              {/* Media Sosial */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Media Sosial</CardTitle>
                  <CardDescription>Tambahkan tautan media sosial komunitas Anda (opsional).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-1.5"><Instagram className="h-3.5 w-3.5" /> Instagram</Label>
                    <div className="flex items-center">
                      <span className="flex items-center h-10 px-3 border border-r-0 rounded-l-md bg-secondary text-muted-foreground text-sm">@</span>
                      <Input
                        id="instagram" name="instagram"
                        value={form.instagram.replace("@", "")}
                        onChange={(e) => setForm(f => ({ ...f, instagram: e.target.value }))}
                        className="rounded-l-none" placeholder="username_instagram"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="flex items-center gap-1.5"><Facebook className="h-3.5 w-3.5" /> Facebook</Label>
                    <Input id="facebook" name="facebook" value={form.facebook} onChange={handleChange} placeholder="nama-halaman-facebook" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-1.5"><Twitter className="h-3.5 w-3.5" /> Twitter / X</Label>
                    <div className="flex items-center">
                      <span className="flex items-center h-10 px-3 border border-r-0 rounded-l-md bg-secondary text-muted-foreground text-sm">@</span>
                      <Input
                        id="twitter" name="twitter"
                        value={form.twitter.replace("@", "")}
                        onChange={(e) => setForm(f => ({ ...f, twitter: e.target.value }))}
                        className="rounded-l-none" placeholder="username_twitter"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Button type="submit" className="w-full" size="lg" disabled={isSaving}>
                {isSaving
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                  : <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>
                }
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
