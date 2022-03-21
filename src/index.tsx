import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, useLocation } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import Web3ReactManager from 'components/Web3ReactManager';
import Web3 from 'web3';
import moment from 'moment';
import styled from 'styled-components';
import * as serviceWorker from './serviceWorker';

import ThemeProvider, { GlobalStyle } from './theme';

import Header from './components/Header';
import Footer from './components/Footer';
import GlobalErrorBoundary from './components/ErrorBoundary/GlobalErrorBoundary';
import PageRouter from './PageRouter';

import ProposalsPage from './pages/proposals';
import { SubmitProposalPage } from './pages/SubmitProposal';
import { NewProposalTypePage } from './pages/NewProposalType';
import UserPage from './pages/User';
import ProposalPage from './pages/Proposal';
import InfoPage from './pages/Info';
import ConfigPage from './pages/Configuration';
import FAQPage from './pages/FAQ';
import ForumPage from './pages/Forum';
import CachePage from 'pages/Cache';
import { CreateMetadataPage } from 'pages/Metadata';
import GuildsApp from './GuildsApp';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MultichainProvider from './contexts/MultichainProvider';
import useJsonRpcProvider from './hooks/Guilds/web3/useJsonRpcProvider';
import { useEffect } from 'react';
import { useContext } from './contexts';
import { DEFAULT_CHAIN_ID } from './utils';

import EtherSWRManager from 'components/Guilds/EtherSWRManager';

const Content = styled.div`
  margin: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 85%;
`;

moment.updateLocale('en', {
  relativeTime: {
    s: '1 second',
    m: '1 minute',
    h: '1 hour',
    d: '1 day',
  },
});

function getLibrary(provider) {
  return new Web3(provider);
}

const Routes = () => {
  const location = useLocation();
  return (
    <PageRouter>
      <Route exact path="/">
        {' '}
        <ProposalsPage />{' '}
      </Route>
      <Route exact path="/config">
        {' '}
        <ConfigPage />{' '}
      </Route>
      <Route exact path="/forum">
        {' '}
        <ForumPage />{' '}
      </Route>
      <Route exact path="/faq">
        {' '}
        <FAQPage />{' '}
      </Route>
      <Route exact path="/cache">
        {' '}
        <CachePage />{' '}
      </Route>
      <Route exact path="/:network/proposals">
        {' '}
        <ProposalsPage />{' '}
      </Route>
      <Route exact path="/:network/create/type">
        {' '}
        <NewProposalTypePage />{' '}
      </Route>
      <Route path="/:network/create/submit">
        {' '}
        <SubmitProposalPage />{' '}
      </Route>
      <Route path="/:network/create/metadata/:proposalType">
        {' '}
        <CreateMetadataPage />{' '}
      </Route>
      <Route exact path="/:network/info">
        {' '}
        <InfoPage />{' '}
      </Route>
      <Route exact path="/:network/user/:address">
        {' '}
        <UserPage />{' '}
      </Route>
      <Route exact path="/:network/proposal/:proposalId">
        {' '}
        <ProposalPage />{' '}
      </Route>
      {location.pathname.indexOf('/proposals') < 0 &&
        location.pathname.indexOf('/create/metadata') < 0 && <Footer />}
    </PageRouter>
  );
};

const SplitApp = () => {
  // This split between DXvote and Guilds frontends are temporary.
  // We'll eventually converge changes on the Guilds side to DXvote.
  const location = useLocation();
  const isGuilds = location.pathname.startsWith('/guilds');

  const {
    context: { ensService },
  } = useContext();
  const mainnetProvider = useJsonRpcProvider(DEFAULT_CHAIN_ID);

  useEffect(() => {
    ensService.setWeb3Provider(mainnetProvider);
  }, [mainnetProvider, ensService]);

  return (
    <EtherSWRManager>
      {!isGuilds ? (
        <Switch>
          <Web3ReactManager>
            <GlobalStyle />
            <Content>
              <Header />
              <Routes />
              <ToastContainer />
            </Content>
          </Web3ReactManager>
        </Switch>
      ) : (
        <GuildsApp />
      )}
    </EtherSWRManager>
  );
};

const Root = () => {
  return (
    <GlobalErrorBoundary>
      <Web3ReactProvider getLibrary={getLibrary}>
        <MultichainProvider>
          <ThemeProvider>
            <HashRouter>
              <SplitApp />
            </HashRouter>
          </ThemeProvider>
        </MultichainProvider>
      </Web3ReactProvider>
    </GlobalErrorBoundary>
  );
};
ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
