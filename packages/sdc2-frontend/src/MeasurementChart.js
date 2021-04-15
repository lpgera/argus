import { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Paper from '@material-ui/core/Paper'
import Plot from 'react-plotly.js'
import { AxiosContext } from './AxiosContext'

export default function MeasurementChart() {
  const [start, setStart] = useState(new Date().setHours(0, 0, 0, 0))
  const [end, setEnd] = useState(new Date().setHours(23, 59, 59, 999))

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
              [location]: {
                type: 'scatter',
                mode: 'lines',
                name: `${location} - ${type}`,
                x: response.data.map(([x]) => new Date(x)),
                y: response.data.map(([, y]) => y),
              },
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

            <Plot
              style={{ width: '100%', height: 400 }}
              data={Object.values(seriesByLocation)}
              layout={{
                autosize: true,
                margin: {
                  l: 40,
                  r: 20,
                  t: 0,
                  b: 30,
                },
                xaxis: {
                  type: 'date',
                  rangeselector: {
                    buttons: [
                      {
                        count: 6,
                        label: '6h',
                        step: 'hour',
                        stepmode: 'backward',
                      },
                      {
                        count: 12,
                        label: '12h',
                        step: 'hour',
                        stepmode: 'backward',
                      },
                      {
                        count: 1,
                        label: '1d',
                        step: 'day',
                        stepmode: 'backward',
                      },
                      {
                        count: 7,
                        label: '1w',
                        step: 'day',
                        stepmode: 'backward',
                      },
                      {
                        count: 1,
                        label: '1m',
                        step: 'month',
                        stepmode: 'backward',
                      },
                      {
                        count: 3,
                        label: '3m',
                        step: 'month',
                        stepmode: 'backward',
                      },
                      {
                        count: 6,
                        label: '6m',
                        step: 'month',
                        stepmode: 'backward',
                      },
                      { step: 'all' },
                    ],
                  },
                  // rangeslider: {},
                },
                yaxis: {
                  fixedrange: true,
                },
                legend: {
                  orientation: 'h',
                  xanchor: 'center',
                  yanchor: 'top',
                  x: 0.5,
                  y: -0.1,
                },
              }}
              config={{
                displayModeBar: false,
              }}
              useResizeHandler
              onRelayout={(e) => {
                setStart(e['xaxis.range[0]'])
                setEnd(e['xaxis.range[1]'])
              }}
            />
          </Paper>
        )
      )}
    </>
  )
}
