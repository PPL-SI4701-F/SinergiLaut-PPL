"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  LayoutDashboard, User,
  LogOut, Menu, X, ChevronRight,
} from "lucide-react"
import { getInitials } from "@/lib/utils/helpers"

const navItems = [
  { href: "/user/dashboard", label: "Dashboard",   icon: LayoutDashboard, description: "Ringkasan aktivitas saya" },
  { href: "/user/profile",   label: "Profil Saya", icon: User,            description: "Edit data & verifikasi"  },
]

export function UserSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile, user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    toast.success("Berhasil keluar.")
    router.push("/")
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 group-hover:shadow-md transition-shadow">
            <Image src="/images/SinergiLautLogo-transparent.png" alt="Logo" width={24} height={24} style={{ objectFit: "contain" }} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 tracking-tight leading-none">SinergiLaut</p>
            <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-widest mt-0.5">Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-teal-600 text-white shadow-sm shadow-teal-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-slate-200"
              }`}>
                <item.icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block truncate">{item.label}</span>
                <span className={`text-[10px] font-normal truncate ${isActive ? "text-teal-100" : "text-slate-400"}`}>
                  {item.description}
                </span>
              </div>
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-white/60 shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-3 border-t border-slate-100">
        <Link
          href="/user/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors mb-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-xs font-black text-teal-700">
                {getInitials(profile?.full_name || user?.email || "U")}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{profile?.full_name ?? "Pengguna"}</p>
            <p className="text-[10px] text-slate-400 truncate">{profile?.email ?? user?.email ?? ""}</p>
          </div>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <LogOut className="h-4 w-4" />
          </div>
          Keluar
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center border border-slate-100"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`md:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-2xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r border-slate-100 fixed left-0 top-0 bottom-0 z-30">
        <SidebarContent />
      </aside>
    </>
  )
}
