const Promise = require('bluebird')
const noble = require('noble')
const cron = require('cron')
const config = require('config')
const request = Promise.promisifyAll(require('request'), { multiArgs: true })
const log = require('./log')

const peripherals = {}

noble.on('stateChange', state => {
  log.info('stateChange', state)
  if (state === 'poweredOn') {
    noble.startScanning(['6e400001b5a3f393e0a9e50e24dcca9e'])
  } else {
    noble.stopScanning()
  }
})

noble.on('discover', peripheral => {
  log.info('discovered peripheral:', {
    id: peripheral.id,
    uuid: peripheral.uuid,
    advertisement: peripheral.advertisement,
  })
  if (peripheral.advertisement.localName === 'SENSOR') {
    const p = Promise.promisifyAll(peripheral, { multiArgs: true })
    peripherals[p.uuid] = p
  }
})

function measure() {
  Object.values(peripherals).forEach(peripheral => {
    const watchdogTimer = setTimeout(() => {
      log.error(
        `Could not complete measurement in 10 seconds. Disconnecting from peripheral: ${peripheral.uuid}`
      )
      return peripheral.disconnectAsync()
    }, 10000)

    log.info(`connecting to peripheral: ${peripheral.uuid}`)
    peripheral.measurement = {}
    peripheral
      .connectAsync()
      .then(() => {
        log.info(`connected to peripheral: ${peripheral.uuid}`)
        return peripheral.discoverSomeServicesAndCharacteristicsAsync(
          ['6e400001b5a3f393e0a9e50e24dcca9e'],
          [
            '6e400004b5a3f393e0a9e50e24dcca9e', // temperature
            '6e400005b5a3f393e0a9e50e24dcca9e', // atmoshperic pressure
            '6e400006b5a3f393e0a9e50e24dcca9e', // ambient light
          ]
        )
      })
      .spread((services, characteristics) => {
        log.info(
          `discovered characteristics from peripheral (${peripheral.uuid})`
        )
        let dataLeft = characteristics.length
        return characteristics.map(characteristic => {
          const c = Promise.promisifyAll(characteristic, { multiArgs: true })
          c.on('data', data => {
            const hexData = data.toString('hex')
            const intData = parseInt(hexData, 16)
            switch (c.uuid) {
              case '6e400004b5a3f393e0a9e50e24dcca9e':
                peripheral.measurement.pressure = intData / 100 + 16
                break
              case '6e400005b5a3f393e0a9e50e24dcca9e':
                peripheral.measurement.temperature = (intData - 11) / 10
                break
              case '6e400006b5a3f393e0a9e50e24dcca9e':
                peripheral.measurement.light = intData
                break
            }
            c.unsubscribeAsync(() => {
              dataLeft = dataLeft - 1
              if (dataLeft <= 0) {
                clearTimeout(watchdogTimer)
                return peripheral.disconnectAsync(() => {
                  log.info(
                    `measurements from peripheral (${peripheral.uuid}):`,
                    peripheral.measurement
                  )
                  log.info('disconnected from peripheral:', peripheral.uuid)
                  return request.postAsync(config.get('measurementsApiUrl'), {
                    qs: {
                      deviceName: config.get('device.name'),
                      devicePassword: config.get('device.password'),
                      location: config.get('locations')[peripheral.uuid],
                      data: JSON.stringify(peripheral.measurement),
                    },
                  })
                })
              }
              return null
            })
          })
          return c.subscribeAsync()
        })
      })
      .then(() => {
        log.info(
          'subscribed to all characteristics on peripheral:',
          peripheral.uuid
        )
      })
  })
}

const measurementJob = new cron.CronJob({
  cronTime: config.get('measurementCron'),
  onTick: measure,
})

measurementJob.start()
