describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://poker-planning-101.vercel.app/');

    cy.get('input#username').should('be.visible').clear().type('cy-press', { delay: 0 }).should('contain.value', 'cy-press');

    cy.intercept('_app/remote/*/createRoom').as('createRoom');
    cy.get('button').contains('Créer une nouvelle salle').click();
    cy.intercept('_app/remote/*/fetchVotesAndUsersByRoomId?**').as('fetchVotesAndUsersByRoomId');

    cy.wait(['@createRoom']).then(() => {
      cy.url().should('not.equal', 'https://poker-planning-101.vercel.app/');

      cy.contains('Invitez votre équipe dans la salle : https://poker-planning-101.vercel.app/');

      cy.get('div.messages').contains('cy-press joined the room');

      cy.get('table.users-status tbody tr td')
        .first()
        .should('have.text', 'cy-press')
        .next()
        .should('contain', '🤔')
        .next()
        .should('contain', '🤔')
        .next()
        .should('contain', '🤔');

      cy.contains('Une seule tâche simple').click();
      cy.get('table.users-status tbody tr td', { timeout: 60000 })
        .first()
        .should('have.text', 'cy-press')
        .next()
        .should('contain', '✅')
        .next()
        .should('contain', '🤔')
        .next()
        .should('contain', '🤔');

      cy.wait(['@fetchVotesAndUsersByRoomId']);
      cy.get('div.stats ul li')
        .should('have.length', 1)
        .each(($el) => {
          expect($el).to.have.text('Votre valeur 0.5');
        });

      cy.contains('1 à 2 jours').click();
      cy.get('table.users-status tbody tr td')
        .first()
        .should('have.text', 'cy-press')
        .next()
        .should('contain', '✅')
        .next()
        .should('contain', '✅')
        .next()
        .should('contain', '🤔');

      cy.wait(['@fetchVotesAndUsersByRoomId']);
      cy.get('div.stats ul li')
        .should('have.length', 1)
        .each(($el) => {
          expect($el).to.have.text('Votre valeur 2');
        });

      cy.contains('Certaines inconnues existent').click();
      cy.get('table.users-status tbody tr td')
        .first()
        .should('have.text', 'cy-press')
        .next()
        .should('contain', '✅')
        .next()
        .should('contain', '✅')
        .next()
        .should('contain', '✅');

      cy.wait(['@fetchVotesAndUsersByRoomId']);
      cy.get('div.stats ul li')
        .should('have.length', 1)
        .each(($el) => {
          expect($el).to.have.text('Votre valeur 2');
        });

      cy.contains('Une seule tâche simple').click();
      cy.get('table.users-status tbody tr td')
        .first()
        .should('have.text', 'cy-press')
        .next()
        .should('contain', '🤔')
        .next()
        .should('contain', '✅')
        .next()
        .should('contain', '✅');

      cy.wait(['@fetchVotesAndUsersByRoomId']);
      cy.get('div.stats ul li')
        .should('have.length', 1)
        .each(($el) => {
          expect($el).to.have.text('Votre valeur 3');
        });
    });
  });
});
