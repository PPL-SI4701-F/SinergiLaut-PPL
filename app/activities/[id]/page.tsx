"use client"

/**
 * Halaman Detail Kegiatan
 * - Data diambil dari Supabase berdasarkan params.id
 * - Form Relawan terhubung ke volunteer_registrations
 * - Form Donasi Uang terhubung ke Midtrans Snap
 * - Form Donasi Barang terhubung ke donations + donation_items
 */

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Calendar, MapPin, Users, Heart, Package, ArrowLeft,
  CheckCircle2, Banknote, Star, Shield, FileText, Loader2,
  AlertCircle, Phone, QrCode, CreditCard, ChevronRight, Clock,
  ShieldAlert
} from "lucide-react"
import { formatCurrency, calcPercentage, formatDate } from "@/lib/utils/helpers"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { registerVolunteer } from "@/lib/actions/volunteer.actions"
import { createMoneyDonation, createItemDonation } from "@/lib/actions/donation.actions"
import { submitFeedback, getMyFeedback } from "@/lib/actions/feedback.actions"
import type { Activity, VolunteerRegistration, Donation } from "@/lib/types"

const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-secondary animate-pulse rounded-xl flex items-center justify-center text-muted-foreground">Memuat peta...</div>
})

type TabType = "detail" | "volunteer" | "donate" | "items" | "reports" | "feedback"

const MARKUP_PERCENT = 10 // 10% markup on item prices
/** Calculate marked-up price using integer math to avoid floating point errors */
function calcMarkup(basePrice: number): number {
  return Math.round(basePrice * (100 + MARKUP_PERCENT) / 100)
}
const SKILLS_OPTIONS = ["Fotografi / Videografi", "Medis / P3K", "Logistik", "Navigasi Laut", "Menyelam (PADI)", "Bahasa Asing", "Memasak", "Pendidikan / Mengajar"]
const T_SHIRT_SIZES = ["S", "M", "L", "XL", "XXL"]

import { VolunteerManagementTab } from "@/components/activities/volunteer-management-tab"
import { ActivityDetailTab } from "@/components/activities/activity-detail-tab"


