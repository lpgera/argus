import { useLocation } from 'react-router-dom'

export default function MeasurementChart() {
  const { search } = useLocation()
  const urlSearchParams = new URLSearchParams(search)

  const locations = urlSearchParams.getAll('location')
  const types = urlSearchParams.getAll('type')

  return (
    <>
      <h1>Measurements</h1>

      {JSON.stringify({ locations, types }, null, 2)}
    </>
  )
}
