/// <reference path="../support/commands.ts" />
/**
 * FR-27: Persetujuan Pendaftar Relawan — SCRUM-213
 *
 * Strategi:
 * - cy.loginViaApi() → POST ke Supabase auth API → token nyata → middleware accept
 * - Data test relawan sudah di-insert ke DB:
 *     "Relawan Aktif"  (status: pending)
 *     "Test User"      (status: approved)
 *
 * Prasyarat:
 * - Isi cypress.env.json: COMMUNITY_PASSWORD = password akun komunitas@sinergilaut.id
 * - Dev server harus jalan (npm run dev)
 */

const COMMUNITY_EMAIL = 'komunitas@sinergilaut.id'
// Activity nyata milik komunitas ini (pantai indah bersama)
const ACTIVITY_ID     = 'dcadba43-81bf-4bee-acc7-7d59e4085df5'
const ACTIVITY_URL    = `/community/dashboard/activities/${ACTIVITY_ID}/volunteers`

describe('FR-27: Persetujuan Pendaftar Relawan', () => {

  // ─────────────────────────────────────────────────────────────────
  // Test tanpa auth — redirect ke /login
  // ─────────────────────────────────────────────────────────────────
  context('Unauthenticated', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
    })

    it('1. Should redirect to /login when user is not authenticated', () => {
      cy.visit(ACTIVITY_URL)
      cy.url({ timeout: 8000 }).should('include', '/login')
    })

    it('2. Should include redirectedFrom param in the /login URL', () => {
      cy.visit(ACTIVITY_URL)
      cy.url({ timeout: 8000 }).should('include', 'redirectedFrom')
    })
  })

  // ─────────────────────────────────────────────────────────────────
  // Test dengan auth community nyata
  // ─────────────────────────────────────────────────────────────────
  context('Authenticated as Community', () => {
    before(() => {
      // Login sekali untuk semua test dalam context ini
      cy.loginViaApi(COMMUNITY_EMAIL, Cypress.env('COMMUNITY_PASSWORD'))
    })

    beforeEach(() => {
      cy.loginViaApi(COMMUNITY_EMAIL, Cypress.env('COMMUNITY_PASSWORD'))
      cy.visit(ACTIVITY_URL)
      cy.contains('Manajemen Relawan', { timeout: 10000 }).should('be.visible')
    })

    // ── AC: Halaman dapat diakses oleh community ──────────────────
    it('3. Should display volunteer management page with correct heading', () => {
      cy.contains('Manajemen Relawan').should('be.visible')
      cy.contains('Daftar Relawan').should('be.visible')
      cy.contains('Kembali ke Dashboard').should('be.visible')
    })

    // ── AC: 4 kartu ringkasan status ──────────────────────────────
    it('4. Should display 4 status summary cards', () => {
      cy.contains('Menunggu').should('be.visible')
      cy.contains('Diterima').should('be.visible')
      cy.contains('Ditolak').should('be.visible')
      cy.contains('Hadir').should('be.visible')
    })

    // ── AC: Search input tersedia ─────────────────────────────────
    it('5. Should display search input for filtering volunteers', () => {
      cy.get('input[placeholder="Cari nama / email / telepon..."]')
        .should('be.visible')
    })

    // ── AC: Daftar relawan tampil dengan data lengkap ─────────────
    it('6. Should display volunteer cards with name, email, badge status', () => {
      // "Relawan Aktif" (pending) harus muncul
      cy.contains('Relawan Aktif').should('be.visible')
      cy.contains('relawan@sinergilaut.id').should('be.visible')
      // "Test User" (approved) harus muncul
      cy.contains('Test User').should('be.visible')
      // Badge status harus ada
      cy.contains('Menunggu').should('exist')
      cy.contains('Diterima').should('exist')
    })

    // ── AC: Search real-time ──────────────────────────────────────
    it('7. Should filter volunteers in real-time when typing in search', () => {
      cy.get('input[placeholder="Cari nama / email / telepon..."]')
        .type('Relawan')
      cy.contains('Relawan Aktif').should('be.visible')
      cy.contains('Test User').should('not.exist')

      cy.get('input[placeholder="Cari nama / email / telepon..."]').clear()
      cy.contains('Test User').should('be.visible')
    })

    // ── AC: Filter by status card ─────────────────────────────────
    it('8. Should filter list when clicking status card', () => {
      // Klik kartu "Menunggu" → hanya pending yang muncul
      cy.contains('Menunggu').first().click()
      cy.contains('Relawan Aktif').should('be.visible')
      cy.contains('Test User').should('not.exist')

      // Klik lagi untuk reset filter
      cy.contains('Menunggu').first().click()
      cy.contains('Test User').should('be.visible')
    })

    // ── AC: Approve pending → toast success + badge berubah ───────
    it('9. Should approve a pending volunteer and show success toast', () => {
      // Cari kartu "Relawan Aktif" (pending) → klik Terima
      cy.contains('.border.border-border.rounded-xl', 'Relawan Aktif')
        .find('button').contains('Terima').click()

      cy.contains('Status relawan berhasil diubah menjadi Diterima', { timeout: 10000 })
        .should('be.visible')

      // Badge di kartu berubah dari Menunggu ke Diterima
      cy.contains('.border.border-border.rounded-xl', 'Relawan Aktif')
        .contains('Diterima').should('be.visible')
    })

    // ── AC: Mark Attended (approved → attended) ───────────────────
    it('10. Should mark an approved volunteer as attended', () => {
      // "Test User" sudah approved → klik Tandai Hadir
      cy.contains('.border.border-border.rounded-xl', 'Test User')
        .find('button').contains('Tandai Hadir').click()

      cy.contains('Status relawan berhasil diubah menjadi Hadir', { timeout: 10000 })
        .should('be.visible')

      cy.contains('.border.border-border.rounded-xl', 'Test User')
        .contains('Hadir').should('be.visible')
    })

    // ── AC: Reject pending → toast + tombol aksi hilang ──────────
    // (Dibuat terpisah supaya state tidak terpengaruh test 9)
    it.skip('11. Should reject a pending volunteer and hide action buttons', () => {
      // Skip: status "Relawan Aktif" sudah berubah di test 9 (approved)
      // Untuk menjalankan test ini, reset status di DB terlebih dahulu
      cy.contains('.border.border-border.rounded-xl', 'Relawan Aktif')
        .find('button').contains('Tolak').click()

      cy.contains('Status relawan berhasil diubah menjadi Ditolak', { timeout: 10000 })
        .should('be.visible')

      // Setelah ditolak, tombol aksi tidak muncul
      cy.contains('.border.border-border.rounded-xl', 'Relawan Aktif')
        .find('button').should('not.exist')
    })
  })
})
