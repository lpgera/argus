const cron = require('cron')
const config = require('config')
const childProcess = require('child_process')
const path = require('path')
const log = require('sdc2-logger')({ name: 'sdc2-client-mijia' })

const onTick = () => {
  childProcess.fork(path.join(__dirname, 'measure'))
}

const measurementJob = new cron.CronJob({
  cronTime: config.get('measurementCron'),
  onTick,
})

async function start() {
  measurementJob.start()
}

start().catch(log.error)
