describe('FR-05: Manajemen kegiatan konservasi', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.setCookie('e2e-bypass-auth', 'community');

        cy.intercept('GET', '**/auth/v1/user*', {
            statusCode: 200,
            body: {
                id: 'community-user-id',
                aud: 'authenticated',
                role: 'authenticated',
                email: 'community@example.com',
                user_metadata: { role: 'community' }
            }
        });

        cy.intercept('GET', '**/rest/v1/communities*', {
            statusCode: 200,
            body: { id: 'community-id-123' }
        });
    });

    it('Harus menampilkan pesan validasi saat formulir kosong disubmit', () => {
        cy.visit('/community/dashboard/activities/create');
        cy.wait(1000);

        cy.contains('button', 'Ajukan untuk Review').click();

        cy.get('input[name="title"]').then(($input) => {
            expect(($input[0] as HTMLInputElement).validationMessage).to.not.be.empty;
        });
    });
});
