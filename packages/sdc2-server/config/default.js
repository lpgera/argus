const moment = require('moment')

module.exports = {
  port: 4000,
  mysql: {
    host: 'mariadb',
    user: 'sensor_data_collection',
    password: 'mysql-password',
    database: 'sensor_data_collection',
    timezone: 'UTC',
  },
  auth: {
    tokenSecret: 'veryImportantSecret',
    sessionTimeoutSeconds: 7 * 24 * 60 * 60,
    users: [{ username: 'username', password: 'password' }],
  },
  query: {
    threshold: {
      daily: 30,
      hourly: 7,
    },
  },
  location: {
    staleThreshold: moment.duration(7, 'days'),
    warningThreshold: moment.duration(1, 'hours'),
  },
  pushBullet: {
    apiKey: '',
  },
}
