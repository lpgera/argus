import { CronJob } from 'cron'
import noble from '@abandonware/noble'
import Logger from 'logger'
import Client from 'base-client'

const log = Logger({ name: 'mijia' })

const locationsConfig = (process.env.MIJIA_LOCATIONS ?? '')
  .split(',')
  .reduce((acc, current, index, array) => {
    if (index % 2 === 0) {
      return acc
    }
    return [...acc, { [array[index - 1]]: current }]
  }, [])
  .reduce(
    (acc, current) => ({
      ...acc,
      ...current,
    }),
    {}
  )

const knownAddresses = Object.keys(locationsConfig)

const locations = Object.fromEntries(
  knownAddresses.map((address) => [
    address,
    {
      client: Client({
        url: process.env.ARGUS_URL,
        apiKey: process.env.ARGUS_API_KEY,
        location: locationsConfig[address],
      }),
      humidity: null,
      temperature: null,
      battery: null,
      lastUpdatedAt: null,
    },
  ])
)

const onTick = async () => {
  log.debug('tick')
  const now = new Date()
  const minute = 60 * 1000

  try {
    await Promise.all(
      knownAddresses.map(async (address) => {
        const { client, temperature, humidity, battery, lastUpdatedAt } =
          locations[address]
        log.debug({
          address,
          location: locationsConfig[address],
          temperature,
          humidity,
          battery,
          lastUpdatedAt,
        })
        if (now - lastUpdatedAt > 10 * minute) {
          log.warn('Measurement is too old, skipping...')
          return
        }
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
            ...(battery
              ? [
                  {
                    type: 'battery',
                    value: battery,
                  },
                ]
              : []),
          ],
        })
      })
    )
  } catch (error) {
    log.error(error)
  }
}

const measurementJob = CronJob.from({
  cronTime: process.env.MIJIA_MEASUREMENT_CRON ?? '*/5 * * * *',
  onTick,
})

// based on https://github.com/esphome/esphome/blob/0c87a9ad2c7b73127eab80f582468456ceedec4b/esphome/components/xiaomi_ble/xiaomi_ble.cpp#L15
function decodeAndStoreServiceData(address, data) {
  const messageType = data[0]

  switch (messageType) {
    case 0x0a: // battery
      const battery = data[3]
      log.info({ address, location: locationsConfig[address], battery })
      if (knownAddresses.includes(address)) {
        locations[address].battery = battery
      }
      break
    case 0x0d: // temperature + humidity
      const temperature = ((data[4] << 8) | data[3]) / 10.0
      const humidity = ((data[6] << 8) | data[5]) / 10.0
      log.info({
        address,
        location: locationsConfig[address],
        temperature,
        humidity,
      })
      if (knownAddresses.includes(address)) {
        locations[address].temperature = temperature
        locations[address].humidity = humidity
        locations[address].lastUpdatedAt = new Date()
      }
      break
    default:
  }
}

const start = async () => {
  noble.on('discover', async (peripheral) => {
    const address = peripheral.address
    const data = [...peripheral.advertisement.serviceData[0].data].slice(11)
    log.debug({
      address,
      location: locationsConfig[address],
      data,
    })
    decodeAndStoreServiceData(address, data)
  })

  const allowDuplicates = true
  await noble.startScanningAsync(['fe95'], allowDuplicates)

  measurementJob.start()
}

start().catch((error) => log.error(error))
