import 'dotenv/config'
import cron from 'cron'
import Client from 'sdc2-client'
import Logger from 'logger'
import { SerialPort } from 'serialport'
import { PacketLengthParser } from '@serialport/parser-packet-length'

const client = Client({
  url: process.env.SDC2_URL,
  apiKey: process.env.SDC2_API_KEY,
  location: process.env.SDC2_LOCATION,
})

const log = Logger({ name: 'sdc2-client-senseair' })

const port = new SerialPort({
  path: process.env.SERIAL_DEVICE_PATH ?? '/dev/serial0',
  baudRate: 9600,
})
const parser = port.pipe(
  new PacketLengthParser({
    delimiter: 0xfe,
    packetOverhead: 5,
    lengthBytes: 1,
    lengthOffset: 2,
  })
)

const STATUS_COMMAND = Buffer.from([
  0xfe, 0x04, 0x00, 0x00, 0x00, 0x04, 0xe5, 0xc6,
])
const READ_CO2_COMMAND = Buffer.from([
  0xfe, 0x04, 0x00, 0x03, 0x00, 0x01, 0xd5, 0xc5,
])

const latestMeasurement = {
  updatedAt: null,
  value: null,
}

const onTick = async () => {
  log.debug('tick')
  const now = new Date()
  const minute = 60 * 1000

  if (now - latestMeasurement.lastUpdatedAt > 10 * minute) {
    log.warn('Measurement is too old, skipping...')
    return
  }

  try {
    await client.storeMeasurements({
      measurements: [
        {
          type: 'co2',
          value: latestMeasurement.value,
        },
      ],
    })
  } catch (error) {
    log.error(error)
  }
}

const measurementJob = new cron.CronJob({
  cronTime: process.env.SENSEAIR_MEASUREMENT_CRON ?? '*/5 * * * *',
  onTick,
})

const start = async () => {
  parser.on('data', (data) => {
    const length = data[2]
    if (length === 2) {
      const measurementValue = data[3] * 256 + data[4]
      log.debug(`co2: ${measurementValue} ppm`)

      latestMeasurement.updatedAt = new Date()
      latestMeasurement.value = measurementValue
    }
    if (length === 8) {
      const statusCode = data[4] * 256 + data[5]
      const measurementValue = data[9] * 256 + data[10]
      log.info(`sensor status code: ${statusCode}; co2: ${measurementValue}ppm`)

      latestMeasurement.updatedAt = new Date()
      latestMeasurement.value = measurementValue
    }
  })

  setInterval(() => port.write(READ_CO2_COMMAND), 30000)

  port.write(STATUS_COMMAND)

  measurementJob.start()
}

start().catch((error) => log.error(error))
