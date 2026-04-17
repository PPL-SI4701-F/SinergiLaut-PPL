"use client"

/**
 * Halaman Manajemen Donatur (Community Dashboard)
 * Route: /community/dashboard/activities/[id]/donors
 * Menampilkan donasi uang (dengan status Midtrans) dan donasi barang.
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import {
  ArrowLeft, Search, Heart, Banknote, Package, Loader2,
  Mail, CheckCircle, Clock, XCircle, CreditCard, Truck
} from "lucide-react"
import { getActivityDonations, confirmItemDonationReceived } from "@/lib/actions/donation.actions"
import { formatCurrency, formatDate } from "@/lib/utils/helpers"
import { toast } from "sonner"
import type { Donation, DonationItem } from "@/lib/types"

type DonationWithItems = Donation & {
  items: (DonationItem & { item_condition: string; courier: string | null })[]
  user: { full_name: string | null } | null
}

const statusConfig = {
  pending: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700", icon: Clock },
  completed: { label: "Selesai", className: "bg-green-100 text-green-700", icon: CheckCircle },
  refunded: { label: "Dikembalikan", className: "bg-gray-100 text-gray-700", icon: XCircle },
}

const conditionLabel: Record<string, string> = {
  new: "Baru",
  good: "Masih Bagus",
  fair: "Cukup Baik",
}

type FilterType = "all" | "money" | "item"
type FilterStatus = "all" | "pending" | "completed"

export default function DonorsManagementPage() {
  const params = useParams()
  const router = useRouter()
  const { isCommunity, isAdmin, isLoading: authLoading } = useAuth()

  const [donations, setDonations] = useState<DonationWithItems[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isCommunity && !isAdmin) router.push("/login")
  }, [authLoading, isCommunity, isAdmin, router])

  useEffect(() => {
    if (!params.id) return
    async function loadData() {
      setIsLoading(true)
      const result = await getActivityDonations(params.id as string)
      if (result.success) setDonations(result.data as DonationWithItems[])
      else toast.error(result.error ?? "Gagal memuat data donasi.")
      setIsLoading(false)
    }
    loadData()
  }, [params.id])

  async function handleConfirmItemReceived(donationId: string) {
    setConfirmingId(donationId)
    const result = await confirmItemDonationReceived(donationId)
    if (result.success) {
      setDonations(prev => prev.map(d => d.id === donationId ? { ...d, status: "completed" } : d))
      toast.success("Donasi barang telah dikonfirmasi diterima.")
    } else {
      toast.error(result.error ?? "Gagal konfirmasi.")
    }
    setConfirmingId(null)
  }

  const filtered = donations.filter(d => {
    const name = d.is_anonymous ? "Donatur Anonim" : d.donor_name
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      d.donor_email.toLowerCase().includes(search.toLowerCase()) ||
      (d.midtrans_order_id ?? "").toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === "all" || d.type === filterType
    const matchStatus = filterStatus === "all" || d.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const totalMoney = donations.filter(d => d.type === "money" && d.status === "completed").reduce((s, d) => s + (d.amount ?? 0), 0)
  const pendingMoney = donations.filter(d => d.type === "money" && d.status === "pending").reduce((s, d) => s + (d.amount ?? 0), 0)
  const totalItems = donations.filter(d => d.type === "item").reduce((s, d) => s + (d.items?.length ?? 0), 0)

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link href="/community/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" /> Manajemen Donatur
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Pantau dan kelola semua donasi yang masuk untuk kegiatan ini
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Banknote className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Dana Terkumpul</p>
                </div>
                <p className="text-xl font-bold text-foreground">{formatCurrency(totalMoney)}</p>
                {pendingMoney > 0 && <p className="text-xs text-yellow-600 mt-1">+{formatCurrency(pendingMoney)} pending</p>}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-accent" />
                  <p className="text-xs text-muted-foreground">Total Barang</p>
                </div>
                <p className="text-xl font-bold text-foreground">{totalItems} item</p>
                <p className="text-xs text-muted-foreground mt-1">dari {donations.filter(d => d.type === "item").length} donasi</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  <p className="text-xs text-muted-foreground">Total Donatur</p>
                </div>
                <p className="text-xl font-bold text-foreground">{donations.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{donations.filter(d => d.status === "completed").length} selesai</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle>Riwayat Donasi</CardTitle>
                  <CardDescription>{filtered.length} dari {donations.length} donasi</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari nama / email / order ID..." value={search}
                      onChange={e => setSearch(e.target.value)} className="pl-9" />
                  </div>
                  <div className="flex gap-1">
                    {(["all", "money", "item"] as const).map(t => (
                      <Button key={t} size="sm" variant={filterType === t ? "default" : "outline"}
                        onClick={() => setFilterType(t)}>
                        {t === "all" ? "Semua" : t === "money" ? "Uang" : "Barang"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Heart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Belum ada donasi untuk kegiatan ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((d) => {
                    const StatusIcon = statusConfig[d.status]?.icon ?? Clock
                    const displayName = d.is_anonymous ? "Donatur Anonim" : d.donor_name
                    const isExpanded = expandedId === d.id

                    return (
                      <div key={d.id} className="border border-border rounded-xl overflow-hidden">
                        {/* Row utama */}
                        <div
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-secondary/40 transition-colors"
                          onClick={() => setExpandedId(isExpanded ? null : d.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${d.type === "money" ? "bg-primary/10" : "bg-accent/10"}`}>
                              {d.type === "money"
                                ? <Banknote className="h-4 w-4 text-primary" />
                                : <Package className="h-4 w-4 text-accent" />
                              }
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-foreground text-sm">{displayName}</p>
                                <Badge className={statusConfig[d.status]?.className}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig[d.status]?.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {d.type === "money" ? "Uang" : "Barang"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" /> {d.donor_email}
                                </span>
                                <span className="text-xs text-muted-foreground">{formatDate(d.created_at)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pl-12 sm:pl-0">
                            {d.type === "money" && d.amount && (
                              <span className="font-bold text-foreground">{formatCurrency(d.amount)}</span>
                            )}
                            {d.type === "item" && (
                              <span className="text-sm text-muted-foreground">{d.items?.length ?? 0} item</span>
                            )}
                          </div>
                        </div>

                        {/* Detail expandable */}
                        {isExpanded && (
                          <div className="border-t border-border bg-secondary/30 p-4 space-y-3">
                            {/* Info pembayaran (money) */}
                            {d.type === "money" && (
                              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                                {d.midtrans_order_id && (
                                  <div>
                                    <p className="text-muted-foreground">Order ID</p>
                                    <p className="font-mono text-foreground">{d.midtrans_order_id}</p>
                                  </div>
                                )}
                                {d.midtrans_payment_type && (
                                  <div>
                                    <p className="text-muted-foreground">Metode Bayar</p>
                                    <div className="flex items-center gap-1">
                                      <CreditCard className="h-3 w-3" />
                                      <p className="text-foreground capitalize">{d.midtrans_payment_type.replace(/_/g, " ")}</p>
                                    </div>
                                  </div>
                                )}
                                {d.midtrans_va_number && (
                                  <div>
                                    <p className="text-muted-foreground">Nomor VA</p>
                                    <p className="font-mono text-foreground">{d.midtrans_va_number}</p>
                                  </div>
                                )}
                                {d.midtrans_transaction_id && (
                                  <div>
                                    <p className="text-muted-foreground">Transaction ID</p>
                                    <p className="font-mono text-foreground text-xs">{d.midtrans_transaction_id}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Detail barang (item) */}
                            {d.type === "item" && d.items?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-foreground mb-2">Daftar Barang:</p>
                                <div className="space-y-2">
                                  {d.items.map((item) => (
                                    <div key={item.id} className="bg-background rounded-lg p-3 text-xs">
                                      <div className="flex justify-between mb-1">
                                        <span className="font-medium text-foreground">{item.item_name}</span>
                                        <span className="text-muted-foreground">x{item.quantity}</span>
                                      </div>
                                      <div className="flex flex-wrap gap-2 text-muted-foreground">
                                        <Badge className="text-xs">{conditionLabel[item.item_condition] ?? item.item_condition}</Badge>
                                        {item.description && <span>· {item.description}</span>}
                                        {item.tracking_number && (
                                          <span className="flex items-center gap-1">
                                            <Truck className="h-3 w-3" />
                                            {item.courier && `${item.courier}: `}
                                            <span className="font-mono">{item.tracking_number}</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {d.status === "pending" && (
                                  <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700"
                                    disabled={confirmingId === d.id}
                                    onClick={() => handleConfirmItemReceived(d.id)}>
                                    {confirmingId === d.id
                                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Memproses...</>
                                      : <><CheckCircle className="h-3.5 w-3.5 mr-1" />Konfirmasi Barang Diterima</>
                                    }
                                  </Button>
                                )}
                              </div>
                            )}

                            {d.note && (
                              <div>
                                <p className="text-xs text-muted-foreground">Catatan:</p>
                                <p className="text-sm italic text-foreground">"{d.note}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
