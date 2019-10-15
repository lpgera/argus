<template>
  <div class="row">
    <div class="col s12 m10 push-m1 l8 push-l2">
      <h3>Dashboard</h3>

      <p class="stale-checkbox">
        <label>
          <input
            type="checkbox"
            v-model="showStale"
            @change="deselectStale()"
          />
          <span>Show stale data</span>
        </label>
      </p>

      <preloader v-if="!items" class="center-align"></preloader>

      <table v-if="items" class="striped highlight centered">
        <thead>
          <tr>
            <th></th>
            <th v-for="type in visibleTypes" :key="type" class="sideways">
              <a href="#" @click.prevent.stop="toggleType(type)">{{ type }}</a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="location in visibleLocations" :key="location">
            <td>
              <a href="#" @click.prevent.stop="toggleLocation(location)">{{
                location
              }}</a>
            </td>
            <td v-for="type in visibleTypes" :key="`${location}_${type}`">
              <label
                v-if="isValidItem({ location, type })"
                class="dense-checkbox"
              >
                <input
                  type="checkbox"
                  :value="{ location, type }"
                  v-model="selectedItems"
                />
                <span></span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>

      <p class="right-align">
        <button
          class="btn waves-effect waves-light"
          @click="showMeasurements"
          :disabled="selectedItems.length === 0"
        >
          <i class="material-icons right">show_chart</i> Show selected
          measurements
        </button>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'
import router from '../router/index'
import Preloader from './Preloader.vue'

export default {
  name: 'Dashboard',
  components: {
    Preloader,
  },
  async mounted() {
    const response = await axios.get('/location')
    this.items = response.data
  },
  data() {
    return {
      selectedItems: [],
      showStale: false,
      items: null,
    }
  },
  computed: {
    visibleItems() {
      if (!this.items) {
        return null
      }
      if (this.showStale) {
        return this.items
      }
      return this.items.filter(({ isStale }) => !isStale)
    },
    visibleLocations() {
      const locations = this.visibleItems.map(({ location }) => location)
      return _.uniq(locations)
    },
    visibleTypes() {
      const types = this.visibleItems.map(({ type }) => type)
      return _.uniq(types)
    },
  },
  methods: {
    showMeasurements() {
      const query = {
        location: this.selectedItems.map(({ location }) => location),
        type: this.selectedItems.map(({ type }) => type),
      }
      router.push({ name: 'MeasurementChart', query })
    },
    isValidItem({ location, type }) {
      return this.items.some(
        ({ location: l, type: t }) => location === l && type === t
      )
    },
    everyItemSelected(filterFunction) {
      const count = this.visibleItems.filter(filterFunction).length
      const selectedCount = this.selectedItems.filter(filterFunction).length
      return count === selectedCount
    },
    deselectAll(filterFunction) {
      const indicesToRemove = this.selectedItems
        .map((item, index) => {
          if (filterFunction(item)) {
            return index
          }
          return null
        })
        .filter(i => i !== null)
      indicesToRemove.reverse().forEach(index => {
        this.selectedItems.splice(index, 1)
      })
    },
    selectAll(filterFunction) {
      const itemsToSelect = this.visibleItems
        .filter(filterFunction)
        .filter(({ location, type }) => {
          return !this.selectedItems.some(
            ({ location: l, type: t }) => location === l && type === t
          )
        })
      itemsToSelect.forEach(({ location, type }) => {
        this.selectedItems.push({ location, type })
      })
    },
    deselectStale() {
      this.deselectAll(({ isStale }) => isStale)
    },
    toggle(filterFunction) {
      const everyItemSelected = this.everyItemSelected(filterFunction)
      if (everyItemSelected) {
        this.deselectAll(filterFunction)
      } else {
        this.selectAll(filterFunction)
      }
    },
    toggleLocation(l) {
      this.toggle(({ location }) => location === l)
    },
    toggleType(t) {
      this.toggle(({ type }) => type === t)
    },
  },
}
</script>

<style scoped>
p.stale-checkbox {
  text-align: right;
  margin: 0;
}

th.sideways a {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-weight: normal;
}

label.dense-checkbox span {
  padding-left: 18px;
}
</style>
