"use client"

import { CommunitySidebar } from "@/components/community-sidebar"

export default function CommunityDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <CommunitySidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}
