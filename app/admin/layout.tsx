"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { useAuth } from "@/contexts/auth-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/unauthorized")
    }
  }, [isAdmin, isLoading, router])

  if (isLoading || !isAdmin) return null

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}
