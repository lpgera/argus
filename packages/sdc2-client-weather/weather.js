require('dotenv').config()
const axios = require('axios')
const cron = require('cron')
const sdc2Client = require('sdc2-client')({
  url: process.env.SDC2_URL,
  apiKey: process.env.SDC2_API_KEY,
  location: process.env.SDC2_LOCATION,
})
const log = require('sdc2-logger')({ name: 'sdc2-client-weather' })

axios.interceptors.response.use(
  (response) => {
    return response
  },
  (err) => {
    log.error(err, 'axios request error')
    return Promise.reject(err)
  }
)

const onTick = async () => {
  try {
    const [openWeatherMapResponse, airVisualResponse] = await Promise.all([
      axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          appid: process.env.WEATHER_OPENWEATHERMAP_API_KEY,
          lat: process.env.WEATHER_OPENWEATHERMAP_LATITUDE,
          lon: process.env.WEATHER_OPENWEATHERMAP_LONGITUDE,
          units: process.env.WEATHER_OPENWEATHERMAP_UNITS,
        },
      }),
      axios.get('https://api.airvisual.com/v2/city', {
        params: {
          key: process.env.WEATHER_AIRVISUAL_API_KEY,
          country: process.env.WEATHER_AIRVISUAL_COUNTRY,
          state: process.env.WEATHER_AIRVISUAL_STATE,
          city: process.env.WEATHER_AIRVISUAL_CITY,
        },
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
  cronTime: process.env.WEATHER_MEASUREMENT_CRON ?? '*/10 * * * *',
  onTick,
})

async function start() {
  measurementJob.start()
}

start().catch((error) => log.error(error))
