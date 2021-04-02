import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from '@/components/Dashboard'
import MeasurementChart from '@/components/MeasurementChart'
import ApiKeys from '@/components/ApiKeys'
import Diagnostics from '@/components/Diagnostics'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
    },
    {
      path: '/measurements',
      name: 'MeasurementChart',
      component: MeasurementChart,
    },
    {
      path: '/api-keys',
      name: 'ApiKeys',
      component: ApiKeys,
    },
    {
      path: '/diagnostics',
      name: 'Diagnostics',
      component: Diagnostics,
    },
  ],
})
