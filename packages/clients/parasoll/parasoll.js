import { CronJob } from 'cron'
import Client from 'base-client'
import Logger from 'logger'
import { createDirigeraClient } from 'dirigera'

const client = Client({
  url: process.env.ARGUS_URL,
  apiKey: process.env.ARGUS_API_KEY,
  location: process.env.ARGUS_SENSOR_LOCATION,
})

const log = Logger({ name: 'vindstyrka' })

const dirigeraClient = await createDirigeraClient({
  gatewayIP: process.env.DIRIGERA_GATEWAY_IP,
  accessToken: process.env.DIRIGERA_ACCESS_TOKEN,
})

dirigeraClient.startListeningForUpdates(async (update) => {
  log.debug(update, 'Received update')
  if (
    update.type === 'deviceStateChanged' &&
    update.data.deviceType === 'openCloseSensor' &&
    update.data.id === process.env.DIRIGERA_PARASOLL_ID
  ) {
    log.info(update, 'Received PARASOLL state change update')
    await client.storeMeasurement({
      type: 'open',
      value: update.data.attributes.isOpen ? 1 : 0,
    })
  }
})

log.info('Listening for updates...')

const onTick = async () => {
  try {
    const parasoll = await dirigeraClient.openCloseSensors.get({
      id: process.env.DIRIGERA_PARASOLL_ID,
    })

    await client.storeMeasurement({
      type: 'open',
      value: parasoll.attributes.isOpen ? 1 : 0,
    })
  } catch (error) {
    log.error(error)
  }
}

const measurementJob = CronJob.from({
  cronTime: process.env.PARASOLL_MEASUREMENT_CRON ?? '*/5 * * * *',
  onTick,
})

async function start() {
  measurementJob.start()
}

start().catch((error) => log.error(error))
