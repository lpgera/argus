require('dotenv').config()
const Gpio = require('onoff').Gpio
const sdc2Client = require('sdc2-client')({
  url: process.env.SDC2_URL,
  apiKey: process.env.SDC2_API_KEY,
  location: process.env.SDC2_LOCATION,
})
const log = require('sdc2-logger')({ name: 'sdc2-client-hcsr501' })

const pin = new Gpio(parseInt(process.env.HCSR501_GPIO_PIN ?? 18), 'in', 'both')

pin.watch(async (err, value) => {
  if (err) {
    log.error(err)
    return
  }
  log.debug('motion value:', value)
  await sdc2Client.storeMeasurements({
    measurements: [
      {
        type: 'motion',
        value: value,
      },
    ],
  })
})
