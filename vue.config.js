module.exports = {
  devServer: {
    proxy: {
      '/v1': {
        target: process.env.API_URL,
        changeOrigin: true,
      },
    },
  },
  transpileDependencies: ['vuetify'],
};
