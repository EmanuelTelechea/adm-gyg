const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://gyg-production-312a.up.railway.app',
      changeOrigin: true,
    })
  );
};
