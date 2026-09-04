import { setTimeout } from 'node:timers/promises'
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
  if (data[1] === 0x04) {
    return
  }
  if (Buffer.compare(data, ABC_DISABLE_COMMAND) === 0) {
    console.log('ABC disabled successfully')
    process.exit(0)
  }
  console.log('Failed to disable ABC')
  process.exit(1)
})

console.log('Waking up sensor...')

// CO2 read is used to wake up the sensor
port.write(Buffer.from([0xfe, 0x04, 0x00, 0x03, 0x00, 0x01, 0xd5, 0xc5]))

await setTimeout(1000)

console.log('Disabling ABC...')

port.write(ABC_DISABLE_COMMAND)

await setTimeout(5000)

console.log('Timed out')
process.exit(1)
