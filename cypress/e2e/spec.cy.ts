describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://poker-planning-101.vercel.app/');

    cy.get('input#username').type('cy-press');

    cy.intercept('_app/remote/*/createRoom').as('createRoom');
    cy.get('button').contains('Créer une nouvelle salle').click();

    cy.wait(['@createRoom']).then(() => {
      cy.url().should('not.equal', 'https://poker-planning-101.vercel.app/');

      cy.contains('Invitez votre équipe dans la salle : https://poker-planning-101.vercel.app/');

      cy.get('div.messages').contains('cy-press joined the room');

      cy.get('table.users-status tbody tr')
        .children()
        .should('have.length', 4)
        .should('contain', 'cy-press')
        .should('contain', '🤔')
        .should('contain', '🤔')
        .should('contain', '🤔');
      cy.contains('Une seule tâche simple').click();
      cy.get('table.users-status tbody tr', { timeout: 60000 })
        .children()
        .should('have.length', 4)
        .should('contain', 'cy-press')
        .should('contain', '✅')
        .should('contain', '🤔')
        .should('contain', '🤔');

      cy.contains('1 à 2 jours').click();
      cy.get('table.users-status tbody tr')
        .children()
        .should('have.length', 4)
        .should('contain', 'cy-press')
        .should('contain', '✅')
        .should('contain', '✅')
        .should('contain', '🤔');

      cy.contains('Certaines inconnues existent').click();
      cy.get('table.users-status tbody tr')
        .children()
        .should('have.length', 4)
        .should('contain', 'cy-press')
        .should('contain', '✅')
        .should('contain', '✅')
        .should('contain', '✅');

      cy.get('div.stats ul li')
        .should('have.length', 1)
        .each(($el) => {
          expect($el).to.have.text('Votre valeur 2');
        });

      cy.contains('Une seule tâche simple').click();
      cy.get('table.users-status tbody tr')
        .children()
        .should('have.length', 4)
        .should('contain', 'cy-press')
        .should('contain', '🤔')
        .should('contain', '✅')
        .should('contain', '✅');
    });
  });
});
