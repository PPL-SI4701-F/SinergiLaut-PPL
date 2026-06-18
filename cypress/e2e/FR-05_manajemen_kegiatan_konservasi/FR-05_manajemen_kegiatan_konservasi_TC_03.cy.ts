import { fr05Activities, loginAsFR05Community, visitCommunityDashboard } from './fr05.helpers';

describe('FR-05: Manajemen kegiatan konservasi', () => {
  beforeEach(() => {
    loginAsFR05Community();
  });

  it('TC-FR05-003 - Harus hanya menampilkan kegiatan milik komunitas yang sedang login', () => {
    cy.task('getFR05ActivityOwnership').then((activities: any[]) => {
      const ownActivities = activities.filter((activity) => activity.ownerEmail === 'owner1@example.com');
      const otherCommunityActivity = activities.find((activity) =>
        activity.title.includes(fr05Activities.otherCommunity)
      );

      expect(
        ownActivities.some((activity) => activity.title.includes(fr05Activities.published)),
        'published FR-05 activity belongs to logged-in community'
      ).to.equal(true);
      expect(
        ownActivities.some((activity) => activity.title.includes(fr05Activities.draft)),
        'draft FR-05 activity belongs to logged-in community'
      ).to.equal(true);
      expect(
        ownActivities.some((activity) => activity.title.includes(fr05Activities.pendingReview)),
        'pending review FR-05 activity belongs to logged-in community'
      ).to.equal(true);
      expect(
        ownActivities.some((activity) => activity.title.includes(fr05Activities.completed)),
        'completed FR-05 activity belongs to logged-in community'
      ).to.equal(true);
      expect(
        otherCommunityActivity,
        'other community activity seed exists; run TC-FR05-001 first when using reset only in TC_01'
      ).to.not.equal(undefined);
      expect(otherCommunityActivity.ownerEmail).to.not.equal('owner1@example.com');
    });

    visitCommunityDashboard();

    cy.contains(fr05Activities.published).should('be.visible');
    cy.contains(fr05Activities.draft).should('be.visible');
    cy.contains(fr05Activities.pendingReview).should('be.visible');
    cy.contains(fr05Activities.otherCommunity).should('not.exist');
  });
});
