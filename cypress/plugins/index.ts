/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

const fs = require('fs-extra');
const path = require('path');

function getConfigurationByFile(file) {
  const pathToConfigFile = path.resolve('cypress', 'config', `${file}.json`);
  if (!fs.existsSync(pathToConfigFile)) {
    return {};
  }

  return fs.readJson(pathToConfigFile);
}

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = async (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config=
  const envConfig = await getConfigurationByFile(
    config.env.configFile ?? 'development'
  );
  const result = {
    ...config,
    ...envConfig,
  };
  console.debug(`Using baseUrl: ${result.baseUrl}`);
  return result;
};
