"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { 
  FileText, Search, Filter, ArrowRight, CheckCircle2, 
  XCircle, Clock, AlertCircle, FileBarChart
} from "lucide-react"

// Sesuaikan dengan data yang ditarik dari database
type Report = {
  id: string
  title: string
  summary: string
  status: string
  created_at: string
  community: { name: string }
  profiles: { full_name: string }
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchReports() {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from("reports")
        .select(`
          id, title, summary, status, created_at,
          community:communities(name),
          profiles!reports_submitted_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false })
        
      if (error) {
        console.error("Gagal memuat laporan:", error)
      } else {
        setReports(data as unknown as Report[])
      }
      setIsLoading(false)
    }

    fetchReports()
  }, [])

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.community?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "validated": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm"><CheckCircle2 className="w-3 h-3 mr-1" /> Divalidasi</span>
      case "rejected": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200 shadow-sm"><XCircle className="w-3 h-3 mr-1" /> Ditolak</span>
      case "submitted": return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm"><Clock className="w-3 h-3 mr-1" /> Diajukan</span>
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 shadow-sm"><AlertCircle className="w-3 h-3 mr-1" /> Draft</span>
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-600/10 rounded-xl">
              <FileBarChart className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manajemen Laporan</h1>
          </div>
          <p className="text-slate-500 pl-[3.25rem]">Tinjau dan verifikasi laporan kegiatan dan pendanaan dari komunitas SinergiLaut.</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border-transparent bg-slate-50/50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
            placeholder="Cari judul laporan atau nama komunitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl focus:outline-none transition-colors w-full sm:w-auto justify-center">
          <Filter className="w-4 h-4" />
          <span>Filter Status</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Info Laporan</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Komunitas</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Tanggal</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                // Loading Skeleton
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div><div className="h-3 bg-slate-100 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded-lg w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredReports.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText className="w-12 h-12 mb-3 text-slate-300" />
                      <p className="text-lg font-medium text-slate-600">Tidak ada laporan ditemukan</p>
                      <p className="text-sm mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data Rows
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 truncate max-w-[250px]">{report.title}</div>
                      <div className="text-xs text-slate-500 mt-1 truncate max-w-[250px]">{report.summary}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">{report.community?.name || "Komunitas"}</span>
                        <span className="text-xs text-slate-500">Oleh: {report.profiles?.full_name || "Tanpa Nama"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 font-medium">
                        {report.created_at ? format(new Date(report.created_at), "dd MMM yyyy", { locale: localeID }) : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-transparent rounded-xl hover:bg-blue-100 hover:border-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all opacity-0 group-hover:opacity-100">
                        Detail
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
