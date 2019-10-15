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
            <img src="./assets/logo.png" />
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
    <footer class="page-footer">
      <div class="footer-copyright">
        <div class="container center-align">
          © {{ year }} All rights reserved
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios'
import M from 'materialize-css'
import { mapState } from 'vuex'
import NavItems from './components/NavItems'
import Login from './components/Login'
import store from './store'

axios.interceptors.request.use(config => {
  const backendUrl =
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000/' : ''
  const token = localStorage.getItem('token')
  return {
    ...config,
    baseURL: `${backendUrl}ajax`,
    headers: { 'x-authorization-token': token },
  }
})

axios.interceptors.response.use(
  response => {
    return response
  },
  async err => {
    if (err.response.status === 401) {
      M.toast({ html: 'Your session has expired, please login again! 🔑' })
      await store.dispatch('logout')
    } else if (err.response.status !== 403) {
      M.toast({ html: 'Uh-oh... it looks like you are offline. 📶❌' })
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
      isLoggedIn: state => !!state.token,
    }),
    year() {
      return new Date().getFullYear()
    },
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
}

div#app {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

main {
  flex: 1 0 auto;
}

footer.page-footer {
  padding-top: 0;
}
</style>
