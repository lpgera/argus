const config = require('config')

module.exports = {
  client: 'mysql',
  connection: config.get('mysql'),
  acquireConnectionTimeout: 1000 * 60 * 60,
  pool: {
    min: 8,
    max: 16,
  },
}
