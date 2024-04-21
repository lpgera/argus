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
    await fetch(process.env.MONITORING_NTFY_URL, {
      method: 'POST',
      headers: {
        Title: 'Argus warning',
        Tag: 'warning',
      },
      body: message,
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
        await fetch(a.ntfyUrl, {
          method: 'POST',
          headers: {
            Title: 'Argus alert',
            Tag: 'rotating_light',
          },
          body: `${a.location} ${a.type} ${a.comparison} ${a.value}\nLatest measurement: ${latestMeasurement.latestValue}`,
        })
        await alert.setIsAlerting(a.id, true)
      }

      if (!nextIsAlerting && a.isAlerting) {
        await alert.setIsAlerting(a.id, false)
      }
    }
  }
}

const monitoringJob = CronJob.from({
  cronTime: process.env.MONITORING_CRON ?? '0 */4 * * *',
  onTick: monitoringTick,
})

const alertingJob = CronJob.from({
  cronTime: process.env.ALERTING_CRON ?? '30 */5 * * * *',
  onTick: alertingTick,
})

async function start() {
  if (process.env.MONITORING_NTFY_URL) {
    monitoringJob.start()
  } else {
    log.warn('No MONITORING_NTFY_URL set, monitoring disabled')
  }
  alertingJob.start()
}

start().catch((err) => log.error(err))
