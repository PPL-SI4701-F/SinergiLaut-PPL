"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import {
  Plus,
  Search,
  Calendar,
  Users,
  Banknote,
  FileText,
  Wallet,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  XCircle,
  Loader2,
  Trash2,
  PlayCircle,
  Send,
  Clock,
  Package,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/helpers";
import {
  getCommunityDashboardStats,
  getCommunityActivities,
  getCommunityProfile,
} from "@/lib/actions/dashboard.actions";
import {
  cancelActivityAction,
  deleteActivityAction,
  startActivityAction,
  submitActivityEditRequest,
  getCommunityActiveEditRequests,
} from "@/lib/actions/activity.actions";
import { toast } from "sonner";
import type { Activity } from "@/lib/types";

type CommunityActivity = Activity & { reports: { status: string }[] | null };
type CommunityProfile = {
  id: string;
  name: string | null;
  is_verified: boolean | null;
  is_suspended?: boolean | null;
  verification_status: string | null;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  published: { label: "Aktif", className: "bg-green-100 text-green-700" },
  pending_review: {
    label: "Menunggu Review",
    className: "bg-yellow-100 text-yellow-700",
  },
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  ongoing: {
    label: "Sedang Berlangsung",
    className: "bg-indigo-100 text-indigo-700",
  },
  completed: { label: "Selesai", className: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
  validated: { label: "Valid", className: "bg-green-100 text-green-700" },
  submitted: { label: "Disubmit", className: "bg-blue-100 text-blue-700" },
};

const statusFilterOptions = [
  { value: "all", label: "Semua Status" },
  { value: "pending_review", label: "Menunggu Review" },
  { value: "published", label: "Aktif" },
  { value: "ongoing", label: "Sedang Berlangsung" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

/** Kegiatan dianggap "sedang berlangsung" selama 24 jam sejak execution_date */
const EXECUTION_WINDOW_MS = 24 * 60 * 60 * 1000;

function isExecutionOngoing(executionDate: string | null): boolean {
  if (!executionDate) return false;
  const start = new Date(executionDate).getTime();
  const now = Date.now();
  return now >= start && now < start + EXECUTION_WINDOW_MS;
}

export default function CommunityDashboardPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    totalActivities: 0,
    activeActivities: 0,
    completedActivities: 0,
    pendingReviewActivities: 0,
    totalVolunteers: 0,
    activeVolunteers: 0,
    totalDonations: 0,
    activeDonations: 0,
    verifiedReports: "0/0",
    totalBalance: 0,
  });
  const [activities, setActivities] = useState<CommunityActivity[]>([]);
  const [communityProfile, setCommunityProfile] =
    useState<CommunityProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [editRequests, setEditRequests] = useState<
    Record<
      string,
      { id: string; status: string; reason: string; admin_note: string | null }
    >
  >({});
  const [editRequestActivity, setEditRequestActivity] =
    useState<CommunityActivity | null>(null);
  const [editRequestReason, setEditRequestReason] = useState("");
  const [submittingEditRequest, setSubmittingEditRequest] = useState(false);

  const handleCancelActivity = async (activity: CommunityActivity) => {
    setCancellingId(activity.id);
    const result = await cancelActivityAction(activity.id);
    if (!result.success) {
      toast.error(result.error ?? "Gagal membatalkan kegiatan.");
    } else {
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activity.id ? { ...a, status: "cancelled" } : a,
        ),
      );
      toast.success(`Kegiatan "${activity.title}" berhasil dibatalkan.`);
    }
    setCancellingId(null);
  };

  const handleStartActivity = async (activity: CommunityActivity) => {
    setStartingId(activity.id);
    const result = await startActivityAction(activity.id);
    if (!result.success) {
      toast.error(result.error ?? "Gagal melaksanakan kegiatan.");
    } else {
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activity.id ? { ...a, status: "ongoing" } : a,
        ),
      );
      toast.success(`Kegiatan "${activity.title}" sedang dilaksanakan.`);
    }
    setStartingId(null);
  };

  const handleDeleteActivity = async (activity: CommunityActivity) => {
    setDeletingId(activity.id);
    const result = await deleteActivityAction(activity.id);
    if (!result.success) {
      toast.error(result.error ?? "Gagal menghapus kegiatan.");
    } else {
      setActivities((prev) => prev.filter((a) => a.id !== activity.id));
      toast.success(`Kegiatan "${activity.title}" berhasil dihapus.`);
    }
    setDeletingId(null);
  };

  const handleSubmitEditRequest = async () => {
    if (!editRequestActivity) return;
    const trimmed = editRequestReason.trim();
    if (!trimmed) {
      toast.error("Alasan pengajuan edit wajib diisi.");
      return;
    }
    setSubmittingEditRequest(true);
    const result = await submitActivityEditRequest(
      editRequestActivity.id,
      trimmed,
    );
    if (result.success) {
      toast.success(
        "Pengajuan edit berhasil dikirim. Menunggu persetujuan admin.",
      );
      setEditRequests((prev) => ({
        ...prev,
        [editRequestActivity.id]: {
          id: result.data?.id ?? "",
          status: "pending",
          reason: trimmed,
          admin_note: null,
        },
      }));
      setEditRequestActivity(null);
      setEditRequestReason("");
    } else {
      toast.error(result.error ?? "Gagal mengajukan permintaan edit.");
    }
    setSubmittingEditRequest(false);
  };

  useEffect(() => {
    if (!profile?.id) return;
    setIsLoading(true);
    Promise.all([
      getCommunityProfile(),
      getCommunityDashboardStats(profile.id),
      getCommunityActivities(profile.id),
    ]).then(([profileData, statsData, activitiesData]) => {
      setCommunityProfile(profileData.success ? profileData.data : null);
      setStats(statsData);
      setActivities(activitiesData);
      setIsLoading(false);
      const communityId = activitiesData[0]?.community_id;
      if (communityId) {
        getCommunityActiveEditRequests(communityId).then((res) => {
          if (res.success) setEditRequests(res.data);
        });
      }
    });
  }, [profile?.id]);

  const isCommunityApproved =
    communityProfile?.is_verified === true &&
    communityProfile?.verification_status === "approved" &&
    !communityProfile?.is_suspended;

  const verificationStatus = communityProfile?.is_suspended
    ? "suspended"
    : (communityProfile?.verification_status ?? "pending");

  const verificationCopy: Record<
    string,
    { title: string; message: string; badge: string }
  > = {
    approved: {
      title: "Komunitas Terverifikasi",
      message:
        "Komunitas Anda sudah disetujui admin dan dapat mengelola kegiatan.",
      badge: "bg-green-100 text-green-700",
    },
    pending: {
      title: "Menunggu Verifikasi Admin",
      message:
        "Dashboard kegiatan akan aktif setelah data komunitas Anda disetujui admin.",
      badge: "bg-yellow-100 text-yellow-700",
    },
    rejected: {
      title: "Verifikasi Ditolak",
      message:
        "Perbaiki data komunitas Anda agar admin dapat meninjau ulang pengajuan.",
      badge: "bg-red-100 text-red-700",
    },
    suspended: {
      title: "Komunitas Ditangguhkan",
      message:
        "Akses pengelolaan kegiatan sedang dibatasi. Hubungi admin untuk informasi lanjutan.",
      badge: "bg-red-100 text-red-700",
    },
  };

  const currentVerification =
    verificationCopy[verificationStatus] ?? verificationCopy.pending;

  const filtered = activities.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "all" || a.status === statusFilter),
  );

  const communityStats = [
    {
      label: "Total Kegiatan",
      value: stats.totalActivities,
      sub: `${stats.completedActivities} terlaksana - ${stats.activeActivities} aktif - ${stats.pendingReviewActivities} menunggu verifikasi`,
      icon: Calendar,
      change: "Data terbaru",
    },
    {
      label: "Total Relawan",
      value: stats.totalVolunteers,
      sub: `${stats.activeVolunteers} relawan kegiatan aktif`,
      icon: Users,
      change: "Data terbaru",
    },
    {
      label: "Total Donasi Uang",
      value: formatCurrency(stats.totalDonations),
      sub: `${formatCurrency(stats.activeDonations)} dari kegiatan aktif`,
      icon: Banknote,
      change: "Data terbaru",
    },
    {
      label: "Total Donasi Barang",
      value: `${stats.totalItemDonations || 0} Barang`,
      sub: `${stats.activeItemDonations || 0} dari kegiatan aktif`,
      icon: Package,
      change: "Data terbaru",
    },
    {
      label: "Total Saldo Komunitas",
      value: formatCurrency(stats.totalBalance),
      sub: "Dana yang telah dicairkan admin ke komunitas",
      icon: Wallet,
      change: "Data terbaru",
    },
    {
      label: "Laporan Terverifikasi",
      value: stats.verifiedReports,
      icon: FileText,
      change: "Data terbaru",
    },
  ];

  return (
    <div className="flex-1 bg-slate-50">
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-12 md:pt-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              {isCommunityApproved ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <span className="text-sm text-primary font-medium">
                {currentVerification.title}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Dashboard Komunitas
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola kegiatan, relawan, dan laporan komunitas Anda
            </p>
          </div>

          {!isLoading && !isCommunityApproved && (
            <Card className="mb-8 border-dashed">
              <CardContent className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Badge className={currentVerification.badge}>
                    {currentVerification.title}
                  </Badge>
                  <h2 className="text-xl font-semibold mt-3">
                    {communityProfile?.name ?? "Komunitas"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                    {currentVerification.message}
                  </p>
                </div>
                <Button asChild>
                  <Link href="/community/dashboard/profile">Edit Profil</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {(isLoading || isCommunityApproved) && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-7 w-16" />
                            <Skeleton className="h-3 w-10" />
                          </div>
                          <Skeleton className="w-10 h-10 rounded-lg" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : communityStats.map((stat) => (
                    <Card key={stat.label}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {stat.label}
                            </p>
                            <p className="text-2xl font-bold text-foreground mt-1">
                              {stat.value}
                            </p>
                            {stat.sub && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {stat.sub}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-green-500" />{" "}
                              {stat.change}
                            </p>
                          </div>
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <stat.icon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          )}

          {/* Kelola Kegiatan */}
          {(isLoading || isCommunityApproved) && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Kelola Kegiatan</CardTitle>
                    <CardDescription>
                      Katalog kegiatan komunitas Anda
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari kegiatan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 w-56"
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusFilterOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button asChild>
                      <Link href="/community/dashboard/activities/create">
                        <Plus className="mr-2 h-4 w-4" /> Buat Kegiatan
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="p-5 border border-border rounded-xl bg-background space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <div className="pt-3 border-t border-border flex gap-2">
                          <Skeleton className="h-9 flex-1 rounded-md" />
                          <Skeleton className="h-9 flex-1 rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {filtered.map((a) => (
                        <div
                          key={a.id}
                          className="p-5 border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all bg-background"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                              {a.title}
                            </h3>
                            <Badge
                              className={`shrink-0 ${statusConfig[a.status]?.className}`}
                            >
                              {statusConfig[a.status]?.label}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(a.start_date)}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />{" "}
                                {a.volunteer_count || 0}/
                                {a.volunteer_quota || 0} relawan
                              </span>
                              <span className="flex items-center gap-1">
                                <Banknote className="h-3.5 w-3.5" />{" "}
                                {formatCurrency(a.funding_raised || 0)}
                              </span>
                            </div>
                            {a.reports && a.reports.length > 0 && (
                              <div className="flex items-center gap-2 text-xs">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Laporan:
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={`text-[10px] px-1.5 py-0 ${statusConfig[a.reports[0].status]?.className}`}
                                >
                                  {statusConfig[a.reports[0].status]?.label}
                                </Badge>
                              </div>
                            )}
                            {(!a.reports || a.reports.length === 0) &&
                              a.status === "completed" && (
                                <div className="flex items-center gap-2 text-xs">
                                  <AlertCircle className="h-3.5 w-3.5 text-orange-500" />
                                  <span className="text-orange-600">
                                    Laporan belum diupload
                                  </span>
                                </div>
                              )}
                          </div>

                          <div className="pt-3 border-t border-border flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              className="flex-1 text-xs h-9"
                              asChild
                            >
                              <Link
                                href={`/community/dashboard/activities/${a.id}/volunteers`}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1.5" /> Kelola
                              </Link>
                            </Button>
                            {a.status === "draft" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs h-9 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40"
                                asChild
                              >
                                <Link
                                  href={`/community/dashboard/activities/${a.id}/edit`}
                                >
                                  <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                                </Link>
                              </Button>
                            ) : a.status === "published" &&
                              editRequests[a.id]?.status === "approved" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs h-9 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40"
                                asChild
                              >
                                <Link
                                  href={`/community/dashboard/activities/${a.id}/edit`}
                                >
                                  <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                                </Link>
                              </Button>
                            ) : a.status === "published" &&
                              editRequests[a.id]?.status === "pending" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                title={`Menunggu persetujuan admin. Alasan: ${editRequests[a.id]?.reason ?? ""}`}
                                className="flex-1 text-xs h-9 opacity-50 cursor-not-allowed"
                              >
                                <Clock className="h-3.5 w-3.5 mr-1.5" />{" "}
                                Menunggu Persetujuan
                              </Button>
                            ) : a.status === "published" ? (
                              <Dialog
                                open={editRequestActivity?.id === a.id}
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setEditRequestActivity(null);
                                    setEditRequestReason("");
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs h-9 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40"
                                    onClick={() => {
                                      setEditRequestActivity(a);
                                      setEditRequestReason("");
                                    }}
                                  >
                                    <Send className="h-3.5 w-3.5 mr-1.5" />{" "}
                                    Ajukan Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Ajukan Edit Kegiatan
                                    </DialogTitle>
                                    <DialogDescription>
                                      Kegiatan &quot;{a.title}&quot; sedang
                                      aktif. Jelaskan alasan Anda ingin mengedit
                                      kegiatan ini. Admin akan meninjau
                                      permintaan sebelum Anda dapat mengedit.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Tuliskan alasan pengajuan edit..."
                                    value={editRequestReason}
                                    onChange={(e) =>
                                      setEditRequestReason(e.target.value)
                                    }
                                    rows={4}
                                  />
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setEditRequestActivity(null);
                                        setEditRequestReason("");
                                      }}
                                    >
                                      Batal
                                    </Button>
                                    <Button
                                      onClick={handleSubmitEditRequest}
                                      disabled={submittingEditRequest}
                                    >
                                      {submittingEditRequest ? (
                                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                      ) : (
                                        <Send className="h-3.5 w-3.5 mr-1.5" />
                                      )}
                                      Kirim Pengajuan
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                title="Kegiatan yang sudah diajukan tidak dapat diedit"
                                className="flex-1 text-xs h-9 opacity-50 cursor-not-allowed"
                              >
                                <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                              </Button>
                            )}
                            {a.status === "published" && (
                              <Button
                                size="sm"
                                disabled={
                                  !isExecutionOngoing(a.execution_date) ||
                                  startingId === a.id
                                }
                                title={
                                  isExecutionOngoing(a.execution_date)
                                    ? "Tandai kegiatan ini sebagai sedang dilaksanakan"
                                    : "Hanya dapat ditekan saat waktu pelaksanaan kegiatan berlangsung"
                                }
                                className="flex-1 text-xs h-9 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                onClick={() => handleStartActivity(a)}
                              >
                                {startingId === a.id ? (
                                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                ) : (
                                  <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                Laksanakan Kegiatan
                              </Button>
                            )}
                            {a.status === "completed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className={`flex-1 text-xs h-9 ${
                                  !a.reports || a.reports.length === 0
                                    ? "border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
                                    : "border-primary/20 text-primary hover:bg-primary/5"
                                }`}
                                asChild
                              >
                                <Link
                                  href={`/community/dashboard/activities/${a.id}/report`}
                                >
                                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                                  {!a.reports || a.reports.length === 0
                                    ? "Upload Laporan"
                                    : "Lihat Laporan"}
                                </Link>
                              </Button>
                            )}
                            {a.status === "pending_review" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={cancellingId === a.id}
                                    className="flex-1 text-xs h-9 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                  >
                                    {cancellingId === a.id ? (
                                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                    ) : (
                                      <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                    )}
                                    Batalkan
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Batalkan kegiatan ini?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Kegiatan &quot;{a.title}&quot; yang sedang
                                      menunggu review akan dibatalkan dan
                                      dihapus dari antrean review admin.
                                      Tindakan ini tidak dapat diurungkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Tidak</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleCancelActivity(a)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Ya, Batalkan
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            {a.status === "cancelled" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={deletingId === a.id}
                                    className="flex-1 text-xs h-9 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                  >
                                    {deletingId === a.id ? (
                                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                    )}
                                    Hapus
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Hapus kegiatan ini?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Kegiatan &quot;{a.title}&quot; yang sudah
                                      dibatalkan akan dihapus secara permanen
                                      beserta data terkaitnya. Tindakan ini
                                      tidak dapat diurungkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Tidak</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteActivity(a)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Ya, Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {filtered.length === 0 && (
                      <div className="text-center py-12">
                        <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                        <p className="text-muted-foreground text-sm">
                          Tidak ada kegiatan ditemukan.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
