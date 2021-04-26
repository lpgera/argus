import { useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from 'styled-components'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import Plotly from 'plotly.js/dist/plotly-basic'
import createPlotlyComponent from 'react-plotly.js/factory'
import debounce from 'lodash/debounce'
import { AxiosContext } from './AxiosContext'
import useSize from './useSize'
import './plotly-overrides.css'

const Plot = createPlotlyComponent(Plotly)

export default function MeasurementChart() {
  const theme = useTheme()
  const [range, setRange] = useState({
    start: new Date().setHours(0, 0, 0, 0),
    end: new Date().setHours(23, 59, 59, 999),
  })
  const [maxRange, setMaxRange] = useState({
    start: new Date().setHours(0, 0, 0, 0),
    end: new Date().setHours(23, 59, 59, 999),
  })
  const [aggregation, setAggregation] = useState('average')
  const { search } = useLocation()
  const [types, setTypes] = useState([])
  const [yAxes, setYAxes] = useState({})
  const [locationsAndTypes, setLocationsAndTypes] = useState([])
  const [series, setSeries] = useState([])
  const { axios } = useContext(AxiosContext)
  const chartRef = useRef(null)
  const { width: chartWidth = 800 } = useSize(chartRef) ?? {}
  const yAxisWidth = 44.0 / chartWidth

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(search)
    const locations = urlSearchParams.getAll('location')
    const types = urlSearchParams.getAll('type')
    const uniqueTypes = [...new Set(types)]

    setTypes(uniqueTypes)

    setYAxes(
      Object.fromEntries(
        uniqueTypes.map((type, i) => {
          const commonProps = {
            fixedrange: true,
            zeroline: false,
            showgrid: false,
            titlefont: {
              size: 10,
            },
          }
          if (i === 0) {
            return [
              'yaxis',
              {
                title: type,
                ...commonProps,
                showgrid: true,
              },
            ]
          }
          return [
            `yaxis${i + 1}`,
            {
              title: type,
              overlaying: 'y',
              position: yAxisWidth * i,
              ...commonProps,
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
  }, [axios, search, yAxisWidth])

  useEffect(() => {
    const getData = async () => {
      const newSeries = await Promise.all(
        locationsAndTypes.map(async ({ location, type }) => {
          const startIso = new Date(range.start).toISOString()
          const endIso = new Date(range.end).toISOString()
          const { data } = await axios.get(
            `measurement/location/${location}/type/${type}/from/${startIso}/to/${endIso}/aggregation/${aggregation}`
          )
          const typeIndex = types.indexOf(type)
          return {
            type: 'scatter',
            mode: 'lines',
            name: `${location} - ${type}`,
            x: data.map(([x]) => x),
            y: data.map(([, y]) => y),
            yaxis: `y${typeIndex + 1}`,
            hovertemplate: '%{y:.2f}',
          }
        })
      )

      setSeries(newSeries)
    }
    if (locationsAndTypes.length) {
      getData().catch(console.error)
    }
  }, [axios, locationsAndTypes, range, aggregation, types])

  return (
    <>
      <h1>Measurements</h1>

      <Paper style={{ padding: theme.spacing(2) }} ref={chartRef}>
        <Plot
          style={{ width: '100%', height: 360, marginBottom: theme.spacing(1) }}
          data={series}
          layout={{
            autosize: true,
            dragmode: 'pan',
            font: {
              size: 10,
            },
            margin: {
              l: 0,
              r: 10,
              t: 10,
              b: 10,
            },
            hovermode: 'x unified',
            hoverlabel: {
              namelength: -1,
            },
            xaxis: {
              type: 'date',
              domain: [types.length * yAxisWidth, 1],
              showgrid: false,
              autorange: false,
              range: [new Date(range.start), new Date(range.end)],
              rangeslider: {
                autorange: false,
                thickness: 0.05,
                range: [new Date(maxRange.start), new Date(maxRange.end)],
              },
              rangeselector: {
                x: 0,
                y: 1.05,
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
                  {
                    count: 1,
                    label: '1y',
                    step: 'year',
                    stepmode: 'backward',
                  },
                ],
              },
            },
            ...yAxes,
            colorway: [
              '#40c4ff',
              '#37474f',
              '#69f0ae',
              '#ffab40',
              '#7c4dff',
              '#ff4081',
              '#eeff41',
              '#00695c',
              '#ff3d00',
              '#558b2f',
            ],
            legend: {
              orientation: 'h',
              xanchor: 'center',
              x: 0.5,
              y: -0.3,
            },
          }}
          config={{
            displayModeBar: false,
            showTips: false,
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
        <Grid container>
          <Grid item xs={6}>
            <FormControl variant="outlined" size="small">
              <InputLabel>Aggregation</InputLabel>
              <Select
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value)}
                label="Aggregation"
              >
                <MenuItem value="average">Average</MenuItem>
                <MenuItem value="minimum">Minimum</MenuItem>
                <MenuItem value="maximum">Maximum</MenuItem>
                <MenuItem value="count">Count</MenuItem>
                <MenuItem value="sum">Sum</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setRange({ ...range })
              }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  )
}
