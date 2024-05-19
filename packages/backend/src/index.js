import Koa from 'koa'
import koaStatic from 'koa-static'
import koaBodyparser from 'koa-bodyparser'
import KoaRouter from '@koa/router'
import koaCors from '@koa/cors'
import koaCompress from 'koa-compress'
import log from './log.js'
import apiRouter from './routers/api.js'
import ajaxRouter from './routers/ajax.js'
import db from './db.js'

const app = new Koa()
const router = new KoaRouter()

app.use(koaCors())
app.use(koaBodyparser())
app.use(koaCompress())

router.use('/api', apiRouter.routes(), apiRouter.allowedMethods())
router.use('/ajax', ajaxRouter.routes(), ajaxRouter.allowedMethods())

app.use(router.routes(), router.allowedMethods())
app.use(
  koaStatic('frontend', {
    maxage: process.env.NODE_ENV === 'production' ? 30 * 24 * 3600 * 1000 : 0,
  })
)

const port = parseInt(process.env.PORT ?? 4000)

const server = app.listen(port, () => {
  log.info(`Server is listening on port: ${port}`)
})

process.on('SIGINT', () => {
  log.info('Received SIGINT, closing connections...')
  server.close(async () => {
    log.info('Server stopped, closing database connection...')
    await db.destroy()
    log.info('Exiting.')
  })
})

process.on('SIGTERM', async () => {
  log.info('Received SIGTERM, closing database connection...')
  await db.destroy()
  log.info('Exiting.')
  process.exit(0)
})
