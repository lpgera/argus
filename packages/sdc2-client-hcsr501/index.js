const Promise = require('bluebird')
const config = require('config')
const Gpio = require('onoff').Gpio
const request = Promise.promisifyAll(require('request'), { multiArgs: true })
const log = require('sdc2-logger')({ name: 'sdc2-client-hcsr501' })

const pin = new Gpio(18, 'in', 'both')

pin.watch((err, value) => {
  if (err) {
    log.error(err)
    return
  }
  log.debug('motion value:', value)
  request.postAsync(config.get('measurementsApiUrl'), {
    qs: {
      deviceName: config.get('device.name'),
      devicePassword: config.get('device.password'),
      location: config.get('location'),
      data: JSON.stringify({ motion: value }),
    },
  })
})
