import 'dotenv/config'
import BME280 from 'bme280-sensor'
import { CronJob } from 'cron'
import Logger from 'logger'
import Client from 'sdc2-client'

const log = Logger({ name: 'sdc2-client-bme280' })
const client = Client({
  url: process.env.SDC2_URL,
  apiKey: process.env.SDC2_API_KEY,
  location: process.env.SDC2_LOCATION,
})

const bme280 = new BME280({
  i2cBusNo: parseInt(process.env.BME280_I2C_BUS_NUMBER ?? 1),
  i2cAddress: parseInt(process.env.BME280_I2C_ADDRESS ?? 0x76),
})

const measurementJob = new CronJob({
  cronTime: process.env.BME280_MEASUREMENT_CRON ?? '*/5 * * * *',
  onTick: async function () {
    try {
      const {
        temperature_C: temperature,
        humidity,
        pressure_hPa: pressure,
      } = await bme280.readSensorData()

      await client.storeMeasurements({
        measurements: [
          {
            type: 'temperature',
            value: temperature,
          },
          {
            type: 'humidity',
            value: humidity,
          },
          {
            type: 'pressure',
            value: pressure,
          },
        ],
      })
    } catch (err) {
      log.error(err)
    }
  },
})

async function start() {
  await bme280.init()
  measurementJob.start()
}

start().catch((error) => log.error(error))
