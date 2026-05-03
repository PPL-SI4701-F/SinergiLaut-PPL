"use client"
import dynamic from "next/dynamic"
import { Calendar, MapPin, Users, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils/helpers"

const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-secondary animate-pulse rounded-xl flex items-center justify-center text-muted-foreground">Memuat peta...</div>
})

export function ActivityDetailTab({ activity }: { activity: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Tanggal Mulai</p>
                <p className="font-medium text-sm">{formatDate(activity.start_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Lokasi</p>
                <p className="font-medium text-sm">{activity.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Relawan</p>
                <p className="font-medium text-sm">{activity.volunteer_count} / {activity.volunteer_quota} slot</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium text-sm text-green-600">
                  {activity.volunteer_count < activity.volunteer_quota ? "Pendaftaran Terbuka" : "Slot Penuh"}
                </p>
              </div>
            </div>
          </div>
          <h3 className="font-semibold text-foreground mb-3">Deskripsi Kegiatan</h3>
          <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line mb-6">{activity.description}</div>

          {activity.latitude && activity.longitude && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Peta Lokasi
              </h3>
              <MapView lat={Number(activity.latitude)} lng={Number(activity.longitude)} label={activity.title} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
