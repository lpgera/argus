const config = require('config')
const db = require('../db')
const log = require('../log')
const { sqlDateWithoutMillisecondsFormat } = require('../utils')

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

async function insert(measurement) {
  log.debug('Inserting measurement:', measurement)
  await db.insert(measurement).into('measurement')

  log.debug('Updating hourly aggregation with measurement:', measurement)
  await db.raw(_upsertHourlyAggregationQuery, [
    measurement.createdAt,
    measurement.location,
    measurement.type,
    measurement.createdAt,
    measurement.createdAt,
    measurement.location,
    measurement.type,
  ])

  log.debug('Updating daily aggregation with measurement:', measurement)
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

function _getDailyAggregations({ location, type, from, to }) {
  return db
    .select('measurementDay as createdAt', 'average as value') // TODO avg/min/max?
    .from('dailyAggregation')
    .where({ location, type })
    .where(
      'measurementDay',
      '>=',
      from.format(sqlDateWithoutMillisecondsFormat)
    ) // much faster without milliseconds
    .where('measurementDay', '<=', to.format(sqlDateWithoutMillisecondsFormat)) // much faster without milliseconds
    .orderBy('measurementDay')
}

function _getHourlyAggregations({ location, type, from, to }) {
  return db
    .select('measurementHour as createdAt', 'average as value') // TODO avg/min/max?
    .from('hourlyAggregation')
    .where({ location, type })
    .where(
      'measurementHour',
      '>=',
      from.format(sqlDateWithoutMillisecondsFormat)
    ) // much faster without milliseconds
    .where('measurementHour', '<=', to.format(sqlDateWithoutMillisecondsFormat)) // much faster without milliseconds
    .orderBy('measurementHour')
}

function _getMeasurements({ location, type, from, to }) {
  return db
    .select('createdAt', 'value')
    .from('measurement')
    .where({ location, type })
    .where('createdAt', '>=', from.format(sqlDateWithoutMillisecondsFormat)) // much faster without milliseconds
    .where('createdAt', '<=', to.format(sqlDateWithoutMillisecondsFormat)) // much faster without milliseconds
    .orderBy('createdAt')
}

function get({ location, type, from, to }) {
  if (to.diff(from, 'days') >= config.get('query.threshold.daily')) {
    log.debug('Getting daily aggregated measurements:', {
      location,
      type,
      from,
      to,
    })
    return _getDailyAggregations({ location, type, from, to })
  }
  if (to.diff(from, 'days') >= config.get('query.threshold.hourly')) {
    log.debug('Getting hourly aggregated measurements:', {
      location,
      type,
      from,
      to,
    })
    return _getHourlyAggregations({ location, type, from, to })
  }
  log.debug('Getting measurements:', { location, type, from, to })
  return _getMeasurements({ location, type, from, to })
}

function getLatest({ location, type }) {
  return db
    .select('createdAt', 'value')
    .from('measurement')
    .where({ location, type })
    .orderBy('createdAt', 'desc')
    .first()
}

module.exports = {
  insert,
  get,
  getLatest,
}
