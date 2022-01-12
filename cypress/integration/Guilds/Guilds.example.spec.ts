/// <reference types="cypress" />
import Guilds from '../../support/pageObjects/Guilds';
import { NETWORKS } from '../../support/utils';

describe('Guilds main Page', () => {
  NETWORKS.forEach(network => {
    describe(`On ${network.name} network`, () => {
      beforeEach(() => {
        Guilds.goToGuildsPage(network.name);
      });

      it('Should render proposals list', () => {
        Guilds.shouldRenderProposalsList();
      });

      it('Should render sidebar', () => {
        Guilds.shouldRenderSidebar();
      });
    });
  });
});
