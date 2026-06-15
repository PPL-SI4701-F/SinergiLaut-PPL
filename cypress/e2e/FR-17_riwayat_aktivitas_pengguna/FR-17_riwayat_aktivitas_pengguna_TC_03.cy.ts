describe('FR-17: Riwayat aktivitas pengguna', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.login('pending2@user.com', 'Password@2026');
    });
    it('Harus menampilkan kondisi kosong saat pengguna belum pernah mendaftar kegiatan apa pun', () => {
        cy.visit(`/user/dashboard`);
        
        cy.contains(/belum ada|tidak ada|no activity|belum pernah|belum mengikuti/i).should(
            'be.visible'
        );
    });
});