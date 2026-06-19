export const fr05User = {
  email: 'owner1@example.com',
  password: 'Password@2026',
};

export const fr05Activities = {
  published: 'Bersih Pantai Kuta',
  draft: 'Rencana Bersih Pantai Sanur',
  pendingReview: 'Edukasi Lingkungan Laut untuk Pelajar SD',
  pendingReviewAlt: 'Pemantauan Terumbu Karang Amed',
  cancelled: 'Festival Laut Nusantara 2026',
  completed: 'Ekspedisi Terumbu Karang Raja Ampat',
  otherCommunity: 'Kegiatan Komunitas Lain FR05',
};

export const fr05ActivitySlugs = {
  pendingReview: 'edukasi-lingkungan-laut-pelajar-sd',
  cancelled: 'festival-laut-nusantara-2026',
};

type FR05ActivityRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

export function loginAsFR05Community() {
  cy.task('resetFR05Data');
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.login(fr05User.email, fr05User.password);
}

export function visitCommunityDashboard() {
  cy.visit('/community/dashboard');
  cy.contains('Kelola Kegiatan', { timeout: 30000 }).should('be.visible');
}

export function activityCard(title: string) {
  return cy.contains(title, { timeout: 30000 }).closest('.border-border');
}

export function waitForFR05Activity(
  slug: string,
  predicate: (activity: FR05ActivityRow | null) => boolean,
  description: string,
  retries = 20,
): Cypress.Chainable<FR05ActivityRow | null> {
  const poll = (attempt: number): Cypress.Chainable<FR05ActivityRow | null> => {
    return cy.task<FR05ActivityRow | null>('getFR05ActivityBySlug', slug, { log: false }).then((activity) => {
      if (predicate(activity)) {
        return activity;
      }

      if (attempt >= retries) {
        throw new Error(`Timeout menunggu ${description}. Data terakhir: ${JSON.stringify(activity)}`);
      }

      return cy.wait(500, { log: false }).then(() => poll(attempt + 1));
    });
  };

  return poll(1);
}
