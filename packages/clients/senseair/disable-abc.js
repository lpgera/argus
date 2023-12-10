import { SerialPort } from 'serialport'
import { InterByteTimeoutParser } from '@serialport/parser-inter-byte-timeout'

const port = new SerialPort({
  path: process.env.SENSEAIR_SERIAL_DEVICE_PATH ?? '/dev/serial0',
  baudRate: 9600,
})

const ABC_DISABLE_COMMAND = Buffer.from([
  0xfe, 0x06, 0x00, 0x1f, 0x00, 0x00, 0xac, 0x03,
])

const parser = port.pipe(new InterByteTimeoutParser({ interval: 100 }))

parser.on('data', (data) => {
  console.log(data)
  if (Buffer.compare(data, ABC_DISABLE_COMMAND) === 0) {
    console.log('ABC disabled successfully')
    process.exit(0)
  }
  console.log('Failed to disable ABC')
  process.exit(1)
})

console.log('Disabling ABC...')

port.write(ABC_DISABLE_COMMAND)

setTimeout(() => {
  console.log('Timed out')
  process.exit(1)
}, 5000)
