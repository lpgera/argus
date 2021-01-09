<template>
  <div id="app">
    <header>
      <nav>
        <div class="nav-wrapper">
          <a
            v-if="isLoggedIn"
            href="#"
            data-target="mobile-demo"
            class="sidenav-trigger"
            ><i class="material-icons">menu</i></a
          >
          <router-link :to="{ name: 'Dashboard' }" class="brand-logo">
            <img src="./assets/logo.png" alt="Sensor Data Collection logo" />
            <span class="hide-on-med-and-down">Sensor Data Collection</span>
            <span class="hide-on-large-only">SDC</span>
          </router-link>
          <nav-items
            v-if="isLoggedIn"
            id="nav-mobile"
            class="right hide-on-med-and-down"
          />
        </div>
      </nav>
      <nav-items
        v-if="isLoggedIn"
        class="sidenav"
        id="mobile-demo"
        :is-sidenav="true"
      />
    </header>
    <main class="container">
      <login v-if="!isLoggedIn" />
      <router-view v-if="isLoggedIn" />
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import M from 'materialize-css'
import { mapState } from 'vuex'
import NavItems from './components/NavItems'
import Login from './components/Login'
import store from './store'

axios.interceptors.request.use((config) => {
  const backendUrl =
    process.env.NODE_ENV === 'development' ? 'http://localhost:4000/' : ''
  const token = localStorage.getItem('token')
  return {
    ...config,
    baseURL: `${backendUrl}ajax`,
    headers: { 'x-authorization-token': token },
  }
})

axios.interceptors.response.use(
  (response) => {
    return response
  },
  async (err) => {
    if (err.message === 'Network Error') {
      M.toast({ html: 'Uh-oh... it looks like you are offline. 📶❌' })
    } else if (err.response.status === 401) {
      M.toast({ html: 'Your session has expired, please login again! 🔑' })
      await store.dispatch('logout')
    }
    return Promise.reject(err)
  }
)

export default {
  name: 'App',
  components: {
    NavItems,
    Login,
  },
  mounted() {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('./service-worker.js')
    }
  },
  computed: {
    ...mapState({
      isLoggedIn: (state) => !!state.token,
    }),
  },
}
</script>

<style>
.brand-logo {
  margin-left: 15px;
}

.brand-logo img {
  vertical-align: text-bottom;
  filter: brightness(10);
  width: 36px;
  height: 36px;
  margin-right: 8px;
}

div#app {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

main {
  flex: 1 0 auto;
}
</style>
