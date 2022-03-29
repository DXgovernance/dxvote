/// <reference types="cypress" />
import Guilds from '../../support/pageObjects/Guilds';

describe('Guilds', () => {
  it('Should show Guild not available page', () => {
    Guilds.goToGuildsPage('localhost', '0xbadAddress555555');
    cy.contains('No guild exists on this address.');
  });

  it('Should render proper components on Guild page', () => {
    const guildAddress = Guilds.deployedGuildsAddresses[0];
    expect(Guilds.deployedGuildsAddresses.length).to.be.equal(3);
    Guilds.goToGuildsPage('localhost', guildAddress);
    Guilds.shouldRenderProposalsList();
    Guilds.shouldRenderSidebar();
  });
});