export default function ActivityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, isLoading: authLoading, isVolunteerVerified } = useAuth()
  const supabase = createClient()

  const [activity, setActivity] = useState<Activity & {
    community: { id: string; name: string; logo_url: string | null; is_verified: boolean }
    reports: { id: string; title: string; status: string; created_at: string }[]
    feedbacks: { id: string; rating: number; comment: string | null; created_at: string; user: { full_name: string | null } }[]
    items_needed: { item_name: string; target: number; donated: number; unit_price?: number }[]
  } | null>(null)
  const [isLoadingActivity, setIsLoadingActivity] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("detail")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alreadyRegistered, setAlreadyRegistered] = useState<VolunteerRegistration | null>(null)
  const [myDonations, setMyDonations] = useState<Donation[]>([])

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackHover, setFeedbackHover] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [existingFeedback, setExistingFeedback] = useState<{ id: string; rating: number; comment: string | null } | null>(null)

  // Volunteer form state (simplified: only name, age, phone)
  const [volunteerForm, setVolunteerForm] = useState({
    fullName: "", age: "", phone: "", agreed: false,
  })

  // Donation form state
  const [donateForm, setDonateForm] = useState({
    type: "money" as "money" | "fulfillment",
    amount: "", paymentMethod: "",
    donorName: "", donorEmail: "", note: "", isAnonymous: false,
  })
  // Fulfillment cart: index corresponds to items_needed index, value is quantity selected
  const [fulfillmentCart, setFulfillmentCart] = useState<number[]>([])

  // ── Payment Simulation State & Timer ──────────────────────
  const [paymentSim, setPaymentSim] = useState<{
    isOpen: boolean;
    step: "method" | "qr";
    amount: number;
    method: string;
    timeLeft: number;
    // ID donation yang sedang dalam proses pembayaran
    donationId: string | null;
    donationType: "money" | "fulfillment";
  }>({ isOpen: false, step: "method", amount: 0, method: "", timeLeft: 30, donationId: null, donationType: "money" })

  useEffect(() => {
    if (!paymentSim.isOpen || paymentSim.step !== "qr") return;
    
    if (paymentSim.timeLeft <= 0) {
      toast.error("Waktu pembayaran habis. Silakan diulang.");
      setPaymentSim(prev => ({ ...prev, isOpen: false }));
      setActiveTab("detail");
      router.refresh();
      return;
    }

    const timer = setInterval(() => {
      setPaymentSim(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentSim.isOpen, paymentSim.step, paymentSim.timeLeft, router]);

  const handlePaymentSuccess = async () => {
    toast.success("Pembayaran berhasil! 🎉 Donasi Anda telah dicatat.");
    setPaymentSim(prev => ({ ...prev, isOpen: false }));
    setActiveTab("detail");

    if (!activity || !paymentSim.donationId) return;

    try {
      if (paymentSim.donationType === "money") {
        // Tandai donasi uang sebagai 'completed' → trigger DB otomatis tambah funding_raised
        await supabase
          .from('donations')
          .update({ status: 'completed' })
          .eq('id', paymentSim.donationId);

        // Refresh funding_raised dari DB
        const { data: updated } = await supabase
          .from('activities')
          .select('funding_raised')
          .eq('id', activity.id)
          .single();
        if (updated) {
          setActivity(prev => prev ? { ...prev, funding_raised: updated.funding_raised } : prev);
        }
      } else {
        // Donasi barang: tandai sebagai completed + update items_needed di activities
        await supabase
          .from('donations')
          .update({ status: 'completed' })
          .eq('id', paymentSim.donationId);

        // Update items_needed dengan qty yang dipenuhi dari fulfillmentCart
        const updatedItems = activity.items_needed?.map((item, index) => ({
          ...item,
          donated: (item.donated || 0) + (fulfillmentCart[index] || 0)
        })) || [];

        const { error } = await supabase
          .from('activities')
          .update({ items_needed: updatedItems })
          .eq('id', activity.id);

        if (!error) {
          setActivity(prev => prev ? { ...prev, items_needed: updatedItems } : prev);
        }
      }
    } catch (err) {
      console.error('[handlePaymentSuccess] error:', err);
    }

    // Reset fulfillment cart
    setFulfillmentCart(prev => prev.map(() => 0));
  };

  // ── Fetch Activity ────────────────────────────────────────
  useEffect(() => {
    if (!params.id) return

    async function fetchActivity() {
      setIsLoadingActivity(true)

      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          community:communities(id, name, logo_url, is_verified),
          reports(id, title, status, created_at),
          feedbacks(id, rating, comment, created_at, user:profiles(full_name)),
          volunteer_registrations(*)
        `)
        .eq("id", params.id as string)
        .single()

      if (error || !data) {
        console.error("DEBUG fetchActivity - params.id:", params.id, "error:", error, "data:", data);
        toast.error("Kegiatan tidak ditemukan.")
        router.push("/activities")
        return
      }

      setActivity(data as typeof activity)
      setIsLoadingActivity(false)
    }

    fetchActivity()
  }, [params.id, router, supabase])

  // ── Pre-fill form jika sudah login ───────────────────────
  useEffect(() => {
    if (profile) {
      // Calculate age from date_of_birth
      let age = ""
      if (profile.date_of_birth) {
        const dob = new Date(profile.date_of_birth)
        const today = new Date()
        const calcAge = today.getFullYear() - dob.getFullYear()
        age = calcAge.toString()
      }
      setVolunteerForm(prev => ({
        ...prev,
        fullName: profile.full_name ?? "",
        phone: profile.phone ?? "",
        age,
      }))
      setDonateForm(prev => ({
        ...prev,
        donorName: profile.full_name ?? "",
        donorEmail: profile.email,
      }))
    }
  }, [profile])

  // ── Cek apakah sudah terdaftar sebagai relawan ────────────
  useEffect(() => {
    if (!user || !params.id) return

    async function checkRegistration() {
      const { data } = await supabase
        .from("volunteer_registrations")
        .select("*")
        .eq("activity_id", params.id as string)
        .eq("user_id", user!.id)
        .single()

      if (data) setAlreadyRegistered(data as VolunteerRegistration)
    }

    checkRegistration()
  }, [user, params.id, supabase])

  // ── Load existing feedback jika volunteer sudah attended ─────
  useEffect(() => {
    if (!user || !params.id) return
    if (alreadyRegistered?.status !== "attended") return

    async function loadFeedback() {
      const feedback = await getMyFeedback(params.id as string, user!.id)
      if (feedback) {
        setExistingFeedback(feedback)
        setFeedbackRating(feedback.rating)
        setFeedbackComment(feedback.comment ?? "")
      }
    }

    loadFeedback()
  }, [user, params.id, alreadyRegistered?.status])

  if (isLoadingActivity) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">Memuat data kegiatan...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!activity) return null

  const fundingPercent = calcPercentage(activity.funding_raised, activity.funding_goal)
  const volunteerPercent = calcPercentage(activity.volunteer_count, activity.volunteer_quota)
  
  const totalItemNeeded = activity.items_needed?.reduce((acc: number, cur: any) => acc + cur.target, 0) || 0;
  const totalItemDonated = activity.items_needed?.reduce((acc: number, cur: any) => acc + (cur.donated || 0), 0) || 0;
  const itemPercent = totalItemNeeded > 0 ? calcPercentage(totalItemDonated, totalItemNeeded) : 0;

  // Donation timeframe: 6 months from published/created date
  const publishedDateStr = activity.published_at || activity.created_at || new Date().toISOString();
  const publishedDate = new Date(publishedDateStr);
  const deadlineDate = new Date(publishedDate);
  deadlineDate.setMonth(deadlineDate.getMonth() + 6);
  
  const now = new Date();
  const timeDiff = deadlineDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));



  // ── Handle feedback submit ───────────────────────────────────
  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activity || !user) return
    if (feedbackRating === 0) { toast.error("Pilih rating bintang terlebih dahulu."); return }

    setIsSubmittingFeedback(true)
    const result = await submitFeedback({
      activityId: activity.id,
      userId: user.id,
      rating: feedbackRating,
      comment: feedbackComment.trim() || undefined,
    })

    if (result.success) {
      toast.success(existingFeedback ? "Ulasan berhasil diperbarui! ✅" : "Ulasan berhasil dikirim! ✅ Terima kasih atas ulasan Anda.")
      setExistingFeedback({ id: result.data.id, rating: feedbackRating, comment: feedbackComment || null })
      // Refresh feedbacks in activity state
      setActivity(prev => {
        if (!prev) return prev
        const filtered = (prev.feedbacks || []).filter((f: any) => f.user_id !== user.id)
        return {
          ...prev,
          feedbacks: [
            { id: result.data.id, rating: feedbackRating, comment: feedbackComment || null, created_at: new Date().toISOString(), user: { full_name: profile?.full_name ?? "Saya" } },
            ...filtered,
          ]
        }
      })
    } else {
      toast.error(result.error ?? "Gagal mengirim ulasan.")
    }
    setIsSubmittingFeedback(false)
  }

  // ── Handle volunteer submit ───────────────────────────────
  async function handleVolunteerSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activity) return
    if (!volunteerForm.agreed) { toast.error("Harap setujui syarat & ketentuan."); return }
    if (!user) { toast.error("Anda harus login terlebih dahulu."); router.push("/login"); return }
    if (!isVolunteerVerified) { toast.error("Data diri Anda belum diverifikasi. Silakan lengkapi di halaman profil."); return }
    if (alreadyRegistered) { toast.info(`Anda sudah terdaftar. Status: ${alreadyRegistered.status}`); return }

    if (!volunteerForm.age || parseInt(volunteerForm.age) < 15) { toast.error("Usia minimal 15 tahun."); return }

    setIsSubmitting(true)
    const result = await registerVolunteer({
      activityId: activity.id,
      userId: user.id,
      fullName: volunteerForm.fullName,
      email: profile?.email ?? "",
      phone: volunteerForm.phone,
      reason: `Umur: ${volunteerForm.age} tahun`,
      agreedToTerms: volunteerForm.agreed,
    })

    if (result.success) {
      toast.success("Pendaftaran berhasil! ✅ Tunggu konfirmasi dari pengelola kegiatan.")
      setAlreadyRegistered(result.data as VolunteerRegistration)
      setActiveTab("detail")
    } else {
      toast.error(result.error ?? "Gagal mendaftar. Silakan coba lagi.")
    }
    setIsSubmitting(false)
  }

  // ── Handle donate submit ──────────────────────────────────
  async function handleDonateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activity) return
    setIsSubmitting(true)

    if (donateForm.type === "money") {
      const amount = parseInt(donateForm.amount)
      if (!amount || amount < 1000) {
        toast.error("Minimal donasi adalah Rp 1.000.")
        setIsSubmitting(false)
        return
      }

      if (!donateForm.donorName && !donateForm.isAnonymous) {
        toast.error("Nama donatur wajib diisi.")
        setIsSubmitting(false)
        return
      }
      if (!donateForm.donorEmail) {
        toast.error("Email donatur wajib diisi.")
        setIsSubmitting(false)
        return
      }

      // Simpan record donasi uang ke DB dulu
      const result = await createMoneyDonation({
        activityId: activity.id,
        userId: user?.id ?? null,
        donorName: donateForm.donorName || "Donatur",
        donorEmail: donateForm.donorEmail,
        amount,
        note: donateForm.note || undefined,
        isAnonymous: donateForm.isAnonymous,
      })

      if (!result.success) {
        toast.error(result.error ?? "Gagal menyimpan donasi. Coba lagi.")
        setIsSubmitting(false)
        return
      }

      // Buka payment simulation dengan donationId tersimpan
      setTimeout(() => {
        setPaymentSim({
          isOpen: true,
          step: "method",
          amount,
          method: "",
          timeLeft: 30,
          donationId: result.donationId!,
          donationType: "money",
        });
        setIsSubmitting(false);
      }, 300);

    } else {
      // Fulfillment barang
      if (!activity.items_needed || !fulfillmentCart.some(q => q > 0)) {
        toast.error("Pilih minimal 1 barang untuk di-fulfill.")
        setIsSubmitting(false)
        return
      }

      if (!donateForm.donorName && !donateForm.isAnonymous) {
        toast.error("Nama donatur wajib diisi.")
        setIsSubmitting(false)
        return
      }
      if (!donateForm.donorEmail) {
        toast.error("Email donatur wajib diisi.")
        setIsSubmitting(false)
        return
      }

      // Hitung total pembayaran
      const totalAmount = activity.items_needed.reduce((sum, item, index) => {
        const qty = fulfillmentCart[index] || 0
        const markedUpPrice = calcMarkup(item.unit_price || 0)
        return sum + (markedUpPrice * qty)
      }, 0)

      if (totalAmount <= 0) {
        toast.error("Total pembayaran tidak valid.")
        setIsSubmitting(false)
        return
      }

      // Siapkan items untuk disimpan
      const itemsToSave = activity.items_needed
        .map((item, index) => ({
          itemName: item.item_name,
          quantity: fulfillmentCart[index] || 0,
          itemCondition: "new" as const,
        }))
        .filter(item => item.quantity > 0)

      // Simpan record donasi barang ke DB
      const result = await createItemDonation({
        activityId: activity.id,
        userId: user?.id ?? null,
        donorName: donateForm.donorName || "Donatur",
        donorEmail: donateForm.donorEmail,
        note: donateForm.note || undefined,
        isAnonymous: donateForm.isAnonymous,
        items: itemsToSave,
      })

      if (!result.success) {
        toast.error(result.error ?? "Gagal menyimpan donasi barang. Coba lagi.")
        setIsSubmitting(false)
        return
      }

      // Buka payment simulation
      setTimeout(() => {
        setPaymentSim({
          isOpen: true,
          step: "method",
          amount: totalAmount,
          method: "",
          timeLeft: 30,
          donationId: result.donationId!,
          donationType: "fulfillment",
        });
        setIsSubmitting(false);
      }, 300);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-16">
        {/* Breadcrumb / Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <Button variant="outline" size="sm" className="gap-2 text-foreground hover:bg-secondary" asChild>
            <Link href="/activities">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Kegiatan
            </Link>
          </Button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Main Content ─────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cover */}
              <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-secondary">
                {activity.cover_image_url ? (
                  <Image src={activity.cover_image_url} alt={activity.title} fill className="object-cover" priority />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <FileText className="h-16 w-16 opacity-20" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-accent text-accent-foreground capitalize">{activity.category}</Badge>
                  <Badge className={activity.status === "published" ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"}>
                    {activity.status === "published" ? "Aktif" : activity.status}
                  </Badge>
                </div>
              </div>

              {/* Community + Title */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {activity.community?.logo_url && (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image src={activity.community.logo_url} alt={activity.community.name} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Diselenggarakan oleh</p>
                    <div className="flex items-center gap-1">
                      <Link href={`/community/${activity.community?.id}`} className="text-sm font-medium hover:text-primary">
                        {activity.community?.name}
                      </Link>
                      {activity.community?.is_verified && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-foreground">{activity.title}</h1>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { id: "detail", label: "Detail" } as const,
                  { id: "volunteer", label: profile?.role === "community" ? "Kelola Relawan" : "Daftar Relawan" } as const,
                  ...(profile?.role === "community" && activity.items_needed && activity.items_needed.length > 0 ? [{ id: "items", label: "Kelola Barang" } as const] : []),
                  ...(profile?.role !== "community" ? [{ id: "donate", label: "Donasi" } as const] : []),
                  { id: "reports", label: "Laporan" } as const,
                  { id: "feedback", label: "Ulasan" } as const,
                ].map((tab) => (
                  <Button key={tab.id} variant={activeTab === tab.id ? "default" : "outline"} size="sm"
                    onClick={() => setActiveTab(tab.id as TabType)}>
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* ── Tab: Detail ──────────────────────────────── */}
              {activeTab === "detail" && (
                <ActivityDetailTab activity={activity} />
              )}

              {/* ── Tab: Volunteer ──────────────────────────── */}
              {activeTab === "volunteer" && (
                profile?.role === "community" ? (
                  /* ── Community View: Kelola Relawan ── */
                  <VolunteerManagementTab activity={activity} volunteerPercent={volunteerPercent} setActivity={setActivity} />
                ) : (
                  /* ── User View: Daftar Relawan Form ── */
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Daftar Sebagai Relawan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!user && !authLoading ? (
                        <div className="text-center py-8">
                          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground mb-4">Anda harus login untuk mendaftar sebagai relawan.</p>
                          <Button asChild><Link href="/login">Login Sekarang</Link></Button>
                        </div>
                      ) : !isVolunteerVerified && profile?.role === "user" ? (
                        /* ── GATING: Belum Verified ── */
                        <div className="text-center py-8">
                          <ShieldAlert className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                          <p className="font-semibold text-foreground mb-1">Data Diri Belum Diverifikasi</p>
                          <p className="text-muted-foreground text-sm mb-4">
                            {profile?.volunteer_status === "pending" && profile?.nik
                              ? "Data diri Anda sedang direview oleh admin. Harap tunggu."
                              : "Silahkan lengkapi data diri di profil untuk mendaftar sebagai relawan."}
                          </p>
                          {profile?.volunteer_status === "rejected" && profile?.volunteer_reject_note && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm text-red-600">
                              Alasan penolakan: {profile.volunteer_reject_note}
                            </div>
                          )}
                          <Button asChild>
                            <Link href="/user/profile">
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              {profile?.volunteer_status === "rejected" ? "Perbaiki Data Diri" : "Lengkapi Data Diri"}
                            </Link>
                          </Button>
                        </div>
                      ) : alreadyRegistered ? (
                        <div className="text-center py-8">
                          <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                          <p className="font-semibold text-foreground mb-1">Anda Sudah Terdaftar!</p>
                          <p className="text-muted-foreground text-sm mb-3">
                            Status pendaftaran Anda: <Badge className={
                              alreadyRegistered.status === "approved" ? "bg-green-100 text-green-700" :
                              alreadyRegistered.status === "rejected" ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            }>{alreadyRegistered.status}</Badge>
                          </p>
                          {alreadyRegistered.status === "pending" && (
                            <p className="text-xs text-muted-foreground">Pengelola sedang mereview pendaftaran Anda.</p>
                          )}
                        </div>
                      ) : (
                        <form onSubmit={handleVolunteerSubmit} className="space-y-5">
                          {/* Simplified form: Nama, Umur, No. Telp */}
                          <div>
                            <h4 className="font-medium text-foreground mb-3 text-sm uppercase tracking-wide">Data Kontak</h4>
                            <div className="grid sm:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Nama Lengkap *</Label>
                                <Input value={volunteerForm.fullName} onChange={e => setVolunteerForm({ ...volunteerForm, fullName: e.target.value })} required placeholder="Nama lengkap" />
                              </div>
                              <div className="space-y-2">
                                <Label>Umur *</Label>
                                <Input type="number" min={15} max={100} value={volunteerForm.age} onChange={e => setVolunteerForm({ ...volunteerForm, age: e.target.value })} required placeholder="Umur (tahun)" />
                              </div>
                              <div className="space-y-2">
                                <Label>No. Telepon *</Label>
                                <Input type="tel" value={volunteerForm.phone} onChange={e => setVolunteerForm({ ...volunteerForm, phone: e.target.value })} required placeholder="+62 8xx xxxx xxxx" />
                              </div>
                            </div>
                          </div>

                          {/* Persetujuan */}
                          <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
                            <input id="agreed" type="checkbox" checked={volunteerForm.agreed} onChange={e => setVolunteerForm({ ...volunteerForm, agreed: e.target.checked })} className="mt-1 w-4 h-4 accent-primary" />
                            <Label htmlFor="agreed" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                              Saya menyetujui <Link href="/faq" className="text-primary hover:underline">syarat & ketentuan</Link> SinergiLaut, bersedia mengikuti arahan panitia kegiatan, dan menjamin kebenaran data yang diisi.
                            </Label>
                          </div>

                          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !volunteerForm.agreed}>
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mendaftar...</> : "Daftar Sebagai Relawan"}
                          </Button>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                )
              )}

              {/* ── Tab: Kelola Barang (Community Only) ──────────────── */}
              {activeTab === "items" && profile?.role === "community" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Kelola Barang (Fulfillment)</CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">Pantau progres pengumpulan barang yang diajukan.</div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activity.items_needed?.map((item: any, idx: number) => {
                        const prog = item.target > 0 ? calcPercentage(item.donated || 0, item.target) : 0;
                        return (
                          <div key={idx} className="p-4 border border-border rounded-xl bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-foreground text-sm mb-1">{item.item_name}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${prog}%` }} />
                                </div>
                                <span className="text-xs font-medium w-9 text-right text-muted-foreground">{prog}%</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Terkumpul {item.donated || 0} dari {item.target} unit</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground mb-0.5">Harga per unit</p>
                              <p className="text-sm font-medium">{formatCurrency(item.unit_price)}</p>
                            </div>
                          </div>
                        );
                      })}
                      {(!activity.items_needed || activity.items_needed.length === 0) && (
                        <div className="text-center py-6">
                          <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                          <p className="text-sm text-muted-foreground">Kegiatan ini tidak membutuhkan pengumpulan barang.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ── Tab: Donate Form ─────────────────────────── */}
              {activeTab === "donate" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" /> Donasi untuk Kegiatan Ini</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Type Selector */}
                    <div className="flex gap-2 mb-6">
                      <Button variant={donateForm.type === "money" ? "default" : "outline"} size="sm" onClick={() => setDonateForm({ ...donateForm, type: "money" })}>
                        <Banknote className="h-4 w-4 mr-2" /> Donasi Uang
                      </Button>
                      {activity.allow_item_donation && activity.items_needed && activity.items_needed.length > 0 && (
                        <Button variant={donateForm.type === "fulfillment" ? "default" : "outline"} size="sm" onClick={() => {
                          setDonateForm({ ...donateForm, type: "fulfillment" })
                          if (fulfillmentCart.length === 0 && activity.items_needed) {
                            setFulfillmentCart(new Array(activity.items_needed.length).fill(0))
                          }
                        }}>
                          <Package className="h-4 w-4 mr-2" /> Fulfillment Barang
                        </Button>
                      )}
                    </div>

                    <form onSubmit={handleDonateSubmit} className="space-y-5">
                      {/* Identitas Donatur */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nama Donatur {donateForm.isAnonymous ? "(anonim)" : "*"}</Label>
                          <Input value={donateForm.donorName} onChange={e => setDonateForm({ ...donateForm, donorName: e.target.value })}
                            required={!donateForm.isAnonymous} disabled={donateForm.isAnonymous} placeholder="Nama Anda" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input type="email" value={donateForm.donorEmail} onChange={e => setDonateForm({ ...donateForm, donorEmail: e.target.value })} required placeholder="email@example.com" />
                        </div>
                      </div>

                      {/* ─── Form Donasi Uang ─── */}
                      {donateForm.type === "money" && (
                        <>
                          <div className="space-y-2">
                            <Label>Nominal Donasi (IDR) *</Label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
                              {[25000, 50000, 100000, 250000, 500000].map(amt => (
                                <button key={amt} type="button"
                                  onClick={() => setDonateForm({ ...donateForm, amount: amt.toString() })}
                                  className={`p-2.5 rounded-lg border-2 text-center text-xs transition-all ${donateForm.amount === amt.toString() ? "border-primary bg-primary/5 font-semibold" : "border-border hover:border-primary/50"}`}>
                                  {formatCurrency(amt)}
                                </button>
                              ))}
                            </div>
                            <Input type="number" min={1000} value={donateForm.amount}
                              onChange={e => setDonateForm({ ...donateForm, amount: e.target.value })}
                              placeholder="Atau masukkan nominal lain (min. Rp 1.000)" />
                          </div>

                          {/* Info pembayaran Simulasi */}
                          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">💳 Simulasi Payment Gateway</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              Setelah submit, Anda akan dialihkan ke modul simulasi pembayaran (termasuk generasi QRIS dan hitung mundur 30 detik).
                            </p>
                          </div>
                        </>
                      )}

                      {/* ─── Form Fulfillment Barang ─── */}
                      {donateForm.type === "fulfillment" && activity.items_needed && activity.items_needed.length > 0 && (
                        <div className="space-y-4">
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg mb-2">
                            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">📦 Fulfillment Barang Kegiatan</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">
                              Pilih barang yang ingin Anda belikan untuk kegiatan ini. Harga sudah termasuk biaya operasional ({MARKUP_PERCENT}%). Pembayaran menggunakan simulasi payment gateway.
                            </p>
                          </div>

                          <div className="space-y-3">
                            {activity.items_needed.map((item, index) => {
                              const remaining = item.target - item.donated
                              const markedUpPrice = calcMarkup(item.unit_price || 0)
                              const qty = fulfillmentCart[index] || 0
                              const isMaxed = remaining <= 0

                              return (
                                <div key={index} className={`p-4 border rounded-xl transition-all ${qty > 0 ? "border-primary bg-primary/5" : "border-border bg-secondary/30"} ${isMaxed ? "opacity-50" : ""}`}>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-sm text-foreground">{item.item_name}</h4>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-muted-foreground">
                                          Dibutuhkan: <strong>{item.target}</strong> — Terpenuhi: <strong>{item.donated}</strong> — Sisa: <strong className="text-primary">{remaining > 0 ? remaining : 0}</strong>
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs line-through text-muted-foreground">{formatCurrency(item.unit_price || 0)}</span>
                                        <span className="text-sm font-bold text-primary">{formatCurrency(markedUpPrice)}</span>
                                        <Badge variant="secondary" className="text-[10px] py-0">+{MARKUP_PERCENT}%</Badge>
                                      </div>
                                    </div>

                                    {!isMaxed && (
                                      <div className="flex items-center gap-2 shrink-0">
                                        <button type="button" onClick={() => {
                                          const newCart = [...fulfillmentCart]
                                          newCart[index] = Math.max(0, (newCart[index] || 0) - 1)
                                          setFulfillmentCart(newCart)
                                        }} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-lg font-bold hover:bg-secondary transition-colors disabled:opacity-30" disabled={qty <= 0}>
                                          −
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold">{qty}</span>
                                        <button type="button" onClick={() => {
                                          const newCart = [...fulfillmentCart]
                                          newCart[index] = Math.min(remaining, (newCart[index] || 0) + 1)
                                          setFulfillmentCart(newCart)
                                        }} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-lg font-bold hover:bg-secondary transition-colors disabled:opacity-30" disabled={qty >= remaining}>
                                          +
                                        </button>
                                      </div>
                                    )}
                                    {isMaxed && (
                                      <Badge className="bg-green-100 text-green-700 shrink-0">Terpenuhi ✓</Badge>
                                    )}
                                  </div>

                                  {/* Progress bar */}
                                  <div className="mt-3">
                                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, ((item.donated + qty) / item.target) * 100)}%` }} />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Cart Summary */}
                          {fulfillmentCart.some(q => q > 0) && (
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                              <h4 className="font-semibold text-sm text-foreground mb-2">Ringkasan Belanja</h4>
                              {activity.items_needed.map((item, index) => {
                                const qty = fulfillmentCart[index] || 0
                                if (qty === 0) return null
                                const markedUpPrice = calcMarkup(item.unit_price || 0)
                                return (
                                  <div key={index} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{item.item_name} × {qty}</span>
                                    <span className="font-medium">{formatCurrency(markedUpPrice * qty)}</span>
                                  </div>
                                )
                              })}
                              <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold">
                                <span>Total</span>
                                <span className="text-primary">{formatCurrency(
                                  activity.items_needed.reduce((sum, item, index) => {
                                    const qty = fulfillmentCart[index] || 0
                                    const markedUpPrice = calcMarkup(item.unit_price || 0)
                                    return sum + (markedUpPrice * qty)
                                  }, 0)
                                )}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Catatan */}
                      <div className="space-y-2">
                        <Label>Pesan / Catatan (opsional)</Label>
                        <Textarea value={donateForm.note} onChange={e => setDonateForm({ ...donateForm, note: e.target.value })} rows={2} placeholder="Pesan untuk pengelola kegiatan..." />
                      </div>

                      {/* Anonim toggle */}
                      <div className="flex items-center gap-2">
                        <input id="anon" type="checkbox" checked={donateForm.isAnonymous} onChange={e => setDonateForm({ ...donateForm, isAnonymous: e.target.checked })} className="w-4 h-4 accent-primary" />
                        <Label htmlFor="anon" className="text-sm text-muted-foreground cursor-pointer">Sembunyikan nama saya (donasi anonim)</Label>
                      </div>

                      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || (donateForm.type === "fulfillment" && !fulfillmentCart.some(q => q > 0))}>
                        {isSubmitting
                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</>
                          : donateForm.type === "money"
                            ? <><Banknote className="mr-2 h-4 w-4" />Bayar {donateForm.amount ? formatCurrency(parseInt(donateForm.amount) || 0) : "Sekarang"}</>
                            : <><Package className="mr-2 h-4 w-4" />Bayar Fulfillment {formatCurrency(
                                (activity?.items_needed || []).reduce((sum, item, index) => {
                                  const qty = fulfillmentCart[index] || 0
                                  const markedUpPrice = calcMarkup(item.unit_price || 0)
                                  return sum + (markedUpPrice * qty)
                                }, 0)
                              )}</>
                        }
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* ── Tab: Reports ─────────────────────────────── */}
              {activeTab === "reports" && (
                <div className="space-y-4">
                  {activity.reports?.length === 0 ? (
                    <Card><CardContent className="p-12 text-center text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-3 opacity-40" />Belum ada laporan untuk kegiatan ini.
                    </CardContent></Card>
                  ) : activity.reports?.map(r => (
                    <Card key={r.id}>
                      <CardContent className="p-6 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{r.title}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(r.created_at)}</p>
                        </div>
                        <Badge className={r.status === "validated" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                          {r.status === "validated" ? "Tervalidasi" : r.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* ── Tab: Feedback ────────────────────────────── */}
              {activeTab === "feedback" && (
                <div className="space-y-4">

                  {/* ── Form Ulasan (hanya untuk volunteer attended) ── */}
                  {user && alreadyRegistered?.status === "attended" && (
                    <Card className="border-2 border-primary/20 bg-primary/5">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Star className="h-5 w-5 text-yellow-500" />
                          {existingFeedback ? "Edit Ulasan Anda" : "Berikan Ulasan Anda"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Anda telah menghadiri kegiatan ini. Bagikan pengalaman Anda untuk membantu komunitas berkembang!
                        </p>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                          {/* Rating Bintang Interaktif */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Rating Kegiatan *</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setFeedbackRating(star)}
                                  onMouseEnter={() => setFeedbackHover(star)}
                                  onMouseLeave={() => setFeedbackHover(0)}
                                  className="p-0.5 transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`h-8 w-8 transition-colors ${
                                      star <= (feedbackHover || feedbackRating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground/30"
                                    }`}
                                  />
                                </button>
                              ))}
                              {feedbackRating > 0 && (
                                <span className="ml-2 self-center text-sm font-medium text-muted-foreground">
                                  {feedbackRating === 1 ? "Sangat Kurang" :
                                   feedbackRating === 2 ? "Kurang" :
                                   feedbackRating === 3 ? "Cukup" :
                                   feedbackRating === 4 ? "Bagus" : "Sangat Bagus! 🌟"}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Komentar */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Komentar <span className="text-muted-foreground font-normal">(opsional)</span></label>
                            <Textarea
                              value={feedbackComment}
                              onChange={e => setFeedbackComment(e.target.value)}
                              rows={4}
                              placeholder="Ceritakan pengalaman Anda mengikuti kegiatan ini..."
                              className="resize-none"
                            />
                          </div>

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmittingFeedback || feedbackRating === 0}
                          >
                            {isSubmittingFeedback
                              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengirim...</>
                              : existingFeedback
                              ? <><Star className="mr-2 h-4 w-4" />Perbarui Ulasan</>
                              : <><Star className="mr-2 h-4 w-4" />Kirim Ulasan</>}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Info: user login tapi status bukan attended */}
                  {user && alreadyRegistered && alreadyRegistered.status !== "attended" && (
                    <Card className="border border-dashed">
                      <CardContent className="p-6 text-center">
                        <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                        <p className="font-medium text-foreground text-sm mb-1">Belum Bisa Memberikan Ulasan</p>
                        <p className="text-xs text-muted-foreground">
                          Ulasan hanya dapat diberikan setelah pengelola kegiatan menandai kehadiran Anda.
                          Status pendaftaran Anda saat ini: <strong>{alreadyRegistered.status}</strong>.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Info: user belum daftar sama sekali */}
                  {user && !alreadyRegistered && (
                    <Card className="border border-dashed">
                      <CardContent className="p-6 text-center">
                        <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                        <p className="text-sm text-muted-foreground">
                          Hanya relawan yang telah menghadiri kegiatan ini yang dapat memberikan ulasan.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Info: belum login */}
                  {!user && (
                    <Card className="border border-dashed">
                      <CardContent className="p-6 text-center">
                        <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Login untuk melihat apakah Anda bisa memberikan ulasan.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* ── Daftar Ulasan ── */}
                  {activity.feedbacks?.length === 0 ? (
                    <Card><CardContent className="p-8 text-center text-muted-foreground">
                      <Star className="h-8 w-8 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">Belum ada ulasan untuk kegiatan ini.</p>
                    </CardContent></Card>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {activity.feedbacks?.length} Ulasan
                      </h3>
                      {activity.feedbacks?.map(f => (
                        <Card key={f.id}>
                          <CardContent className="p-5">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                                {(f.user?.full_name ?? "U")[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-medium text-sm text-foreground truncate">{f.user?.full_name ?? "Pengguna"}</span>
                                  <div className="flex gap-0.5 flex-shrink-0">
                                    {[1,2,3,4,5].map(s => (
                                      <Star key={s} className={`h-3.5 w-3.5 ${s <= f.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`} />
                                    ))}
                                  </div>
                                </div>
                                {f.comment && <p className="text-sm text-muted-foreground leading-relaxed">{f.comment}</p>}
                                <p className="text-xs text-muted-foreground mt-1.5">{formatDate(f.created_at)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Sidebar ──────────────────────────────────── */}
            <div className="space-y-6">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="text-lg">Progres Kegiatan</CardTitle>
                  <div className="flex items-center gap-1.5 mt-1 text-sm bg-orange-50 dark:bg-orange-950/30 p-2 rounded-md border border-orange-100 dark:border-orange-900/50">
                    <Clock className={`h-4 w-4 ${daysLeft > 0 ? "text-orange-500" : "text-red-500"}`} />
                    {daysLeft > 0 ? (
                      <span className="text-orange-600 dark:text-orange-400 font-medium tracking-tight">Sisa waktu pengumpulan: {daysLeft} hari lagi</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 font-medium tracking-tight">Batas waktu pengumpulan habis</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground flex items-center gap-1"><Banknote className="h-4 w-4" /> Dana Terkumpul</span>
                      <span className="font-semibold text-foreground">{fundingPercent}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${fundingPercent}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(activity.funding_raised)} dari {formatCurrency(activity.funding_goal)}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground flex items-center gap-1"><Users className="h-4 w-4" /> Relawan</span>
                      <span className="font-semibold text-foreground">{volunteerPercent}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${volunteerPercent}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.volunteer_count} dari {activity.volunteer_quota} slot terisi
                    </p>
                  </div>

                  {totalItemNeeded > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground flex items-center gap-1"><Package className="h-4 w-4" /> Barang</span>
                        <span className="font-semibold text-foreground">{itemPercent}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${itemPercent}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {totalItemDonated} dari {totalItemNeeded} barang terkumpul
                      </p>
                    </div>
                  )}

                  {profile?.role !== "community" && (
                  <div className="space-y-3 pt-2">
                    {/* Gated volunteer button */}
                    {!isVolunteerVerified && profile?.role === "user" ? (
                      <div>
                        <Button className="w-full" variant="outline" disabled>
                          <Users className="mr-2 h-4 w-4" /> Daftar Relawan
                        </Button>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1.5 flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3 flex-shrink-0" />
                          <Link href="/user/profile" className="hover:underline">Silahkan lengkapi data diri di profil</Link>
                        </p>
                      </div>
                    ) : (
                      <Button className="w-full" onClick={() => setActiveTab("volunteer")} disabled={alreadyRegistered != null}>
                        <Users className="mr-2 h-4 w-4" />
                        {alreadyRegistered ? `Terdaftar (${alreadyRegistered.status})` : "Daftar Relawan"}
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("donate")}>
                      <Heart className="mr-2 h-4 w-4" /> Donasi Sekarang
                    </Button>
                  </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Gateway Simulation Dialog */}
      <Dialog open={paymentSim.isOpen} onOpenChange={(open) => !open && setPaymentSim(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentSim.step === "method" ? "Pilih Metode Pembayaran" : "Selesaikan Pembayaran"}
            </DialogTitle>
            <DialogDescription>
              {paymentSim.step === "method" 
                ? "Pilih metode yang ingin Anda gunakan untuk donasi." 
                : "Silakan scan QR Code di bawah untuk menyelesaikan pembayaran."}
            </DialogDescription>
          </DialogHeader>

          {paymentSim.step === "method" ? (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center bg-secondary/50 p-4 rounded-lg">
                <span className="text-sm font-medium">Total Tagihan</span>
                <span className="font-bold text-primary">{formatCurrency(paymentSim.amount)}</span>
              </div>
              <div className="space-y-2">
                {["QRIS", "Transfer BCA", "GoPay", "OVO"].map(method => (
                  <button
                    key={method}
                    onClick={() => {
                      setPaymentSim(prev => ({ ...prev, step: "qr", method, timeLeft: 30 }));
                    }}
                    className="w-full flex items-center justify-between p-4 border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      {method === "QRIS" ? <QrCode className="h-6 w-6 text-muted-foreground" /> : <CreditCard className="h-6 w-6 text-muted-foreground" />}
                      <span className="font-medium text-sm">{method}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4 flex flex-col items-center text-center">
              <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-primary/50 flex items-center justify-center mx-auto" style={{ width: "220px", height: "220px" }}>
                <QrCode className="h-40 w-40 text-zinc-900" />
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Metode Pembayaran: <strong className="text-foreground">{paymentSim.method}</strong></p>
                <p className="text-3xl font-bold text-primary mb-2">{formatCurrency(paymentSim.amount)}</p>
                <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-bold mt-4 animate-pulse mx-auto inline-block">
                  Selesaikan dalam {Math.floor(paymentSim.timeLeft / 60)}:{(paymentSim.timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-3 mt-4">
                <Button variant="outline" className="w-full" onClick={() => setPaymentSim(prev => ({ ...prev, isOpen: false }))}>
                  Batal
                </Button>
                <Button className="w-full" onClick={handlePaymentSuccess}>
                  Submit (Simulasi Sukses)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
