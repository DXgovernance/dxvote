/// <reference types="cypress" />
import Guilds from '../../support/pageObjects/Guilds';

describe('Guilds', () => {
  before(() => {
    // cy.visit('/');
  });
  // it('Should show Guild not available page', () => {
  //   Guilds.goToGuildsPage('localhost', '0xbadAddress555555');
  //   cy.contains('No guild exists on this address.');
  // });
  it('Should show deployed guilds in LandingPage', () => {
    Guilds.goToGuildsPage();
    cy.findAllByTestId('guildCard').should(
      'have.length',
      Guilds.deployedGuildsAddresses.length
    );
  });

  it('Should redirect to guild page', () => {
    Guilds.goToGuildsPage();
    cy.findAllByTestId('guildCard')
      .eq(1)
      .invoke('attr', 'href')
      .then(href => {
        cy.findAllByTestId('guildCard').eq(1).click();
        cy.url().should('include', href);
      });
    // cy.findAllByTestId('guildCard').eq(1).click();
  });
  it('Should render proper components on Guild page', () => {
    // const guildAddress = Guilds.deployedGuildsAddresses[0];
    // expect(Guilds.deployedGuildsAddresses.length).to.be.equal(3);
    // Guilds.goToGuildsPage('localhost', guildAddress);
    Guilds.shouldRenderProposalsList();
    Guilds.shouldRenderSidebar();
  });

  it('Should be able to connect with metamask account', () => {
    cy.findAllByTestId('connectWalletBtn').eq(0).click();
    cy.findByTestId('wallet-option-MetaMask').eq(0).click();
    cy.waitFor(null, 1000);
    cy.acceptMetamaskAccess(true);
    cy.get('body').click(0, 0);
  });

  it('Should Create Proposal', () => {
    cy.findByTestId('create-proposal-button').should('be.visible').click();
    // cy.findByTestId('create-proposal-button')
    //   .should('be.visible')
    //   .click({ force: true });
    cy.url().should('include', '/proposalType');
    // TODO: CHOOSE WHAT TYPE OF PROPOSAL.
    cy.findByTestId('proposal-type-continue-button')
      .should('be.visible')
      .click();
    cy.url().should('include', '/create');
    cy.findByTestId('create-proposal-title')
      .focus()
      .type('Test automated proposal');
    cy.findByTestId('create-proposal-link')
      .focus()
      .type(
        'https://daotalk.org/t/test-synpress-proposal-07-02-2022-03-04-2022/4003'
      );
    cy.findByTestId('editor-content')
      .find('div')
      .type(
        'Test Contributor proposal{enter}Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        { force: true }
      );
    cy.findByTestId('create-proposal-action-button').click();
  });
});

