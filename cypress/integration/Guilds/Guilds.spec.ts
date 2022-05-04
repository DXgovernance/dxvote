/// <reference types="cypress" />
import Guilds from '../../support/pageObjects/Guilds';
import { clickAnywhereToClose } from '../../utils';

describe('Guilds', () => {
  it('Should show deployed guilds in LandingPage', () => {
    Guilds.goToGuildsPage();
    cy.findAllByTestId('guildCard').should(
      'have.length',
      Guilds.deployedGuildsAddresses.length
    );
  });

  it('Should redirect to guild page', () => {
    cy.findAllByTestId('guildCard')
      .eq(1)
      .invoke('attr', 'href')
      .then(href => {
        cy.findAllByTestId('guildCard').eq(1).click();
        cy.url().should('include', href);
      });
  });

  it('Should render proper components on Guild page', () => {
    Guilds.shouldRenderProposalsList();
    Guilds.shouldRenderSidebar();
  });

  it('Should be able to connect with metamask account', () => {
    Guilds.clickOpenWalletModalBtn();
    cy.findByTestId('wallet-option-MetaMask').eq(0).click();
    cy.waitFor(null, 1000);
    cy.acceptMetamaskAccess(true);
    clickAnywhereToClose();
  });

  it('Should trigger Create Proposal', () => {
    cy.findByTestId('create-proposal-button').should('be.visible').click();
    cy.url().should('include', '/proposalType');
    cy.findByTestId('proposal-type-continue-button')
      .should('be.visible')
      .click();
    cy.url().should('include', '/create');
    Guilds.fillCreateProposalForm();
    cy.findByTestId('create-proposal-action-button').click();
  });
});

