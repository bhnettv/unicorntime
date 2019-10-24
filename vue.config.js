const path = require('path');

module.exports = {
  chainWebpack: (config) => {
    const apiClient = process.env.VUE_APP_API_CLIENT; // mock or server
    config.resolve.alias.set(
      'api-client',
      path.resolve(__dirname, `src/api/${apiClient}`),
    );
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        publish: ['github'],
      },
    },
  },
  css: {
    loaderOptions: {
      scss: {
        prependData: '@import "~@/assets/global.scss";',
      },
    },
  },
};
