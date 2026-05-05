"use client"
import { useState, useEffect } from "react"
import { Users, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { updateVolunteerStatus } from "@/lib/actions/volunteer.actions"

export function VolunteerManagementTab({ activity, volunteerPercent, setActivity }: {
  activity: any;
  volunteerPercent: number;
  setActivity: React.Dispatch<React.SetStateAction<any>>;
}) {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (activity && activity.volunteer_registrations) {
      setVolunteers(activity.volunteer_registrations.map((v: any) => ({
        id: v.id,
        name: v.full_name,
        email: v.email,
        phone: v.phone,
        skills: v.skills || [],
        tShirtSize: v.t_shirt_size || "-",
        reason: v.reason || "",
        status: v.status
      })))
    }
  }, [activity?.volunteer_registrations]);

  const approvedCount = volunteers.filter(v => v.status === "approved").length;
  const pendingCount = volunteers.filter(v => v.status === "pending").length;

  const handleAction = async (id: string, action: "approved" | "rejected" | "attended") => {
    // Optimistic UI update
    setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: action } : v));
    
    // Server action to update DB
    const result = await updateVolunteerStatus(id, action);
    
    if (!result.success) {
      toast.error(result.error || "Gagal mengupdate status relawan.");
      // Revert optimistic update
      setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: "pending" } : v));
      return;
    }

    if (action === "approved") {
      toast.success("Relawan berhasil disetujui! ✅")
      setActivity((prev: any) => prev ? { ...prev, volunteer_count: prev.volunteer_count + 1 } : prev)
    } else if (action === "attended") {
      toast.success("Relawan berhasil ditandai hadir! ✅ Mereka kini dapat memberikan ulasan.")
    } else {
      toast.info("Pendaftaran relawan ditolak.");
    }
  };

  const statusBadge = (status: string) => {
    if (status === "attended") return <Badge className="bg-blue-100 text-blue-700">Hadir ✓</Badge>;
    if (status === "approved") return <Badge className="bg-green-100 text-green-700">Disetujui</Badge>;
    if (status === "rejected") return <Badge className="bg-red-100 text-red-700">Ditolak</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700">Menunggu</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Kelola Relawan</CardTitle>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${volunteerPercent}%` }} />
          </div>
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">{activity.volunteer_count} dari {activity.volunteer_quota} orang</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Menunggu</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Disetujui</p>
            </div>
            <div className="text-center p-3 bg-secondary rounded-lg">
              <p className="text-2xl font-bold text-foreground">{volunteers.length}</p>
              <p className="text-xs text-muted-foreground">Total Pendaftar</p>
            </div>
          </div>

          {volunteers.map((v) => (
            <div key={v.id} className={`border rounded-xl overflow-hidden transition-all ${v.status === "pending" ? "border-yellow-300 bg-yellow-50/30 dark:bg-yellow-950/10" : "border-border"}`}>
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    {v.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.email}</p>
                  </div>
                </div>
                {statusBadge(v.status)}
              </button>

              {expandedId === v.id && (
                <div className="px-4 pb-4 border-t border-border pt-4 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Telepon:</span> <span className="font-medium">{v.phone}</span></div>
                    <div><span className="text-muted-foreground">Ukuran Kaos:</span> <span className="font-medium">{v.tShirtSize}</span></div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Keahlian:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {v.skills.map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                  {v.reason && (
                    <div>
                      <span className="text-sm text-muted-foreground">Alasan:</span>
                      <p className="text-sm text-foreground mt-0.5">{v.reason}</p>
                    </div>
                  )}

                  {v.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAction(v.id, "approved")}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Setujui
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction(v.id, "rejected")}>
                        Tolak
                      </Button>
                    </div>
                  )}
                  {v.status === "approved" && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => handleAction(v.id, "attended")}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Tandai Hadir
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
