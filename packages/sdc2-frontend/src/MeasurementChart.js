import { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Paper from '@material-ui/core/Paper'
import Plotly from 'plotly.js/dist/plotly-basic'
import createPlotlyComponent from 'react-plotly.js/factory'
import { AxiosContext } from './AxiosContext'

const Plot = createPlotlyComponent(Plotly)

export default function MeasurementChart() {
  const [bounds, setBounds] = useState({
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

    setLocationsAndTypes(
      locations.map((location, i) => ({
        location,
        type: types[i],
      }))
    )
  }, [search])

  useEffect(() => {
    const getData = async () => {
      const newSeries = await Promise.all(
        locationsAndTypes.map(async ({ location, type }) => {
          const startIso = new Date(bounds.start).toISOString()
          const endIso = new Date(bounds.end).toISOString()
          const response = await axios.get(
            `measurement/location/${location}/type/${type}/from/${startIso}/to/${endIso}/aggregation/average`
          )
          const typeIndex = types.indexOf(type)
          return {
            type: 'scatter',
            mode: 'lines',
            name: `${location} - ${type}`,
            x: response.data.map(([x]) => new Date(x)),
            y: response.data.map(([, y]) => y),
            yaxis: `y${typeIndex + 1}`,
          }
        })
      )

      setSeries(newSeries)
    }
    if (locationsAndTypes.length) {
      getData().catch(console.error)
    }
  }, [axios, locationsAndTypes, bounds, types])

  return (
    <>
      <h1>Measurements</h1>

      <Paper style={{ padding: 16 }}>
        <Plot
          style={{ width: '100%', height: 400 }}
          data={series}
          layout={{
            autosize: true,
            margin: {
              l: 40,
              r: 20,
              t: 10,
              b: 30,
            },
            hovermode: 'x unified',
            hoverlabel: {
              namelength: -1,
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
          onRelayout={(e) => {
            const start = e['xaxis.range[0]']
            const end = e['xaxis.range[1]']
            if (start && end) {
              setBounds({
                start,
                end,
              })
            }
          }}
        />
      </Paper>
    </>
  )
}
