describe('Base Dashboard & Social Media Marketing Integration Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();
  });

  it('verifies seamless transition: Login -> Funnel -> Social Media -> Back to Funnel', () => {
    // 1. Initial login loads Funnel
    cy.url().should('include', '/dashboard/funnel');
    cy.contains(/funnel conversion/i).should('be.visible');

    // 2. Switch to Social Media
    cy.contains('Social Media').click();
    cy.url().should('include', '/dashboard/social-media');
    cy.contains(/social media performance & viral reach/i).should('be.visible');

    // 3. Switch back to Funnel
    cy.contains('Funnel Conversion').click();
    cy.url().should('include', '/dashboard/funnel');
    cy.contains(/funnel conversion/i).should('be.visible');
  });

  it('navigates through Social Media platform sub-tabs without error', () => {
    cy.visit('http://localhost:5173/dashboard/social-media');

    // Overview -> LinkedIn
    cy.contains('LinkedIn Organic').click();
    cy.url().should('include', '/social-media/linkedin');
    cy.contains(/linkedin performance & audience telemetry/i).should('be.visible');

    // LinkedIn -> Reddit
    cy.contains('Reddit Community').click();
    cy.url().should('include', '/social-media/reddit');
    cy.contains(/reddit community & subreddit intelligence/i).should('be.visible');

    // Reddit -> Campaigns
    cy.contains('Campaign ROI').click();
    cy.url().should('include', '/campaigns');
    cy.contains(/cross-platform marketing campaigns/i).should('be.visible');

    // Campaigns -> Email Heatmap
    cy.contains('Email Heatmap & Timing').click();
    cy.url().should('include', '/email/detailed');
    cy.contains(/email intelligence & engagement telemetry/i).should('be.visible');
  });

  it('drills down from Email dashboard into Enhanced Email view', () => {
    cy.visit('http://localhost:5173/dashboard/email');
    cy.contains(/timing, heatmap & journey/i).click();
    cy.url().should('include', '/email/detailed');
    cy.contains(/click timing analysis/i).should('be.visible');
    cy.contains(/device engagement distribution/i).should('be.visible');
    cy.contains(/email link heatmap & interaction density/i).should('be.visible');
  });

  it('drills down from Campaigns list into detailed Campaign ROI view', () => {
    cy.visit('http://localhost:5173/campaigns');
    cy.contains(/q3 product launch/i).click();
    cy.contains(/multi-touch attribution & cross-channel roi/i).should('be.visible');
    cy.contains(/total campaign reach/i).should('be.visible');
    cy.contains(/channel conversion breakdown/i).should('be.visible');
  });
});
