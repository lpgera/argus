import db from '../db.js'
import log from '../log.js'

const _upsertDailyAggregationQuery = `
  REPLACE INTO dailyAggregation (measurementDay, location, type, count, sum, average, minimum, maximum)
    SELECT
      DATE_FORMAT(?, '%Y-%m-%d 00:00:00') AS measurementDay,
      ? AS location,
      ? AS type,
      count(value) AS count,
      sum(value) AS sum,
      avg(value) AS average,
      min(value) AS minimum,
      max(value) AS maximum
    FROM
      measurement
    WHERE
      createdAt >= DATE_FORMAT(?, '%Y-%m-%d 00:00:00.000') AND
      createdAt <= DATE_FORMAT(?, '%Y-%m-%d 23:59:59.999') AND
      location = ? AND
      type = ?;`

const _upsertHourlyAggregationQuery = `
  REPLACE INTO hourlyAggregation (measurementHour, location, type, count, sum, average, minimum, maximum)
    SELECT
      DATE_FORMAT(?, '%Y-%m-%d %H:00:00') AS measurementHour,
      ? AS location,
      ? AS type,
      count(value) AS count,
      sum(value) AS sum,
      avg(value) AS average,
      min(value) AS minimum,
      max(value) AS maximum
    FROM
      measurement
    WHERE
      createdAt >= DATE_FORMAT(?, '%Y-%m-%d %H:00:00.000') AND
      createdAt <= DATE_FORMAT(?, '%Y-%m-%d %H:59:59.999') AND
      location = ? AND
      type = ?;`

export async function insert(measurement) {
  log.debug(measurement, 'Inserting measurement.')
  await db.insert(measurement).into('measurement')

  log.debug(measurement, 'Updating hourly aggregation with measurement.')
  await db.raw(_upsertHourlyAggregationQuery, [
    measurement.createdAt,
    measurement.location,
    measurement.type,
    measurement.createdAt,
    measurement.createdAt,
    measurement.location,
    measurement.type,
  ])

  log.debug(measurement, 'Updating daily aggregation with measurement.')
  return db.raw(_upsertDailyAggregationQuery, [
    measurement.createdAt,
    measurement.location,
    measurement.type,
    measurement.createdAt,
    measurement.createdAt,
    measurement.location,
    measurement.type,
  ])
}

function _getDailyAggregations({
  location,
  type,
  from,
  to,
  aggregation = 'average',
}) {
  return db
    .select('measurementDay as createdAt', `${aggregation} as value`)
    .from('dailyAggregation')
    .where({ location, type })
    .where('measurementDay', '>=', from.toDate())
    .where('measurementDay', '<=', to.toDate())
    .orderBy('measurementDay')
}

function _getHourlyAggregations({
  location,
  type,
  from,
  to,
  aggregation = 'average',
}) {
  return db
    .select('measurementHour as createdAt', `${aggregation} as value`)
    .from('hourlyAggregation')
    .where({ location, type })
    .where('measurementHour', '>=', from.toDate())
    .where('measurementHour', '<=', to.toDate())
    .orderBy('measurementHour')
}

function _getMeasurements({ location, type, from, to }) {
  return db
    .select('createdAt', 'value')
    .from('measurement')
    .where({ location, type })
    .where('createdAt', '>=', from.toDate())
    .where('createdAt', '<=', to.toDate())
    .orderBy('createdAt')
}

export function get({ location, type, from, to, aggregation }) {
  if (
    to.diff(from, 'days') >=
    parseInt(process.env.DAILY_QUERY_THRESHOLD_IN_DAYS ?? 30)
  ) {
    log.debug(
      {
        location,
        type,
        from,
        to,
      },
      'Getting daily aggregated measurements.'
    )
    return _getDailyAggregations({ location, type, from, to, aggregation })
  }
  if (
    to.diff(from, 'days') >=
    parseInt(process.env.HOURLY_QUERY_THRESHOLD_IN_DAYS ?? 7)
  ) {
    log.debug(
      {
        location,
        type,
        from,
        to,
      },
      'Getting hourly aggregated measurements.'
    )
    return _getHourlyAggregations({ location, type, from, to, aggregation })
  }
  log.debug({ location, type, from, to }, 'Getting measurements.')
  return _getMeasurements({ location, type, from, to })
}

export function getLatest({ location, type }) {
  return db
    .select('createdAt', 'value')
    .from('measurement')
    .where({ location, type })
    .orderBy('createdAt', 'desc')
    .first()
}
