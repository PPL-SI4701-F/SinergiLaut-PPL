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
import { Navigation } from "@/components/navigation"
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
import { registerCommunity } from "@/lib/actions/auth.actions"
import { useRouter } from "next/navigation"

const steps = [
  { id: 1, title: "Basic Info", icon: Building2 },
  { id: 2, title: "Contact Info", icon: Mail },
  { id: 3, title: "Location & Coverage", icon: MapPin },
  { id: 4, title: "Documents", icon: FileText },
  { id: 5, title: "Submit", icon: CheckCircle2 },
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
    if (currentStep < 5) setCurrentStep(currentStep + 1)
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
    
    const actionData = new FormData()
    actionData.append("communityName", formData.communityName)
    actionData.append("shortDescription", formData.shortDescription)
    actionData.append("adminName", formData.adminName)
    actionData.append("email", formData.email)
    actionData.append("password", formData.password)
    actionData.append("phone", formData.phone)
    actionData.append("website", formData.website)
    actionData.append("location", formData.region + (formData.operationalArea ? ` - ${formData.operationalArea}` : ""))
    actionData.append("selectedActivities", JSON.stringify(formData.selectedActivities))
    
    if (formData.logo) {
      actionData.append("logo", formData.logo)
    }
    
    if (formData.legalDocuments.length > 0) {
      for (const doc of formData.legalDocuments) {
        actionData.append("legalDocuments", doc)
      }
    }

    const result = await registerCommunity(actionData)

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
      case 1:
        return formData.communityName && formData.shortDescription
      case 2:
        return formData.adminName && formData.email && formData.phone && formData.password && formData.confirmPassword
      case 3:
        return formData.region && formData.selectedActivities.length > 0
      case 4:
        return true
      case 5:
        return formData.agreedToTerms
      default:
        return false
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
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
                  {verificationStatus === "pending" && "Registration Submitted!"}
                  {verificationStatus === "verified" && "Registration Approved!"}
                  {verificationStatus === "rejected" && "Registration Needs Review"}
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
                  {verificationStatus === "pending" && "Pending Verification"}
                  {verificationStatus === "verified" && "Verified"}
                  {verificationStatus === "rejected" && "Rejected"}
                </Badge>

                <p className="text-muted-foreground mb-8">
                  {verificationStatus === "pending" &&
                    "Your registration will be reviewed by the platform admin. You will receive a confirmation email at " +
                      formData.email +
                      " when approved."}
                  {verificationStatus === "verified" &&
                    "Congratulations! Your community has been verified. You can now start publishing activities."}
                  {verificationStatus === "rejected" &&
                    "Please review the feedback sent to your email and resubmit your registration."}
                </p>

                <div className="bg-secondary/50 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-foreground mb-4">What happens next?</h3>
                  <ul className="text-left space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Our team will review your registration within 2-3 business days</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>You will receive an email notification about your registration status</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Once approved, you can start creating activities and accepting volunteers</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/">Return to Home</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/activities">Browse Activities</Link>
                  </Button>
                </div>

                {/* Demo buttons to show different states */}
                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">Demo: View different status states</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVerificationStatus("pending")}
                      className={verificationStatus === "pending" ? "ring-2 ring-primary" : ""}
                    >
                      Pending
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVerificationStatus("verified")}
                      className={verificationStatus === "verified" ? "ring-2 ring-primary" : ""}
                    >
                      Verified
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVerificationStatus("rejected")}
                      className={verificationStatus === "rejected" ? "ring-2 ring-primary" : ""}
                    >
                      Rejected
                    </Button>
                  </div>
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
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
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
            Join SinergiLaut as a Conservation Community
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
            Register your organization to start publishing activities, managing volunteers, and accepting donations
          </p>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-border hidden sm:block" />
              <div
                className="absolute top-6 left-0 h-0.5 bg-primary transition-all duration-300 hidden sm:block"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step) => {
                const Icon = step.icon
                const isActive = step.id === currentStep
                const isCompleted = step.id < currentStep

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg scale-110"
                          : isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-muted-foreground border-2 border-border"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium hidden sm:block ${
                        isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
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
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Basic Information</h2>
                    <p className="text-muted-foreground">
                      Tell us about your conservation community or organization
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Community Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="e.g., Ocean Guardians Indonesia"
                        value={formData.communityName}
                        onChange={(e) => handleInputChange("communityName", e.target.value)}
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Short Description <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        placeholder="Describe your community's mission and activities (max 500 characters)"
                        value={formData.shortDescription}
                        onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.shortDescription.length}/500 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Community Logo
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
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG up to 2MB
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Info */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Contact Information</h2>
                    <p className="text-muted-foreground">
                      Provide contact details for your community administrator
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Admin Name <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="Full name of the administrator"
                          value={formData.adminName}
                          onChange={(e) => handleInputChange("adminName", e.target.value)}
                          className="h-12 pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address <span className="text-destructive">*</span>
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
                        Phone Number <span className="text-destructive">*</span>
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
                          Confirm Password <span className="text-destructive">*</span>
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
                        Social Media (Optional)
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

              {/* Step 3: Location & Coverage */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Location & Coverage</h2>
                    <p className="text-muted-foreground">
                      Specify your operational area and types of activities
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Region <span className="text-destructive">*</span>
                      </label>
                      <Select
                        value={formData.region}
                        onValueChange={(value) => handleInputChange("region", value)}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select your operational region" />
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
                        Operational Area Details
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <Textarea
                          placeholder="Describe specific locations where your community operates (cities, coastal areas, marine parks, etc.)"
                          value={formData.operationalArea}
                          onChange={(e) => handleInputChange("operationalArea", e.target.value)}
                          rows={3}
                          className="pl-10 pt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Types of Activities <span className="text-destructive">*</span>
                      </label>
                      <p className="text-xs text-muted-foreground mb-4">
                        Select all activities your community participates in
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

              {/* Step 4: Documents */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Legal Documents</h2>
                    <p className="text-muted-foreground">
                      Upload supporting documents (optional but recommended)
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
                          Upload Legal Documents
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Organization registration, certificates, permits, or other official documents
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
                        Recommended Documents:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>- Organization registration certificate</li>
                        <li>- NPO/NGO status proof (if applicable)</li>
                        <li>- Activity permits or licenses</li>
                        <li>- Previous activity reports or portfolios</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Submit */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Review & Submit</h2>
                    <p className="text-muted-foreground">
                      Review your information and submit your registration
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="space-y-4">
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <h3 className="font-semibold text-foreground mb-3">Registration Summary</h3>
                      <div className="grid gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Community Name:</span>
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
                          <span className="text-muted-foreground">Region:</span>
                          <span className="font-medium text-foreground">{formData.region || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Activities:</span>
                          <span className="font-medium text-foreground">
                            {formData.selectedActivities.length} selected
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Documents:</span>
                          <span className="font-medium text-foreground">
                            {formData.legalDocuments.length} uploaded
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verification Note */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground mb-1">Verification Process</p>
                          <p className="text-sm text-muted-foreground">
                            Your registration will be reviewed by the platform admin. You will receive a
                            confirmation email when approved. This process typically takes 2-3 business days.
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
                        I agree to the{" "}
                        <Link href="#" className="text-primary hover:underline">
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                        . I confirm that all information provided is accurate and that I am authorized to
                        register this community on SinergiLaut.
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentStep < 5 ? (
                  <Button onClick={nextStep} disabled={!canProceed()} className="gap-2">
                    Next
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
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
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
