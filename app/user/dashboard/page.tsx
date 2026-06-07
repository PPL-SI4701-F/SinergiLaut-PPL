import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getUserDashboardStats } from "@/lib/actions/dashboard.actions"
import { getMyVolunteerRegistrations } from "@/lib/actions/volunteer.actions"
import { getMyDonations } from "@/lib/actions/donation.actions"
import { formatCurrency } from "@/lib/utils/helpers"
import { Calendar, Heart, CheckCircle2, TrendingUp, User, AlertCircle, XCircle } from "lucide-react"
import { DashboardClient } from "./dashboard-client"

import { cookies } from "next/headers"

export default async function UserDashboardPage() {
  const cookieStore = await cookies()
  const isE2E = process.env.NODE_ENV === 'development' && cookieStore.get('e2e-bypass-auth')?.value

  let userId = ""
  let profile: any = null
  let stats = { totalActivities: 0, activeActivities: 0, totalDonations: 0 }
  let volunteers: any[] = []
  let donations: any[] = []

  if (isE2E) {
    userId = "e2e-user-id"
    profile = { full_name: "Mock User", role: "user", volunteer_status: "approved" }
    stats = { totalActivities: 1, activeActivities: 1, totalDonations: 0 }
    const volunteersResult = await getMyVolunteerRegistrations(userId)
    volunteers = volunteersResult.data ?? []
  } else {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) redirect("/login")

    userId = session.user.id

    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name, role, volunteer_status")
      .eq("id", userId)
      .single()
    profile = prof

    const [s, volunteersResult, donationsResult] = await Promise.all([
      getUserDashboardStats(userId),
      getMyVolunteerRegistrations(userId),
      getMyDonations(userId),
    ])
    stats = s
    volunteers = volunteersResult.data ?? []
    donations  = donationsResult.data ?? []
  }

  const firstName  = profile?.full_name?.split(" ")[0] ?? "Pengguna"

  return (
    <main className="flex-1 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-14 md:pt-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Selamat datang, {firstName}! 👋
              </h1>
              {profile?.volunteer_status === "approved" && (
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                </span>
              )}
              {profile?.volunteer_status === "pending" && (
                <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1 shrink-0">
                  <AlertCircle className="w-3 h-3" /> Menunggu Verifikasi
                </span>
              )}
              {profile?.volunteer_status === "rejected" && (
                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full flex items-center gap-1 shrink-0">
                  <XCircle className="w-3 h-3" /> Ditolak
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Pantau partisipasi dan riwayat Anda di SinergiLaut
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/user/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-700 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
              <User className="h-3.5 w-3.5" /> Edit Profil
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Kegiatan Diikuti",  value: stats.totalActivities,              icon: Calendar,     color: "text-teal-600", bg: "bg-teal-50" },
            { label: "Total Donasi",       value: formatCurrency(stats.totalDonations), icon: Heart,       color: "text-teal-600", bg: "bg-teal-50" },
            { label: "Status Aktif",       value: stats.activeActivities,             icon: CheckCircle2, color: "text-teal-600", bg: "bg-teal-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" /> Live
                  </p>
                </div>
                <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <DashboardClient volunteers={volunteers as any} donations={donations as any} />

      </div>
    </main>
  )
}
