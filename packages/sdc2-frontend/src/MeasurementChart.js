import { useContext, useEffect, useReducer, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'
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

const StyledPlot = styled(Plot)(({ theme }) => ({
  width: '100%',
  height: 360,
  marginBottom: theme.spacing(1),
}))

const colors = [
  '#2196f3',
  '#e91e63',
  '#4caf50',
  '#607d8b',
  '#ff9800',
  '#673ab7',
  '#cddc39',
  '#009688',
  '#3f51b5',
  '#9c27b0',
  '#795548',
]

const rangeSelectorButtons = [
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
]

export default function MeasurementChart() {
  const theme = useTheme()
  const { axios } = useContext(AxiosContext)
  const [aggregation, setAggregation] = useState('average')
  const { search } = useLocation()
  const [types, setTypes] = useState([])
  const [locationsAndTypes, setLocationsAndTypes] = useState([])
  const [maxRange, setMaxRange] = useState({
    start: new Date().setHours(0, 0, 0, 0),
    end: new Date().setHours(23, 59, 59, 999),
  })
  const [yAxes, setYAxes] = useState({})
  const [start, setStart] = useState(new Date().setHours(0, 0, 0, 0))
  const [end, setEnd] = useState(new Date().setHours(23, 59, 59, 999))
  const [series, setSeries] = useState([])
  const [refetchState, refetchSeries] = useReducer(() => ({}), {})

  const chartRef = useRef(null)

  const { width: chartWidth = 800 } = useSize(chartRef) ?? {}
  const yAxisWidth = 44.0 / chartWidth

  // calculate locations and types from search
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(search)
    const locations = urlSearchParams.getAll('location')
    const types = urlSearchParams.getAll('type')
    const uniqueTypes = [...new Set(types)]

    setTypes(uniqueTypes)
    setLocationsAndTypes(
      locations.map((location, i) => ({
        location,
        type: types[i],
      }))
    )
  }, [search])

  // calculate yAxes from types and window size
  useEffect(() => {
    setYAxes(
      Object.fromEntries(
        types.map((type, i) => {
          const commonProps = {
            fixedrange: true,
            zeroline: false,
            showgrid: false,
            color: theme.palette.text.secondary,
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
  }, [types, yAxisWidth, theme])

  // fetch max range based on locations and types
  useEffect(() => {
    const fetchMaxRange = async () => {
      if (locationsAndTypes.length) {
        const newMaxRange = {
          start: Number.MAX_VALUE,
          end: 0,
        }
        await Promise.all(
          locationsAndTypes.map(async ({ location, type }) => {
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
    }

    fetchMaxRange().catch(console.error)
  }, [axios, locationsAndTypes])

  // fetch data series
  useEffect(() => {
    const fetchSeries = async () => {
      const newSeries = await Promise.all(
        locationsAndTypes.map(async ({ location, type }) => {
          const startIso = new Date(start).toISOString()
          const endIso = new Date(end).toISOString()
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
      fetchSeries().catch(console.error)
    }
  }, [axios, locationsAndTypes, start, end, aggregation, types, refetchState])

  return (
    <>
      <h1>Measurements</h1>

      <Paper style={{ padding: theme.spacing(2) }} ref={chartRef}>
        <StyledPlot
          data={series}
          layout={{
            plot_bgcolor: theme.palette.background.default,
            paper_bgcolor: theme.palette.background.paper,
            autosize: true,
            dragmode: 'pan',
            font: {
              size: 10,
              color: theme.palette.text.secondary,
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
              range: [new Date(start), new Date(end)],
              rangeslider: {
                autorange: false,
                thickness: 0.05,
                range: [new Date(maxRange.start), new Date(maxRange.end)],
              },
              rangeselector: {
                x: 0,
                y: 1.05,
                bgcolor: theme.palette.background.default,
                buttons: rangeSelectorButtons,
              },
            },
            ...yAxes,
            colorway: colors,
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
            const newStart = e['xaxis.range[0]'] ?? e['xaxis.range']?.[0]
            const newEnd = e['xaxis.range[1]'] ?? e['xaxis.range']?.[1]

            setStart(
              newStart
                ? Math.max(new Date(newStart).getTime(), maxRange.start)
                : start
            )
            setEnd(
              newEnd ? Math.min(new Date(newEnd).getTime(), maxRange.end) : end
            )
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
                refetchSeries()
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
