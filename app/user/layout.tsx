"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserSidebar } from "@/components/user-sidebar"
import { useAuth } from "@/contexts/auth-context"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { isUser, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isUser) {
      router.replace("/unauthorized")
    }
  }, [isUser, isLoading, router])

  if (isLoading || !isUser) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#eff6ff] flex">
      <UserSidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}
