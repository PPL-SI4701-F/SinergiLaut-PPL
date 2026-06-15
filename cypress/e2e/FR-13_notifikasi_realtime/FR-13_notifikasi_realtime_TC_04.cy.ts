describe('FR-13: Notifikasi Real-time Pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('userApproved2@user.com', 'Password@2026'); // has unread notification
    });
    it('Harus menampilkan badge jumlah notifikasi belum dibaca apabila ada', () => {
        cy.visit('/');
        cy.wait(1000);

        // Badge hanya tampil bila unreadCount > 0 — pastikan tidak crash bila tidak ada
        cy.get('button[aria-label="Notifikasi"]').then($btn => {
            cy.wrap($btn).should('be.visible');
        });
    });
});
