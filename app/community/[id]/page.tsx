import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Footer } from "@/components/footer"
import {
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  Heart,
  Activity,
  ArrowLeft,
  ArrowRight,
  Share2,
  ShieldAlert,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { formatDate, calcPercentage, formatCurrency } from "@/lib/utils/helpers"

export default async function CommunityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let isUser = false
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    isUser = profile?.role === "user"
  }

  const { data: community, error } = await supabase
    .from("communities")
    .select("*, activities(*)")
    .eq("id", id)
    .single()

  if (error) {
    console.error(error)
  }

  if (!community) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center text-muted-foreground p-4 text-center">
          <div>
            <Activity className="h-10 w-10 mx-auto opacity-30 mb-2" />
            <p>Komunitas tidak ditemukan atau telah dihapus.</p>
          </div>
        </main>
        {!isUser && <Footer />}
      </div>
    )
  }

  // Fallback defaults mapping to real Supabase fields
  const coverImage = community.cover_url || "/images/community-hero.jpg"
  const logoUrl = community.logo_url || "https://placehold.co/400x400/4f46e5/ffffff?text=" + encodeURIComponent(community.name.substring(0, 2))

  const allActs = community.activities || []
  const activeActs = allActs.filter((a: any) => a.status === "published" || a.status === "completed")
  const completedActs = allActs.filter((a: any) => a.status === "completed")
  const totalDonations = activeActs.reduce((acc: number, a: any) => acc + (Number(a.funding_raised) || 0), 0)

  // Partisipan relawan: total relawan yang disetujui pada kegiatan-kegiatan komunitas ini
  // (volunteer_registrations dibatasi RLS untuk service_role saja, jadi gunakan
  // activities.volunteer_count yang sudah dipelihara otomatis oleh trigger DB)
  const participantCount = allActs.reduce((acc: number, a: any) => acc + (Number(a.volunteer_count) || 0), 0)


  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="relative z-[60] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-primary/5"
          >
            <ArrowLeft className="h-4 w-4" />
            {isUser ? "Kembali ke Daftar Komunitas" : "Kembali ke Komunitas"}
          </Link>
        </div>

        {community.is_banned && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 relative z-[60]">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-4 items-start">
              <ShieldAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900">Komunitas Di-Ban Permanen</h3>
                <p className="text-red-700 text-sm mt-1">Komunitas ini sudah tidak ada/di ban. Semua aktivitas dari komunitas ini otomatis berstatus "Selesai".</p>
              </div>
            </div>
          </div>
        )}

        {/* Cover Image */}
        <section className="relative h-64 md:h-80 bg-secondary">
          {coverImage && (
            <Image
              src={coverImage}
              alt={community.name}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </section>

        {/* Profile Header */}
        <section className="relative -mt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-background border-4 border-background shadow-xl">
                <Image
                  src={logoUrl}
                  alt={community.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{community.name}</h1>
                  {community.is_verified && (
                    <Badge className="bg-primary/10 text-primary">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Terverifikasi
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{community.location || "Indonesia"}</span>
                  <span className="text-muted-foreground/50">|</span>
                  <span>Bergabung {formatDate(community.created_at)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Konservasi Laut</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" aria-label="Bagikan halaman komunitas">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button asChild>
                  <Link href={`/activities?community=${community.id}`}>
                    Lihat Kegiatan
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-6 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{participantCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">Partisipan Relawan</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{completedActs.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Kegiatan Terlaksana</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Heart className="h-5 w-5 text-accent" />
                  <span className="text-2xl font-bold text-foreground">
                    {formatCurrency(totalDonations)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Dana Terkumpul</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">
                    {activeActs.length}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Kegiatan Aktif</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - About & Contact */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Tentang Komunitas</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {community.description}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Kontak</h2>
                    <div className="space-y-3">
                      {community.email && (
                        <a
                          href={`mailto:${community.email}`}
                          className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{community.email}</span>
                        </a>
                      )}
                      {community.phone && (
                        <a
                          href={`tel:${community.phone}`}
                          className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{community.phone}</span>
                        </a>
                      )}
                      {community.website && (
                        <a
                          href={community.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Globe className="h-4 w-4" />
                          <span className="text-sm">{community.website}</span>
                        </a>
                      )}
                      {!community.email && !community.phone && !community.website && (
                        <p className="text-sm text-muted-foreground">Informasi kontak belum tersedia.</p>
                      )}
                    </div>

                    {(community.instagram || community.facebook || community.twitter) && (
                      <>
                        <div className="border-t border-border my-4" />
                        <div className="flex items-center gap-3">
                          {community.instagram && (
                            <a
                              href={`https://instagram.com/${community.instagram.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                            >
                              <Instagram className="h-5 w-5" />
                            </a>
                          )}
                          {community.facebook && (
                            <a
                              href={`https://facebook.com/${community.facebook}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                            >
                              <Facebook className="h-5 w-5" />
                            </a>
                          )}
                          {community.twitter && (
                            <a
                              href={`https://twitter.com/${community.twitter.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                            >
                              <Twitter className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Gallery - only show if cover_url is available */}
                {community.cover_url && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold text-foreground mb-4">Galeri</h2>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative aspect-square rounded-lg overflow-hidden">
                          <Image
                            src={community.cover_url}
                            alt={`${community.name} cover`}
                            fill
                            className="object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Activities */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Kegiatan Aktif</h2>
                  <Button variant="outline" asChild>
                    <Link href={`/activities?community=${community.id}`}>Lihat Semua</Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  {activeActs.map((activity: any) => (
                    <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative w-full md:w-48 h-48 md:h-auto shrink-0 bg-secondary">
                            {activity.cover_image_url ? (
                              <Image
                                src={activity.cover_image_url}
                                alt={activity.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-30">
                                <Activity className="h-10 w-10" />
                              </div>
                            )}
                          </div>
                          <div className="p-6 flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-foreground mb-1">{activity.title}</h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(activity.start_date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {activity.location}
                                  </span>
                                </div>
                              </div>
                              <Badge>{activity.status}</Badge>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Relawan</span>
                                  <span className="font-medium text-foreground">
                                    {activity.volunteer_quota > 0
                                      ? `${activity.volunteer_count || 0}/${activity.volunteer_quota}`
                                      : `${activity.volunteer_count || 0} terdaftar`}
                                  </span>
                                </div>
                                {activity.volunteer_quota > 0 && (
                                  <Progress
                                    value={calcPercentage(activity.volunteer_count || 0, activity.volunteer_quota)}
                                    className="h-2"
                                  />
                                )}
                              </div>

                              <div>
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Dana Terkumpul</span>
                                  <span className="font-medium text-foreground">
                                    {activity.funding_goal > 0
                                      ? `${formatCurrency(activity.funding_raised || 0)} / ${formatCurrency(activity.funding_goal)}`
                                      : formatCurrency(activity.funding_raised || 0)}
                                  </span>
                                </div>
                                {activity.funding_goal > 0 && (
                                  <Progress
                                    value={calcPercentage(activity.funding_raised || 0, activity.funding_goal)}
                                    className="h-2"
                                  />
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mt-4">
                              <Button size="sm" asChild>
                                <Link href={`/activities/${activity.id}`}>
                                  Lihat Kegiatan
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {activeActs.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Belum ada kegiatan</h3>
                      <p className="text-muted-foreground">
                        Komunitas ini belum memiliki kegiatan terpublikasi.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {!isUser && <Footer />}
    </div>
  )
}
