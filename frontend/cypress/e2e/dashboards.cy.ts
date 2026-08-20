describe('Dashboard Navigation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();
  });

  it('loads funnel dashboard by default', () => {
    cy.url().should('include', '/dashboard/funnel');
    cy.contains(/signup started|funnel conversion/i).should('be.visible');
  });

  it('navigates to features dashboard', () => {
    cy.contains('Features').click();
    cy.url().should('include', '/dashboard/features');
    cy.contains(/block adoption|feature adoption/i).should('be.visible');
  });

  it('navigates to retention dashboard', () => {
    cy.contains('Retention').click();
    cy.url().should('include', '/dashboard/retention');
    cy.contains(/7-day retention|retention/i).should('be.visible');
  });

  it('navigates to email dashboard', () => {
    cy.contains('Email').click();
    cy.url().should('include', '/dashboard/email');
    cy.contains(/campaign|all campaigns/i).should('be.visible');
  });

  it('filters funnel data by date range', () => {
    cy.get('#funnel-date-range-btn').should('exist');
    cy.contains(/funnel conversion|signup started/i).should('be.visible');
  });

  it('filters funnel data by signup source', () => {
    cy.get('#funnel-signup-source').select('organic');
    cy.contains(/funnel conversion|signup started/i).should('be.visible');
  });
});
