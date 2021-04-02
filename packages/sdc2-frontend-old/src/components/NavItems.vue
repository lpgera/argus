<template>
  <ul>
    <li v-if="isSidenav"><a class="subheader">Menu</a></li>
    <li>
      <router-link :to="{ name: 'Dashboard' }" class="sidenav-close"
        ><i class="material-icons left">dashboard</i>Dashboard</router-link
      >
    </li>
    <li>
      <router-link :to="{ name: 'ApiKeys' }" class="sidenav-close"
        ><i class="material-icons left">vpn_key</i>Api keys</router-link
      >
    </li>
    <li>
      <router-link :to="{ name: 'Diagnostics' }" class="sidenav-close"
        ><i class="material-icons left">local_hospital</i
        >Diagnostics</router-link
      >
    </li>
    <li>
      <a href="#/" @click="logout" class="sidenav-close"
        ><i class="material-icons left">lock_outline</i>Logout</a
      >
    </li>
  </ul>
</template>

<script>
import M from 'materialize-css'
import { mapActions } from 'vuex'

export default {
  name: 'NavItems',
  props: {
    isSidenav: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    ...mapActions(['logout']),
  },
  mounted() {
    if (this.isSidenav) {
      const elem = document.querySelector('.sidenav')
      M.Sidenav.init(elem)
    }
  },
}
</script>
