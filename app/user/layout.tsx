"use client"

import { UserSidebar } from "@/components/user-sidebar"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#eff6ff] flex">
      <UserSidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}
