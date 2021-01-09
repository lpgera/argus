const pino = require('pino')
const multistream = require('pino-multi-stream').multistream

const destination =
  process.env.NODE_ENV === 'production'
    ? multistream([
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

const log = (options) =>
  pino(
    {
      name: 'sdc2',
      prettyPrint:
        process.env.NODE_ENV !== 'production'
          ? {
              colorize: true,
              translateTime: 'yyyy-mm-dd HH:MM:ss.l',
            }
          : false,
      level: 'trace',
      ...options,
    },
    destination
  )

module.exports = log
