import pino from 'pino'

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
  pino({
    name: 'sdc2',
    level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',
    ...prettyOptions,
    ...options,
  })
