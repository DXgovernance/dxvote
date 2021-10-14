import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, useLocation } from 'react-router-dom';
import { createWeb3ReactRoot } from '@web3-react/core';
import Web3ReactManager from 'components/Web3ReactManager';
import Web3 from 'web3';
import moment from 'moment';

import * as serviceWorker from './serviceWorker';

import 'index.css';
import ThemeProvider, { GlobalStyle } from './theme';

import { web3ContextNames } from 'provider/connectors';

import Header from './components/Header';
import Footer from './components/Footer';
import PageRouter from './PageRouter';

import ProposalsPage from './pages/Proposals';
import NewProposalPage from './pages/NewProposal';
import { NewProposalTypePage } from './pages/NewProposalType';
import UserPage from './pages/User';
import ProposalPage from './pages/Proposal';
import InfoPage from './pages/Info';
import ConfigPage from './pages/Configuration';
import FAQPage from './pages/FAQ';
import ForumPage from './pages/Forum';
import { CreateMetadataPage } from 'pages/Metadata';

moment.updateLocale('en', {
  relativeTime: {
    s: '1 second',
    m: '1 minute',
    h: '1 hour',
    d: '1 day',
  },
});

const Web3ProviderInjected = createWeb3ReactRoot(web3ContextNames.injected);

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
      <Route exact path="/:network/proposals">
        {' '}
        <ProposalsPage />{' '}
      </Route>
      <Route exact path="/:network/create/type">
        {' '}
        <NewProposalTypePage />{' '}
      </Route>
      <Route path="/:network/create/submit/:proposalType">
        {' '}
        <NewProposalPage />{' '}
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

const Root = (
  <Web3ProviderInjected getLibrary={getLibrary}>
    <ThemeProvider>
      <GlobalStyle />
      <HashRouter>
        <Switch>
          <Web3ReactManager>
            <Header />
            <Routes />
          </Web3ReactManager>
        </Switch>
      </HashRouter>
    </ThemeProvider>
  </Web3ProviderInjected>
);
ReactDOM.render(Root, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
