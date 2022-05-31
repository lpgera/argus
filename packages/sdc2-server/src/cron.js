import 'dotenv/config'
import { CronJob } from 'cron'
import moment from 'moment'
import got from 'got'
import log from './log.js'
import config from './config.js'
import * as location from './models/location.js'

const onTick = async () => {
  const locations = await location.get()
  const nonStaleLocations = locations.filter((l) =>
    moment(l.latestCreatedAt).isAfter(moment().subtract(config.staleThreshold))
  )
  const warnings = nonStaleLocations.filter((l) =>
    moment(l.latestCreatedAt).isBefore(
      moment().subtract(config.warningThreshold)
    )
  )
  if (warnings.length) {
    const message = warnings
      .map(
        (l) =>
          `${l.location} ${l.type} ${moment(l.latestCreatedAt).toISOString()}`
      )
      .join('\n')
    await got.post('https://api.pushbullet.com/v2/pushes', {
      headers: {
        'Access-Token': process.env.PUSHBULLET_API_KEY,
      },
      json: {
        type: 'note',
        title: 'SDC warning',
        body: message,
      },
    })
  }
}

const monitoringJob = new CronJob({
  cronTime: process.env.MONITORING_CRON ?? '0 */4 * * *',
  onTick,
})

async function start() {
  if (!process.env.PUSHBULLET_API_KEY) {
    throw new Error('process.env.PUSHBULLET_API_KEY not found')
  }
  monitoringJob.start()
}

start().catch((err) => log.error(err))
