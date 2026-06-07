"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CommunitySidebar } from "@/components/community-sidebar"
import { useAuth } from "@/contexts/auth-context"

export default function CommunityDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isCommunity, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isCommunity) {
      router.replace("/unauthorized")
    }
  }, [isCommunity, isLoading, router])

  if (isLoading || !isCommunity) return null

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <CommunitySidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}
