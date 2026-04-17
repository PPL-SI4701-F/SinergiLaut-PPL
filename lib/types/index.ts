// ===========================================
// SinergiLaut - TypeScript Type Definitions
// ===========================================

export type UserRole = "admin" | "community" | "user"
export type VerificationStatus = "pending" | "approved" | "rejected"
export type ActivityStatus = "draft" | "pending_review" | "published" | "cancelled" | "completed"
export type DonationStatus = "pending" | "completed" | "refunded"
export type DonationType = "money" | "item"
export type VolunteerStatus = "pending" | "approved" | "rejected" | "attended"
export type SanctionType = "warning" | "suspend" | "ban"
export type ReportStatus = "draft" | "submitted" | "validated" | "rejected"

// ----------------
// Profiles
// ----------------
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  bio: string | null
  role: UserRole
  is_active: boolean
  // Volunteer verification
  volunteer_status: VerificationStatus
  date_of_birth: string | null
  nik: string | null
  gender: string | null
  address: string | null
  ktp_url: string | null
  volunteer_verified_by: string | null
  volunteer_verified_at: string | null
  volunteer_reject_note: string | null
  created_at: string
  updated_at: string
}

// ----------------
// Communities
// ----------------
export interface Community {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  website: string | null
  location: string | null
  focus_areas: string[]
  member_count: number
  is_verified: boolean
  verification_status: VerificationStatus
  is_suspended: boolean
  created_at: string
  updated_at: string
  // Relations
  owner?: Profile
  verification?: CommunityVerification
}

export interface CommunityVerification {
  id: string
  community_id: string
  status: VerificationStatus
  admin_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  documents: string[]
  created_at: string
}

// ----------------
// Activities
// ----------------
export interface Activity {
  id: string
  community_id: string
  title: string
  slug: string
  description: string
  category: ActivityCategory
  status: ActivityStatus
  start_date: string
  end_date: string | null
  location: string
  latitude: number | null
  longitude: number | null
  volunteer_quota: number
  volunteer_count: number
  funding_goal: number
  funding_raised: number
  allow_item_donation: boolean
  cover_image_url: string | null
  images: string[]
  created_at: string
  updated_at: string
  published_at: string | null
  // Relations
  community?: Community
  volunteers?: VolunteerRegistration[]
  donations?: Donation[]
  reports?: Report[]
}

export type ActivityCategory =
  | "cleanup"
  | "restoration"
  | "education"
  | "research"
  | "event"
  | "other"

// ----------------
// Volunteer Registrations
// ----------------
export interface VolunteerRegistration {
  id: string
  activity_id: string
  user_id: string
  full_name: string
  email: string
  phone: string
  reason: string | null
  status: VolunteerStatus
  agreed_to_terms: boolean
  created_at: string
  updated_at: string
  // Relations
  activity?: Activity
  user?: Profile
}

// ----------------
// Donations
// ----------------
export interface Donation {
  id: string
  activity_id: string
  user_id: string | null
  donor_name: string
  donor_email: string
  type: DonationType
  amount: number | null
  // Midtrans payment fields
  midtrans_order_id: string | null
  midtrans_snap_token: string | null
  midtrans_transaction_id: string | null
  midtrans_payment_type: string | null
  midtrans_va_number: string | null
  midtrans_expiry_time: string | null
  status: DonationStatus
  note: string | null
  is_anonymous: boolean
  created_at: string
  updated_at: string
  // Relations
  activity?: Activity
  user?: Profile
  items?: DonationItem[]
}

export interface DonationItem {
  id: string
  donation_id: string
  item_name: string
  quantity: number
  item_condition: string        // new | good | fair
  description: string | null
  tracking_number: string | null
  courier: string | null        // JNE | J&T | SiCepat | dll.
  created_at: string
}

// ----------------
// Reports
// ----------------
export interface Report {
  id: string
  activity_id: string
  community_id: string
  submitted_by: string
  title: string
  summary: string
  fund_usage: FundUsageItem[]
  status: ReportStatus
  admin_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  completion_status: "partial" | "completed"
  created_at: string
  updated_at: string
  // Relations
  activity?: Activity
  files?: ReportFile[]
}

export interface FundUsageItem {
  category: string
  amount: number
  description: string
}

export interface ReportFile {
  id: string
  report_id: string
  file_url: string
  file_name: string
  file_type: string
  file_size: number
  created_at: string
}

// ----------------
// Sanctions
// ----------------
export interface Sanction {
  id: string
  community_id: string
  issued_by: string
  type: SanctionType
  reason: string
  notes: string | null
  is_active: boolean
  expires_at: string | null
  created_at: string
  // Relations
  community?: Community
  admin?: Profile
}

// ----------------
// Feedbacks
// ----------------
export interface Feedback {
  id: string
  activity_id: string
  user_id: string
  rating: number // 1-5
  comment: string | null
  is_public: boolean
  created_at: string
  // Relations
  activity?: Activity
  user?: Profile
}

// ----------------
// Notifications
// ----------------
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  link: string | null
  is_read: boolean
  created_at: string
}

// ----------------
// Audit Logs
// ----------------
export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string | null
  metadata: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

// ----------------
// UI / Utility Types
// ----------------
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface FilterParams {
  search?: string
  location?: string
  category?: ActivityCategory
  status?: ActivityStatus
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}
