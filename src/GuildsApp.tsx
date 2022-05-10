import GlobalErrorBoundary from './old-components/Guilds/ErrorBoundary/GlobalErrorBoundary';
import Header from './old-components/Guilds/Header';
import ToastNotificationContainer from './old-components/Guilds/ToastNotifications/ToastNotificationContainer';
import WalletWeb3Manager from './old-components/Guilds/Web3Manager/WalletWeb3Manager';
import { Container } from './Components/Primitives/Layout';
import GuildsPage from './pages/Guilds/Guilds';
import ProposalPage from './pages/Guilds/Proposal';
import GlobalStyle from './theme/GlobalTheme';
import theme from './theme/dark.json';
import { ProposalTypesConfig } from 'configs/proposalTypes';
import { GuildsContextProvider, TransactionsProvider } from 'contexts/Guilds';
import GuildAvailabilityProvider from 'contexts/Guilds/guildAvailability';
import ProposalTypes from 'old-components/Guilds/ProposalTypes';
import CreateProposalPage from 'pages/Guilds/CreateProposal';
import LandingPage from 'pages/Guilds/LandingPage';
import NotFound from 'pages/Guilds/NotFound';
import { HashRouter, Route, Switch, useHistory } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

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
                  <GuildAvailabilityProvider>
                    <Switch>
                      <Route exact path="/:chainName">
                        <LandingPage />
                      </Route>

                      <Route exact path="/:chainName/:guildId">
                        <GuildsPage />
                      </Route>
                      <Route path="/:chainName/:guildId/proposalType">
                        <ProposalTypes data={ProposalTypesConfig} />
                      </Route>
                      <Route path="/:chainName/:guildId/proposal/:proposalId">
                        <ProposalPage />
                      </Route>
                      <Route path="/:chainName/:guildId/create/:proposalType">
                        <CreateProposalPage />
                      </Route>

                      <Route>
                        <NotFound />
                      </Route>
                    </Switch>
                  </GuildAvailabilityProvider>
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
