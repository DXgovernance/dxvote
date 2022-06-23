// Used to make the build reproducible between different machines (IPFS-related)
module.exports = (config, env) => {
  
  config.output.publicPath = process.env.GH_PAGES ? "/dxvote" : "/";
  
  if (env !== 'production') {
    return config;
  }
  config.output.filename = `static/js/[name].js`;
  config.output.chunkFilename = `static/js/[name].chunk.js`;
  return config;
};
