import { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Paper from '@material-ui/core/Paper'
import Plotly from 'plotly.js/dist/plotly-basic'
import createPlotlyComponent from 'react-plotly.js/factory'
import debounce from 'lodash/debounce'
import { AxiosContext } from './AxiosContext'

const Plot = createPlotlyComponent(Plotly)

export default function MeasurementChart() {
  const [range, setRange] = useState({
    start: new Date().setHours(0, 0, 0, 0),
    end: new Date().setHours(23, 59, 59, 999),
  })
  const [maxRange, setMaxRange] = useState({
    start: new Date().setHours(0, 0, 0, 0),
    end: new Date().setHours(23, 59, 59, 999),
  })
  const { search } = useLocation()
  const [types, setTypes] = useState([])
  const [yAxes, setYAxes] = useState({})
  const [locationsAndTypes, setLocationsAndTypes] = useState([])
  const [series, setSeries] = useState([])
  const { axios } = useContext(AxiosContext)

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(search)
    const locations = urlSearchParams.getAll('location')
    const types = urlSearchParams.getAll('type')
    const uniqueTypes = [...new Set(types)]

    setTypes(uniqueTypes)

    setYAxes(
      Object.fromEntries(
        uniqueTypes.map((type, i) => {
          if (i === 0) {
            return [
              'yaxis',
              {
                title: type,
                fixedrange: true,
              },
            ]
          }
          return [
            `yaxis${i + 1}`,
            {
              title: type,
              fixedrange: true,
              overlaying: 'y',
            },
          ]
        })
      )
    )
    const locationAndTypes = locations.map((location, i) => ({
      location,
      type: types[i],
    }))
    setLocationsAndTypes(locationAndTypes)

    const getData = async () => {
      const newMaxRange = {
        start: Number.MAX_VALUE,
        end: 0,
      }
      await Promise.all(
        locationAndTypes.map(async ({ location, type }) => {
          const { data } = await axios.get(
            `measurement/location/${location}/type/${type}`
          )
          for (const [x] of data) {
            const start = new Date(x).setHours(0, 0, 0, 0)
            const end = new Date(x).setHours(23, 59, 59, 999)
            if (start < newMaxRange.start) {
              newMaxRange.start = start
            }
            if (end > newMaxRange.end) {
              newMaxRange.end = end
            }
          }
        })
      )
      setMaxRange(newMaxRange)
    }

    getData().catch(console.error)
  }, [axios, search])

  useEffect(() => {
    const getData = async () => {
      const newSeries = await Promise.all(
        locationsAndTypes.map(async ({ location, type }) => {
          const startIso = new Date(range.start).toISOString()
          const endIso = new Date(range.end).toISOString()
          const { data } = await axios.get(
            `measurement/location/${location}/type/${type}/from/${startIso}/to/${endIso}/aggregation/average`
          )
          const typeIndex = types.indexOf(type)
          return {
            type: 'scatter',
            mode: 'lines',
            name: `${location} - ${type}`,
            x: data.map(([x]) => x),
            y: data.map(([, y]) => y),
            yaxis: `y${typeIndex + 1}`,
          }
        })
      )

      setSeries(newSeries)
    }
    if (locationsAndTypes.length) {
      getData().catch(console.error)
    }
  }, [axios, locationsAndTypes, range, types])

  return (
    <>
      <h1>Measurements</h1>

      <Paper style={{ padding: 16 }}>
        <Plot
          style={{ width: '100%', height: 550 }}
          data={series}
          layout={{
            autosize: true,
            margin: {
              l: 40,
              r: 20,
              t: 10,
              b: 10,
            },
            hovermode: 'x unified',
            hoverlabel: {
              namelength: -1,
            },
            xaxis: {
              type: 'date',
              autorange: false,
              range: [new Date(range.start), new Date(range.end)],
              rangeslider: {
                autorange: false,
                range: [new Date(maxRange.start), new Date(maxRange.end)],
              },
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
            },
            ...yAxes,
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
          onRelayout={debounce((e) => {
            const start = e['xaxis.range[0]'] ?? e['xaxis.range']?.[0]
            const end = e['xaxis.range[1]'] ?? e['xaxis.range']?.[1]

            setRange({
              start: start
                ? Math.max(new Date(start).getTime(), maxRange.start)
                : range.start,
              end: end
                ? Math.min(new Date(end).getTime(), maxRange.end)
                : range.end,
            })
          }, 200)}
        />
      </Paper>
    </>
  )
}
