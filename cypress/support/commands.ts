// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import '@testing-library/cypress/add-commands';
// Synpress types -> https://github.com/Synthetixio/synpress/blob/master/support/index.d.ts
// Synpress commands -> https://github.com/Synthetixio/synpress/blob/master/plugins/index.js
declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Include custom cy.command types
       */
      // customCyCommandType(param?: string): Cypress.Chainable<Element>;
    }
  }
}

