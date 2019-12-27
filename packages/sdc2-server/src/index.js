const config = require('config')
const path = require('path')
const Koa = require('koa')
const koaStatic = require('koa-static')
const koaBodyparser = require('koa-bodyparser')
const KoaRouter = require('@koa/router')
const koaCors = require('@koa/cors')
const log = require('./log')
const apiRouter = require('./routers/api')
const ajaxRouter = require('./routers/ajax')

const app = new Koa()
const router = new KoaRouter()

app.use(koaCors())
app.use(koaBodyparser())

router.use('/api', apiRouter.routes(), apiRouter.allowedMethods())
router.use('/ajax', ajaxRouter.routes(), ajaxRouter.allowedMethods())

app.use(router.routes(), router.allowedMethods())

app.use(koaStatic(path.join(__dirname, '../frontend')))

const server = app.listen(config.get('port'), () => {
  log.info(`Server is listening on port: ${config.get('port')}`)
  if (process.send) {
    process.send('ready')
  }
})

process.on('SIGINT', () => {
  log.info('Received SIGINT, closing connections...')
  server.close(() => {
    log.info('Server stopped, exiting.')
    process.exit(0)
  })
})
