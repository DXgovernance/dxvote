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

  goToGuildsPage(network: string = 'localhost', address?: string) {
    const baseUrl = Cypress.config('baseUrl');
    cy.visit(`${baseUrl}/guilds/${network}${address ? `/${address}` : ''}`, {
      timeout: 120000,
    });
  }

  shouldRenderProposalsList() {
    cy.findByTestId(this.proposalsListId).should('be.visible');
  }

  shouldRenderSidebar() {
    cy.findByTestId(this.sidebarId).should('be.visible');
  }

  fillCreateProposalForm() {
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
        'Test Contributor proposal{enter}Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        { force: true }
      );
  }

  clickOpenWalletModalBtn() {
    cy.findAllByTestId('connectWalletBtn').eq(0).click();
  }
}

const guilds: Guilds = new Guilds();

export default guilds;

