import { data } from 'cypress/types/jquery';

class Guilds {
  public proposalsListId: string;
  public sidebarId: string;

  constructor() {
    this.proposalsListId = 'proposals-list';
    this.sidebarId = 'sidebar';
  }

  goToGuildsPage(network: string = 'rinkeby') {
    const baseUrl = Cypress.config('baseUrl');
    cy.visit(`${baseUrl}/guilds/${network}`, { timeout: 120000 });
  }

  shouldRenderProposalsList() {
    cy.findByTestId(this.proposalsListId).should('be.visible');
  }

  shouldRenderSidebar() {
    cy.findByTestId(this.sidebarId).should('be.visible');
  }

  handleProposalsPageCreateProposalBtnClick() {
    cy.findByTestId('create-proposal-button').should('be.visible').click();
    cy.url({ timeout: 8000 }).should('contain', '/proposalType');
  }

  handleCreateProposalTypeBtnClick() {
    const proposalsTypeList = cy.findByTestId('proposal-types-list'); // eslint-disable-line

    proposalsTypeList
      .should('be.visible')
      .children('button')
      .should('have.length', 5);

    proposalsTypeList.first().click();

    cy.findByTestId('proposal-type-continue-button').click();

    cy.url({ timeout: 8000 }).should('contain', '/create/proposal_type');
  }
}

const guilds: Guilds = new Guilds();

export default guilds;
