class Guilds {
  public proposalsListId: string;
  public sidebarId: string;

  constructor() {
    this.proposalsListId = 'proposal-list';
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
}

const guilds: Guilds = new Guilds();

export default guilds;
