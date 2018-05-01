<template>
  <v-app dark>
      <v-drawer></v-drawer>
      <v-toolbar></v-toolbar>
      <v-progress-linear v-if="loading" v-bind:indeterminate="true"></v-progress-linear>
      <v-alert dismissible v-model="alert" transition="scale-transition">
        {{message}}
      </v-alert>
      <v-alert dismissible v-model="notConnected" transition="scale-transition">
        Network connection error
      </v-alert>
      <router-view/>
      <v-pincode v-if="wallets.length>0 && pinCode == null"></v-pincode>
  </v-app>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import { EventBus } from './event-bus.js'
import Events from './store/event-api.js'
import Persistent from './store/persistent'
import Transient from './store/transient'
import VueNativeSock from 'vue-native-websocket'
import Pincode from '@/components/Pincode'
import Drawer from '@/components/Drawer'
import Toolbar from '@/components/Toolbar'

Vue.prototype.$http = axios
var WSURL = 'wss://' + window.location.host + '/wss'

if (process.env.NODE_ENV === 'development') {
  Vue.prototype.$baseUrl = 'http://192.168.1.49:4567'
  WSURL = 'ws://192.168.1.49:4567/wss'
} else {
  Vue.prototype.$baseUrl = ''
}

Vue.use(VueNativeSock, WSURL, {
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 3000,
  store: Transient,
  format: 'json'
})

export default {
  name: 'app',
  data () {
    return {
      loading: false,
      alert: false,
      message: '',
      user: Persistent.getters.user,
      showPincode: false
      // showPincode: (Transient.getters.pinCode === null && Persistent.getters.wallets.length > 0)
    }
  },
  computed: {
    notConnected () {
      return Transient.getters.isConnected === false
    },
    wallets () {
      return Persistent.getters.wallets
    },
    pinCode () {
      return Transient.getters.pinCode
    }
  },
  components: {
    'v-toolbar': Toolbar,
    'v-drawer': Drawer,
    'v-pincode': Pincode
  },
  beforeDestroy: function () {
    console.log('destroying ...')
  },
  created: function () {
    var me = this
    EventBus.$on(Events.apiError, function (status, message) {
      me.alert = true
      try {
        message = JSON.parse(message).message
        console.err(message)
      } catch (e) {}
      me.message = status + ' ' + message
    })
    EventBus.$on(Events.loadingStart, function () {
      me.loading = true
    })
    EventBus.$on(Events.loadingEnd, function () {
      me.loading = false
    })

    this.$options.sockets.onmessage = (message) => {
      try {
        var response = JSON.parse(message.data)
        if (response.error) {
          this.message = response.error.code + ' ' + response.error.message
          this.alert = true
        } else {
          this.alert = false
        }
      } catch (e) {
        this.message = 'invalid response from server ' + message.data
        this.alert = true
      }
    }
    this.$options.sockets.onopen = (data) => {
      this.$socket.sendObj({jsonrpc: '2.0', id: 1, method: 'wallet.rates'})
    }
  }
}
</script>
<style src='../node_modules/vuetify/dist/vuetify.min.css'>
    /* global styles */
</style>
<style>
.progress-linear {
  margin-top: 1px;
}
.alert {
  margin-top: 1px;
}
.alert {
  width: 100%;
}

.primary--text {
    color: #red!important;
}
</style>

<style type="css">

  $theme := {
    primary: #009688;
    accent: #FFC107;
    secondary: #00796B;
    info: #B2DFDB;
  }

</style>
