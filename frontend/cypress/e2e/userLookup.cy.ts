describe('User Lookup', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.contains(/user directory|user lookup/i).click();
  });

  it('searches for users by email', () => {
    cy.get('input[placeholder*="Search"]').type('alice.chen@example.com');
    cy.get('#user-search-btn').click();
    cy.contains('alice.chen@example.com').should('be.visible');
  });

  it('displays user profile on click', () => {
    cy.contains('alice.chen@example.com').click();
    cy.contains(/showcase rooms|activity & timeline|user id/i).should('be.visible');
  });

  it('shows event timeline', () => {
    cy.contains('alice.chen@example.com').click();
    cy.contains('Activity & Timeline').click();
    cy.contains(/signup started|event timeline/i).should('be.visible');
  });

  it('returns to search on back button', () => {
    cy.contains('alice.chen@example.com').click();
    cy.get('#user-back-btn').click();
    cy.get('input[placeholder*="Search"]').should('be.visible');
  });
});
