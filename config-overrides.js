// Used to make the build reproducible between different machines (IPFS-related)
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = (config, env) => {
  config.module.rules.push({
    test: /\.m?js/,
    resolve: { fullySpecified: false },
  });

  // Fix import outside src issue
  config.resolve.plugins = config.resolve.plugins.filter(
    plugin => plugin.constructor.name !== `ModuleScopePlugin`
  );

  // Add polyfills to crypto, stream, path etc...
  config.plugins.push(new NodePolyfillPlugin());

  if (env !== 'production') {
    return config;
  }

  config.output.filename = `static/js/[name].js`;
  config.output.chunkFilename = `static/js/[name].chunk.js`;
  return config;
};

