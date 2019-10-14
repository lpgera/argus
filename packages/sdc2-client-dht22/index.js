const dht = require('dht-sensor')
const cron = require('cron')
const config = require('config')
const _ = require('lodash')
const log = require('./log')
const sdc2Client = require('sdc2-client')(config.get('sdc2'))

function isValidHumidity(humidity) {
  return humidity > 0 && humidity <= 100
}

function isValidTemperature(temperature) {
  return temperature > 0 && temperature <= 60
}

function getValidMeasurement() {
  let measurement = {}
  do {
    measurement = dht.read(22, 4)
    measurement.humidity = +measurement.humidity.toFixed(1)
    measurement.temperature = +measurement.temperature.toFixed(1)
  } while (
    !isValidHumidity(measurement.humidity) ||
    !isValidTemperature(measurement.temperature)
  )
  return measurement
}

function measure() {
  const measurements = []

  for (let i = 0; i < 5; i = i + 1) {
    measurements[i] = getValidMeasurement()
  }

  const measurementsToStore = [
    {
      type: 'humidity',
      value: _.get(_.sortBy(measurements, 'humidity'), '2.humidity'),
    },
    {
      type: 'temperature',
      value: _.get(_.sortBy(measurements, 'temperature'), '2.temperature'),
    },
  ]

  log.debug('measurement:', measurementsToStore)

  return sdc2Client.storeMeasurements({ measurements: measurementsToStore })
}

const measurementJob = new cron.CronJob({
  cronTime: config.get('measurementCron'),
  onTick: measure,
})

measurementJob.start()
