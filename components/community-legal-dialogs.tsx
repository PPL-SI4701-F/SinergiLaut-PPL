"use client"

import type { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function LegalSection({ title, items }: { title: string; items: ReactNode[] }) {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
      <div className="space-y-1.5 text-sm text-muted-foreground leading-relaxed">
        {items.map((item, i) => (
          <p key={i}>{item}</p>
        ))}
      </div>
    </div>
  )
}

function LegalDialog({ trigger, title, children }: { trigger: ReactNode; title: string; children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">{children}</div>
      </DialogContent>
    </Dialog>
  )
}

export function CommunityTermsDialog({ trigger }: { trigger: ReactNode }) {
  return (
    <LegalDialog trigger={trigger} title="Syarat & Ketentuan Pendaftaran Komunitas">
      <LegalSection
        title="1. Pendahuluan"
        items={[
          `Selamat datang di SinergiLaut. Syarat dan Ketentuan ini mengatur pendaftaran dan penggunaan layanan platform SinergiLaut oleh organisasi, LSM, atau komunitas independen ("Komunitas"). Dengan mendaftar dan menggunakan platform kami, Anda setuju untuk terikat penuh oleh syarat-syarat berikut.`,
        ]}
      />
      <LegalSection
        title="2. Syarat Kelayakan & Pendaftaran"
        items={[
          "Komunitas yang mendaftar harus berfokus pada konservasi laut, perlindungan ekosistem pesisir, edukasi bahari, atau keberlanjutan lingkungan.",
          `Pendaftar ("Admin") harus merupakan perwakilan sah dari Komunitas yang memiliki kewenangan untuk membuat keputusan dan mengelola akun di platform SinergiLaut.`,
          "Seluruh informasi dan dokumen pendukung yang diberikan selama proses pendaftaran (seperti surat keputusan, identitas, dsb.) harus akurat, sah, dan terbaru. SinergiLaut berhak menolak pendaftaran atau mencabut status verifikasi apabila ditemukan pemalsuan data.",
        ]}
      />
      <LegalSection
        title="3. Kewajiban Komunitas"
        items={[
          "Pembuatan Kegiatan: Komunitas berhak mempublikasikan kegiatan kerelawanan dan konservasi. Semua kegiatan harus bersifat legal, aman, dan mematuhi norma sosial serta regulasi pemerintah setempat.",
          "Manajemen Relawan: Komunitas wajib memberikan informasi yang jelas terkait tugas, risiko, dan logistik kepada relawan, serta memperlakukan semua relawan secara adil tanpa diskriminasi.",
          "Pelaporan Dampak: Komunitas yang melakukan kegiatan berskala besar diharapkan untuk mengunggah pembaruan status dan metrik dampak (misal: jumlah bibit mangrove, berat sampah yang dikumpulkan) sebagai bentuk transparansi.",
        ]}
      />
      <LegalSection
        title="4. Penggalangan Dana (Donasi)"
        items={[
          "Komunitas terverifikasi diperbolehkan menggunakan fitur penggalangan dana di SinergiLaut.",
          "100% donasi (setelah dipotong biaya gateway pembayaran pihak ketiga jika ada) wajib dialokasikan untuk operasional kegiatan konservasi yang bersangkutan.",
          "Komunitas wajib memberikan laporan pertanggungjawaban penggunaan dana kepada para donatur melalui platform.",
        ]}
      />
      <LegalSection
        title="5. Penangguhan & Penghentian Akun"
        items={[
          "SinergiLaut berhak untuk secara sepihak menangguhkan, menurunkan (take-down) kegiatan, atau menghapus akun Komunitas apabila terbukti melakukan:",
          "• Penipuan, penggelapan dana, atau penyalahgunaan data relawan.",
          "• Aktivitas yang melanggar hukum, merusak lingkungan, atau merugikan pihak lain.",
          "• Pelanggaran berturut-turut terhadap Syarat & Ketentuan ini.",
        ]}
      />
    </LegalDialog>
  )
}

export function CommunityPrivacyDialog({ trigger }: { trigger: ReactNode }) {
  return (
    <LegalDialog trigger={trigger} title="Kebijakan Privasi untuk Komunitas">
      <LegalSection
        title="1. Pengumpulan Data"
        items={[
          "Informasi Saat Komunitas mendaftar di SinergiLaut, kami mengumpulkan:",
          "• Data Organisasi: Nama komunitas, alamat operasional, deskripsi, fokus area, dan tautan media sosial/website.",
          "• Data Admin: Nama lengkap, alamat email, dan nomor telepon perwakilan/admin komunitas.",
          "• Dokumen Legal: Bukti registrasi LSM/organisasi, KTP penanggung jawab (hanya untuk keperluan verifikasi internal).",
        ]}
      />
      <LegalSection
        title="2. Penggunaan Data"
        items={[
          "Informasi yang kami kumpulkan digunakan untuk:",
          "• Memverifikasi keabsahan Komunitas untuk memastikan keamanan bagi relawan dan donatur kami.",
          "• Menampilkan profil publik Komunitas di direktori pencarian SinergiLaut. (Catatan: Dokumen legal internal dan nomor telepon pribadi admin tidak akan dipublikasikan ke umum).",
          "• Memfasilitasi komunikasi antara platform, donatur, relawan, dan Komunitas Anda.",
          "• Memberikan informasi administratif, pembaruan fitur, dan dukungan teknis.",
        ]}
      />
      <LegalSection
        title="3. Keamanan Data"
        items={[
          "Kami menerapkan prosedur keamanan standar industri dan enkripsi (termasuk penyimpanan password yang dienkripsi secara aman) untuk melindungi data organisasi Anda dari akses, perubahan, atau pengungkapan yang tidak sah.",
        ]}
      />
      <LegalSection
        title="4. Pembagian Data kepada Pihak Ketiga"
        items={[
          "SinergiLaut tidak akan menjual atau menyewakan informasi pribadi admin maupun database Komunitas kepada pihak ketiga mana pun. Data hanya dapat dibagikan:",
          "• Kepada mitra payment gateway resmi secara terbatas guna memfasilitasi pencairan donasi.",
          "• Apabila diwajibkan oleh hukum, panggilan pengadilan, atau perintah aparat penegak hukum Indonesia yang sah.",
        ]}
      />
      <LegalSection
        title="5. Hak Komunitas"
        items={[
          "Anda berhak untuk kapan saja mengubah, memperbarui informasi profil, atau meminta penghapusan permanen akun Komunitas Anda beserta seluruh riwayat data dengan menghubungi tim support SinergiLaut.",
        ]}
      />
    </LegalDialog>
  )
}
