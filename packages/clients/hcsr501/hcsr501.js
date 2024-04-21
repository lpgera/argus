import { Gpio } from 'onoff'
import Logger from 'logger'
import Client from 'base-client'

const client = Client({
  url: process.env.ARGUS_URL,
  apiKey: process.env.ARGUS_API_KEY,
  location: process.env.ARGUS_SENSOR_LOCATION,
})
const log = Logger({ name: 'hcsr501' })

const pin = new Gpio(parseInt(process.env.HCSR501_GPIO_PIN ?? 18), 'in', 'both')

pin.watch(async (err, value) => {
  if (err) {
    log.error(err)
    return
  }
  log.debug('motion value:', value)
  await client.storeMeasurement({
    type: 'motion',
    value: value,
  })
})
