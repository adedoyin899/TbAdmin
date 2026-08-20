describe('Auth Flow', () => {
  it('logs in with real seeded credentials (maz@talentbridge.cv)', () => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').clear().type('maz@talentbridge.cv');
    cy.get('input[type="password"]').clear().type('temp_password_123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/funnel');
  });

  it('logs in with email/password', () => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').clear().type('test@example.com');
    cy.get('input[type="password"]').clear().type('password');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/funnel');
  });

  it('shows error on invalid email format', () => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').clear().type('invalid');
    cy.get('input[type="password"]').clear().type('password');
    cy.get('button[type="submit"]').click();
    cy.contains(/valid email|invalid email/i).should('be.visible');
  });

  it('persists session on reload', () => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').clear().type('maz@talentbridge.cv');
    cy.get('input[type="password"]').clear().type('temp_password_123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard/funnel');
    cy.reload();
    cy.url().should('include', '/dashboard/funnel');
  });

  it('logs out successfully and clears session', () => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').clear().type('maz@talentbridge.cv');
    cy.get('input[type="password"]').clear().type('temp_password_123');
    cy.get('button[type="submit"]').click();
    cy.get('#logout-btn').click();
    cy.url().should('equal', 'http://localhost:5173/');
  });
});
