/// <reference types="cypress" />
import Guilds from '../../support/pageObjects/Guilds';
import {
  clickAnywhereToClose,
  DEPLOYED_GUILDS_NAMES,
  ACCOUNTS,
} from '../../utils';

describe('Guilds', () => {
  before(() => {
    Guilds.goToGuildsPage();
    // create all the accounts
    ACCOUNTS.slice(1, 4).forEach(({ name }) => {
      cy.createMetamaskAccount(name);
    });
  });
  describe('Landing page', () => {
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
    it('Should redirect to DXDGuild page', () => {
      Guilds.goToGuildsPage();
      Guilds.clickOnGuildCard('DXDGuild');
    });
    it('Should redirect to SwaprGuild page', () => {
      Guilds.goToGuildsPage();
      Guilds.clickOnGuildCard('SwaprGuild');
    });
    it('Should redirect to REPGuild page', () => {
      Guilds.goToGuildsPage();
      Guilds.clickOnGuildCard('REPGuild');
    });
  });

  describe('Guild page', () => {
    it('Should render proper components on Guild page', () => {
      Guilds.goToGuildsPage(Guilds.deployedGuilds[0]);
      Guilds.shouldRenderProposalsList();
      Guilds.shouldRenderSidebar();
    });
  });

  describe('Lock tokens', () => {
    const testAcccount = ACCOUNTS[3];
    before(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
    });

    it('Should be able to connect with metamask account', () => {
      Guilds.goToGuildsPage();
      Guilds.clickOnGuildCard('DXDGuild');
      Guilds.connectToMetamask(testAcccount.name);
    });

    it('Should open lock modal', () => {
      cy.findByTestId(Guilds.openStakeTokensModalBtn)
        .should('be.visible')
        .click();
      cy.findByTestId('stake-tokens-modal').should('be.visible');
      cy.findByText('Stake DXDao on localhost tokens').should('be.visible');
    });

    it('Should set max amount, approve spending and close modal', () => {
      cy.wait(2000);
      cy.findByTestId('stake-amount-max-button')
        .should('be.visible')
        .click({ force: true });
      cy.findByTestId('stake-amount-input').should('have.value', '50.0');
      cy.findByTestId('approve-token-spending').should('be.visible').click();
      cy.confirmMetamaskPermissionToSpend();
      cy.wait(500);
      cy.contains('Transaction Submitted').should('be.visible');
      clickAnywhereToClose();
      clickAnywhereToClose();
      cy.wait(3000);
    });

    it('Should open lock modal and lock tokens', () => {
      cy.findByTestId(Guilds.openStakeTokensModalBtn)
        .should('be.visible')
        .click();
      cy.findByTestId('stake-amount-max-button')
        .should('be.visible')
        .click({ force: true });
      cy.findByTestId('stake-amount-input').should('have.value', '50.0');
      cy.findByTestId('lock-token-spending').should('be.visible').click();
      cy.confirmMetamaskPermissionToSpend();
      cy.wait(500);
      cy.contains('Transaction Submitted').should('be.visible');
      clickAnywhereToClose();
      clickAnywhereToClose();
      cy.wait(5000);
    });

    it('Should show member actions dropdown after locking tokens', () => {
      Guilds.goToGuildsPage();
      Guilds.clickOnGuildCard('DXDGuild');
      cy.findByTestId('member-actions-button').should('be.visible');
    });
  });

  it.skip('Should trigger Create Proposal', () => {
    Guilds.goToGuildsPage();
    Guilds.clickOnGuildCard('DXDGuild');
    Guilds.connectToMetamask(ACCOUNTS[0].name);
    cy.findByTestId(Guilds.createProposalBtn).should('be.visible').click();
    cy.url().should('include', '/proposalType');
    cy.findByTestId(Guilds.proposalTypeContinueBtn)
      .should('be.visible')
      .click();
    cy.url().should('include', '/create');
    Guilds.fillCreateProposalForm();
    cy.findByTestId(Guilds.actionBuilderCreateProposalBtn).click();
    cy.wait(3000);
    Guilds.goToGuildsPage();
    Guilds.clickOnGuildCard('DXDGuild');
    // Guilds.goToGuildsPage(DXDGuildAddress);
    // cy.contains('Test automated proposal').should('be.visible');
    /// verify that proposal is created
    cy.disconnectMetamaskWalletFromAllDapps();
  });
});

