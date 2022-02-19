/// <reference types="cypress" />
import Guilds from '../../support/pageObjects/Guilds';
import { NETWORKS } from '../../support/utils';

const rinkeby = NETWORKS.find(network => network.id === 4);

describe('Guilds', () => {
  beforeEach(() => {
    Guilds.goToGuildsPage(rinkeby.name);
  });

  it('Should render proper components on Proposals page', () => {
    Guilds.shouldRenderProposalsList();
    Guilds.shouldRenderSidebar();
  });

  it.skip('Should Create a proposal', () => {
    Guilds.handleProposalsPageCreateProposalBtnClick();
    Guilds.handleCreateProposalTypeBtnClick();
    Guilds.fillCreateProposalForm();
    Guilds.toggleEditorMode();
  });
});
