import localhostConfigJSON from '../../../src/configs/localhost/config.json';

class Guilds {
  public proposalsListId: string;
  public sidebarId: string;
  public deployedGuildsAddresses: string[];

  constructor() {
    this.proposalsListId = 'proposals-list';
    this.sidebarId = 'sidebar';
    this.deployedGuildsAddresses = localhostConfigJSON.guilds;
  }

  goToGuildsPage(
    network: string = 'localhost',
    address: string = '0x9cdc16b5f95229b856cba5f38095fd8e00f8edef' // default rinkeby deployed address
  ) {
    const baseUrl = Cypress.config('baseUrl');
    cy.visit(`${baseUrl}/guilds/${network}/${address}`, { timeout: 120000 });
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
