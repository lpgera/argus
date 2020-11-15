const noble = require('@abandonware/noble')
const config = require('config')
const sdc2Client = require('sdc2-client')(config.get('sdc2'))
const log = require('sdc2-logger')({ name: 'sdc2-client-mijia' })

log.debug('starting measurement')

noble.on('stateChange', state => {
  log.debug('stateChange', state)
  if (state === 'poweredOn') {
    noble.startScanning(['180f', '180a'])
  } else {
    noble.stopScanning()
  }
})

let measurementData = null

noble.on('discover', async peripheral => {
  await noble.stopScanningAsync()
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
  await peripheral.connectAsync()
  log.debug(`connected to peripheral: ${peripheral.uuid}`)
  const {
    characteristics,
  } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
    ['226c000064764566756266734470666d'],
    ['226caa5564764566756266734470666d']
  )
  log.debug('discovered characteristics', characteristics)
  const characteristic = characteristics[0]
  characteristic.on('data', async d => {
    await characteristic.unsubscribeAsync()
    if (!measurementData) {
      measurementData = Buffer.from(d, 'hex')
        .toString()
        .trim()
      const [, temperature, humidity] = measurementData.match(
        /T=([0-9.-]+) H=([0-9.-]+)/
      )
      log.debug('data', temperature, humidity)
      const measurements = [
        {
          type: 'temperature',
          value: parseFloat(temperature),
        },
        {
          type: 'humidity',
          value: parseFloat(humidity),
        },
      ]
      return sdc2Client.storeMeasurements({ measurements })
    }
  })
  await characteristic.subscribeAsync()
})

setTimeout(() => {
  log.debug('exiting')
  process.exit(0)
}, 20000)
