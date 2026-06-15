describe('FR-14: Rating & feedback kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('approved3@user.com', 'Password@2026'); // Maya Sari
    });
    it('Harus menampilkan kondisi kosong saat belum ada feedback pada kegiatan', () => {
        cy.task('getActivityIdByTitle', 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').then((id) => {
            cy.visit(`/activities/${id}?tab=feedback`);
        });
        cy.wait(1000);

        cy.contains(/belum ada ulasan|belum ada feedback|no review|no feedback|belum ada komentar/i).should('be.visible');
    });
});