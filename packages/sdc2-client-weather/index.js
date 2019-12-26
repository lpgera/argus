const config = require('config')
const axios = require('axios')
const cron = require('cron')
const sdc2Client = require('sdc2-client')(config.get('sdc2'))
const log = require('sdc2-logger')({ name: 'sdc2-client-weather' })

axios.interceptors.response.use(
  response => {
    return response
  },
  err => {
    log.error(
      `axios request error - status: ${err.response.status} body:`,
      err.response.data
    )
    return Promise.reject(err)
  }
)

const onTick = async () => {
  try {
    const [openWeatherMapResponse, airVisualResponse] = await Promise.all([
      axios.get('http://api.openweathermap.org/data/2.5/weather', {
        params: config.get('openWeatherMap'),
      }),
      axios.get('http://api.airvisual.com/v2/city', {
        params: config.get('airVisual'),
      }),
    ])
    const measurements = [
      { type: 'humidity', value: openWeatherMapResponse.data.main.humidity },
      { type: 'pressure', value: openWeatherMapResponse.data.main.pressure },
      { type: 'temperature', value: openWeatherMapResponse.data.main.temp },
      { type: 'wind', value: openWeatherMapResponse.data.wind.speed },
      {
        type: 'aqi',
        value: airVisualResponse.data.data.current.pollution.aqius,
      },
    ]
    await sdc2Client.storeMeasurements({ measurements })
  } catch (err) {
    log.error(err)
  }
}

const measurementJob = new cron.CronJob({
  cronTime: config.get('measurementCron'),
  onTick,
})

async function start() {
  measurementJob.start()
}

start().catch(log.error)
