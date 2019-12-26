const config = require('config')
const Gpio = require('onoff').Gpio
const sdc2Client = require('sdc2-client')(config.get('sdc2'))
const log = require('sdc2-logger')({ name: 'sdc2-client-hcsr501' })

const pin = new Gpio(18, 'in', 'both')

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
