// ===========================================
// SinergiLaut - App-wide Constants
// ===========================================

export const APP_NAME = "SinergiLaut"
export const APP_DESCRIPTION = "Platform Konservasi Laut Indonesia"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// Roles
export const ROLES = {
  ADMIN: "admin",
  COMMUNITY: "community",
  USER: "user",
} as const

// Activity Categories
export const ACTIVITY_CATEGORIES = [
  { value: "cleanup", label: "Beach / Ocean Cleanup" },
  { value: "restoration", label: "Coral & Ecosystem Restoration" },
  { value: "education", label: "Marine Education" },
  { value: "research", label: "Research & Monitoring" },
  { value: "event", label: "Conservation Events" },
  { value: "other", label: "Other" },
] as const

// Activity Status Labels
export const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Menunggu Review",
  published: "Dipublikasikan",
  cancelled: "Dibatalkan",
  completed: "Selesai",
}

// Verification Status Labels
export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  pending: "Menunggu Review",
  approved: "Diverifikasi",
  rejected: "Ditolak",
}

// Indonesian locations for filters
export const INDONESIA_PROVINCES = [
  "Seluruh Indonesia",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Bali",
  "Sulawesi Selatan",
  "Sulawesi Utara",
  "Kalimantan Timur",
  "Papua",
  "Papua Barat",
  "Maluku",
  "Maluku Utara",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Online",
]

// Donation default amounts (IDR)
export const DONATION_PRESETS = [
  { label: "Rp 25.000", value: 25000 },
  { label: "Rp 50.000", value: 50000 },
  { label: "Rp 100.000", value: 100000 },
  { label: "Rp 250.000", value: 250000 },
  { label: "Rp 500.000", value: 500000 },
  { label: "Rp 1.000.000", value: 1000000 },
]

// Payment methods (placeholder)
export const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Transfer Bank", icon: "🏦" },
  { value: "virtual_account", label: "Virtual Account", icon: "💳" },
  { value: "qris", label: "QRIS", icon: "📱" },
  { value: "gopay", label: "GoPay", icon: "💚" },
  { value: "ovo", label: "OVO", icon: "💜" },
  { value: "dana", label: "DANA", icon: "💙" },
]

// Status badge color maps
export const STATUS_COLORS: Record<string, string> = {
  // Verification
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  // Activity
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  pending_review: "bg-yellow-100 text-yellow-700 border-yellow-200",
  published: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  // Volunteer
  attended: "bg-blue-100 text-blue-700 border-blue-200",
  // Donation
  refunded: "bg-orange-100 text-orange-700 border-orange-200",
  // Sanction
  warning: "bg-orange-100 text-orange-700 border-orange-200",
  suspend: "bg-red-100 text-red-700 border-red-200",
  ban: "bg-red-200 text-red-900 border-red-300",
  // Report
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  validated: "bg-green-100 text-green-700 border-green-200",
  active: "bg-green-100 text-green-700 border-green-200",
}

// Navigation links by role
export const NAV_LINKS_PUBLIC = [
  { href: "/", label: "Beranda" },
  { href: "/activities", label: "Kegiatan" },
  { href: "/community", label: "Komunitas" },
  { href: "/about", label: "Tentang" },
]

export const NAV_LINKS_USER = [
  { href: "/activities", label: "Kegiatan" },
  { href: "/community", label: "Komunitas" },
  { href: "/user/dashboard", label: "Dashboard" },
]

export const NAV_LINKS_COMMUNITY = [
  { href: "/activities", label: "Kegiatan" },
  { href: "/community/dashboard", label: "Dashboard" },
]

export const NAV_LINKS_ADMIN = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/communities", label: "Komunitas" },
  { href: "/admin/activities", label: "Kegiatan" },
  { href: "/admin/reports", label: "Laporan" },
  { href: "/admin/users", label: "Pengguna" },
]

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 12

// File upload limits
export const MAX_FILE_SIZE_MB = 10
export const MAX_IMAGE_SIZE_MB = 5
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"]
