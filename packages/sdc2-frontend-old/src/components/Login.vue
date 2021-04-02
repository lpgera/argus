<template>
  <div class="row">
    <form class="col s12 m8 offset-m2 l6 offset-l3">
      <h3>Login</h3>
      <div class="row">
        <div class="input-field col s12">
          <input id="username" type="text" v-model="username" />
          <label for="username">Username</label>
        </div>
        <div class="input-field col s12">
          <input id="password" type="password" v-model="password" />
          <label for="password">Password</label>
        </div>
      </div>
      <p class="right-align">
        <button class="btn waves-effect waves-light" @click.prevent="login">
          <i class="material-icons right">lock_open</i> Login
        </button>
      </p>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import M from 'materialize-css'
import { mapActions } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
    }
  },
  methods: {
    ...mapActions({
      loginWithToken: 'login',
    }),
    async login() {
      try {
        const {
          data: { token },
        } = await axios.post('/login', {
          username: this.username,
          password: this.password,
        })
        this.loginWithToken(token)
      } catch (err) {
        M.toast({ html: 'Invalid credentials. 🔒' })
      }
    },
  },
}
</script>
