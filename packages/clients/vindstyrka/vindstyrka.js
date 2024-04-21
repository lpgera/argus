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

const onTick = async () => {
  try {
    const vindstyrka = await dirigeraClient.environmentSensors.get({
      id: process.env.DIRIGERA_VINDSTYRKA_ID,
    })

    const measurements = [
      {
        type: 'pm25',
        value: vindstyrka.attributes.currentPM25,
      },
      {
        type: 'tvoc',
        value: vindstyrka.attributes.vocIndex,
      },
    ]

    await client.storeMeasurements({ measurements })
  } catch (error) {
    log.error(error)
  }
}

const measurementJob = CronJob.from({
  cronTime: process.env.VINDSTYRKA_MEASUREMENT_CRON ?? '*/5 * * * *',
  onTick,
})

async function start() {
  measurementJob.start()
}

start().catch((error) => log.error(error))
