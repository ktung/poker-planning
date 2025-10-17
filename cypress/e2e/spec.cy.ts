describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://poker-planning-101.vercel.app/');

    cy.get('input#username').type('cy-press');

    cy.intercept('_app/remote/*/createRoom').as('createRoom');
    cy.get('button').contains('Create a new room').click();

    cy.wait(['@createRoom']).then(() => {
      cy.url().should('not.equal', 'https://poker-planning-101.vercel.app/');

      cy.contains('Invite your team to the room: https://poker-planning-101.vercel.app/');

      cy.get('div.messages').contains('cy-press joined the room');

      cy.get('table.users-status tbody tr td')
        .should('have.length', 4)
        .each(($el) => {
          expect($el).to.have.text('cy-press');
          expect($el).to.have.text('🤔');
          expect($el).to.have.text('🤔');
          expect($el).to.have.text('🤔');
        });
      cy.contains('Single straightforward task').click();
      cy.get('table.users-status tbody tr td')
        .should('have.length', 4)
        .each(($el) => {
          expect($el).to.have.text('cy-press');
          expect($el).to.have.text('✅');
          expect($el).to.have.text('🤔');
          expect($el).to.have.text('🤔');
        });

      cy.contains('1-2 days').click();
      cy.get('table.users-status tbody tr td')
        .should('have.length', 4)
        .each(($el) => {
          expect($el).to.have.text('cy-press');
          expect($el).to.have.text('✅');
          expect($el).to.have.text('✅');
          expect($el).to.have.text('🤔');
        });

      cy.contains('Some unknowns exist').click();
      cy.get('table.users-status tbody tr td')
        .should('have.length', 4)
        .each(($el) => {
          expect($el).to.have.text('cy-press');
          expect($el).to.have.text('✅');
          expect($el).to.have.text('✅');
          expect($el).to.have.text('✅');
        });

      cy.get('div.stats ul li')
        .should('have.length', 1)
        .each(($el) => {
          expect($el).to.have.text('Your value 2');
        });

      cy.contains('Single straightforward task').click();
      cy.get('table.users-status tbody tr td')
        .should('have.length', 4)
        .each(($el) => {
          expect($el).to.have.text('cy-press');
          expect($el).to.have.text('🤔');
          expect($el).to.have.text('✅');
          expect($el).to.have.text('✅');
        });
    });
  });
});
