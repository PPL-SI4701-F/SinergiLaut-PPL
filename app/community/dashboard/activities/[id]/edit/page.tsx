"use client"

import { useState, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2, MapPin, Image as ImageIcon, X, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// Import MapPicker dynamically to avoid SSR issues
const MapPicker = dynamic(() => import("@/components/map/map-picker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-secondary animate-pulse rounded-xl flex items-center justify-center text-muted-foreground">Memuat peta...</div>
})

export default function EditActivityPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  
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
  })

  // --- Cover Image State ---
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return

    async function fetchActivity() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("id", params.id as string)
        .single()

      if (error || !data) {
        toast.error("Kegiatan tidak ditemukan.")
        router.back()
        return
      }

      setForm({
        title: data.title,
        description: data.description || "",
        location: data.location || "",
        latitude: data.latitude,
        longitude: data.longitude,
        cover_image_url: data.cover_image_url,
      })
      setImagePreview(data.cover_image_url)
      setIsLoading(false)
    }

    fetchActivity()
  }, [params.id, router, supabase])

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
      let currentCoverUrl = form.cover_image_url

      // Upload new image if selected
      if (newCoverFile) {
        const fileExt = newCoverFile.name.split('.').pop()
        const fileName = `${params.id}/cover-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('activity-images')
          .upload(fileName, newCoverFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('activity-images')
          .getPublicUrl(fileName)
        
        currentCoverUrl = publicUrl
      }

      // Update Database
      const { error: updateError } = await supabase
        .from('activities')
        .update({
          description: form.description,
          location: form.location,
          latitude: form.latitude,
          longitude: form.longitude,
          cover_image_url: currentCoverUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id as string)

      if (updateError) throw updateError

      toast.success("Kegiatan berhasil diperbarui! ✅")
      router.push(`/community/dashboard`)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Gagal memperbarui kegiatan.")
    } finally {
      setIsSaving(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <main className="pt-20 pb-16">
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
