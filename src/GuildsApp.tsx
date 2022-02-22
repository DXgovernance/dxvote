import {
  HashRouter,
  Route,
  Switch,
  useHistory,
  Redirect,
} from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { Container } from './components/Guilds/common/Layout';
import Header from './components/Guilds/Header';
import GuildsPage from './pages/Guilds/Guilds';
import ProposalPage from './pages/Guilds/Proposal';
import CreateProposalPage from 'pages/Guilds/CreateProposal';
import GlobalStyle from './theme/GlobalTheme';
import theme from './theme/dark.json';
import { GuildsContextProvider, TransactionsProvider } from 'contexts/Guilds';
import WalletWeb3Manager from './components/Guilds/Web3Manager/WalletWeb3Manager';
import GlobalErrorBoundary from './components/Guilds/ErrorBoundary/GlobalErrorBoundary';

import ProposalTypes from 'components/Guilds/ProposalTypes';
import { ProposalTypesConfig } from 'configs/proposalTypes';
import ToastNotificationContainer from './components/Guilds/ToastNotifications/ToastNotificationContainer';

const GuildsApp = () => {
  const history = useHistory();

  const isTestingEnv = !window.location?.hostname?.startsWith('dxvote.eth');

  if (!isTestingEnv) {
    history.push('/');
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <HashRouter basename="/guilds">
        <GlobalErrorBoundary>
          <WalletWeb3Manager>
            <TransactionsProvider>
              <GuildsContextProvider>
                <GlobalStyle />
                <Header />
                <Container>
                  <Switch>
                    <Redirect
                      exact
                      from="/"
                      to="/rinkeby/0x9cdc16b5f95229b856cba5f38095fd8e00f8edef"
                    />
                    <Redirect
                      exact
                      from="/:chain_name"
                      to="/:chain_name/0x9cdc16b5f95229b856cba5f38095fd8e00f8edef"
                    />
                    <Route exact path="/:chain_name/:guild_id">
                      <GuildsPage />
                    </Route>
                    <Route exact path="/:chain_name/:guild_id/proposalType">
                      <ProposalTypes data={ProposalTypesConfig} />
                    </Route>
                    <Route path="/:chain_name/:guild_id/proposal/:proposal_id">
                      <ProposalPage />
                    </Route>
                    <Route path="/:chain_name/:guild_id/create/:proposal_type">
                      <CreateProposalPage />
                    </Route>
                  </Switch>
                </Container>
              </GuildsContextProvider>
            </TransactionsProvider>
          </WalletWeb3Manager>
        </GlobalErrorBoundary>
      </HashRouter>

      <ToastNotificationContainer autoClose={10000} limit={4} />
    </ThemeProvider>
  );
};

export default GuildsApp;
