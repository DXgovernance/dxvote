import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
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
import UserPage from './pages/User';
import ProposalPage from './pages/Proposal';
import InfoPage from './pages/Info';
import ConfigPage from './pages/Configuration';
import FAQPage from './pages/FAQ';
import ForumPage from './pages/Forum';

moment.updateLocale('en', {
  relativeTime : {
    s: "1 second",
    m: "1 minute",
    h: "1 hour",
    d:  "1 day",
  }
});

const Web3ProviderInjected = createWeb3ReactRoot(web3ContextNames.injected);

function getLibrary(provider) {
  return new Web3(provider);
}

const Root = (
  <Web3ProviderInjected getLibrary={getLibrary}>
    <ThemeProvider>
      <GlobalStyle />
      <HashRouter>
        <Switch>
          <Web3ReactManager>
            <Header />
            <PageRouter>
              <Route exact path="/"> <ProposalsPage /> </Route>
              <Route exact path="/new"> <NewProposalPage /> </Route>
              <Route exact path="/info"> <InfoPage /> </Route>
              <Route exact path="/config"> <ConfigPage /> </Route>
              <Route exact path="/faq"> <FAQPage /> </Route>
              <Route exact path="/forum"> <ForumPage /> </Route>
              <Route exact path="/user/:address"> <UserPage /> </Route>
              <Route exact path="/proposal/:proposalId"> <ProposalPage /> </Route>
              <Redirect push to="/"> </Redirect>
            </PageRouter>
            <Footer />
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
