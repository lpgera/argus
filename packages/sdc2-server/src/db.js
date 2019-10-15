const config = require('config')

module.exports = require('knex')({
  client: 'mysql',
  connection: config.get('mysql'),
  acquireConnectionTimeout: 1000 * 60 * 60,
  pool: {
    min: 8,
    max: 16,
  },
})
