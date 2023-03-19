import 'dotenv/config'
import { Gpio } from 'onoff'
import Client from 'sdc2-client'
import Logger from 'logger'

const client = Client({
  url: process.env.SDC2_URL,
  apiKey: process.env.SDC2_API_KEY,
  location: process.env.SDC2_LOCATION,
})
const log = Logger({ name: 'sdc2-client-hcsr501' })

const pin = new Gpio(parseInt(process.env.HCSR501_GPIO_PIN ?? 18), 'in', 'both')

pin.watch(async (err, value) => {
  if (err) {
    log.error(err)
    return
  }
  log.debug('motion value:', value)
  await client.storeMeasurements({
    measurements: [
      {
        type: 'motion',
        value: value,
      },
    ],
  })
})
