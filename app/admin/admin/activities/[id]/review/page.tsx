"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft, Loader2, Calendar, MapPin, Users, Banknote,
  Package, Receipt, CheckCircle2, X, ImageIcon, FileText,
  Shield, Building2, AlertTriangle, Info, ZoomIn
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/utils/helpers"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { approveActivityAction, rejectActivityAction } from "@/lib/actions/dashboard.actions"

const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-secondary animate-pulse rounded-xl flex items-center justify-center text-muted-foreground">Memuat peta...</div>
})

const MARKUP_PERCENT = 10

export default function AdminActivityReviewPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [activity, setActivity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rejectNote, setRejectNote] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return
    async function fetchActivity() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          community:communities(id, name, logo_url, is_verified, location, owner:profiles(full_name, email))
        `)
        .eq("id", params.id as string)
        .single()

      if (error || !data) {
        toast.error("Kegiatan tidak ditemukan.")
        router.push("/admin/dashboard")
        return
      }
      setActivity(data)
      setIsLoading(false)
    }
    fetchActivity()
  }, [params.id])

  const handleApprove = async () => {
    if (!activity) return
    setIsSubmitting(true)
    const result = await approveActivityAction(activity.id)
    if (result.success) {
      toast.success("Kegiatan berhasil dipublikasikan! ✅")
      router.push("/admin/dashboard?tab=activities")
    } else {
      toast.error(result.error ?? "Gagal menyetujui kegiatan.")
    }
    setIsSubmitting(false)
  }

  const handleReject = async () => {
    if (!activity) return
    if (!rejectNote.trim()) {
      toast.error("Harap isi catatan penolakan untuk komunitas.")
      return
    }
    setIsSubmitting(true)
    const result = await rejectActivityAction(activity.id)
    if (result.success) {
      toast.info("Kegiatan telah ditolak.")
      router.push("/admin/dashboard?tab=activities")
    } else {
      toast.error(result.error ?? "Gagal menolak kegiatan.")
    }
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">Memuat data kegiatan...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!activity) return null

  const items_needed: { item_name: string; target: number; unit_price: number; donated: number }[] =
    Array.isArray(activity.items_needed) ? activity.items_needed : []
  const receipt_urls: string[] = Array.isArray(activity.receipt_urls) ? activity.receipt_urls : []
  const totalEstimatedValue = items_needed.reduce((sum, item) => sum + item.unit_price * item.target, 0)
  const totalWithMarkup = Math.round(totalEstimatedValue * (100 + MARKUP_PERCENT) / 100)

  const statusColor: Record<string, string> = {
    pending_review: "bg-yellow-100 text-yellow-700",
    published: "bg-green-100 text-green-700",
    draft: "bg-secondary text-muted-foreground",
    rejected: "bg-red-100 text-red-700",
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="mb-6">
            <Link href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard Admin
            </Link>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-600 uppercase tracking-wide">Review Kegiatan</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">{activity.title}</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Diajukan oleh: <span className="font-medium">{activity.community?.name}</span>
                </p>
              </div>
              <Badge className={statusColor[activity.status] ?? "bg-secondary text-muted-foreground"}>
                {activity.status === "pending_review" ? "Menunggu Review" : activity.status}
              </Badge>
            </div>
          </div>

          <div className="space-y-6">
            {/* Komunitas Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Informasi Komunitas Pengaju
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nama Komunitas</p>
                  <p className="font-medium">{activity.community?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pemilik Akun</p>
                  <p className="font-medium">{activity.community?.owner?.full_name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{activity.community?.owner?.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Lokasi</p>
                  <p className="font-medium">{activity.community?.location ?? "—"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Informasi Dasar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Detail Kegiatan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tanggal Mulai</p>
                      <p className="font-medium">{formatDate(activity.start_date)}</p>
                    </div>
                  </div>
                  {activity.end_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Tanggal Selesai</p>
                        <p className="font-medium">{formatDate(activity.end_date)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Lokasi</p>
                      <p className="font-medium">{activity.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Kuota Relawan</p>
                      <p className="font-medium">{activity.volunteer_quota || "Tidak terbatas"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Banknote className="h-4 w-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Target Dana</p>
                      <p className="font-medium">{formatCurrency(activity.funding_goal || 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Donasi Barang</p>
                      <p className="font-medium">{activity.allow_item_donation ? "Diizinkan" : "Tidak"}</p>
                    </div>
                  </div>
                </div>

                {activity.latitude && activity.longitude && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Peta Lokasi
                    </p>
                    <MapView lat={Number(activity.latitude)} lng={Number(activity.longitude)} label={activity.title} />
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Kategori</p>
                  <Badge className="bg-primary/10 text-primary capitalize">{activity.category}</Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Deskripsi Kegiatan</p>
                  <div className="p-4 bg-secondary rounded-lg text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {activity.description}
                  </div>
                </div>

                {/* Cover Image */}
                {activity.cover_image_url && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5" /> Foto Sampul Kegiatan
                    </p>
                    <img
                      src={activity.cover_image_url}
                      alt="Cover kegiatan"
                      className="rounded-xl max-h-64 object-cover w-full cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setLightboxImg(activity.cover_image_url)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Item Donation Section */}
            {activity.allow_item_donation && (
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Package className="h-4 w-4" /> Daftar Barang yang Diperlukan
                  </CardTitle>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg mt-2">
                    <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Harga yang ditampilkan adalah harga asli dari komunitas. Donatur akan dikenakan harga dengan markup <strong>{MARKUP_PERCENT}% untuk biaya operasional SinergiLaut</strong>.
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  {items_needed.length > 0 ? (
                    <div className="space-y-3">
                      {items_needed.map((item, idx) => (
                        <div key={idx} className="p-4 border border-border rounded-xl bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-sm text-foreground">{item.item_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Jumlah dibutuhkan: <strong>{item.target} unit</strong>
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-muted-foreground">Harga asli / unit</p>
                            <p className="font-medium text-sm">{formatCurrency(item.unit_price)}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Setelah markup: <span className="font-semibold text-foreground">{formatCurrency(Math.round(item.unit_price * (100 + MARKUP_PERCENT) / 100))}</span>
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Total */}
                      <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">Total Estimasi Kebutuhan Barang</p>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Harga asli: <span className="line-through">{formatCurrency(totalEstimatedValue)}</span>
                          </p>
                          <p className="text-base font-bold text-foreground">
                            {formatCurrency(totalWithMarkup)}
                            <span className="text-xs font-normal text-muted-foreground ml-1">(termasuk markup {MARKUP_PERCENT}%)</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Package className="h-8 w-8 mx-auto opacity-30 mb-2" />
                      <p className="text-sm text-muted-foreground">Komunitas belum menambahkan daftar barang.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Foto Nota */}
            {activity.allow_item_donation && (
              <Card className={receipt_urls.length === 0 ? "border-red-200 dark:border-red-800" : "border-amber-200 dark:border-amber-800"}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="h-4 w-4" /> Foto Nota / Kwitansi Verifikasi
                  </CardTitle>
                  {receipt_urls.length === 0 && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg mt-2 border border-red-100 dark:border-red-900">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 dark:text-red-300">
                        <strong>Tidak ada foto nota diunggah.</strong> Komunitas ini mengaktifkan donasi barang tetapi tidak melampirkan bukti nota. Pertimbangkan untuk menolak dan meminta komunitas untuk mengunggah nota.
                      </p>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {receipt_urls.length > 0 ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-3">{receipt_urls.length} foto nota diunggah. Klik untuk memperbesar.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {receipt_urls.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-xl overflow-hidden border border-border group cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setLightboxImg(url)}
                          >
                            <img src={url} alt={`Nota ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                              <span className="text-white text-xs font-medium">Nota {idx + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Receipt className="h-10 w-10 mx-auto opacity-20 mb-3" />
                      <p className="text-sm text-muted-foreground">Tidak ada foto nota yang diunggah.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Panel */}
            {activity.status === "pending_review" && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" /> Keputusan Admin
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Kegiatan akan langsung dipublikasikan setelah disetujui. Comunity akan mendapatkan notifikasi.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Reject form */}
                  {showRejectForm && (
                    <div className="space-y-2 p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
                      <Label className="text-sm font-medium text-red-700 dark:text-red-300">
                        Catatan Penolakan *
                      </Label>
                      <Textarea
                        value={rejectNote}
                        onChange={e => setRejectNote(e.target.value)}
                        placeholder="Jelaskan alasan penolakan kepada komunitas. Contoh: Foto nota tidak terlampir, harga tidak sesuai, deskripsi kurang lengkap..."
                        rows={4}
                        className="border-red-200 dark:border-red-800"
                      />
                      <p className="text-xs text-muted-foreground">Catatan ini akan dikirim ke komunitas sebagai alasan penolakan.</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                      disabled={isSubmitting || showRejectForm}
                    >
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Setujui & Publikasikan
                    </Button>

                    {!showRejectForm ? (
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => setShowRejectForm(true)}
                        disabled={isSubmitting}
                      >
                        <X className="mr-2 h-4 w-4" /> Tolak Kegiatan
                      </Button>
                    ) : (
                      <div className="flex gap-2 flex-1">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => { setShowRejectForm(false); setRejectNote("") }}
                          disabled={isSubmitting}
                        >
                          Batal
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={handleReject}
                          disabled={isSubmitting || !rejectNote.trim()}
                        >
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                          Konfirmasi Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Already decided */}
            {activity.status !== "pending_review" && (
              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  {activity.status === "published" ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="font-medium text-foreground">Kegiatan ini sudah dipublikasikan.</p>
                    </>
                  ) : (
                    <>
                      <X className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="font-medium text-foreground">Kegiatan ini sudah ditolak.</p>
                    </>
                  )}
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/admin/dashboard">Kembali ke Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Lightbox */}
      <Dialog open={!!lightboxImg} onOpenChange={() => setLightboxImg(null)}>
        <DialogContent className="max-w-3xl p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>Foto Nota</DialogTitle>
          </DialogHeader>
          {lightboxImg && (
            <img src={lightboxImg} alt="Foto diperbesar" className="w-full h-auto rounded-lg max-h-[80vh] object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
