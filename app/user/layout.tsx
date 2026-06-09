import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { UserSidebar } from "@/components/user-sidebar"
import { createClient } from "@/lib/supabase/server"

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const isE2EMode = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_E2E_TESTING === "true"

  if (!isE2EMode) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      redirect("/login?redirectedFrom=/user/dashboard")
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

    if (profile.role === "community") {
      redirect("/community/dashboard")
    }

    if (profile.role !== "user") {
      redirect("/unauthorized")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#eff6ff] flex">
      <UserSidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}
