const config = require('config')
const axios = require('axios')
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

const openWeatherMapPromise = axios.get(
  'http://api.openweathermap.org/data/2.5/weather',
  {
    params: config.get('openWeatherMap'),
  }
)

const airVisualPromise = axios.get('http://api.airvisual.com/v2/city', {
  params: config.get('airVisual.apiKey'),
})

Promise.all([openWeatherMapPromise, airVisualPromise]).then(
  ([openWeatherMapResponse, airVisualResponse]) => {
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
    return sdc2Client.storeMeasurements({ measurements })
  }
)
