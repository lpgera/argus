import { SerialPort } from 'serialport'
import { InterByteTimeoutParser } from '@serialport/parser-inter-byte-timeout'

const port = new SerialPort({
  path: process.env.SENSEAIR_SERIAL_DEVICE_PATH ?? '/dev/serial0',
  baudRate: 9600,
})

// 0xb4 = 180 -> 180/24 = 7.5 days
const ABC_ENABLE_COMMAND = Buffer.from([
  0xfe, 0x06, 0x00, 0x1f, 0x00, 0xb4, 0xac, 0x74,
])

const parser = port.pipe(new InterByteTimeoutParser({ interval: 100 }))

parser.on('data', (data) => {
  console.log(data)
  if (Buffer.compare(data, ABC_ENABLE_COMMAND) === 0) {
    console.log('ABC enabled successfully')
    process.exit(0)
  }
  console.log('Failed to enable ABC')
  process.exit(1)
})

console.log('Enabling ABC...')

port.write(ABC_ENABLE_COMMAND)

setTimeout(() => {
  console.log('Timed out')
  process.exit(1)
}, 5000)
