import moment from 'moment'
import log from '../src/log.js'
import db from '../src/db.js'
import upsertHourlyAggregations from './aggregation/upsertHourlyAggregations.js'
import upsertDailyAggregations from './aggregation/upsertDailyAggregations.js'

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
  const range = Array.from(
    Array((intervalLengthDays * 24 * 60) / stepMinutes),
    (_, i) => i * stepMinutes
  )
  const measurementArray = range.flatMap((d) => {
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
