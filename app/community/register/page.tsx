"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Footer } from "@/components/footer"
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  Users,
  Waves,
  Heart,
  ArrowLeft,
  ArrowRight,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Lock,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { registerCommunity } from "@/lib/actions/auth.actions"

const steps = [
  { id: 1, title: "Info Komunitas", icon: Building2 },
  { id: 2, title: "Lokasi & Kegiatan", icon: MapPin },
  { id: 3, title: "Dokumen", icon: FileText },
  { id: 4, title: "Submit", icon: CheckCircle2 },
]

const activityTypes = [
  "Beach Cleanup",
  "Coral Restoration",
  "Mangrove Planting",
  "Marine Education",
  "Wildlife Conservation",
  "Sustainable Fishing",
  "Research & Monitoring",
  "Community Outreach",
]

const regions = [
  "Jakarta & Surroundings",
  "Bali & Nusa Tenggara",
  "Sulawesi",
  "Kalimantan",
  "Sumatra",
  "Papua & Maluku",
  "Java (Non-Jakarta)",
  "Multiple Regions",
]

export default function CommunityRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    communityName: "",
    shortDescription: "",
    logo: null as File | null,
    adminName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    website: "",
    instagram: "",
    facebook: "",
    twitter: "",
    operationalArea: "",
    region: "",
    selectedActivities: [] as string[],
    legalDocuments: [] as File[],
    agreedToTerms: false,
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "rejected">("pending")

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleActivityToggle = (activity: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedActivities: prev.selectedActivities.includes(activity)
        ? prev.selectedActivities.filter((a) => a !== activity)
        : [...prev.selectedActivities, activity],
    }))
  }

  const handleFileUpload = (field: string, files: FileList | null) => {
    if (!files) return
    if (field === "logo") {
      setFormData((prev) => ({ ...prev, logo: files[0] }))
    } else if (field === "legalDocuments") {
      setFormData((prev) => ({
        ...prev,
        legalDocuments: [...prev.legalDocuments, ...Array.from(files)],
      }))
    }
  }

  const removeDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      legalDocuments: prev.legalDocuments.filter((_, i) => i !== index),
    }))
  }

  const nextStep = () => {
    // Validasi step 1 (Info Komunitas — gabungan Basic + Contact)
    if (currentStep === 1) {
      if (formData.communityName.trim().length < 3) {
        toast.error("Nama komunitas minimal 3 karakter.")
        return
      }
      if (formData.shortDescription.trim().length < 20) {
        toast.error("Deskripsi singkat minimal 20 karakter.")
        return
      }
      if (formData.shortDescription.trim().length > 500) {
        toast.error("Deskripsi singkat maksimal 500 karakter.")
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        toast.error("Format email tidak valid. Pastikan menggunakan @.")
        return
      }
      const phoneRegex = /^[+\d\s()-]{6,20}$/
      if (!phoneRegex.test(formData.phone)) {
        toast.error("Nomor telepon tidak valid. Gunakan angka saja.")
        return
      }
      if (formData.password.length < 8) {
        toast.error("Password minimal 8 karakter.")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Password dan konfirmasi password tidak cocok.")
        return
      }
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Password tidak cocok.")
      return
    }
    if (formData.password.length < 8) {
      toast.error("Password minimal 8 karakter.")
      return
    }

    setIsSubmitting(true)
    
    const submitData = new FormData()
    submitData.append("communityName", formData.communityName)
    submitData.append("shortDescription", formData.shortDescription)
    submitData.append("adminName", formData.adminName)
    submitData.append("email", formData.email)
    submitData.append("phone", formData.phone)
    submitData.append("password", formData.password)
    submitData.append("website", formData.website)
    submitData.append("region", formData.region)
    submitData.append("operationalArea", formData.operationalArea)
    submitData.append("selectedActivities", JSON.stringify(formData.selectedActivities))
    
    if (formData.logo) {
      submitData.append("logo", formData.logo)
    }
    
    formData.legalDocuments.forEach(doc => {
      submitData.append("legalDocuments", doc)
    })

    const result = await registerCommunity(submitData)

    if (result?.error) {
      toast.error(result.error)
      setIsSubmitting(false)
      return
    }

    setIsSubmitted(true)
    setVerificationStatus("pending")
    setIsSubmitting(false)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Info Komunitas (Basic + Contact gabung)
        return formData.communityName && formData.shortDescription &&
               formData.adminName && formData.email && formData.phone &&
               formData.password && formData.confirmPassword
      case 2: // Lokasi & Kegiatan
        return formData.region && formData.selectedActivities.length > 0
      case 3: // Dokumen
        return true
      case 4: // Submit
        return formData.agreedToTerms
      default:
        return false
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-background">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="/register">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Bergabung dengan SinergiLaut
              </Link>
            </Button>
          </div>
        </div>
        <main>
          <div className="max-w-2xl mx-auto px-4 py-16">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  {verificationStatus === "pending" && (
                    <Clock className="w-10 h-10 text-primary" />
                  )}
                  {verificationStatus === "verified" && (
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  )}
                  {verificationStatus === "rejected" && (
                    <XCircle className="w-10 h-10 text-destructive" />
                  )}
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {verificationStatus === "pending" && "Pendaftaran Terkirim!"}
                  {verificationStatus === "verified" && "Pendaftaran Disetujui!"}
                  {verificationStatus === "rejected" && "Pendaftaran Perlu Ditinjau"}
                </h2>

                <Badge
                  variant={
                    verificationStatus === "pending"
                      ? "secondary"
                      : verificationStatus === "verified"
                        ? "default"
                        : "destructive"
                  }
                  className="mb-6"
                >
                  {verificationStatus === "pending" && "Menunggu Verifikasi"}
                  {verificationStatus === "verified" && "Terverifikasi"}
                  {verificationStatus === "rejected" && "Ditolak"}
                </Badge>

                <p className="text-muted-foreground mb-8">
                  {verificationStatus === "pending" &&
                    "Pendaftaran Anda akan ditinjau oleh admin platform. Anda akan menerima email konfirmasi ke " +
                      formData.email +
                      " jika disetujui."}
                  {verificationStatus === "verified" &&
                    "Selamat! Komunitas Anda telah diverifikasi. Anda kini dapat mulai mempublikasikan kegiatan."}
                  {verificationStatus === "rejected" &&
                    "Harap tinjau masukan yang dikirim ke email Anda dan ajukan ulang pendaftaran."}
                </p>

                <div className="bg-secondary/50 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-foreground mb-4">Selanjutnya?</h3>
                  <ul className="text-left space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Tim kami akan meninjau pendaftaran Anda dalam 2-3 hari kerja</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Anda akan menerima notifikasi email tentang status pendaftaran Anda</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Setelah disetujui, Anda dapat mulai membuat kegiatan dan menerima relawan</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/community/dashboard">Ke Dashboard Komunitas</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/activities">Lihat Kegiatan</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/community-register-hero.jpg"
            alt="Marine conservation community"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users className="w-8 h-8 text-accent" />
            <Waves className="w-8 h-8 text-accent" />
            <Heart className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4 text-balance">
            Bergabung dengan SinergiLaut sebagai Komunitas Konservasi
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
            Daftarkan organisasi Anda untuk mulai mempublikasikan kegiatan, mengelola relawan, dan menerima donasi
          </p>
          <div className="mt-8">
            <Link href="/register" className="sl-btn sl-btn-ghost-dark sl-btn-md">
              <ArrowLeft style={{ width: 16, height: 16 }} />
              Kembali ke Bergabung dengan SinergiLaut
            </Link>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Progress Indicator */}
          <div className="mb-12">
            <style>{`
              .creg-stepper { display: flex; align-items: center; justify-content: center; gap: 0; }
              .creg-step-wrap { display: flex; align-items: center; }
              .creg-step-circle {
                width: 48px; height: 48px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                transition: all 0.3s ease; position: relative; z-index: 1;
              }
              .creg-step-circle.active   { background: linear-gradient(135deg, #0e4d6d, #06958a); color: white; box-shadow: 0 4px 12px rgba(6,149,138,0.35); transform: scale(1.1); }
              .creg-step-circle.done     { background: #06958a; color: white; }
              .creg-step-circle.inactive { background: white; color: #94a3b8; border: 2px solid #e2e8f0; }
              .creg-step-label { margin-top: 0.5rem; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; display: none; }
              @media (min-width: 640px) { .creg-step-label { display: block; } }
              .creg-step-label.active-label   { color: #0e4d6d; }
              .creg-step-label.done-label     { color: #06958a; }
              .creg-step-label.inactive-label { color: #94a3b8; }
              .creg-step-connector { height: 2px; width: 56px; transition: background 0.3s ease; margin: 0 4px; }
              .creg-step-connector.done     { background: #06958a; }
              .creg-step-connector.inactive { background: #e2e8f0; }
            `}</style>
            <div className="creg-stepper">
              {steps.map((step) => {
                const Icon = step.icon
                const isActive = step.id === currentStep
                const isCompleted = step.id < currentStep
                const state = isCompleted ? "done" : isActive ? "active" : "inactive"

                return (
                  <div key={step.id} className="creg-step-wrap">
                    <div className="flex flex-col items-center">
                      <div className={`creg-step-circle ${state}`}>
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <span className={`creg-step-label ${state}-label`}>{step.title}</span>
                    </div>
                    {step.id < steps.length && (
                      <div className={`creg-step-connector ${isCompleted ? "done" : "inactive"}`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Mobile Step Indicator */}
            <div className="sm:hidden text-center mt-4">
              <span className="text-sm font-medium text-primary">
                Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
              </span>
            </div>
          </div>

          {/* Form Card */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6 md:p-8">
              {/* Step 1: Info Komunitas (Basic + Contact gabung) */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Informasi Komunitas</h2>
                    <p className="text-muted-foreground">
                      Isi informasi dasar dan kontak administrator komunitas Anda
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nama Komunitas <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="contoh: Ocean Guardians Indonesia"
                        value={formData.communityName}
                        onChange={(e) => handleInputChange("communityName", e.target.value)}
                        className="h-12"
                        maxLength={100}
                      />
                      <p className={`text-xs mt-1 ${formData.communityName.length < 3 && formData.communityName.length > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                        {formData.communityName.length}/100 karakter (min. 3)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Deskripsi Singkat <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        placeholder="Deskripsikan misi dan kegiatan komunitas Anda (20–500 karakter)"
                        value={formData.shortDescription}
                        onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                        rows={4}
                        maxLength={500}
                      />
                      <p className={`text-xs mt-1 ${formData.shortDescription.length < 20 && formData.shortDescription.length > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                        {formData.shortDescription.length}/500 karakter (min. 20)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Logo Komunitas
                      </label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload("logo", e.target.files)}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          {formData.logo ? (
                            <div className="flex items-center justify-center gap-3">
                              <CheckCircle2 className="w-8 h-8 text-green-600" />
                              <span className="text-foreground">{formData.logo.name}</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground">
                                Klik untuk unggah atau seret dan jatuhkan
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG maks 2MB
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1 bagian 2: Contact Info (masih di step 1) */}
              {currentStep === 1 && (
                <div className="space-y-6 border-t border-border pt-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">Informasi Kontak Admin</h3>
                    <p className="text-muted-foreground text-sm">
                      Data akun administrator komunitas Anda
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nama Admin <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="Nama lengkap administrator"
                          value={formData.adminName}
                          onChange={(e) => handleInputChange("adminName", e.target.value)}
                          className="h-12 pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Alamat Email <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="admin@community.org"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="h-12 pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nomor Telepon <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="+62 812 3456 7890"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="h-12 pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Password <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Minimal 8 karakter"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className="h-12 pl-10"
                            required
                            minLength={8}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Konfirmasi Password <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Ulangi password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            className="h-12 pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-4">
                        Media Sosial (Opsional)
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            placeholder="Website URL"
                            value={formData.website}
                            onChange={(e) => handleInputChange("website", e.target.value)}
                            className="h-12 pl-10"
                          />
                        </div>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            placeholder="Instagram handle"
                            value={formData.instagram}
                            onChange={(e) => handleInputChange("instagram", e.target.value)}
                            className="h-12 pl-10"
                          />
                        </div>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            placeholder="Facebook page"
                            value={formData.facebook}
                            onChange={(e) => handleInputChange("facebook", e.target.value)}
                            className="h-12 pl-10"
                          />
                        </div>
                        <div className="relative">
                          <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            placeholder="Twitter handle"
                            value={formData.twitter}
                            onChange={(e) => handleInputChange("twitter", e.target.value)}
                            className="h-12 pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Lokasi & Kegiatan */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Lokasi & Kegiatan</h2>
                    <p className="text-muted-foreground">
                      Tentukan area operasional dan jenis kegiatan Anda
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Wilayah <span className="text-destructive">*</span>
                      </label>
                      <Select
                        value={formData.region}
                        onValueChange={(value) => handleInputChange("region", value)}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Pilih wilayah operasional Anda" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Detail Area Operasional
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <Textarea
                          placeholder="Deskripsikan lokasi spesifik tempat komunitas Anda beroperasi (kota, kawasan pesisir, taman laut, dll.)"
                          value={formData.operationalArea}
                          onChange={(e) => handleInputChange("operationalArea", e.target.value)}
                          rows={3}
                          className="pl-10 pt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Jenis Kegiatan <span className="text-destructive">*</span>
                      </label>
                      <p className="text-xs text-muted-foreground mb-4">
                        Pilih semua kegiatan yang dilakukan komunitas Anda
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {activityTypes.map((activity) => (
                          <button
                            key={activity}
                            type="button"
                            onClick={() => handleActivityToggle(activity)}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              formData.selectedActivities.includes(activity)
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            {activity}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        {formData.selectedActivities.length} selected
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Dokumen */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Dokumen Legal</h2>
                    <p className="text-muted-foreground">
                      Unggah dokumen pendukung (opsional namun direkomendasikan)
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        multiple
                        onChange={(e) => handleFileUpload("legalDocuments", e.target.files)}
                        className="hidden"
                        id="documents-upload"
                      />
                      <label htmlFor="documents-upload" className="cursor-pointer">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-foreground font-medium mb-2">
                          Unggah Dokumen Legal
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Akta pendirian organisasi, sertifikat, izin, atau dokumen resmi lainnya
                        </p>
                        <Button variant="outline" type="button" className="pointer-events-none">
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Files
                        </Button>
                      </label>
                    </div>

                    {formData.legalDocuments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          Uploaded Documents ({formData.legalDocuments.length})
                        </p>
                        {formData.legalDocuments.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-primary" />
                              <span className="text-sm text-foreground">{doc.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-secondary/30 rounded-lg p-4">
                      <p className="text-sm font-medium text-foreground mb-2">
                        Dokumen yang Direkomendasikan:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>- Akta pendirian organisasi</li>
                        <li>- Bukti status LSM/NPO (jika ada)</li>
                        <li>- Izin kegiatan atau lisensi</li>
                        <li>- Laporan kegiatan sebelumnya atau portofolio</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Tinjau & Kirim</h2>
                    <p className="text-muted-foreground">
                      Tinjau informasi Anda dan kirimkan pendaftaran
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="space-y-4">
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <h3 className="font-semibold text-foreground mb-3">Ringkasan Pendaftaran</h3>
                      <div className="grid gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nama Komunitas:</span>
                          <span className="font-medium text-foreground">{formData.communityName || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Admin:</span>
                          <span className="font-medium text-foreground">{formData.adminName || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium text-foreground">{formData.email || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Wilayah:</span>
                          <span className="font-medium text-foreground">{formData.region || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kegiatan:</span>
                          <span className="font-medium text-foreground">
                            {formData.selectedActivities.length} dipilih
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dokumen:</span>
                          <span className="font-medium text-foreground">
                            {formData.legalDocuments.length} diunggah
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verification Note */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground mb-1">Proses Verifikasi</p>
                          <p className="text-sm text-muted-foreground">
                            Pendaftaran Anda akan ditinjau oleh admin platform. Anda akan menerima email konfirmasi jika disetujui. Proses ini biasanya membutuhkan 2-3 hari kerja.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
                      <Checkbox
                        id="terms"
                        checked={formData.agreedToTerms}
                        onCheckedChange={(checked) =>
                          handleInputChange("agreedToTerms", checked === true)
                        }
                        className="mt-0.5"
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                        Saya menyetujui{" "}
                        <Link href="#" className="text-primary hover:underline">
                          Syarat & Ketentuan
                        </Link>{" "}
                        dan{" "}
                        <Link href="#" className="text-primary hover:underline">
                          Kebijakan Privasi
                        </Link>
                        . Saya menyatakan bahwa semua informasi yang diberikan akurat dan saya berwenang untuk mendaftarkan komunitas ini di SinergiLaut.
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={prevStep} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <Button onClick={nextStep} disabled={!canProceed()} className="gap-2">
                    Lanjut
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.agreedToTerms || isSubmitting}
                    className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Mengirim..." : "Kirim Pendaftaran"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
