const pino = require('pino')

const destination =
  process.env.NODE_ENV === 'production'
    ? pino.multistream([
        {
          stream: process.stdout,
          level: 'info',
        },
        {
          stream: process.stderr,
          level: 'error',
        },
      ])
    : pino.destination(2)

const prettyOptions =
  process.env.NODE_ENV !== 'production'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss.l',
          },
        },
      }
    : {}

const log = (options) =>
  pino(
    {
      name: 'sdc2',
      level: 'trace',
      ...prettyOptions,
      ...options,
    },
    destination
  )

module.exports = log
