export default {
  client: 'mysql',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 0,
    max: 128,
  },
  migrations: {
    directory: './db/migrations/',
  },
}
