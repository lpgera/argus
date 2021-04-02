import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: localStorage.getItem('token'),
  },
  mutations: {
    login(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    logout(state) {
      state.token = null
      localStorage.removeItem('token')
    },
  },
  actions: {
    login({ commit }, token) {
      commit('login', token)
    },
    logout({ commit }) {
      commit('logout')
    },
  },
})
