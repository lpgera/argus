import { CronJob } from 'cron'
import Client from 'base-client'
import Logger from 'logger'
import { createDirigeraClient } from 'dirigera'

const client = Client({
  url: process.env.ARGUS_URL,
  apiKey: process.env.ARGUS_API_KEY,
  location: process.env.ARGUS_SENSOR_LOCATION,
})
const log = Logger({ name: 'dirigera-temperature-humidity-sensor' })

const dirigeraClient = await createDirigeraClient({
  gatewayIP: process.env.DIRIGERA_GATEWAY_IP,
  accessToken: process.env.DIRIGERA_ACCESS_TOKEN,
})

const onTick = async () => {
  try {
    const temperatureSensor = await dirigeraClient.environmentSensors.get({
      id: `${process.env.DIRIGERA_TEMPERATURE_HUMIDITY_SENSOR_ID}_1`,
    })

    const humiditySensor = await dirigeraClient.environmentSensors.get({
      id: `${process.env.DIRIGERA_TEMPERATURE_HUMIDITY_SENSOR_ID}_2`,
    })

    const measurements = [
      {
        type: 'temperature',
        value: temperatureSensor.attributes.currentTemperature,
      },
      {
        type: 'humidity',
        value: humiditySensor.attributes.currentRH,
      },
      {
        type: 'battery',
        value: temperatureSensor.attributes.batteryPercentage,
      },
    ]

    await client.storeMeasurements({ measurements })
  } catch (error) {
    log.error(error)
  }
}

const measurementJob = CronJob.from({
  cronTime:
    process.env.DIRIGERA_TEMPERATURE_HUMIDITY_SENSOR_MEASUREMENT_CRON ??
    '*/5 * * * *',
  onTick,
})

measurementJob.start()

const stopSignalHandler = async (signal) => {
  log.info(`Received ${signal}, stopping...`)
  await measurementJob.stop()
  log.info('Stopped, exiting.')
}

process.once('SIGINT', stopSignalHandler)
process.once('SIGTERM', stopSignalHandler)
