import 'dotenv/config'
import dht from 'node-dht-sensor'
import { CronJob } from 'cron'
import Logger from 'logger'
import Client from 'sdc2-client'

const log = Logger({ name: 'sdc2-client-dht22' })
const client = Client({
  url: process.env.SDC2_URL,
  apiKey: process.env.SDC2_API_KEY,
  location: process.env.SDC2_LOCATION,
})

function isValidHumidity(humidity) {
  return humidity > 0 && humidity <= 100
}

function isValidTemperature(temperature) {
  return temperature > 0 && temperature <= 60
}

function getValidMeasurement() {
  let measurement = {}
  do {
    measurement = dht.read(22, parseInt(process.env.DHT22_GPIO_PIN ?? 4))
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
      value: measurements.sort((a, b) => a.humidity - b.humidity)[2].humidity,
    },
    {
      type: 'temperature',
      value: measurements.sort((a, b) => a.temperature - b.temperature)[2]
        .temperature,
    },
  ]

  log.debug('measurement:', measurementsToStore)

  return client.storeMeasurements({ measurements: measurementsToStore })
}

const measurementJob = new CronJob({
  cronTime: process.env.DHT22_MEASUREMENT_CRON ?? '*/5 * * * *',
  onTick: measure,
})

measurementJob.start()
