import { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Paper from '@material-ui/core/Paper'
import { AxiosContext } from './AxiosContext'

export default function MeasurementChart() {
  const [start] = useState(new Date().setHours(0, 0, 0, 0))
  const [end] = useState(new Date().setHours(23, 59, 59, 999))
  const { search } = useLocation()
  const [locationsAndTypes, setLocationsAndTypes] = useState([])
  const [seriesByTypeAndLocation, setSeriesByTypeAndLocation] = useState({})
  const { axios } = useContext(AxiosContext)

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(search)
    const locations = urlSearchParams.getAll('location')
    const types = urlSearchParams.getAll('type')

    setLocationsAndTypes(
      locations.map((location, i) => ({
        location,
        type: types[i],
      }))
    )
  }, [search])

  useEffect(() => {
    const getData = async () => {
      setSeriesByTypeAndLocation({})
      await Promise.all(
        locationsAndTypes.map(async ({ location, type }) => {
          const startIso = new Date(start).toISOString()
          const endIso = new Date(end).toISOString()
          const response = await axios.get(
            `measurement/location/${location}/type/${type}/from/${startIso}/to/${endIso}/aggregation/average`
          )
          setSeriesByTypeAndLocation((series) => ({
            ...series,
            [type]: {
              ...series[type],
              [location]: response.data,
            },
          }))
        })
      )
    }
    if (start && end && locationsAndTypes.length) {
      getData()
    }
  }, [axios, locationsAndTypes, start, end])

  return (
    <>
      <h1>Measurements</h1>

      {Object.entries(seriesByTypeAndLocation).map(
        ([type, seriesByLocation]) => (
          <Paper style={{ padding: 16, marginBottom: 16 }} key={type}>
            <h2 style={{ marginTop: 0 }}>{type}</h2>

            {JSON.stringify(seriesByLocation, null, 2)}
          </Paper>
        )
      )}
    </>
  )
}
