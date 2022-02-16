const axios = require('axios')
const log = require('sdc2-logger')({ name: 'sdc2-client' })

module.exports = ({ url, apiKey, location }) => {
  axios.interceptors.response.use(
    (response) => {
      return response
    },
    (err) => {
      log.error(
        `sdc2-client request error - status: ${err.response?.status} body:`,
        err.response?.data
      )
      return Promise.reject(err)
    }
  )

  function storeMeasurement({ type, value }) {
    return axios.post(
      `${url}/api/measurement/location/${location}`,
      { type, value },
      {
        headers: {
          'X-API-Key': apiKey,
        },
      }
    )
  }

  function storeMeasurements({ measurements }) {
    return axios.post(
      `${url}/api/measurement/location/${location}`,
      measurements,
      {
        headers: {
          'X-API-Key': apiKey,
        },
      }
    )
  }

  function getLatestMeasurement({ location, type }) {
    return axios.get(
      `${url}/api/measurement/latest/location/${location}/type/${type}`,
      {
        headers: {
          'X-API-Key': apiKey,
        },
      }
    )
  }

  return {
    storeMeasurement,
    storeMeasurements,
    getLatestMeasurement,
  }
}
