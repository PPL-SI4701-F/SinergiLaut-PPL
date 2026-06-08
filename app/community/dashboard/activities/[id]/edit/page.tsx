"use client"

import { useState, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, MapPin, Image as ImageIcon, X, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  getActivityEditRequestStatus,
  getCommunityActivityForEdit,
  updateCommunityActivityAction,
} from "@/lib/actions/activity.actions"

// Import MapPicker dynamically to avoid SSR issues
const MapPicker = dynamic(() => import("@/components/map/map-picker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-secondary animate-pulse rounded-xl flex items-center justify-center text-muted-foreground">Memuat peta...</div>
})

export default function EditActivityPage() {
  const router = useRouter()
  const params = useParams()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // --- Form State ---
  const [form, setForm] = useState({
    title: "", // Read only for context
    description: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    cover_image_url: "" as string | null,
    status: "draft",
  })

  // --- Cover Image State ---
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return

    async function fetchActivity() {
      setIsLoading(true)
      const result = await getCommunityActivityForEdit(params.id as string)
      const data = result.data

      if (!result.success || !data) {
        toast.error(result.error ?? "Kegiatan tidak ditemukan.")
        router.back()
        return
      }

      if (data.status !== "draft") {
        if (data.status === "published") {
          const editRequest = await getActivityEditRequestStatus(params.id as string)
          if (editRequest.success && editRequest.data?.status === "approved") {
            setForm({
              title: data.title,
              description: data.description || "",
              location: data.location || "",
              latitude: data.latitude,
              longitude: data.longitude,
              cover_image_url: data.cover_image_url,
              status: data.status,
            })
            setImagePreview(data.cover_image_url)
            setIsLoading(false)
            return
          }
        }
        toast.error("Kegiatan yang sudah diajukan tidak dapat diedit.")
        router.replace("/community/dashboard")
        return
      }

      setForm({
        title: data.title,
        description: data.description || "",
        location: data.location || "",
        latitude: data.latitude,
        longitude: data.longitude,
        cover_image_url: data.cover_image_url,
        status: data.status,
      })
      setImagePreview(data.cover_image_url)
      setIsLoading(false)
    }

    fetchActivity()
  }, [params.id, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 2MB")
        return
      }
      setNewCoverFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append("activityId", params.id as string)
      formData.append("description", form.description)
      formData.append("location", form.location)
      if (form.latitude !== null) formData.append("latitude", String(form.latitude))
      if (form.longitude !== null) formData.append("longitude", String(form.longitude))
      if (newCoverFile) formData.append("coverImage", newCoverFile)

      const result = await updateCommunityActivityAction(formData)
      if (!result.success) throw new Error(result.error)

      toast.success("Kegiatan berhasil diperbarui!")
      router.push(`/community/dashboard`)
      return
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Gagal memperbarui kegiatan.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-slate-50">
      <main className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild className="rounded-full">
                <Link href="/community/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Edit Kegiatan</h1>
                <p className="text-sm text-muted-foreground">{form.title}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Thumbnail / Cover */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Thumbnail Kegiatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative aspect-video rounded-xl border-2 border-dashed border-border overflow-hidden group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-medium">Ganti Gambar</p>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
                      <p className="text-xs">Klik untuk unggah thumbnail</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Format: JPG, PNG, WEBP. Maksimal 2MB.</p>
              </CardContent>
            </Card>

            {/* Konten */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informasi Utama</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Kegiatan *</Label>
                  <Textarea 
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    placeholder="Jelaskan detail kegiatan..."
                    className="min-h-[150px] resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lokasi (Alamat Teks) *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="location"
                      value={form.location}
                      onChange={(e) => setForm({...form, location: e.target.value})}
                      placeholder="Contoh: Pantai Indah Kapuk, Jakarta"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Pin Lokasi di Peta</Label>
                  <MapPicker 
                    lat={form.latitude}
                    lng={form.longitude}
                    onChange={(lat, lng) => setForm({...form, latitude: lat, longitude: lng})}
                  />
                  {form.latitude && (
                    <p className="text-[10px] text-muted-foreground">
                      Koordinat: {form.latitude.toFixed(6)}, {form.longitude!.toFixed(6)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSaving}
              >
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                asChild
                disabled={isSaving}
              >
                <Link href="/community/dashboard">Batal</Link>
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
