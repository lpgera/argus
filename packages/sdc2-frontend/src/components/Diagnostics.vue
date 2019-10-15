<template>
  <div>
    <h3>Diagnostics</h3>

    <table class="highlight">
      <thead>
        <tr>
          <th>Location</th>
          <th>Type</th>
          <th>Last seen</th>
          <th>Last value</th>
          <th>Last 24h count</th>
        </tr>
      </thead>

      <tbody>
        <tr v-show="diagnostics === null">
          <td colspan="5" class="center-align">
            <preloader></preloader>
          </td>
        </tr>
        <tr v-if="diagnostics !== null && diagnostics.length === 0">
          <td colspan="5" class="center-align">
            No data found
          </td>
        </tr>
        <tr
          v-for="record in diagnostics"
          :key="`${record.location}_${record.type}`"
        >
          <td>
            {{ record.location }}
          </td>
          <td>
            {{ record.type }}
          </td>
          <td>
            <span
              class="tooltipped"
              data-position="left"
              :data-tooltip="toTooltipDate(record.latestCreatedAt)"
              >{{ record.latestFromNow }}</span
            >
          </td>
          <td>
            {{ record.latestvalue }}
          </td>
          <td>
            {{ record.lastDayCount }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios'
import M from 'materialize-css'
import Preloader from './Preloader.vue'

export default {
  name: 'Diagnostics',
  components: {
    Preloader,
  },
  data() {
    return {
      diagnostics: null,
    }
  },
  async mounted() {
    const response = await axios.get('/diagnostics')
    this.diagnostics = response.data
  },
  updated() {
    document.querySelectorAll('.tooltipped').forEach(element => {
      M.Tooltip.init(element, { enterDelay: 400 })
    })
  },
  methods: {
    toTooltipDate(isoDateString) {
      const date = new Date(isoDateString)
      return `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`
    },
  },
}
</script>

<style scoped>
.highlight {
  margin-bottom: 20px;
}
</style>
