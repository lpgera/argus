import { SerialPort } from 'serialport'
import { InterByteTimeoutParser } from '@serialport/parser-inter-byte-timeout'

const port = new SerialPort({
  path: process.env.SENSEAIR_SERIAL_DEVICE_PATH ?? '/dev/serial0',
  baudRate: 9600,
})

const parser = port.pipe(new InterByteTimeoutParser({ interval: 100 }))

parser.on('data', (data) => {
  console.log(data)
  if (data[1] === 0x03) {
    console.log('Calibration sequence complete')
    if (data[4] === 0x20) {
      console.log('Calibration successful')
      process.exit(0)
    } else {
      console.log('Calibration failed')
      process.exit(1)
    }
  }
})

console.log('Starting outdoor calibration sequence...')

port.write(Buffer.from([0xfe, 0x06, 0x00, 0x00, 0x00, 0x00, 0x9d, 0xc5]))

setTimeout(
  () =>
    port.write(Buffer.from([0xfe, 0x06, 0x00, 0x01, 0x7c, 0x06, 0x6c, 0xc7])),
  2000
)

setTimeout(
  () =>
    port.write(Buffer.from([0xfe, 0x03, 0x00, 0x00, 0x00, 0x01, 0x90, 0x05])),
  6000
)

setTimeout(() => {
  console.log('Calibration timed out')
  process.exit(1)
}, 20000)
