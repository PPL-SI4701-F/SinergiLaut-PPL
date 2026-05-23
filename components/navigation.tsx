"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  User,
  LayoutDashboard,
  Shield,
  Building2,
  CheckCheck,
} from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials, formatDate } from "@/lib/utils/helpers";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions/notification.actions";

const publicNavLinks = [
  { href: "/activities", label: "Kegiatan" },
  { href: "/community", label: "Komunitas" },
  { href: "/about", label: "Tentang" },
];

const userNavLinks = [
  { href: "/activities", label: "Kegiatan" },
  { href: "/community", label: "Komunitas" },
  { href: "/user/dashboard", label: "Dashboard" },
];

const communityNavLinks = [
  { href: "/activities", label: "Kegiatan" },
  { href: "/community/dashboard", label: "Dashboard Komunitas" },
];

const adminNavLinks = [
  { href: "/admin/dashboard", label: "Dashboard Admin" },
];

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const notifTypeColor: Record<string, string> = {
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, profile, role, signOut, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks =
    !user || !role
      ? publicNavLinks
      : role === "admin"
        ? adminNavLinks
        : role === "community"
          ? communityNavLinks
          : userNavLinks;

  const getDashboardLink = () => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "community") return "/community/dashboard";
    return "/user/dashboard";
  };

  // Dark hero detection: halaman yang punya background gelap di hero
  const isDashboard = pathname.includes("dashboard");
  const isDarkHeroPage = !isDashboard && (
    ["/", "/activities", "/community", "/about"].includes(pathname) ||
    pathname.startsWith("/activities/") ||
    pathname.startsWith("/community/") ||
    pathname === "/login" ||
    pathname === "/register"
  );

  const showPillNav = isScrolled || !isDarkHeroPage || isMenuOpen;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Berhasil keluar.");
    router.push("/");
    router.refresh();
  };

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const result = await getMyNotifications();
    if (result.success) {
      setNotifications(result.data as Notification[]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications, user]);

  useEffect(() => {
    if (notifOpen) fetchNotifications();
  }, [notifOpen, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)),
      );
    }
    setNotifOpen(false);
    if (notif.link) router.push(notif.link);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("Semua notifikasi telah ditandai dibaca");
  };

  const NotifDot = ({ type }: { type: string }) => (
    <span
      className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${notifTypeColor[type] ?? "bg-gray-400"}`}
    />
  );

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
        <div
          className={`flex items-center justify-between transition-all duration-500 ${
            showPillNav ? "px-6 sm:px-8" : "px-0"
          } h-16 md:h-18`}
        >
          {/* Logo */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div
                  className={`absolute inset-0 bg-primary/20 blur-lg rounded-full transition-opacity ${showPillNav ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`}
                />
                <Image
                  src="/images/SinergiLautLogo-transparent.png"
                  alt="SinergiLaut Logo"
                  width={36}
                  height={36}
                  className="relative transform transition-transform group-hover:scale-110"
                  style={{ width: 36, height: 36 }}
                />
              </div>
              <span
                className={`text-xl font-black tracking-tight transition-colors duration-300 ${
                  showPillNav
                    ? "text-foreground group-hover:text-primary"
                    : "text-white group-hover:text-white"
                }`}
              >
                SinergiLaut
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center justify-center gap-2 flex-none">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-bold transition-all rounded-full relative group ${
                    isActive
                      ? showPillNav
                        ? "text-primary bg-primary/5"
                        : "text-white bg-white/10"
                      : showPillNav
                        ? "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                        showPillNav ? "bg-primary" : "bg-white"
                      }`}
                    />
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
                {/* Notification Bell */}
                <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`relative transition-all ${
                        !showPillNav
                          ? "text-white hover:bg-white/10"
                          : "text-foreground hover:bg-secondary/80"
                      }`}
                      aria-label="Notifikasi"
                    >
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-80 max-h-[480px] overflow-hidden flex flex-col p-0"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Notifikasi
                        </p>
                        {unreadCount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {unreadCount} belum dibaca
                          </p>
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
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                          <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Tidak ada notifikasi
                          </p>
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
                              <p
                                className={`text-sm font-medium line-clamp-1 ${!notif.is_read ? "text-foreground" : "text-muted-foreground"}`}
                              >
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-2 px-1 pr-2 rounded-full transition-all ${
                        showPillNav
                          ? "hover:bg-secondary/80 text-foreground"
                          : "hover:bg-white/10 text-white"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full overflow-hidden shadow-sm flex items-center justify-center text-xs font-bold ${
                          showPillNav
                            ? "bg-primary/10 text-primary border border-border"
                            : "bg-white/20 text-white border border-white/20"
                        }`}
                      >
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(profile?.full_name || user.email || "U")
                        )}
                      </div>
                      <span className="hidden sm:inline-block text-sm font-bold max-w-[120px] truncate ml-1">
                        {profile?.full_name ||
                          user.email?.split("@")[0] ||
                          "User"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-70 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()}>
                        <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={role === "community" ? "/community/dashboard/profile" : "/user/profile"}>
                        <User className="h-4 w-4 mr-2" /> Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        handleSignOut();
                      }}
                      className="text-destructive cursor-pointer"
                    >
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
                  className={`font-bold transition-all ${!showPillNav ? "text-white hover:text-white hover:bg-white/10" : "text-foreground"}`}
                  asChild
                >
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button
                  variant="premium"
                  size="sm"
                  className="font-bold shadow-lg"
                  asChild
                >
                  <Link href="/register">Daftar</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 relative group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div
              className={`absolute inset-0 bg-primary/10 blur-md rounded-full transition-opacity ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
            />
            {isMenuOpen ? (
              <X className="h-6 w-6 text-primary relative" />
            ) : (
              <Menu
                className={`h-6 w-6 relative transition-colors ${
                  isScrolled
                    ? "text-foreground group-hover:text-primary"
                    : "text-white group-hover:text-white"
                }`}
              />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 mt-4 border-t border-border/10 animate-in fade-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href + "/"));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-lg font-bold px-5 py-4 rounded-2xl transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : isScrolled
                          ? "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div
                className={`flex flex-col gap-3 pt-6 mt-2 border-t ${isScrolled ? "border-border/40" : "border-white/10"}`}
              >
                {user ? (
                  <>
                    <div
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${
                        isScrolled
                          ? "bg-secondary/50 border-border/40"
                          : "bg-white/10 border-white/20"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black border ${
                          isScrolled
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-white/20 text-white border-white/30"
                        }`}
                      >
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          getInitials(profile?.full_name || user.email || "U")
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-base font-bold truncate ${isScrolled ? "text-foreground" : "text-white"}`}
                        >
                          {profile?.full_name || user.email}
                        </p>
                        <p
                          className={`text-xs font-semibold uppercase tracking-wider ${isScrolled ? "text-muted-foreground" : "text-white/60"}`}
                        >
                          {role}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <div className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-xs ring-4 ring-red-500/10">
                          <Bell className="h-3.5 w-3.5" /> {unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className={`h-12 rounded-xl font-bold border-2 ${
                          !isScrolled
                            ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                            : ""
                        }`}
                        asChild
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Link href="/user/profile">
                          <User className="w-4 h-4 mr-2" /> Profil
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className={`h-12 rounded-xl font-bold text-destructive hover:bg-destructive/10 ${
                          !isScrolled ? "hover:bg-red-500/20" : ""
                        }`}
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Keluar
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="ghost"
                      className={`h-12 rounded-xl font-bold ${
                        !isScrolled ? "text-white hover:bg-white/10" : ""
                      }`}
                      asChild
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href="/login">Masuk</Link>
                    </Button>
                    <Button
                      variant="premium"
                      className="h-12 rounded-xl font-bold shadow-xl"
                      asChild
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href="/register">Daftar</Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
