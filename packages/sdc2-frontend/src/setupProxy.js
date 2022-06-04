const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function setupProxy(app) {
  app.use(
    '/ajax',
    createProxyMiddleware({
      target: process.env.BACKEND_URL ?? 'http://localhost:4000',
      changeOrigin: true,
    })
  )
}
