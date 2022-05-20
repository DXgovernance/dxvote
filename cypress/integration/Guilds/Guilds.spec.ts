/// <reference types="cypress" />
import Guilds from '../../support/pageObjects/Guilds';
import { clickAnywhereToClose, DEPLOYED_GUILDS_NAMES } from '../../utils';

describe('Guilds', () => {
  it('Should show deployed guilds in LandingPage', () => {
    Guilds.goToGuildsPage();
    cy.findAllByTestId('guildCard').should(
      'have.length',
      Guilds.deployedGuilds.length
    );
    DEPLOYED_GUILDS_NAMES.forEach(name => {
      cy.contains(name).should('be.visible');
    });
  });

  it('Should redirect to guild page', () => {
    Guilds.goToGuildsPage();
    Guilds.clickOnGuildCard('DXDGuild');
  });

  it('Should render proper components on Guild page', () => {
    Guilds.goToGuildsPage(Guilds.deployedGuilds[0]);
    Guilds.shouldRenderProposalsList();
    Guilds.shouldRenderSidebar();
  });

  it('Should be able to connect with metamask account', () => {
    Guilds.goToGuildsPage(Guilds.deployedGuilds[0]);
    Guilds.clickOpenWalletModalBtn();
    cy.findByTestId('wallet-option-MetaMask').eq(0).click();
    cy.wait(2000);
    cy.acceptMetamaskAccess(false);
    clickAnywhereToClose();
  });

  it.skip('Should trigger Create Proposal', () => {
    // TODO: make sure that when creating proposal, it is created in the correct guild and acc[2] has voting power, or first test locking is working.
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

