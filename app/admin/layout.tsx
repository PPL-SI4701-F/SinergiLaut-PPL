import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminSidebar } from "@/components/admin-sidebar"
import { createClient } from "@/lib/supabase/server"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const e2eRole = process.env.NODE_ENV === "development"
    ? cookieStore.get("e2e-bypass-auth")?.value
    : null

  if (e2eRole && e2eRole !== "admin") {
    redirect("/unauthorized")
  }

  if (!e2eRole) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      redirect("/login?redirectedFrom=/admin/dashboard")
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError || !profile) {
      redirect("/unauthorized")
    }

    if (profile.role === "community") {
      redirect("/community/dashboard")
    }

    if (profile.role === "user") {
      redirect("/user/dashboard")
    }

    if (profile.role !== "admin") {
      redirect("/unauthorized")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}
