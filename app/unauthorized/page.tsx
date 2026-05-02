import Link from 'next/link';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Akses Ditolak | SinergiLaut',
  description: 'Anda tidak memiliki hak akses untuk halaman ini.',
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden text-center p-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Akses Ditolak
        </h1>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          Maaf, Anda tidak memiliki hak akses untuk melihat halaman ini. Silakan kembali ke halaman sebelumnya atau menuju ke Beranda.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
          >
            <Home className="w-4 h-4 mr-2" />
            Beranda
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
