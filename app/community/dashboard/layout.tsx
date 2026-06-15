import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { CommunitySidebar } from "@/components/community-sidebar"
import { createClient } from "@/lib/supabase/server"

export default async function CommunityDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const e2eRole = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_E2E_TESTING === "true"
    ? cookieStore.get("e2e-bypass-auth")?.value
    : null

  if (e2eRole && !e2eRole.startsWith("community")) {
    redirect("/unauthorized")
  }

  let isBanned = false

  if (!e2eRole) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      redirect("/login?redirectedFrom=/community/dashboard")
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError || !profile) {
      redirect("/unauthorized")
    }

    if (profile.role === "admin") {
      redirect("/admin/dashboard")
    }

    if (profile.role === "user") {
      redirect("/user/dashboard")
    }

    if (profile.role !== "community") {
      redirect("/unauthorized")
    }

    const { data: community } = await supabase
      .from("communities")
      .select("is_banned")
      .eq("owner_id", user.id)
      .maybeSingle()

    if (community?.is_banned) {
      isBanned = true
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <CommunitySidebar isBanned={isBanned} />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {isBanned ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-20">
             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Komunitas Di-Ban Permanen</h2>
             <p className="text-slate-600 max-w-md mx-auto">Komunitas Anda telah di-ban secara permanen dari platform SinergiLaut. Semua fitur dan akses dashboard telah dinonaktifkan sepenuhnya.</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
