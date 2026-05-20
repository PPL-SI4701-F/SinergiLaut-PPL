import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { getUserDashboardStats } from "@/lib/actions/dashboard.actions"
import { getMyVolunteerRegistrations } from "@/lib/actions/volunteer.actions"
import { getMyDonations } from "@/lib/actions/donation.actions"
import { formatCurrency } from "@/lib/utils/helpers"
import { Calendar, Heart, CheckCircle2, ArrowRight, User, AlertCircle, XCircle } from "lucide-react"
import { DashboardClient } from "./dashboard-client"

export default async function UserDashboardPage() {
  // Verifikasi sesi server-side
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id

  // Ambil nama dari profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, volunteer_status")
    .eq("id", userId)
    .single()

  // Fetch semua data paralel
  const [stats, volunteersResult, donationsResult] = await Promise.all([
    getUserDashboardStats(userId),
    getMyVolunteerRegistrations(userId),
    getMyDonations(userId),
  ])

  const volunteers = volunteersResult.data ?? []
  const donations  = donationsResult.data ?? []

  const firstName = profile?.full_name?.split(" ")[0] ?? "Pengguna"

  return (
    <div className="flex-1">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Selamat datang, {firstName}! 👋
                </h1>
                {profile?.volunteer_status === 'approved' && (
                  <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full flex items-center gap-1 shrink-0"><CheckCircle2 className="w-3 h-3"/> Terverifikasi</span>
                )}
                {profile?.volunteer_status === 'pending' && (
                  <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1 shrink-0"><AlertCircle className="w-3 h-3"/> Menunggu Verifikasi</span>
                )}
                {profile?.volunteer_status === 'rejected' && (
                  <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full flex items-center gap-1 shrink-0"><XCircle className="w-3 h-3"/> Ditolak</span>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                Pantau partisipasi dan riwayat Anda di SinergiLaut
              </p>
            </div>
            <Button asChild>
              <Link href="/activities">
                Temukan Kegiatan <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Kegiatan Diikuti</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stats.totalActivities}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Donasi</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {formatCurrency(stats.totalDonations)}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status Aktif</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stats.activeActivities}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client Component: Tabs + Lists */}
          <DashboardClient volunteers={volunteers as any} donations={donations as any} />

          {/* Profile Shortcut */}
          <div className="mt-8 flex justify-end">
            <Button variant="outline" asChild>
              <Link href="/user/profile">
                <User className="mr-2 h-4 w-4" /> Edit Profil
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
