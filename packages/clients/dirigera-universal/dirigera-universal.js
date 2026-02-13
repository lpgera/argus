import { CronJob } from 'cron'
import Client from 'base-client'
import Logger from 'logger'
import { z } from 'zod'
import { createDirigeraClient } from 'dirigera'

const log = Logger({ name: 'dirigera-universal' })

const dirigeraClient = await createDirigeraClient({
  gatewayIP: process.env.DIRIGERA_GATEWAY_IP,
  accessToken: process.env.DIRIGERA_ACCESS_TOKEN,
})

const sensorsConfig = z
  .record(
    z.string(),
    z.array(
      z.object({
        deviceId: z.string(),
        attributeMapping: z.partialRecord(
          z.enum([
            'currentTemperature',
            'currentRH',
            'currentPM25',
            'vocIndex',
            'isOn',
            'currentCO2',
            'batteryPercentage',
            'illuminance',
            'isDetected',
          ]),
          z.string()
        ),
      })
    )
  )
  .parse(JSON.parse(process.env.DIRIGERA_SENSORS ?? 'null'))

const onTick = async () => {
  try {
    for (const [location, locationSensorConfigs] of Object.entries(
      sensorsConfig
    )) {
      const client = Client({
        url: process.env.ARGUS_URL,
        apiKey: process.env.ARGUS_API_KEY,
        location,
      })

      const measurementPromiseResults = await Promise.allSettled(
        locationSensorConfigs.map(async (sensorConfig) => {
          const sensor = await dirigeraClient.devices.get({
            id: sensorConfig.deviceId,
          })

          if (
            new Date(sensor.lastSeen) <
            new Date(Date.now() - 12 * 60 * 60 * 1000)
          ) {
            throw new Error(
              `Sensor ${sensorConfig.deviceId} has not been seen for more than 12 hours`
            )
          }

          return Object.entries(sensorConfig.attributeMapping).map(
            ([attribute, type]) => ({
              type,
              value: sensor.attributes[attribute],
            })
          )
        })
      )

      const measurements = measurementPromiseResults.flatMap((result) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          log.error(result.reason, 'Error fetching sensor data')
          return []
        }
      })

      await client.storeMeasurements({ measurements })
    }
  } catch (error) {
    log.error(error)
  }
}

const measurementJob = CronJob.from({
  cronTime: process.env.DIRIGERA_MEASUREMENT_CRON ?? '*/5 * * * *',
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
