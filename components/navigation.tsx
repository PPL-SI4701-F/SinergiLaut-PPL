"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Menu, X, Bell, ChevronDown, LogOut, User, LayoutDashboard, Shield, Building2, CheckCheck } from "lucide-react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials, formatDate } from "@/lib/utils/helpers"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions/notification.actions"

const publicNavLinks = [
  { href: "/activities", label: "Kegiatan" },
  { href: "/community", label: "Komunitas" },

  { href: "/about", label: "Tentang" },
]

const userNavLinks = [
  { href: "/activities", label: "Kegiatan" },
  { href: "/community", label: "Komunitas" },

  { href: "/user/dashboard", label: "Dashboard" },
]

const communityNavLinks = [
  { href: "/activities", label: "Kegiatan" },

  { href: "/community/dashboard", label: "Dashboard Komunitas" },
]

const adminNavLinks = [
  { href: "/admin/dashboard", label: "Dashboard Admin" },

]

// Tipe data notifikasi
interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  link: string | null
  is_read: boolean
  created_at: string
}

const notifTypeColor: Record<string, string> = {
  info:    "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-amber-500",
  error:   "bg-red-500",
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user, profile, role, signOut, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [isScrolled, setIsScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  const isHomePage = pathname === '/'
  const showPillNav = !isHomePage || isScrolled || isMenuOpen

  const navLinks = !user || !role
    ? publicNavLinks
    : role === "admin"
    ? adminNavLinks
    : role === "community"
    ? communityNavLinks
    : userNavLinks

  const getDashboardLink = () => {
    if (role === "admin") return "/admin/dashboard"
    if (role === "community") return "/community/dashboard"
    return "/user/dashboard"
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success("Berhasil keluar.")
    router.push("/")
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    const result = await getMyNotifications()
    if (result.success) {
      setNotifications(result.data as Notification[])
    }
  }, [user])

  // Fetch on mount + setiap 30 detik
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Fetch ulang saat dropdown dibuka
  useEffect(() => {
    if (notifOpen) fetchNotifications()
  }, [notifOpen, fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      )
    }
    setNotifOpen(false)
    if (notif.link) router.push(notif.link)
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    toast.success("Semua notifikasi telah ditandai dibaca")
  }

  // Render ikon dot berdasarkan tipe
  const NotifDot = ({ type }: { type: string }) => (
    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${notifTypeColor[type] ?? "bg-gray-400"}`} />
  )

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        showPillNav
          ? "top-4 px-4 sm:px-6 lg:px-8"
          : "top-0 px-6 sm:px-10 lg:px-12"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto transition-all duration-500 ease-in-out ${
          showPillNav
            ? "bg-background/80 backdrop-blur-xl shadow-2xl rounded-2xl md:rounded-full py-1 border border-border/40"
            : "bg-transparent py-6 border-transparent"
        }`}
      >
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <div
                  className={`absolute inset-0 bg-primary/20 blur-lg rounded-full transition-opacity ${showPillNav ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`}
                />
                <Image src="/images/SinergiLautLogo-transparent.png" alt="SinergiLaut Logo" width={32} height={32} className="h-8 w-auto relative transform transition-transform group-hover:scale-110" />
              </div>
              <span className={`text-xl font-black tracking-tight transition-colors duration-300 ${
                  showPillNav
                    ? "text-foreground group-hover:text-primary"
                    : "text-white group-hover:text-white"
                }`}>SinergiLaut</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center justify-center gap-8 flex-none">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                                    className={`text-base font-semibold transition-all relative ${
                    isActive
                      ? "text-primary"
                      : showPillNav 
                        ? "text-muted-foreground hover:text-foreground" 
                        : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-[26px] left-0 right-0 h-1 bg-primary rounded-t-lg mx-auto w-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center justify-end gap-3 flex-1">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-secondary animate-pulse" />
            ) : user ? (
              <>
                {/* ── Notification Bell Dropdown ── */}
                <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className={`relative ${!showPillNav ? "text-white hover:text-white hover:bg-white/10" : ""}`} aria-label="Notifikasi">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 max-h-[480px] overflow-hidden flex flex-col p-0">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Notifikasi</p>
                        {unreadCount > 0 && (
                          <p className="text-xs text-muted-foreground">{unreadCount} belum dibaca</p>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-primary hover:text-primary"
                          onClick={handleMarkAllRead}
                        >
                          <CheckCheck className="h-3.5 w-3.5 mr-1" />
                          Tandai semua
                        </Button>
                      )}
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                          <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-secondary/60 transition-colors ${
                              !notif.is_read ? "bg-primary/5" : ""
                            }`}
                          >
                            <NotifDot type={notif.type} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium line-clamp-1 ${!notif.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-muted-foreground/60 mt-1">
                                {formatDate(notif.created_at)}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Role Badge */}
                {role === "admin" && (
                  <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                )}
                {role === "community" && (
                  <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    <Building2 className="h-3 w-3" /> Komunitas
                  </span>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {getInitials(profile?.full_name || user.email || "U")}
                      </div>
                      <span className={`text-sm font-medium max-w-[100px] truncate ${!showPillNav ? "text-white" : ""}`}>
                        {profile?.full_name || user.email?.split("@")[0] || "User"}
                      </span>
                      <ChevronDown className={`h-3 w-3 ${!showPillNav ? "text-white/80" : "text-muted-foreground"}`} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()}>
                        <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/user/profile">
                        <User className="h-4 w-4 mr-2" /> Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSignOut(); }} className="text-destructive cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" /> Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`font-bold transition-all ${!showPillNav ? "text-white hover:text-white hover:bg-white/10" : ""}`}
                  asChild
                >
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Daftar</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className={`h-6 w-6 ${!showPillNav ? "text-white" : "text-foreground"}`} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href + "/"));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-base font-semibold px-2 py-2 rounded-md transition-colors ${
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {getInitials(profile?.full_name || user.email || "U")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{profile?.full_name || user.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{role}</p>
                      </div>
                      {/* Notif badge mobile */}
                      {unreadCount > 0 && (
                        <span className="ml-auto flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                          <Bell className="h-3 w-3" /> {unreadCount}
                        </span>
                      )}
                    </div>
                    <Button variant="outline" className="w-full" asChild onClick={() => setIsMenuOpen(false)}>
                      <Link href={getDashboardLink()}>Dashboard</Link>
                    </Button>
                    <Button variant="ghost" className="w-full text-destructive" onClick={() => { handleSignOut(); setIsMenuOpen(false) }}>
                      Keluar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild onClick={() => setIsMenuOpen(false)}>
                      <Link href="/login">Masuk</Link>
                    </Button>
                    <Button asChild onClick={() => setIsMenuOpen(false)}>
                      <Link href="/register">Daftar</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
