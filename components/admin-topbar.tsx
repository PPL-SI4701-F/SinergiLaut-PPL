"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCheck, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions/notification.actions"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  link: string | null
  is_read: boolean
  created_at: string
}

interface GroupedNotification {
  ids: string[]
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  link: string | null
  created_at: string
  count: number
}

const typeColor: Record<string, string> = {
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
}

const typeBadgeBg: Record<string, string> = {
  info: "bg-blue-50 border-blue-100 text-blue-700",
  success: "bg-emerald-50 border-emerald-100 text-emerald-700",
  warning: "bg-amber-50 border-amber-100 text-amber-700",
  error: "bg-red-50 border-red-100 text-red-700",
}

const typeLabel: Record<string, string> = {
  info: "Info",
  success: "Berhasil",
  warning: "Peringatan",
  error: "Error",
}

// Teks aksi per halaman tujuan notifikasi
const linkAction: Record<string, string> = {
  "/admin/users": "membutuhkan review verifikasi",
  "/admin/communities": "menunggu verifikasi komunitas",
  "/admin/activities": "menunggu persetujuan kegiatan",
  "/admin/reports": "menunggu validasi laporan",
  "/admin/disbursements": "menunggu proses pencairan",
}

// Ekstrak nama subjek dari isi pesan notifikasi
function extractName(message: string): string {
  // Nama komunitas dalam tanda kutip: Komunitas "XYZ"
  const quoted = message.match(/["""„]([^"""„]+)[""""]/)
  if (quoted) return quoted[1]
  // Nama orang sebelum kata kerja umum Bahasa Indonesia
  const beforeVerb = message.match(/^(.+?)\s+(?:mengajukan|mendaftar|baru saja|membutuhkan|melaporkan|telah)\b/)
  if (beforeVerb) return beforeVerb[1].trim()
  return ""
}

function buildGroupMessage(notifs: Notification[]): string {
  if (notifs.length === 1) return notifs[0].message

  const link = notifs[0].link
  const action = (link && linkAction[link]) ?? "membutuhkan perhatian"

  const names = notifs.map((n) => extractName(n.message)).filter(Boolean)

  if (names.length === 0) return `${notifs.length} item ${action}`
  if (names.length === 1) return `${names[0]} ${action}`
  if (names.length === 2) return `${names[0]}, ${names[1]} ${action}`

  const rest = names.length - 2
  return `${names[0]}, ${names[1]} dan ${rest} lainnya ${action}`
}

function groupNotifications(notifications: Notification[]): GroupedNotification[] {
  const map = new Map<string, Notification[]>()

  for (const notif of notifications) {
    const key = notif.link ?? `title:${notif.title}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(notif)
  }

  const groups: GroupedNotification[] = []

  for (const group of map.values()) {
    // Urutkan terbaru di dalam grup
    group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    groups.push({
      ids: group.map((n) => n.id),
      title: group[0].title,
      message: buildGroupMessage(group),
      type: group[0].type,
      link: group[0].link,
      created_at: group[0].created_at,
      count: group.length,
    })
  }

  // Urutkan grup dari yang terbaru, lalu batasi 12
  return groups
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return "Baru saja"
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

export function AdminTopBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
    const result = await getMyNotifications()
    if (result.success) {
      setNotifications((result.data as Notification[]).filter((n) => !n.is_read))
    }
  }, [])

  // Polling setiap 30 detik sebagai fallback
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Realtime: notifikasi baru langsung muncul tanpa tunggu polling
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    supabase.auth.getUser().then((result: any) => {
      const user = result?.data?.user
      if (!user) return

      channel = supabase
        .channel("admin-notif-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          () => fetchNotifications()
        )
        .subscribe()
    })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [supabase, fetchNotifications])

  // Refresh saat dropdown dibuka
  useEffect(() => {
    if (open) fetchNotifications()
  }, [open, fetchNotifications])

  const grouped = groupNotifications(notifications)
  // Badge menampilkan jumlah grup (bukan jumlah notif mentah)
  const badgeCount = grouped.length

  const handleClick = async (notif: GroupedNotification) => {
    // Tandai semua notif dalam grup sebagai sudah dibaca
    await Promise.all(notif.ids.map((id) => markNotificationRead(id)))
    setNotifications((prev) => prev.filter((n) => !notif.ids.includes(n.id)))
    setOpen(false)
    if (notif.link) router.push(notif.link)
  }

  const handleMarkAll = async () => {
    await markAllNotificationsRead()
    setNotifications([])
    toast.success("Semua notifikasi ditandai sudah dibaca")
  }

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-end px-6 sticky top-0 z-30">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Notifikasi"
          >
            <Bell className="h-5 w-5" />
            {badgeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 leading-none">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[400px] max-h-[560px] overflow-hidden flex flex-col p-0 shadow-xl border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
            <div>
              <p className="text-sm font-bold text-slate-800">Notifikasi</p>
              <p className="text-xs text-slate-500">
                {badgeCount > 0
                  ? `${badgeCount} item · ${notifications.length} belum dibaca`
                  : "Semua sudah dibaca"}
              </p>
            </div>
            {badgeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                onClick={handleMarkAll}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Tandai semua
              </Button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {grouped.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <BellOff className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Tidak ada notifikasi</p>
                <p className="text-xs text-slate-400 mt-1">Aktivitas terbaru akan muncul di sini</p>
              </div>
            ) : (
              grouped.map((notif) => (
                <button
                  key={notif.ids[0]}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-slate-100 transition-colors bg-teal-50/60 hover:bg-teal-50 ${notif.link ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${typeColor[notif.type] ?? "bg-slate-400"}`} />

                  <div className="flex-1 min-w-0">
                    {/* Badge baris: tipe + jumlah jika bulk */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${typeBadgeBg[notif.type]}`}>
                        {typeLabel[notif.type]}
                      </span>
                      {notif.count > 1 && (
                        <span className="inline-block text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                          {notif.count} item
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold leading-snug text-slate-800">
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-slate-400">{formatDate(notif.created_at)}</p>
                      {notif.link && (
                        <span className="text-[10px] text-teal-600 font-semibold">Lihat detail →</span>
                      )}
                    </div>
                  </div>

                  <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
                </button>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
