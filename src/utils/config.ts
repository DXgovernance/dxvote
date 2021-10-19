const { NODE_ENV, REACT_APP_DXVOTE_COMMIT, REACT_APP_VERSION } = process.env;

interface Config {
  env?: string;
  commit?: string;
  version?: string;
}
const config: Config = {
  env: NODE_ENV,
  commit: REACT_APP_DXVOTE_COMMIT,
  version: REACT_APP_VERSION,
};

export default config;
