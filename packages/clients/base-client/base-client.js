import Logger from 'logger'

const log = Logger({ name: 'base-client' })

async function handleErrors(fetchCall) {
  const response = await fetchCall()

  if (!response.ok) {
    log.error(
      `Argus client request error - status: ${
        response.status
      }, body: ${await response.text()}`
    )
  }
}

export default ({ url, apiKey, location }) => {
  function storeMeasurement({ type, value }) {
    return handleErrors(() =>
      fetch(`${url}/api/measurement/location/${location}`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ type, value }),
      })
    )
  }

  function storeMeasurements({ measurements }) {
    return handleErrors(() =>
      fetch(`${url}/api/measurement/location/${location}`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(measurements),
      })
    )
  }

  function getLatestMeasurement({ location, type }) {
    return handleErrors(() =>
      fetch(`${url}/api/measurement/latest/location/${location}/type/${type}`, {
        headers: {
          'x-api-key': apiKey,
        },
      })
    )
  }

  return {
    storeMeasurement,
    storeMeasurements,
    getLatestMeasurement,
  }
}
