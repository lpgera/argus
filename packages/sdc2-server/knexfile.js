require('dotenv').config()

module.exports = {
  client: 'mysql',
  connection: process.env.DATABASE_URL,
  acquireConnectionTimeout: 1000 * 60 * 60,
  pool: {
    min: 8,
    max: 16,
  },
}
