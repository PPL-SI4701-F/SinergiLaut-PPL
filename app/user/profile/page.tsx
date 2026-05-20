"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import {
  User, Camera, Save, Loader2, Phone, Mail, FileText, ArrowLeft, X,
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [optimisticAvatar, setOptimisticAvatar] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

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
    
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: form.full_name,
        phone: form.phone,
        bio: form.bio,
      }).eq("id", profile.id)

      if (error) {
        console.error("Profile update error:", error)
        toast.error("Gagal memperbarui profil: " + error.message)
      } else {
        toast.success("Profil berhasil diperbarui!")
        await refreshProfile()
      }
    } catch (err: any) {
      console.error("Unexpected error during profile update:", err)
      toast.error("Terjadi kesalahan sistem saat menyimpan.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !profile) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto profil maksimal 2MB.")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar.")
      return
    }

    setIsUploadingAvatar(true)
    const previewUrl = URL.createObjectURL(file)
    setOptimisticAvatar(previewUrl)

    const fileExt = file.name.split(".").pop()
    const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`

    try {
      const { error: uploadError } = await supabase.storage
        .from("sinergilaut-assets")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from("sinergilaut-assets").getPublicUrl(filePath)
      const avatarUrl = urlData.publicUrl

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", profile.id)

      if (updateError) throw updateError

      toast.success("Foto profil berhasil diperbarui!")
      await refreshProfile()
    } catch (error: any) {
      console.error("Avatar upload FULL ERROR:", error)
      toast.error("Gagal mengupload foto profil: " + (error.message || "Pastikan izin akses storage sudah dikonfigurasi."))
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Clear optimistic avatar when real profile avatar updates
  useEffect(() => {
    if (profile?.avatar_url && optimisticAvatar) {
      URL.revokeObjectURL(optimisticAvatar)
      setOptimisticAvatar(null)
    }
  }, [profile?.avatar_url, optimisticAvatar])

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
    <div className="flex-1 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(103,232,249,0.08)_0%,transparent_40%),radial-gradient(circle_at_80%_60%,rgba(6,149,138,0.06)_0%,transparent_40%)] pointer-events-none" />
      <main className="pt-8 relative z-10 px-4 pb-16">
        <div className="max-w-2xl mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0e2a3a] tracking-tight">Edit Profil</h1>
          </div>

          {/* Verification Banner */}
          {profile?.role === "user" && (
            <div className={`mb-8 p-5 rounded-2xl border backdrop-blur-md flex items-start gap-4 shadow-sm ${
              volunteerStatus === "approved" ? "bg-emerald-50/70 border-emerald-100 text-emerald-800" :
              volunteerStatus === "rejected" ? "bg-rose-50/70 border-rose-100 text-rose-800" :
              hasSubmitted ? "bg-amber-50/70 border-amber-100 text-amber-800" :
              "bg-blue-50/70 border-blue-100 text-blue-800"
            }`}>
              <div className={`p-2 rounded-xl border ${
                volunteerStatus === "approved" ? "bg-emerald-100/50 border-emerald-200 text-emerald-600" :
                volunteerStatus === "rejected" ? "bg-rose-100/50 border-rose-200 text-rose-600" :
                hasSubmitted ? "bg-amber-100/50 border-amber-200 text-amber-600" :
                "bg-blue-100/50 border-blue-200 text-blue-600"
              }`}>
                {volunteerStatus === "approved" ? <ShieldCheck className="h-6 w-6" /> :
                 volunteerStatus === "rejected" ? <ShieldX className="h-6 w-6" /> :
                 hasSubmitted ? <ShieldAlert className="h-6 w-6" /> :
                 <AlertCircle className="h-6 w-6" />}
              </div>
              <div>
                <p className="font-extrabold text-sm mb-1 uppercase tracking-wider opacity-80">Status Verifikasi</p>
                <p className="font-bold text-[15px] leading-tight mb-1">
                  {volunteerStatus === "approved" ? "Data diri Anda sudah terverifikasi!" :
                   volunteerStatus === "rejected" ? "Verifikasi ditolak oleh admin." :
                   hasSubmitted ? "Data diri sedang direview oleh admin." :
                   "Anda belum diverifikasi sebagai relawan."}
                </p>
                <p className="text-sm opacity-80 leading-relaxed font-medium">
                  {volunteerStatus === "approved" ? "Kini Anda dapat mendaftar untuk mengikuti berbagai kegiatan di platform SinergiLaut." :
                   volunteerStatus === "rejected" ? (profile?.volunteer_reject_note ? `Alasan: ${profile.volunteer_reject_note}` : "Silakan cek data Anda dan ajukan kembali.") :
                   hasSubmitted ? "Proses ini memakan waktu maksimal 2x24 jam. Kami akan memberitahu Anda via notifikasi." :
                   "Lengkapi data di bawah untuk akses penuh pendaftaran kegiatan komunitas."}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* ── Avatar Card ── */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-background" />
                    ) : (
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold border-2 border-background">
                        {getInitials(profile?.full_name ?? profile?.email ?? "?")}
                      </div>
                    )}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-background/50 rounded-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={avatarInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarUpload} 
                      disabled={isUploadingAvatar}
                    />
                    <button 
                      type="button" 
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center text-primary-foreground shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-black text-[#0e2a3a] mb-1">{profile?.full_name ?? "Pengguna"}</p>
                    <p className="text-sm font-semibold text-[#64748b] flex items-center justify-center sm:justify-start gap-1.5 mb-3">
                      <Mail className="h-3.5 w-3.5" /> {profile?.email}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <Badge className="bg-[#0e2a3a] text-white py-1 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest border-none">
                        {profile?.role}
                      </Badge>
                      {isVolunteerVerified && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 py-1 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <UserCheck className="h-3 w-3 mr-1" /> Terverifikasi
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Profile Form */}
            <form onSubmit={handleSubmit}>
              <Card className="bg-white/70 backdrop-blur-xl border-white/80 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-white/40 pb-4">
                  <CardTitle className="text-xl font-extrabold text-[#0e2a3a] flex items-center gap-2">
                    <User className="h-6 w-6 text-[#06958a]" /> Informasi Pribadi
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <Label htmlFor="full_name" className="text-sm font-bold text-[#475569]">Nama Lengkap</Label>
                      <span className={`text-xs ${form.full_name.length > 90 ? "text-red-500" : "text-[#94a3b8]"}`}>{form.full_name.length}/100</span>
                    </div>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8] group-focus-within:text-[#06958a] transition-colors" />
                      <Input id="full_name" name="full_name" value={form.full_name} onChange={handleChange}
                        maxLength={100}
                        className="pl-11 h-12 bg-white/50 border-white/60 focus:bg-white focus:border-[#06958a] focus:ring-[#06958a]/20 transition-all rounded-xl font-medium"
                        placeholder="Nama lengkap" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-[#475569] ml-1">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8]" />
                      <Input value={profile?.email ?? ""} disabled
                        className="pl-11 h-12 bg-gray-100/50 border-transparent text-[#94a3b8] cursor-not-allowed rounded-xl font-medium" />
                    </div>
                    <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider ml-1">Email tidak dapat diubah</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-bold text-[#475569] ml-1">Nomor Telepon</Label>
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8] group-focus-within:text-[#06958a] transition-colors" />
                      <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                        maxLength={20}
                        className="pl-11 h-12 bg-white/50 border-white/60 focus:bg-white focus:border-[#06958a] focus:ring-[#06958a]/20 transition-all rounded-xl font-medium"
                        placeholder="+62 8xx xxxx xxxx" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <Label htmlFor="bio" className="text-sm font-bold text-[#475569]">Bio / Tentang Saya</Label>
                      <span className={`text-xs ${form.bio.length > 270 ? "text-red-500" : "text-[#94a3b8]"}`}>{form.bio.length}/300</span>
                    </div>
                    <div className="relative group">
                      <FileText className="absolute left-3.5 top-4 h-5 w-5 text-[#94a3b8] group-focus-within:text-[#06958a] transition-colors" />
                      <Textarea id="bio" name="bio" value={form.bio} onChange={handleChange}
                        maxLength={300}
                        className="pl-11 py-3 bg-white/50 border-white/60 focus:bg-white focus:border-[#06958a] focus:ring-[#06958a]/20 transition-all rounded-xl font-medium"
                        rows={4} placeholder="Ceritakan sedikit tentang diri... (maks. 300 karakter)" />
                    </div>
                  </div>
                  <Button type="submit" variant="premium" className="w-full h-12 shadow-md hover:shadow-xl transition-all font-bold text-base" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan...</> : <><Save className="mr-2 h-5 w-5" /> Simpan Perubahan</>}
                  </Button>
                </CardContent>
              </Card>
            </form>

            {/* Volunteer Verification Form */}
            {profile?.role === "user" && (
              <form onSubmit={handleVerificationSubmit}>
                <Card className={`bg-white/70 backdrop-blur-xl border-2 shadow-lg rounded-2xl overflow-hidden transition-all duration-500 ${
                  volunteerStatus === "approved" ? "border-emerald-200/60" :
                  volunteerStatus === "rejected" ? "border-rose-200/60" :
                  hasSubmitted ? "border-amber-200/60" : "border-white/80"
                }`}>
                  <CardHeader className="border-b border-white/40 pb-6">
                    <CardTitle className="text-xl font-extrabold text-[#0e2a3a] flex items-center gap-2">
                      <ShieldCheck className="h-6 w-6 text-[#06958a]" /> Verifikasi Data Diri Volunteer
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-[#64748b] leading-relaxed">
                      Lengkapi data diri Anda agar dapat mendaftar sebagai relawan di kegiatan komunitas. Data akan diverifikasi oleh admin secara manual.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="v_full_name" className="text-sm font-bold text-[#475569] ml-1">Nama Lengkap (sesuai KTP) *</Label>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8] group-focus-within:text-[#06958a] transition-colors" />
                          <Input id="v_full_name" name="full_name" value={verifyForm.full_name} onChange={handleVerifyChange}
                            className="pl-11 h-12 bg-white/50 border-white/60 focus:bg-white focus:border-[#06958a] focus:ring-[#06958a]/20 transition-all rounded-xl font-medium"
                            placeholder="Nama sesuai KTP" required
                            disabled={volunteerStatus === "approved" || (volunteerStatus === "pending" && hasSubmitted)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth" className="text-sm font-bold text-[#475569] ml-1">Tanggal Lahir *</Label>
                        <div className="relative group">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8] group-focus-within:text-[#06958a] transition-colors" />
                          <Input id="date_of_birth" name="date_of_birth" type="date" value={verifyForm.date_of_birth} onChange={handleVerifyChange}
                            className="pl-11 h-12 bg-white/50 border-white/60 focus:bg-white focus:border-[#06958a] focus:ring-[#06958a]/20 transition-all rounded-xl font-medium"
                            required disabled={volunteerStatus === "approved" || (volunteerStatus === "pending" && hasSubmitted)} />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nik" className="text-sm font-bold text-[#475569] ml-1">No. KTP / NIK (16 digit) *</Label>
                        <div className="relative group">
                          <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8] group-focus-within:text-[#06958a] transition-colors" />
                          <Input id="nik" name="nik" value={verifyForm.nik} onChange={handleVerifyChange}
                            className="pl-11 h-12 bg-white/50 border-white/60 focus:bg-white focus:border-[#06958a] focus:ring-[#06958a]/20 transition-all rounded-xl font-medium"
                            placeholder="16 digit angka" maxLength={16} required
                            disabled={volunteerStatus === "approved" || (volunteerStatus === "pending" && hasSubmitted)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-sm font-bold text-[#475569] ml-1">Jenis Kelamin *</Label>
                        <select id="gender" name="gender" value={verifyForm.gender} onChange={handleVerifyChange}
                          className="flex h-12 w-full rounded-xl border border-white/60 bg-white/50 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#06958a]/20 focus:border-[#06958a] transition-all"
                          required disabled={volunteerStatus === "approved" || (volunteerStatus === "pending" && hasSubmitted)}>
                          <option value="">Pilih...</option>
                          <option value="male">Laki-laki</option>
                          <option value="female">Perempuan</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="v_phone" className="text-sm font-bold text-[#475569] ml-1">No. Telepon *</Label>
                        <div className="relative group">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94a3b8] group-focus-within:text-[#06958a] transition-colors" />
                          <Input id="v_phone" name="phone" type="tel" value={verifyForm.phone} onChange={handleVerifyChange}
                            className="pl-11 h-12 bg-white/50 border-white/60 focus:bg-white focus:border-[#06958a] focus:ring-[#06958a]/20 transition-all rounded-xl font-medium"
                            placeholder="+62 8xx xxxx xxxx" required
                            disabled={volunteerStatus === "approved" || (volunteerStatus === "pending" && hasSubmitted)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-[#475569] ml-1">Upload Foto KTP</Label>
                        <div className="flex gap-3 items-center">
                          <label className={`flex-1 flex items-center justify-center gap-3 h-12 px-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                            volunteerStatus === "approved" || (volunteerStatus === "pending" && hasSubmitted)
                              ? "opacity-50 border-gray-200 cursor-not-allowed"
                              : "border-[#06958a]/30 hover:border-[#06958a] hover:bg-[#06958a]/5 text-[#64748b] hover:text-[#06958a]"
                          }`}>
                            {isUploadingKtp ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                            <span className="text-sm font-bold truncate">
                              {verifyForm.ktp_url ? "KTP Berhasil Terupload ✓" : "Unggah Foto KTP"}
                            </span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleKtpUpload}
                              disabled={volunteerStatus === "approved" || (volunteerStatus === "pending" && hasSubmitted)} />
                          </label>
                          {verifyForm.ktp_url && (
                            <a href={verifyForm.ktp_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-white/60 text-[#06958a] hover:bg-white shadow-sm transition-all group">
                              <ImageIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider ml-1">Format: JPG/PNG, MAKS. 5MB</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-bold text-[#475569] ml-1">Alamat Lengkap *</Label>
                      <div className="relative group">
                        <MapPin className="absolute left-3.5 top-4 h-5 w-5 text-[#94a3b8] group-focus-within:text-[#06958a] transition-colors" />
                        <Textarea id="address" name="address" value={verifyForm.address} onChange={handleVerifyChange}
                          className="pl-11 py-3 bg-white/50 border-white/60 focus:bg-white focus:border-[#06958a] focus:ring-[#06958a]/20 transition-all rounded-xl font-medium"
                          rows={3} placeholder="Alamat sesuai KTP" required
                          disabled={volunteerStatus === "approved" || (volunteerStatus === "pending" && hasSubmitted)} />
                      </div>
                    </div>

                    <div className="mt-8">
                      {volunteerStatus === "approved" ? (
                        <div className="flex items-center gap-3 p-5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 shadow-sm">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <ShieldCheck className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold uppercase tracking-wider opacity-90 mb-0.5">Sudah Terverifikasi</p>
                            <p className="font-bold text-sm">Identitas Anda telah divalidasi oleh sistem SinergiLaut.</p>
                          </div>
                        </div>
                      ) : volunteerStatus === "pending" && hasSubmitted ? (
                        <div className="flex items-center gap-3 p-5 bg-amber-50 text-amber-800 rounded-2xl border border-amber-100 shadow-sm">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold uppercase tracking-wider opacity-90 mb-0.5">Sedang Diproses</p>
                            <p className="font-bold text-sm">Menunggu verifikasi admin. Kami akan segera memproses data Anda.</p>
                          </div>
                        </div>
                      ) : (
                        <Button type="submit" variant="premium" className="w-full h-14 shadow-lg hover:shadow-xl transition-all font-bold text-lg" disabled={isSubmittingVerification}>
                          {isSubmittingVerification
                            ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Mengirim Data...</>
                            : volunteerStatus === "rejected"
                            ? <><ShieldCheck className="mr-2 h-6 w-6" /> Ajukan Ulang Verifikasi</>
                            : <><ShieldCheck className="mr-2 h-6 w-6" /> Ajukan Verifikasi Data Diri</>}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Avatar Lightbox Preview */}
      {isPreviewOpen && (optimisticAvatar || profile?.avatar_url) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300 animate-in fade-in"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 animate-in zoom-in-95 duration-300">
              <img
                src={optimisticAvatar || profile?.avatar_url || ""}
                alt="Full Preview"
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
            <div className="mt-6 text-center">
              <p className="text-white text-xl font-extrabold">{profile?.full_name}</p>
              <p className="text-white/60 text-sm font-bold uppercase tracking-widest mt-1">{profile?.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
