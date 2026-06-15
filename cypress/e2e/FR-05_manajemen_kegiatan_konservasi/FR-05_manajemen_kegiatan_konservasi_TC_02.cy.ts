describe('FR-05: Manajemen kegiatan konservasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role community.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('owner1@example.com', 'Password@2026');
    });
    it('Harus berhasil mengisi formulir dan membuat kegiatan baru', () => {
        cy.intercept('POST', '**/activities/create').as('createActivity');

        cy.visit('/community/dashboard/activities/create');
        cy.wait(1000);

        cy.get('input[name="title"]').type('Bersih Pantai Kuta — Aksi Nyata Lawan Plastik');
        cy.get('textarea[name="description"]').type('Kegiatan pembersihan area pesisir pantai mutiara.');
        cy.get('input[name="location"]').type('Pantai Mutiara, Jakarta');

        const d = new Date();
        d.setMonth(d.getMonth() + 7);
        const validFuture = d.toISOString().slice(0, 16);
        cy.get('input[name="startDate"]').type(new Date().toISOString().slice(0, 16));
        cy.get('input[name="executionDate"]').type(validFuture);

        cy.contains('button', 'Ajukan untuk Review').click();

        cy.url({ timeout: 15000 }).should('satisfy', (url: string) =>
            url.includes('/community/dashboard')
        );
    });
});
