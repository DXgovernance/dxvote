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
declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Provides a working example
       */
      setupMetamask(
        secretWordsOrPrivateKey: string,
        network: string | object,
        password: string
      ): Cypress.Chainable<Element>;

      acceptAccess(asd: boolean): Cypress.Chainable<Element>;
      acceptMetamaskAccess(asd: boolean): Cypress.Chainable<Element>;
    }
  }
}

