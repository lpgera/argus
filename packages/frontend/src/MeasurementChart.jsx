import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import HighchartsReact from 'highcharts-react-official'
import HighStock from 'highcharts/highstock'
import 'highcharts/css/highcharts.css'
import './highcharts.overrides.css'
import useApiClient from './hooks/useApiClient'
import useDarkMode from './hooks/useDarkMode'

const rangeSelectorButtons = [
  {
    count: 6,
    text: '6h',
    type: 'hour',
  },
  {
    count: 12,
    text: '12h',
    type: 'hour',
  },
  {
    text: '1d',
    type: 'day',
  },
  {
    count: 7,
    text: '1w',
    type: 'day',
  },
  {
    text: '1m',
    type: 'month',
  },
  {
    count: 3,
    text: '3m',
    type: 'month',
  },
  {
    count: 6,
    text: '6m',
    type: 'month',
  },
  {
    text: '1y',
    type: 'year',
  },
  {
    type: 'all',
    text: 'All',
  },
]

export default function MeasurementChart() {
  const [isDarkMode] = useDarkMode()
  const dayStart = new Date().setHours(0, 0, 0, 0)
  const dayEnd = new Date().setHours(23, 59, 59, 999)
  const theme = useTheme()
  const [, apiClient] = useApiClient()
  const [aggregation, setAggregation] = useState('average')
  const { search } = useLocation()
  const [types, setTypes] = useState([])
  const [locationsAndTypes, setLocationsAndTypes] = useState([])
  const [extremes, setExtremes] = useState({
    min: dayStart,
    max: dayEnd,
  })
  const [dataSeries, setDataSeries] = useState([])
  const [navigatorSeries, setNavigatorSeries] = useState([])
  const [refetchState, setRefetchState] = useState({})
  const refetchSeries = () => setRefetchState({})

  const yAxis = types.map((type) => ({
    id: type,
    title: {
      text: type,
    },
    maxPadding: 0,
    minPadding: 0,
    showLastLabel: true,
    opposite: false,
  }))

  const isAllSeriesInitialized =
    locationsAndTypes.length === dataSeries.length &&
    locationsAndTypes.length === navigatorSeries.length

  const series = isAllSeriesInitialized
    ? [...dataSeries, ...navigatorSeries]
    : []

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

  // fetch data series
  useEffect(() => {
    const fetchDataSeries = async () => {
      const newSeries = await Promise.all(
        locationsAndTypes.map(async ({ location, type }) => {
          const startISO = new Date(extremes.min).toISOString()
          const endISO = new Date(extremes.max).toISOString()
          const data = await apiClient(
            `/measurement/location/${location}/type/${type}/from/${startISO}/to/${endISO}/aggregation/${aggregation}`
          )
          return {
            name: `${location} - ${type}`,
            data,
            yAxis: type,
            showInNavigator: false,
          }
        })
      )

      setDataSeries(newSeries)
    }
    if (locationsAndTypes.length) {
      fetchDataSeries().catch(console.error)
    }
  }, [apiClient, locationsAndTypes, extremes, aggregation, types, refetchState])

  // fetch navigator series
  useEffect(() => {
    const fetchNavigatorSeries = async () => {
      const newSeries = await Promise.all(
        locationsAndTypes.map(async ({ location, type }, i) => {
          const data = await apiClient(
            `/measurement/location/${location}/type/${type}`
          )
          return {
            name: `${location} - ${type}`,
            data,
            yAxis: type,
            navigatorOptions: {
              visible: true,
            },
            colorIndex: i,
            showInNavigator: true,
            showInLegend: false,
            visible: false,
          }
        })
      )

      setNavigatorSeries(newSeries)
    }
    if (locationsAndTypes.length) {
      fetchNavigatorSeries().catch(console.error)
    }
  }, [apiClient, locationsAndTypes, types, refetchState])

  return (
    <>
      <h1>Measurements</h1>

      <Paper
        style={{ padding: theme.spacing(2) }}
        className={`highcharts-${isDarkMode ? 'dark' : 'light'}`}
      >
        <HighchartsReact
          containerProps={{ style: { marginBottom: theme.spacing(1) } }}
          highcharts={HighStock}
          constructorType={'stockChart'}
          options={{
            chart: {
              type: 'line',
              animation: false,
              styledMode: true,
              marginTop: 20,
            },
            accessibility: {
              enabled: false,
            },
            plotOptions: {
              series: {
                dataGrouping: {
                  enabled: false,
                },
                animation: false,
              },
            },
            time: {
              timezoneOffset: new Date().getTimezoneOffset(),
            },
            rangeSelector: {
              inputEnabled: false,
              dropdown: 'never',
              buttonPosition: {
                align: 'right',
                y: -10,
              },
              buttons: rangeSelectorButtons,
            },
            xAxis: [
              {
                type: 'datetime',
                ordinal: false,
                min: extremes.min,
                max: extremes.max,
                events: {
                  afterSetExtremes: ({ min, max }) =>
                    setExtremes({
                      min: new Date(min ?? dayStart).getTime(),
                      max: new Date(max ?? dayEnd).getTime(),
                    }),
                },
              },
            ],
            yAxis,
            series,
            tooltip: {
              split: false,
              shared: true,
            },
            legend: {
              enabled: true,
            },
            navigator: {
              xAxis: {
                overscroll: 86400000,
              },
            },
            scrollbar: {
              enabled: true,
              liveRedraw: false,
              buttonsEnabled: true,
              height: 16,
            },
          }}
        />
        <Grid container>
          <Grid item xs={6}>
            <FormControl size="small" color="secondary">
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
              onClick={() => refetchSeries()}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  )
}
