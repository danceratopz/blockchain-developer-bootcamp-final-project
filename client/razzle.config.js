module.exports = {
  options: {
    buildType: 'spa',
    enableBabelCache: false,
    debug: { // debug flags
      options: false, // print webpackOptions that will be used in webpack config
      config: false, // print webpack config
      nodeExternals: false // print node externals debug info 
    },    
  },
  modifyWebpackConfig(opts) {
    const config = opts.webpackConfig;

    config.performance = Object.assign({}, {
      maxAssetSize: 1600000,
      maxEntrypointSize: 1600000,
      hints: false
    })
    
    // Ignore fs dependencies so we can use winston
    // if (opts.env.target === 'node' && !opts.env.dev) {
    config.node = { fs: 'empty' };
    // }

    return config;
  },
};
