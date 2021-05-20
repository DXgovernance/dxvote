import React from 'react';
import ReactDOM from 'react-dom';
import { createWeb3ReactRoot } from '@web3-react/core';
import 'index.css';
import App from 'App';
import * as serviceWorker from './serviceWorker';
import { web3ContextNames } from 'provider/connectors';
import ThemeProvider, { GlobalStyle } from './theme';
import Web3 from 'web3';
import moment from 'moment';

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
      <>
        <GlobalStyle />
        <App />
      </>
    </ThemeProvider>
  </Web3ProviderInjected>
);
ReactDOM.render(Root, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
