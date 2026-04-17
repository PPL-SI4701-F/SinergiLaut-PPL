"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import {
  User, Camera, Save, Loader2, Phone, Mail, FileText, ArrowLeft,
  ShieldCheck, ShieldAlert, ShieldX, Upload, Calendar, CreditCard,
  MapPin, UserCheck, AlertCircle, ImageIcon
} from "lucide-react"
import Link from "next/link"
import { getInitials } from "@/lib/utils/helpers"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { submitVolunteerVerification } from "@/lib/actions/volunteer-verification.actions"

export default function UserProfilePage() {
  const { user, profile, refreshProfile, isVolunteerVerified } = useAuth()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false)
  const [isUploadingKtp, setIsUploadingKtp] = useState(false)

  // Basic profile form
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    bio: "",
  })

  // Verification form
  const [verifyForm, setVerifyForm] = useState({
    full_name: "",
    date_of_birth: "",
    nik: "",
    gender: "",
    address: "",
    phone: "",
    ktp_url: "",
  })

  // Initialize forms when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        bio: profile.bio ?? "",
      })
      setVerifyForm({
        full_name: profile.full_name ?? "",
        date_of_birth: profile.date_of_birth ?? "",
        nik: profile.nik ?? "",
        gender: profile.gender ?? "",
        address: profile.address ?? "",
        phone: profile.phone ?? "",
        ktp_url: profile.ktp_url ?? "",
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleVerifyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setVerifyForm({ ...verifyForm, [e.target.name]: e.target.value })
  }

  // Handle basic profile update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setIsLoading(true)
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      phone: form.phone,
      bio: form.bio,
    }).eq("id", profile.id)

    if (error) {
      toast.error("Gagal memperbarui profil.")
    } else {
      toast.success("Profil berhasil diperbarui!")
      await refreshProfile()
    }
    setIsLoading(false)
  }

  // Handle KTP upload
  const handleKtpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, dll).")
      return
    }

    setIsUploadingKtp(true)
    const fileExt = file.name.split(".").pop()
    const filePath = `ktp/${user.id}/ktp-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("sinergilaut-assets")
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      console.error("KTP upload error:", uploadError)
      toast.error("Gagal mengupload foto KTP: " + uploadError.message)
      setIsUploadingKtp(false)
      return
    }

    const { data: urlData } = supabase.storage.from("sinergilaut-assets").getPublicUrl(filePath)
    setVerifyForm(prev => ({ ...prev, ktp_url: urlData.publicUrl }))
    
    toast.success("Foto KTP berhasil diupload!")
    setIsUploadingKtp(false)
  }

  // Handle verification submission
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validations
    if (!verifyForm.full_name || !verifyForm.date_of_birth || !verifyForm.nik || !verifyForm.gender || !verifyForm.address || !verifyForm.phone) {
      toast.error("Harap lengkapi semua data yang wajib diisi.")
      return
    }

    if (verifyForm.nik.length !== 16 || !/^\d+$/.test(verifyForm.nik)) {
      toast.error("NIK harus 16 digit angka.")
      return
    }

    setIsSubmittingVerification(true)
    const result = await submitVolunteerVerification({
      userId: user.id,
      fullName: verifyForm.full_name,
      dateOfBirth: verifyForm.date_of_birth,
      nik: verifyForm.nik,
      gender: verifyForm.gender,
      address: verifyForm.address,
      phone: verifyForm.phone,
      ktpUrl: verifyForm.ktp_url || undefined,
    })

    if (result.success) {
      toast.success("Data verifikasi berhasil dikirim! Tunggu persetujuan admin.")
      await refreshProfile()
    } else {
      toast.error(result.error ?? "Gagal mengirim data verifikasi.")
    }
    setIsSubmittingVerification(false)
  }

  const volunteerStatus = profile?.volunteer_status ?? "pending"
  const hasSubmitted = !!profile?.nik

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <Link href="/user/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Edit Profil</h1>
          </div>

          {/* ── Verification Status Banner ── */}
          {profile?.role === "user" && (
            <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
              volunteerStatus === "approved" ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" :
              volunteerStatus === "rejected" ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800" :
              hasSubmitted ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800" :
              "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
            }`}>
              {volunteerStatus === "approved" ? (
                <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : volunteerStatus === "rejected" ? (
                <ShieldX className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : hasSubmitted ? (
                <ShieldAlert className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-medium text-sm ${
                  volunteerStatus === "approved" ? "text-green-800 dark:text-green-300" :
                  volunteerStatus === "rejected" ? "text-red-800 dark:text-red-300" :
                  hasSubmitted ? "text-yellow-800 dark:text-yellow-300" :
                  "text-blue-800 dark:text-blue-300"
                }`}>
                  {volunteerStatus === "approved"
                    ? "✅ Data diri Anda sudah terverifikasi! Anda dapat mendaftar ke kegiatan."
                    : volunteerStatus === "rejected"
                    ? "❌ Verifikasi ditolak oleh admin."
                    : hasSubmitted
                    ? "⏳ Data diri Anda sedang direview oleh admin."
                    : "📋 Lengkapi data diri di bawah untuk bisa mendaftar ke kegiatan."}
                </p>
                {volunteerStatus === "rejected" && profile?.volunteer_reject_note && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Alasan: {profile.volunteer_reject_note}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* ── Avatar Card ── */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
                        {getInitials(profile?.full_name ?? profile?.email ?? "?")}
                      </div>
                    )}
                    <button type="button" className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{profile?.full_name ?? "Pengguna"}</p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="capitalize text-xs">{profile?.role}</Badge>
                      {isVolunteerVerified && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <UserCheck className="h-3 w-3 mr-1" /> Terverifikasi
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Basic Profile Form ── */}
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Informasi Pribadi</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="full_name" name="full_name" value={form.full_name} onChange={handleChange} className="pl-10" placeholder="Nama lengkap" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={profile?.email ?? ""} disabled className="pl-10 bg-secondary text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className="pl-10" placeholder="+62 8xx xxxx xxxx" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio / Tentang Saya</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea id="bio" name="bio" value={form.bio} onChange={handleChange} className="pl-10" rows={4}
                        placeholder="Ceritakan sedikit tentang diri Anda dan minat Anda di bidang konservasi laut..." />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>}
                  </Button>
                </CardContent>
              </Card>
            </form>

            {/* ── Volunteer Verification Form ── */}
            {profile?.role === "user" && (
              <form onSubmit={handleVerificationSubmit}>
                <Card className={`border-2 ${
                  volunteerStatus === "approved" ? "border-green-200" :
                  volunteerStatus === "rejected" ? "border-red-200" :
                  hasSubmitted ? "border-yellow-200" : "border-primary/30"
                }`}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" /> Verifikasi Data Diri Volunteer
                    </CardTitle>
                    <CardDescription>
                      Lengkapi data diri Anda agar dapat mendaftar sebagai relawan di kegiatan komunitas. Data akan diverifikasi oleh admin.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="v_full_name">Nama Lengkap (sesuai KTP) *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="v_full_name" name="full_name" value={verifyForm.full_name} onChange={handleVerifyChange}
                            className="pl-10" placeholder="Nama sesuai KTP" required
                            disabled={volunteerStatus === "approved" || volunteerStatus === "pending" && hasSubmitted} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth">Tanggal Lahir *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="date_of_birth" name="date_of_birth" type="date" value={verifyForm.date_of_birth} onChange={handleVerifyChange}
                            className="pl-10" required
                            disabled={volunteerStatus === "approved" || volunteerStatus === "pending" && hasSubmitted} />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nik">No. KTP / NIK (16 digit) *</Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="nik" name="nik" value={verifyForm.nik} onChange={handleVerifyChange}
                            className="pl-10" placeholder="16 digit angka" maxLength={16} required
                            disabled={volunteerStatus === "approved" || volunteerStatus === "pending" && hasSubmitted} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Jenis Kelamin *</Label>
                        <select id="gender" name="gender" value={verifyForm.gender} onChange={handleVerifyChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          required disabled={volunteerStatus === "approved" || volunteerStatus === "pending" && hasSubmitted}>
                          <option value="">Pilih...</option>
                          <option value="male">Laki-laki</option>
                          <option value="female">Perempuan</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="v_phone">No. Telepon *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="v_phone" name="phone" type="tel" value={verifyForm.phone} onChange={handleVerifyChange}
                            className="pl-10" placeholder="+62 8xx xxxx xxxx" required
                            disabled={volunteerStatus === "approved" || volunteerStatus === "pending" && hasSubmitted} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Upload Foto KTP</Label>
                        <div className="flex gap-2 items-center">
                          <label className={`flex-1 flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg cursor-pointer transition-colors ${
                            volunteerStatus === "approved" || (volunteerStatus === "pending" && hasSubmitted) ? "opacity-50 pointer-events-none" : "hover:border-primary hover:bg-primary/5"
                          }`}>
                            {isUploadingKtp ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Upload className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm text-muted-foreground truncate">
                              {verifyForm.ktp_url ? "KTP Terupload ✓" : "Pilih file..."}
                            </span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleKtpUpload}
                              disabled={volunteerStatus === "approved" || (volunteerStatus === "pending" && hasSubmitted)} />
                          </label>
                          {verifyForm.ktp_url && (
                            <a href={verifyForm.ktp_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary hover:underline">
                              <ImageIcon className="h-3.5 w-3.5" /> Lihat
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Format: JPG/PNG, maks. 5MB</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Alamat Lengkap *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea id="address" name="address" value={verifyForm.address} onChange={handleVerifyChange}
                          className="pl-10" rows={3} placeholder="Alamat lengkap sesuai KTP" required
                          disabled={volunteerStatus === "approved" || volunteerStatus === "pending" && hasSubmitted} />
                      </div>
                    </div>

                    {/* Submit/Status */}
                    {volunteerStatus === "approved" ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-green-700 dark:text-green-300">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="text-sm font-medium">Data diri Anda sudah terverifikasi.</span>
                      </div>
                    ) : volunteerStatus === "pending" && hasSubmitted ? (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg text-yellow-700 dark:text-yellow-300">
                        <ShieldAlert className="h-5 w-5" />
                        <span className="text-sm font-medium">Menunggu verifikasi admin. Anda akan diberitahu setelah diproses.</span>
                      </div>
                    ) : (
                      <Button type="submit" className="w-full" size="lg" disabled={isSubmittingVerification}>
                        {isSubmittingVerification
                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...</>
                          : volunteerStatus === "rejected"
                          ? <><ShieldCheck className="mr-2 h-4 w-4" /> Ajukan Ulang Verifikasi</>
                          : <><ShieldCheck className="mr-2 h-4 w-4" /> Ajukan Verifikasi Data Diri</>}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
