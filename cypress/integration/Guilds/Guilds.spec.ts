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
      cy.findAllByTestId(Guilds.guildCardId).should(
        'have.length',
        Guilds.deployedGuilds.length
      );
      Object.values(DEPLOYED_GUILDS_NAMES).forEach(name => {
        cy.contains(name).should('be.visible');
      });
    });
    Object.values(DEPLOYED_GUILDS_NAMES).forEach(name => {
      it(`Should redirect to ${name} page`, () => {
        Guilds.goToGuildsPage();
        Guilds.clickOnGuildCard(name);
      });
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
      Guilds.clickOnGuildCard(DEPLOYED_GUILDS_NAMES.DXDGuild);
      Guilds.connectToMetamask(testAcccount.name);
    });

    it('Should open lock modal', () => {
      cy.findByTestId(Guilds.openStakeTokensModalBtn)
        .should('be.visible')
        .click();
      cy.findByTestId(Guilds.stakeTokensModal).should('be.visible');
      cy.findByText('Stake DXDao on localhost tokens').should('be.visible');
    });

    it('Should set max amount, approve spending and close modal', () => {
      cy.wait(2000);
      cy.findByTestId(Guilds.stakeAmountMaxButton)
        .should('be.visible')
        .click({ force: true });
      cy.findByTestId(Guilds.stakeModalAmountInput).should(
        'have.value',
        '50.0'
      );
      cy.findByTestId(Guilds.approveTokenSpendingButton)
        .should('be.visible')
        .click();
      cy.confirmMetamaskPermissionToSpend();
      cy.wait(100);
      cy.contains('Transaction Submitted').should('be.visible');
      clickAnywhereToClose();
      clickAnywhereToClose();
      cy.wait(20000); // wait for transaction
    });

    it('Should open lock modal and lock tokens', () => {
      cy.findByTestId(Guilds.openStakeTokensModalBtn)
        .should('be.visible')
        .click({ force: true });
      cy.wait(2000);
      cy.findByTestId(Guilds.stakeAmountMaxButton)
        .should('be.visible')
        .click({ force: true });
      cy.findByTestId(Guilds.stakeModalAmountInput).should(
        'have.value',
        '50.0'
      );
      cy.findByTestId(Guilds.lockTokenSpendingButton)
        .should('be.visible')
        .click({ force: true });
      cy.confirmMetamaskPermissionToSpend();
      cy.wait(100);
      cy.contains('Transaction Submitted').should('be.visible');
      clickAnywhereToClose();
      clickAnywhereToClose();
      cy.wait(15000); // wait for transaction
    });

    it('Should show member actions dropdown after locking tokens', () => {
      Guilds.goToGuildsPage();
      Guilds.clickOnGuildCard(DEPLOYED_GUILDS_NAMES.DXDGuild);
      cy.findByTestId('member-actions-button').should('be.visible');
    });
  });

  it.skip('Should trigger Create Proposal', () => {
    Guilds.goToGuildsPage();
    Guilds.clickOnGuildCard(DEPLOYED_GUILDS_NAMES.DXDGuild);
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
    Guilds.clickOnGuildCard(DEPLOYED_GUILDS_NAMES.DXDGuild);
    cy.disconnectMetamaskWalletFromAllDapps();
    /// verify that proposal is created
  });
});

