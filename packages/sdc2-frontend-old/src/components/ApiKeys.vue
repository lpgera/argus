<template>
  <div>
    <h3>Api keys</h3>

    <table class="highlight">
      <thead>
        <tr>
          <th>Token</th>
          <th>Read access</th>
          <th>Write access</th>
          <th>Comment</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr v-show="apiKeys === null">
          <td colspan="4" class="center-align loading">
            <div class="preloader-wrapper active">
              <div class="spinner-layer spinner-red-only">
                <div class="circle-clipper left">
                  <div class="circle"></div>
                </div>
                <div class="gap-patch">
                  <div class="circle"></div>
                </div>
                <div class="circle-clipper right">
                  <div class="circle"></div>
                </div>
              </div>
            </div>
          </td>
        </tr>
        <tr v-if="apiKeys !== null && apiKeys.length === 0">
          <td colspan="4" class="center-align">No api keys found</td>
        </tr>
        <tr v-for="apiKey in apiKeys" :key="apiKey.id">
          <td>
            {{ apiKey.token }}
          </td>
          <td>
            <label>
              <input
                type="checkbox"
                v-model="apiKey.canRead"
                @change="updateReadAccess(apiKey)"
              />
              <span></span>
            </label>
          </td>
          <td>
            <label>
              <input
                type="checkbox"
                v-model="apiKey.canWrite"
                @change="updateWriteAccess(apiKey)"
              />
              <span></span>
            </label>
          </td>
          <td>
            <div class="input-field inline">
              <input
                type="text"
                maxlength="255"
                v-model="apiKey.comment"
                @input="updateComment(apiKey)"
              />
            </div>
          </td>
          <td>
            <a
              class="waves-effect waves-light btn-floating red darken-2 modal-trigger"
              href="#remove-confirm-modal"
              @click="apiKeyToDelete = apiKey"
            >
              <i class="material-icons">delete</i>
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <div id="remove-confirm-modal" class="modal">
      <div class="modal-content">
        <h4>Are you sure?</h4>
        <p>
          The API key with this token will be removed:
          {{ apiKeyToDelete.token }}
        </p>
      </div>
      <div class="modal-footer">
        <button class="modal-close btn btn-flat waves-effect waves-red">
          Cancel
        </button>
        <button
          class="modal-close btn btn-flat waves-effect waves-green"
          @click.prevent="remove(apiKeyToDelete.id)"
        >
          Ok
        </button>
      </div>
    </div>

    <p class="right-align">
      <button class="btn" @click="create">
        <i class="material-icons right">add</i> Create new api key
      </button>
    </p>
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import M from 'materialize-css'
import _ from 'lodash'

export default {
  name: 'ApiKeys',
  data() {
    return {
      apiKeys: null,
      apiKeyToDelete: {
        token: null,
      },
    }
  },
  async mounted() {
    const modalElement = document.querySelector('.modal')
    M.Modal.init(modalElement, {})
    const response = await axios.get('/api-key')
    this.apiKeys = response.data
    await Vue.nextTick()
    M.updateTextFields()
  },
  methods: {
    async create() {
      const response = await axios.post('/api-key')
      this.apiKeys = response.data
      M.toast({ html: 'Api key created' })
    },
    async updateReadAccess(apiKey) {
      const response = await axios.patch(`/api-key/${apiKey.id}`, {
        canRead: apiKey.canRead,
      })
      this.apiKeys = response.data
      M.toast({ html: 'Api key read access updated' })
    },
    async updateWriteAccess(apiKey) {
      const response = await axios.patch(`/api-key/${apiKey.id}`, {
        canWrite: apiKey.canWrite,
      })
      this.apiKeys = response.data
      M.toast({ html: 'Api key write access updated' })
    },
    updateComment: _.debounce(async (apiKey) => {
      const response = await axios.patch(`/api-key/${apiKey.id}`, {
        comment: apiKey.comment,
      })
      this.apiKeys = response.data
      M.toast({ html: 'Api key comment updated' })
    }, 500),
    async remove(id) {
      const response = await axios.delete(`/api-key/${id}`)
      this.apiKeys = response.data
      M.toast({ html: 'Api key removed' })
    },
  },
}
</script>

<style scoped>
div.input-field.inline {
  margin: 0;
}
</style>
