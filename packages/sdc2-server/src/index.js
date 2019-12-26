const config = require('config')
const express = require('express')
const cors = require('cors')
const http = require('http')
const path = require('path')
const router = require('express-promise-router')()
const log = require('./log')
const apiController = require('./controllers/api')
const ajaxController = require('./controllers/ajax')

const app = express()
const server = http.createServer(app)

if (process.env.NODE_ENV === 'development') {
  const corsOptions = {
    origin: ['http://localhost:8080'],
    credentials: true,
  }

  router.use(cors(corsOptions))
}

router.use('/api', apiController)
router.use('/ajax', ajaxController)
router.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/index.html'))
)
router.use('/', express.static(path.join(__dirname, '../frontend')))

app.use(router)

process.on('SIGINT', () => {
  log.info('Received SIGINT, closing connections...')
  server.close(() => {
    log.info('Server stopped, exiting.')
    process.exit(0)
  })
})

server.listen(config.get('port'), () => {
  log.info(`Server is listening on port: ${config.get('port')}`)
  process.send('ready')
})
