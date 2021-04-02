<template>
  <div>
    <h3>Measurements</h3>

    <div v-if="chart === null" class="center-align">
      <preloader></preloader>
    </div>

    <div id="chart"></div>

    <div>
      <select
        v-model="aggregationType"
        class="browser-default"
        style="display: inline-block"
      >
        <option value="average">Average</option>
        <option value="minimum">Minimum</option>
        <option value="maximum">Maximum</option>
        <option value="count">Count</option>
        <option value="sum">Sum</option>
      </select>
      <button
        class="btn waves-effect waves-light right"
        @click="refresh"
        :disabled="this.chart === null"
      >
        <i class="material-icons right">refresh</i> Refresh
      </button>
    </div>
  </div>
</template>

<script>
import Highcharts from 'highcharts/highstock'
import axios from 'axios'
import _ from 'lodash'
import Preloader from './Preloader.vue'

export default {
  name: 'MeasurementChart',
  components: {
    Preloader,
  },
  data() {
    return {
      chart: null,
      series: [],
      initializing: true,
      aggregationType: 'average',
    }
  },
  computed: {
    locations() {
      return _.castArray(this.$route.query.location)
    },
    types() {
      return _.castArray(this.$route.query.type)
    },
    uniqueTypes() {
      return _.uniq(this.types)
    },
  },
  watch: {
    aggregationType: function () {
      this.afterSetExtremes()
    },
  },
  methods: {
    async initSeries() {
      const numberOfSeries = this.locations.length
      await Promise.all(
        this.locations.map(async (l, index) => {
          const t = this.types[index]
          const response = await axios.get(
            `/measurement/location/${l}/type/${t}`
          )
          this.series[index] = {
            name: `${l} - ${t}`,
            yAxis: t,
            data: response.data,
            showInNavigator: false,
            showInLegend: true,
            visible: true,
            dataGrouping: {
              enabled: false,
            },
          }
          this.series[index + numberOfSeries] = {
            name: `${l} - ${t}`,
            yAxis: t,
            data: response.data,
            colorIndex: index,
            navigatorOptions: {
              visible: true,
            },
            showInNavigator: true,
            showInLegend: false,
            visible: false,
            dataGrouping: {
              enabled: false,
            },
          }
        })
      )
    },
    async afterSetExtremes() {
      const from = new Date(this.chart.xAxis[0].getExtremes().min).toISOString()
      const to = new Date(this.chart.xAxis[0].getExtremes().max).toISOString()
      this.chart.showLoading('Loading data...')

      await Promise.all(
        this.locations.map(async (l, index) => {
          const t = this.types[index]
          const response = await axios.get(
            `/measurement/location/${l}/type/${t}/from/${from}/to/${to}/aggregation/${this.aggregationType}`
          )
          this.chart.series[index].setData(response.data, false)
        })
      )

      this.chart.redraw()
      this.chart.hideLoading()
    },
    initHighCharts() {
      this.chart = Highcharts.stockChart('chart', {
        rangeSelector: {
          inputEnabled: false,
          buttons: [
            {
              type: 'hour',
              count: 6,
              text: '6h',
            },
            {
              type: 'hour',
              count: 12,
              text: '12h',
            },
            {
              type: 'day',
              count: 1,
              text: '1d',
            },
            {
              type: 'week',
              count: 1,
              text: '1w',
            },
            {
              type: 'day',
              count: 30,
              text: '1m',
            },
            {
              type: 'month',
              count: 3,
              text: '3m',
            },
            {
              type: 'month',
              count: 6,
              text: '6m',
            },
            {
              type: 'all',
              text: 'All',
            },
          ],
        },
        xAxis: {
          type: 'datetime',
          ordinal: false,
          minRange: 3600000,
          events: {
            afterSetExtremes: this.afterSetExtremes,
          },
        },
        colors: [
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
        chart: {
          animation: false,
        },
        time: {
          useUTC: true,
          timezoneOffset: new Date().getTimezoneOffset(),
        },
        yAxis: this.uniqueTypes.map((t) => {
          return {
            id: t,
            type: 'linear',
            title: {
              text: t,
            },
          }
        }),
        navigator: {
          adaptToUpdatedData: false,
          xAxis: {
            overscroll: 86400000,
          },
        },
        scrollbar: {
          liveRedraw: false,
        },
        plotOptions: {
          series: {
            dataGrouping: {
              enabled: false,
            },
            animation: false,
          },
        },
        tooltip: {
          valueDecimals: 2,
        },
        legend: {
          enabled: true,
        },
        credits: {
          enabled: false,
        },
        series: this.series,
      })
    },
    refresh() {
      this.afterSetExtremes()
    },
  },
  async mounted() {
    await this.initSeries()
    this.initHighCharts()
  },
  updated() {
    if (this.initializing) {
      const start = new Date().setHours(0, 0, 0, 0)
      const end = new Date().setHours(23, 59, 59, 999)
      this.chart.xAxis[0].setExtremes(start, end)
    }
    this.initializing = false
  },
}
</script>

<style scoped>
select {
  display: inline-block;
  max-width: 120px;
  height: 34px;
}
</style>
