require('dotenv').config()
const cron = require('cron')
const moment = require('moment')
const { got } = require('got-cjs')
const log = require('./log')
const { staleThreshold, warningThreshold } = require('./config')
const location = require('./models/location')

const onTick = async () => {
  const locations = await location.get()
  const nonStaleLocations = locations.filter((l) =>
    moment(l.latestCreatedAt).isAfter(moment().subtract(staleThreshold))
  )
  const warnings = nonStaleLocations.filter((l) =>
    moment(l.latestCreatedAt).isBefore(moment().subtract(warningThreshold))
  )
  if (warnings.length) {
    const message = locations
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

const monitoringJob = new cron.CronJob({
  cronTime: process.env.MONITORING_CRON ?? '0 */4 * * *',
  onTick,
})

async function start() {
  if (!process.env.PUSHBULLET_API_KEY) {
    log.warn('process.env.PUSHBULLET_API_KEY not found')
  }
  monitoringJob.start()
}

start().catch(log.error)
