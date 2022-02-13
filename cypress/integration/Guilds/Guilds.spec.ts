/// <reference types="cypress" />
import Guilds from '../../support/pageObjects/Guilds';
import { NETWORKS } from '../../support/utils';

const rinkeby = NETWORKS.find(network => network.id === 4);

describe(`${rinkeby.name} network`, () => {
  // beforeEach(() => {
  //   Guilds.goToGuildsPage(rinkeby.name);
  // });

  describe('Guilds/Proposals Page', () => {
    beforeEach(() => {
      Guilds.goToGuildsPage(rinkeby.name);
    });
    it('Should render proposals list', () => {
      Guilds.shouldRenderProposalsList();
    });

    it('Should render sidebar', () => {
      Guilds.shouldRenderSidebar();
    });
  });

  describe('Guilds/Create Proposal', () => {
    it('Should navigate to proposal type page selection and trigger continue with choosen proposal type', () => {
      Guilds.goToGuildsPage(rinkeby.name);
      Guilds.handleProposalsPageCreateProposalBtnClick();
      Guilds.handleCreateProposalTypeBtnClick();
    });
    // it('asd', () => {});
  });
});
