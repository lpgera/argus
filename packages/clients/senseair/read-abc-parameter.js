import { setTimeout } from 'node:timers/promises'
import { SerialPort } from 'serialport'
import { InterByteTimeoutParser } from '@serialport/parser-inter-byte-timeout'

const port = new SerialPort({
  path: process.env.SENSEAIR_SERIAL_DEVICE_PATH ?? '/dev/serial0',
  baudRate: 9600,
})

const parser = port.pipe(new InterByteTimeoutParser({ interval: 100 }))

parser.on('data', (data) => {
  console.log(data)
  if (data[1] === 0x04) {
    return
  }
  if (data[1] === 0x03) {
    console.log('ABC parameter value: ', data[4])
    process.exit(0)
  }
  process.exit(1)
})

console.log('Waking up sensor...')

// CO2 read is used to wake up the sensor
port.write(Buffer.from([0xfe, 0x04, 0x00, 0x03, 0x00, 0x01, 0xd5, 0xc5]))

await setTimeout(1000)

console.log('Querying ABC status...')

port.write(Buffer.from([0xfe, 0x03, 0x00, 0x1f, 0x00, 0x01, 0xa1, 0xc3]))

await setTimeout(5000)

console.log('Querying timed out')
process.exit(1)
