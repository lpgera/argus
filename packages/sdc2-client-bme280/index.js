require('dotenv').config()
const BME280 = require('bme280-sensor')
const cron = require('cron')
const log = require('sdc2-logger')({ name: 'sdc2-client-bme280' })
const sdc2Client = require('sdc2-client')({
  url: process.env.SDC2_URL,
  apiKey: process.env.SDC2_API_KEY,
  location: process.env.SDC2_LOCATION,
})

const bme280 = new BME280({
  i2cBusNo: parseInt(process.env.BME280_I2C_BUS_NUMBER ?? 1),
  i2cAddress: parseInt(process.env.BME280_I2C_ADDRESS ?? 0x76),
})

const measurementJob = new cron.CronJob({
  cronTime: process.env.BME280_MEASUREMENT_CRON ?? '*/5 * * * *',
  onTick: async function () {
    try {
      const {
        temperature_C: temperature,
        humidity,
        pressure_hPa: pressure,
      } = await bme280.readSensorData()

      await sdc2Client.storeMeasurements({
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

start().catch(log.error)
