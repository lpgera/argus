import express from 'express'
import cors from 'cors'
import compression from 'compression'
import bodyParser from 'body-parser'
import path from 'path'
import log from './log.js'
import apiRouter from './routers/api.js'
import ajaxRouter from './routers/ajax.js'
import db from './db.js'

if (process.env.NODE_ENV === 'production') {
  await db.migrate.latest()
}

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(compression())

app.use('/api', apiRouter)
app.use('/ajax', ajaxRouter)

app.use(
  express.static(path.resolve('frontend'), {
    maxAge: '30 days',
  })
)

const port = parseInt(process.env.PORT ?? 4000)

const server = app.listen(port, () => {
  log.info(`Server is listening on port: ${port}`)
})

const stopSignalHandler = (signal) => {
  log.info(`Received ${signal}, closing connections...`)
  server.close(async () => {
    log.info('Server stopped, closing database connection...')
    await db.destroy()
    log.info('Exiting.')
  })
}

process.once('SIGINT', stopSignalHandler)
process.once('SIGTERM', stopSignalHandler)
