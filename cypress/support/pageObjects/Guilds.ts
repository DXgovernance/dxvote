class Guilds {
  public proposalsListId: string;
  public sidebarId: string;
  public text: {
    createProposalTitle: string;
    createProposalLink: string;
    createProposalEditorText: string;
  };
  constructor() {
    this.proposalsListId = 'proposals-list';
    this.sidebarId = 'sidebar';
    this.text = {
      createProposalTitle: 'Member payment proposal [12/10/2022 - 12/12/2022]',
      createProposalLink: 'https://daotalk.org/12309123091231293012930',
      createProposalEditorText:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    };
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
    cy.findByTestId('proposal-types-list')
      .should('be.visible')
      .children('button')
      .should('have.length', 5)
      .first()
      .click();

    cy.findByTestId('proposal-type-continue-button').click();

    cy.url({ timeout: 8000 }).should('contain', '/create/proposal_type');
  }

  checkForCreateProposalPageComponents() {
    cy.url({ timeout: 8000 }).should('contain', '/create/proposal_type');
    cy.findByTestId('create-proposal-editor').should('be.visible');
    cy.findByTestId('create-proposal-title').should('be.visible');
  }

  fillCreateProposalForm() {
    cy.findByTestId('create-proposal-editor-toggle-button').should(
      'be.disabled'
    );

    cy.findByTestId('create-proposal-title').type(
      this.text.createProposalTitle
    );
    cy.findByTestId('create-proposal-link').type(this.text.createProposalLink);
    cy.get('[data-testId="editor-content"] div[contenteditable]')
      .click()
      .type(this.text.createProposalEditorText);

    cy.findByTestId('create-proposal-editor-toggle-button').should(
      'not.be.disabled'
    );
  }

  toggleEditorMode() {
    cy.findByTestId('create-proposal-editor-toggle-button').click();
  }
}

const guilds: Guilds = new Guilds();

export default guilds;
