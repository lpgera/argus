const BME280 = require('bme280-sensor')
const config = require('config')
const cron = require('cron')
const log = require('sdc2-logger')({ name: 'sdc2-client-bme280' })
const sdc2Client = require('sdc2-client')(config.get('sdc2'))

const bme280 = new BME280({
  i2cBusNo: config.get('i2c.busNumber'),
  i2cAddress: config.get('i2c.address'),
})

const measurementJob = new cron.CronJob({
  cronTime: config.get('measurementCron'),
  onTick: async function() {
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
