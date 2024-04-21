import { CronJob } from 'cron'
import Client from 'base-client'
import Logger from 'logger'

const client = Client({
  url: process.env.ARGUS_URL,
  apiKey: process.env.ARGUS_API_KEY,
  location: process.env.ARGUS_SENSOR_LOCATION,
})
const log = Logger({ name: 'weather' })

const getOpenWeatherMapMeasurements = async () => {
  const openWeatherMapResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?${new URLSearchParams({
      appid: process.env.WEATHER_OPENWEATHERMAP_API_KEY,
      lat: process.env.WEATHER_LATITUDE,
      lon: process.env.WEATHER_LONGITUDE,
      units: process.env.WEATHER_OPENWEATHERMAP_UNITS,
    })}`
  )

  if (!openWeatherMapResponse.ok) {
    throw new Error(
      `OpenWeatherMap API error: ${await openWeatherMapResponse.text()}`
    )
  }

  const responseData = await openWeatherMapResponse.json()

  return [
    { type: 'humidity', value: responseData.main.humidity },
    { type: 'pressure', value: responseData.main.pressure },
    { type: 'temperature', value: responseData.main.temp },
    { type: 'wind', value: responseData.wind.speed },
  ]
}

const getAirVisualMeasurements = async () => {
  const airVisualResponse = await fetch(
    `https://api.airvisual.com/v2/nearest_city?${new URLSearchParams({
      key: process.env.WEATHER_AIRVISUAL_API_KEY,
      lat: process.env.WEATHER_LATITUDE,
      lon: process.env.WEATHER_LONGITUDE,
    })}`
  )
  if (!airVisualResponse.ok) {
    throw new Error(`AirVisual API error: ${await airVisualResponse.text()}`)
  }

  const responseData = await airVisualResponse.json()

  return [
    {
      type: 'aqi',
      value: responseData.data.current.pollution.aqius,
    },
  ]
}

const onTick = async () => {
  try {
    const measurementResults = await Promise.allSettled([
      getOpenWeatherMapMeasurements(),
      getAirVisualMeasurements(),
    ])

    measurementResults
      .filter(({ status }) => status === 'rejected')
      .forEach(({ reason }) => log.error(reason))

    const measurements = measurementResults
      .filter(({ status }) => status === 'fulfilled')
      .flatMap(({ value }) => value)

    if (measurements.length) {
      await client.storeMeasurements({ measurements })
    }
  } catch (err) {
    log.error(err)
  }
}

const measurementJob = CronJob.from({
  cronTime: process.env.WEATHER_MEASUREMENT_CRON ?? '*/10 * * * *',
  onTick,
})

async function start() {
  measurementJob.start()
}

start().catch((error) => log.error(error))
