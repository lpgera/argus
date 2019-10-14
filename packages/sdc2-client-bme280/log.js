const bunyan = require('bunyan')

const developmentStreams = [
  {
    level: 'trace',
    stream: process.stdout,
  },
]

const productionStreams = [
  {
    level: 'info',
    stream: process.stdout,
  },
  {
    level: 'error',
    stream: process.stderr,
  },
]

const log = bunyan.createLogger({
  name: 'bme280-module',
  streams: (() => {
    if (process.env.NODE_ENV === 'development') {
      return developmentStreams
    }
    return productionStreams
  })(),
})

module.exports = log
