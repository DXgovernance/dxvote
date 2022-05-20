import localhostConfigJSON from '../../../src/configs/localhost/config.json';
import { clickAnywhereToClose } from '../../utils';

class Guilds {
  public proposalsListId: string;
  public sidebarId: string;
  public createProposalTitleId: string;
  public createProposalLinkId: string;
  public createProposalEditorId: string;
  public connectWalletId: string;
  public guildCardId: string;
  public proposalCard: string;
  public createProposalBtn: string;
  public proposalTypeContinueBtn: string;
  public actionBuilderCreateProposalBtn: string;
  public openStakeTokensModalBtn: string;
  public deployedGuilds: string[];

  constructor() {
    this.proposalsListId = 'proposals-list';
    this.sidebarId = 'sidebar';
    this.createProposalTitleId = 'create-proposal-title';
    this.createProposalLinkId = 'create-proposal-link';
    this.createProposalEditorId = 'editor-content';
    this.connectWalletId = 'connectWalletBtn';
    this.guildCardId = 'guildCard';
    this.proposalCard = 'proposal-card';
    this.createProposalBtn = 'create-proposal-button';
    this.proposalTypeContinueBtn = 'proposal-type-continue-button';
    this.actionBuilderCreateProposalBtn = 'create-proposal-action-button';
    this.openStakeTokensModalBtn = 'open-stake-tokens-modal-btn';
    this.deployedGuilds = localhostConfigJSON.guilds;
  }

  goToGuildsPage(address?: string) {
    const baseUrl = Cypress.config('baseUrl');
    const network = Cypress.env('network');
    cy.visit(`${baseUrl}/guilds/${network}${address ? `/${address}` : ''}`, {
      timeout: 120000,
    }).wait(2000);
  }

  shouldRenderProposalsList() {
    cy.findByTestId(this.proposalsListId).should('be.visible');
  }

  shouldRenderSidebar() {
    cy.findByTestId(this.sidebarId).should('be.visible');
  }

  fillCreateProposalForm() {
    cy.findByTestId(this.createProposalTitleId)
      .focus()
      .type('Test automated proposal');
    cy.findByTestId(this.createProposalLinkId)
      .focus()
      .type(
        'https://daotalk.org/t/test-synpress-proposal-07-02-2022-03-04-2022/4003'
      );
    cy.findByTestId(this.createProposalEditorId)
      .find('div')
      .type(
        'Test Contributor proposal{enter}Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        { force: true }
      );
  }

  clickOpenWalletModalBtn() {
    cy.findByTestId(this.connectWalletId).click();
  }

  clickOnGuildCard(guildName: string) {
    const network = Cypress.env('network');
    cy.findAllByTestId(this.guildCardId).contains(guildName).first().click();
    cy.wait(2000);
    cy.url().then(url =>
      this.deployedGuilds.some(address =>
        url.includes(`guilds/${network}/${address}`)
      )
    );
  }

  connectToMetamask = accountName => {
    cy.switchMetamaskAccount(accountName);
    this.clickOpenWalletModalBtn();
    cy.findByTestId('wallet-option-MetaMask').eq(0).click();
    cy.wait(2000);
    cy.acceptMetamaskAccess(true);
    clickAnywhereToClose();
    cy.wait(500);
  };
}

const guilds: Guilds = new Guilds();

export default guilds;

