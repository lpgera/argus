import pino from 'pino'

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

const prettyOptions = Boolean(process.env.SDC2_LOGGER_JSON)
  ? {}
  : {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: true,
          ignore: 'pid,hostname,time',
        },
      },
    }

export default (options) =>
  pino(
    {
      name: 'sdc2',
      level: 'trace',
      ...prettyOptions,
      ...options,
    },
    destination
  )
