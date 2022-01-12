import {
  HashRouter,
  Route,
  Switch,
  useHistory,
  Redirect,
} from 'react-router-dom';
//import { useParams } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { EthSWRConfig } from 'ether-swr';
import { Container } from './components/Guilds/common/Layout';

import Header from './components/Guilds/Header';
import GuildsPage from './pages/Guilds/Guilds';
import ProposalPage from './pages/Guilds/Proposal';
import GlobalStyle from './theme/GlobalTheme';
import theme from './theme/light.json';
import { GuildsContextProvider } from 'contexts/Guilds';
import WalletWeb3Manager from './components/Guilds/Web3Manager/WalletWeb3Manager';
import GlobalErrorBoundary from './components/Guilds/ErrorBoundary/GlobalErrorBoundary';

import useJsonRpcProvider from './hooks/Guilds/web3/useJsonRpcProvider';
import ERC20GuildContract from './contracts/ERC20Guild.json';

const GuildsApp = () => {
  const history = useHistory();

  const isTestingEnv = !window.location?.hostname?.startsWith('dxvote.eth');
  //const { guild_id: guildId } = useParams<{ guild_id?: string }>();
  const provider = useJsonRpcProvider();

  if (!isTestingEnv) {
    history.push('/');
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <HashRouter basename="/guilds">
        <GlobalErrorBoundary>
          <WalletWeb3Manager>
            <EthSWRConfig
              value={{
                web3Provider: provider,
                ABIs: new Map([
                  [
                    // If we need to generate this for each guildId we may need this wrapping after each route
                    '0x9cdc16b5f95229b856cba5f38095fd8e00f8edef',
                    ERC20GuildContract.abi,
                  ],
                ]),
                // If we need different polls in each part of the app we can reconfigure this as param when fetching
                // or a different wrapp for each. Remove this line when we are all set up.
                refreshInterval: 30000,
              }}
            >
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
            </EthSWRConfig>
          </WalletWeb3Manager>
        </GlobalErrorBoundary>
      </HashRouter>
    </ThemeProvider>
  );
};

export default GuildsApp;
