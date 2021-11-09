import { HashRouter, Route, Switch } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { Container } from './components/Guilds/common/Layout';

import Header from './components/Guilds/Header';
import GuildsPage from './pages/Guilds/Guilds';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
        monospace;
  }`;

const GuildsApp = () => {
  return (
    <HashRouter basename="/guilds">
      <GlobalStyle />
      <Header />
      <Container>
        <Switch>
          <Route exact path="/">
            <GuildsPage />
          </Route>
          <Route path="/:guild_id">
            <div>Guild Page</div>
          </Route>
        </Switch>
      </Container>
    </HashRouter>
  );
};

export default GuildsApp;
