const GitRevisionPlugin = require("git-revision-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");

// Used to make the build reproducible between different machines (IPFS-related)
module.exports = (config, env) => {
    if (env !== "production") {
        return config;
    }
    const gitRevisionPlugin = new GitRevisionPlugin();
    const shortCommitHash = gitRevisionPlugin.commithash().substring(0, 8);
    config.output.publicPath = "";
    config.output.filename = `static/js/[name].${shortCommitHash}.js`;
    config.output.chunkFilename = `static/js/[name].${shortCommitHash}.chunk.js`;
    config.plugins = config.plugins.filter(
        (plugin) =>
            !(
                plugin instanceof WorkboxWebpackPlugin.GenerateSW ||
                plugin instanceof ManifestPlugin ||
                plugin instanceof MiniCssExtractPlugin
            )
    );
    config.plugins.push(
        new MiniCssExtractPlugin({
            filename: `static/css/[name].${shortCommitHash}.css`,
            chunkFilename: "static/css/[name].chunk.css",
        })
    );
    
    // TO DO: Check how to enable this later

    // config.module.rules[2].oneOf.find(
    //     (rule) => rule.loader === process.cwd()+"/node_modules/react-scripts/node_modules/file-loader/dist/cjs.js"
    // ).options.name = "static/media/[name].[ext]";
    // config.module.rules[2].oneOf.find(
    //     (rule) => rule.loader === process.cwd()+"/node_modules/react-scripts/node_modules/url-loader/dist/cjs.js"
    // ).options.name = "static/media/[name].[ext]";
    // config.optimization.moduleIds = "hashed";
    return config;
};
