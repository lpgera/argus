const moment = require('moment')
const _ = require('lodash')
const log = require('../src/log')
const db = require('../src/db')
const upsertHourlyAggregations = require('./aggregation/upsertHourlyAggregations')
const upsertDailyAggregations = require('./aggregation/upsertDailyAggregations')

const intervalLengthDays = 180
const stepMinutes = 5

async function resetDB() {
  log.info('Erasing database...')
  await db.migrate.rollback({}, true)
  await db.migrate.latest()
}

async function insertRandomMeasurements() {
  log.info(`Filling database with ${intervalLengthDays} days of random data...`)
  const start = moment().startOf('minute').subtract(intervalLengthDays, 'day')
  const range = _.range(0, intervalLengthDays * 24 * 60, stepMinutes)
  const measurementArray = _.flatMap(range, (d) => {
    const createdAt = start.clone().add(d, 'minute').toDate()
    return [
      {
        createdAt,
        location: 'location_1',
        type: 'temperature',
        value: Math.round(Math.random() * 4000 - 1000) / 100,
      },
      {
        createdAt,
        location: 'location_1',
        type: 'humidity',
        value: Math.round(Math.random() * 10000) / 100,
      },
      {
        createdAt,
        location: 'location_2',
        type: 'temperature',
        value: Math.round(Math.random() * 4000 - 1000) / 100,
      },
    ]
  })
  await db('measurement').insert(measurementArray)
}

async function seed() {
  await resetDB()
  await insertRandomMeasurements()
  await upsertHourlyAggregations()
  await upsertDailyAggregations()
}

seed()
  .catch(console.error)
  .then(() => {
    log.info('Done.')
    db.destroy()
  })
