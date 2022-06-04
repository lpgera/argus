import 'dotenv/config'
import cron from 'cron'
import Client from 'sdc2-client'
import Logger from 'sdc2-logger'

const client = Client({
  url: process.env.SDC2_URL,
  apiKey: process.env.SDC2_API_KEY,
  location: process.env.SDC2_LOCATION,
})
const log = Logger({ name: 'sdc2-client-weather' })

const onTick = async () => {
  try {
    const [openWeatherMapResponse, airVisualResponse] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?${new URLSearchParams({
          appid: process.env.WEATHER_OPENWEATHERMAP_API_KEY,
          lat: process.env.WEATHER_OPENWEATHERMAP_LATITUDE,
          lon: process.env.WEATHER_OPENWEATHERMAP_LONGITUDE,
          units: process.env.WEATHER_OPENWEATHERMAP_UNITS,
        })}`
      ),
      fetch(
        `https://api.airvisual.com/v2/city?${new URLSearchParams({
          key: process.env.WEATHER_AIRVISUAL_API_KEY,
          country: process.env.WEATHER_AIRVISUAL_COUNTRY,
          state: process.env.WEATHER_AIRVISUAL_STATE,
          city: process.env.WEATHER_AIRVISUAL_CITY,
        })}`
      ),
    ])
    if (!openWeatherMapResponse.ok) {
      throw new Error(
        `OpenWeatherMap API error: ${await openWeatherMapResponse.text()}`
      )
    }
    if (!airVisualResponse.ok) {
      throw new Error(`AirVisual API error: ${await airVisualResponse.text()}`)
    }

    const openWeatherMapResponseData = await openWeatherMapResponse.json()
    const airVisualResponseData = await airVisualResponse.json()

    const measurements = [
      { type: 'humidity', value: openWeatherMapResponseData.main.humidity },
      { type: 'pressure', value: openWeatherMapResponseData.main.pressure },
      { type: 'temperature', value: openWeatherMapResponseData.main.temp },
      { type: 'wind', value: openWeatherMapResponseData.wind.speed },
      {
        type: 'aqi',
        value: airVisualResponseData.data.current.pollution.aqius,
      },
    ]
    await client.storeMeasurements({ measurements })
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
