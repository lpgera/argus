import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function MeasurementChart() {
  const [start] = useState(new Date('2021-04-04').setHours(0, 0, 0, 0))
  const [end] = useState(new Date().setHours(23, 59, 59, 999))
  const { search } = useLocation()
  const [locationsAndTypes, setLocationsAndTypes] = useState([])

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

  return (
    <>
      <h1>Measurements</h1>

      {JSON.stringify({ locationsAndTypes, start, end }, null, 2)}
    </>
  )
}
