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
import GlobalStyle from './theme/GlobalTheme';
import theme from './theme/light.json';

import { GuildsContextProvider } from 'contexts/Guilds';
import MainnetWeb3Manager from './components/Guilds/Web3Manager/MainnetWeb3Manager';
import WalletWeb3Manager from './components/Guilds/Web3Manager/WalletWeb3Manager';
import GlobalErrorBoundary from './components/Guilds/ErrorBoundary/GlobalErrorBoundary';

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
          <MainnetWeb3Manager>
            <WalletWeb3Manager>
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
                    <GuildsContextProvider>
                      <GuildsPage />
                    </GuildsContextProvider>
                  </Route>
                  <Route path="/:chain_name/:guild_id/proposal/:proposal_id">
                    <ProposalPage />
                  </Route>
                </Switch>
              </Container>
            </WalletWeb3Manager>
          </MainnetWeb3Manager>
        </GlobalErrorBoundary>
      </HashRouter>
    </ThemeProvider>
  );
};

export default GuildsApp;
