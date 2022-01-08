import {
  HashRouter,
  Route,
  Switch,
  useHistory,
  Redirect,
  useLocation,
} from 'react-router-dom';
import { matchPath } from 'react-router';
import { ThemeProvider } from 'styled-components';
import { Container } from './components/Guilds/common/Layout';

import Header from './components/Guilds/Header';
import GuildsPage from './pages/Guilds/Guilds';
import ProposalPage from './pages/Guilds/Proposal';
import GlobalStyle from './theme/GlobalTheme';
import theme from './theme/light.json';
import { GuildsContextProvider } from 'contexts/Guilds';
import WalletWeb3Manager from './components/Guilds/Web3Manager/WalletWeb3Manager';
import GlobalErrorBoundary from './components/Guilds/ErrorBoundary/GlobalErrorBoundary';

const GuildsApp = () => {
  const history = useHistory();
  const {
    params: { address },
  } = matchPath(useLocation().pathname, {
    path: '/guilds/:chain_name/:address',
  });

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
            <GuildsContextProvider guildAddress={address}>
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
                  <Route path="/:chain_name/:guild_id/proposal/:proposal_id">
                    <ProposalPage />
                  </Route>
                </Switch>
              </Container>
            </GuildsContextProvider>
          </WalletWeb3Manager>
        </GlobalErrorBoundary>
      </HashRouter>
    </ThemeProvider>
  );
};

export default GuildsApp;
