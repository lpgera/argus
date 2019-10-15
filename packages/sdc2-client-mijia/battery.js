const noble = require('noble')
const Promise = require('bluebird')
const config = require('config')
const sdc2Client = require('sdc2-client')(config.get('sdc2'))
const log = require('sdc2-logger')({ name: 'sdc2-client-mijia' })

noble.on('stateChange', state => {
  log.debug('stateChange', state)
  if (state === 'poweredOn') {
    noble.startScanning(['180f', '180a'])
  } else {
    noble.stopScanning()
  }
})

let measurementData = null

noble.on('discover', p => {
  noble.stopScanning()
  const peripheral = Promise.promisifyAll(p, { multiArgs: true })
  log.debug(
    'discovered peripheral:',
    JSON.stringify(
      {
        id: peripheral.id,
        uuid: peripheral.uuid,
        advertisement: peripheral.advertisement,
      },
      null,
      2
    )
  )
  return peripheral
    .connectAsync()
    .then(() => {
      log.debug(`connected to peripheral: ${peripheral.uuid}`)
      return peripheral.discoverSomeServicesAndCharacteristicsAsync(
        ['180f'],
        ['2a19']
      )
    })
    .spread((s, c) => {
      log.debug('discovered characteristics', c)
      const characteristic = Promise.promisifyAll(c[0], { multiArgs: true })
      return characteristic.readAsync().then(d => {
        const battery = d[0].readUInt8(0)
        const measurements = [
          {
            type: 'battery',
            value: battery,
          },
        ]
        return sdc2Client.storeMeasurements({ measurements })
      })
    })
})

setTimeout(() => {
  process.exit(0)
}, 20000)
