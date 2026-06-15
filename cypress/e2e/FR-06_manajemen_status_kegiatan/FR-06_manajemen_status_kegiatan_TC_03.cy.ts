describe('FR-06: Manajemen status kegiatan', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        
        // [INSTRUKSI] Melakukan login menggunakan akun riil dari database (db:reset) dengan role admin.
        // Data ini diambil langsung dari database menggunakan UI login, menggantikan mock cy.intercept dan cookie e2e-bypass-auth.
        cy.login('admin1@sinergilaut.id', 'Password@2026');
    });
    it('Harus mengizinkan admin memantau detail kegiatan yang sedang berlangsung', () => {
        cy.visit('/admin/activities');

        // Mock the activity fetch on the detail page which uses Supabase client directly
        cy.intercept('GET', '**/rest/v1/activities*', {
            statusCode: 200,
            body: {
                id: 'activity-3',
                title: 'Bersih Pantai Kuta — Aksi Nyata Lawan Plastik',
                status: 'published',
                start_date: new Date().toISOString(),
                community: { name: 'Eco Ocean' },
                reports: [],
                feedbacks: [],
                volunteer_registrations: []
            }
        });

        cy.contains('Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').should('be.visible');
        cy.contains(/Pantau Detail/i).click({ force: true });

        // Assert redirect and correct content loads from the mock
        cy.url().should('include', '/activities/activity-3');
        cy.contains('Bersih Pantai Kuta — Aksi Nyata Lawan Plastik').should('be.visible');
    });
});
