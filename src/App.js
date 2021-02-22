import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import Web3ReactManager from 'components/Web3ReactManager';
import Header from './components/Header';
import Footer from './components/Footer';
import ProposalsPage from './pages/Proposals';
import NewProposalPage from './pages/NewProposal';
import UserPage from './pages/User';
import ProposalPage from './pages/Proposal';
import SchemePage from './pages/Scheme';
import ConfigPage from './pages/Configuration';

const App = () => {
  return (
    <HashRouter>
      <Switch>
        <Web3ReactManager>
        <div className="Container">
          <Header />
          <Route exact path="/"> <ProposalsPage /> </Route>
          <Route exact path="/new"> <NewProposalPage /> </Route>
          <Route exact path="/config"> <ConfigPage /> </Route>
          <Route exact path="/user/:address"> <UserPage /> </Route>
          <Route exact path="/scheme/:schemAddress"> <SchemePage /> </Route>
          <Route exact path="/scheme/:schemAddress/proposal/:proposalId"> <ProposalPage /> </Route>
          <Footer />
        </div>
        </Web3ReactManager>
      </Switch>
    </HashRouter>
  );
};

export default App;
