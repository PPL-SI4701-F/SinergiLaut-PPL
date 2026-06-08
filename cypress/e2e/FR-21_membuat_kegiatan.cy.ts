describe('FR-21: Membuat Kegiatan Baru oleh Komunitas', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.setCookie('e2e-bypass-auth', 'community');
  });

  it('Harus menampilkan halaman pembuatan kegiatan dengan form lengkap', () => {
    cy.visit('/community/dashboard/activities/create');
    cy.wait(1000);

    cy.contains('h1', 'Buat Kegiatan Baru').should('be.visible');
    cy.contains('Kegiatan akan direview admin sebelum dipublikasikan').should('be.visible');

    cy.get('input#title').should('be.visible');
    cy.get('select#category').should('be.visible');
    cy.get('textarea#description').should('be.visible');
    cy.get('input#startDate').should('be.visible');
    cy.get('input#executionDate').should('be.visible');
    cy.get('input#location').should('be.visible');
    cy.get('input#volunteerQuota').should('be.visible');
    cy.get('input#fundingGoal').should('be.visible');
  });

  it('Harus menampilkan tombol Simpan sebagai Draft dan Ajukan untuk Review', () => {
    cy.visit('/community/dashboard/activities/create');
    cy.wait(1000);

    cy.contains('button', 'Simpan sebagai Draft').should('be.visible');
    cy.contains('button', 'Ajukan untuk Review').should('be.visible');
  });

  it('Harus menampilkan validasi saat tanggal pelaksanaan kurang dari 1 bulan dari sekarang', () => {
    cy.visit('/community/dashboard/activities/create');
    cy.wait(1000);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const offset = tomorrow.getTimezoneOffset() * 60000;
    const tomorrowLocal = new Date(tomorrow.getTime() - offset).toISOString().slice(0, 16);

    const today = new Date();
    const todayOffset = today.getTimezoneOffset() * 60000;
    const todayLocal = new Date(today.getTime() - todayOffset).toISOString().slice(0, 16);

    cy.get('input#title').type('Bersih Pantai Ancol');
    cy.get('textarea#description').type('Kegiatan membersihkan sampah plastik di sepanjang Pantai Ancol bersama relawan.');
    cy.get('input#location').type('Pantai Ancol, Jakarta');
    cy.get('input#volunteerQuota').type('30');
    cy.get('input#fundingGoal').type('5000000');

    cy.get('input#startDate').invoke('val', todayLocal).trigger('input').trigger('change');
    cy.get('input#executionDate').invoke('val', tomorrowLocal).trigger('input').trigger('change');

    cy.contains('button', 'Ajukan untuk Review').click();
    cy.contains('Tanggal Pelaksanaan Kegiatan harus minimal 1 bulan dari sekarang.').should('be.visible');
  });

  it('Harus mengizinkan komunitas mengisi form kegiatan dengan data yang valid', () => {
    cy.visit('/community/dashboard/activities/create');
    cy.wait(1000);

    cy.get('input#title').type('Bersih Pantai Ancol');
    cy.get('select#category').select(1);
    cy.get('textarea#description').type('Kegiatan membersihkan sampah plastik di sepanjang Pantai Ancol bersama relawan.');
    cy.get('input#location').type('Pantai Ancol, Jakarta');
    cy.get('input#volunteerQuota').type('30');
    cy.get('input#fundingGoal').type('5000000');

    cy.get('input#title').should('have.value', 'Bersih Pantai Ancol');
    cy.get('input#location').should('have.value', 'Pantai Ancol, Jakarta');
    cy.get('input#volunteerQuota').should('have.value', '30');
    cy.get('input#fundingGoal').should('have.value', '5000000');
  });

  it('Harus menampilkan opsi donasi barang ketika checkbox "Terima Donasi Barang" dicentang', () => {
    cy.visit('/community/dashboard/activities/create');
    cy.wait(1000);

    cy.get('input#allowItemDonation').check({ force: true });
    cy.get('input#allowItemDonation').should('be.checked');
  });

  it('Harus menyediakan tautan kembali ke dashboard komunitas', () => {
    cy.visit('/community/dashboard/activities/create');
    cy.wait(1000);

    cy.contains('a', 'Kembali ke Dashboard').should('have.attr', 'href', '/community/dashboard');
  });
});
