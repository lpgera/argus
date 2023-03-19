import pino from 'pino'

const prettyOptions = Boolean(process.env.USE_JSON_LOGS)
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
  pino({
    name: 'argus',
    level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',
    ...prettyOptions,
    ...options,
  })
