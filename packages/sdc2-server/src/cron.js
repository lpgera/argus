import 'dotenv/config'
import { CronJob } from 'cron'
import moment from 'moment'
import log from './log.js'
import config from './config.js'
import * as location from './models/location.js'
import * as alert from './models/alert.js'
import * as diagnostics from './models/diagnostics.js'

const monitoringTick = async () => {
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
    await fetch('https://api.pushbullet.com/v2/pushes', {
      method: 'POST',
      headers: {
        'Access-Token': process.env.PUSHBULLET_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'note',
        title: 'SDC warning',
        body: message,
      }),
    })
  }
}

const shouldAlert = ({ value, comparison, alertValue }) => {
  switch (comparison) {
    case '<':
      return value < alertValue
    case '<=':
      return value <= alertValue
    case '=':
      return (value = alertValue)
    case '>=':
      return value >= alertValue
    case '>':
      return value > alertValue
    default:
      throw new Error(`Invalid comparison: ${comparison}`)
  }
}

const alertingTick = async () => {
  const alerts = await alert.list()
  const diagnosticsData = await diagnostics.get()

  for (const a of alerts) {
    const latestMeasurement = diagnosticsData.find(
      ({ location, type }) => location === a.location && type === a.type
    )

    if (latestMeasurement) {
      const nextIsAlerting = shouldAlert({
        value: latestMeasurement.latestValue,
        comparison: a.comparison,
        alertValue: a.value,
      })

      if (nextIsAlerting && !a.isAlerting) {
        await fetch('https://api.pushbullet.com/v2/pushes', {
          method: 'POST',
          headers: {
            'Access-Token': process.env.PUSHBULLET_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'note',
            title: 'SDC alert',
            body: `🚨 ${a.location} ${a.type} ${a.comparison} ${a.value} 🚨\n
            Latest measurement: ${latestMeasurement.latestValue} at ${latestMeasurement.latestCreatedAt}`,
          }),
        })
        await alert.setIsAlerting(a.id, true)
      }

      if (!nextIsAlerting && a.isAlerting) {
        await alert.setIsAlerting(a.id, false)
      }
    }
  }
}

const monitoringJob = new CronJob({
  cronTime: process.env.MONITORING_CRON ?? '0 */4 * * *',
  onTick: monitoringTick,
})

const alertingJob = new CronJob({
  cronTime: process.env.ALERTING_CRON ?? '30 */5 * * *',
  onTick: alertingTick,
})

async function start() {
  if (!process.env.PUSHBULLET_API_KEY) {
    throw new Error('process.env.PUSHBULLET_API_KEY not found')
  }
  monitoringJob.start()
  alertingJob.start()
}

start().catch((err) => log.error(err))
