import {
  HashRouter,
  Route,
  Switch,
  useHistory,
  Redirect,
} from 'react-router-dom';
import { EtherSWRConfig } from 'ether-swr';

import { ThemeProvider } from 'styled-components';
import { Container } from './components/Guilds/common/Layout';

import Header from './components/Guilds/Header';
import GuildsPage from './pages/Guilds/Guilds';
import ProposalPage from './pages/Guilds/Proposal';
import CreateProposalPage from 'pages/Guilds/CreateProposal';
import GlobalStyle from './theme/GlobalTheme';
import theme from './theme/light.json';
import { GuildsContextProvider } from 'contexts/Guilds';
import WalletWeb3Manager from './components/Guilds/Web3Manager/WalletWeb3Manager';
import GlobalErrorBoundary from './components/Guilds/ErrorBoundary/GlobalErrorBoundary';
import { TransactionModalProvider } from 'components/Guilds/Web3Modals/TransactionModal';

import useJsonRpcProvider from 'hooks/Guilds/web3/useJsonRpcProvider';
import ERC20GuildContract from 'contracts/ERC20Guild.json';

const GuildsApp = () => {
  const history = useHistory();

  const isTestingEnv = !window.location?.hostname?.startsWith('dxvote.eth');
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
            <GlobalStyle />
            <Header />
            <Container>
              <TransactionModalProvider>
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
                      <EtherSWRConfig
                        value={{
                          web3Provider: provider,
                          ABIs: new Map([
                            [
                              // we can move this probably to a hook to reduce repeat ourselves in each route.
                              '0x9cdc16b5f95229b856cba5f38095fd8e00f8edef',
                              ERC20GuildContract.abi,
                            ],
                          ]),
                          refreshInterval: 30000,
                        }}
                      >
                        <GuildsPage />
                      </EtherSWRConfig>
                    </GuildsContextProvider>
                  </Route>
                  <Route path="/:chain_name/:guild_id/proposal/:proposal_id">
                    <EtherSWRConfig
                      value={{
                        web3Provider: provider,
                        ABIs: new Map([
                          [
                            '0x9cdc16b5f95229b856cba5f38095fd8e00f8edef',
                            ERC20GuildContract.abi,
                          ],
                        ]),
                        refreshInterval: 0,
                      }}
                    >
                      {' '}
                      <ProposalPage />
                    </EtherSWRConfig>
                  </Route>
                  <Route path="/:chain_name/:guild_id/createProposal/:proposal_type">
                    <CreateProposalPage />
                  </Route>
                </Switch>
              </TransactionModalProvider>
            </Container>
          </WalletWeb3Manager>
        </GlobalErrorBoundary>
      </HashRouter>
    </ThemeProvider>
  );
};

export default GuildsApp;
