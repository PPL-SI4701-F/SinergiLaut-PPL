describe('FR-32: Validasi Laporan dan Pencairan Dana', () => {
    // Data pencairan berasal dari mock E2E pada getAllDisbursements() di
    // lib/actions/disbursement.actions.ts — selalu satu baris berstatus "pending"
    // untuk komunitas "Gerakan Pesisir Hijau Lombok" senilai Rp 2.000.000.

    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('admin1@sinergilaut.id', 'Password@2026'); // Admin Utama
        cy.visit('/admin/disbursements');
        cy.wait(1000);
    });

    it('FR 32 - TC 01 - Harus mengizinkan admin memproses pencairan dana dari Menunggu hingga Selesai', () => {
        // Cari baris pertama yang memiliki status Menunggu dan klik "Tinjau"
        cy.contains('tr', 'Menunggu').contains('button', /Tinjau/i).click();

        cy.contains('Update Status Pencairan').should('be.visible');
        cy.get('input[placeholder*="TRF" i]').type('TRX-123456');
        cy.contains('button', /Setujui & Proses/i).click();

        // Setelah berhasil, modal tertutup dan ada baris yang berstatus Diproses
        cy.contains('Update Status Pencairan').should('not.exist');
        cy.contains('tr', /Diproses/i).should('be.visible');

        // Lanjutkan ke "Selesai" lewat tombol "Update Status" pada baris Diproses
        cy.contains('tr', /Diproses/i).first().contains('button', /Update Status/i).click();
        cy.contains('button', /Tandai Selesai/i).click();

        cy.contains('Update Status Pencairan').should('not.exist');
        cy.contains('tr', /Selesai/i).should('be.visible');
    });

    // ─────────────────────────────────────────────
    // Edge Case 1: Nomor referensi bersifat opsional
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // Edge Case 2: Tandai Gagal (alur negatif)
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // Edge Case 3: Disbursement sudah "completed" - tombol aksi tidak muncul
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // New: Menutup modal tanpa memproses
    // ─────────────────────────────────────────────
    // ─────────────────────────────────────────────
    // New: Tabel pencairan menampilkan kolom dengan benar
    // ─────────────────────────────────────────────
});

// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Validasi Laporan Pertanggungjawaban oleh Admin
// Menutup gap acceptance criteria "Validasi Laporan oleh Admin".
// Mock getAdminReportsList() di lib/actions/dashboard.actions.ts selalu
// mengembalikan satu laporan "Laporan Pertanggungjawaban: Bersih Pantai Besar Bunaken" milik
// komunitas "Gerakan Pesisir Hijau Lombok" berstatus submitted. approveReportAction &
// rejectReportAction mengembalikan { success: true } di mode E2E.
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Pembuatan Pencairan & Validasi Saldo
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Dana Abadi (Endowment)
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// FR-32 (lanjutan): Akses Komunitas ke Data Disbursement
// ════════════════════════════════════════════════════════════════════
