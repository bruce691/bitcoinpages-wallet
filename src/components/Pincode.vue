<template>
      <v-dialog v-model="showPincode" persistent fullscreen>
        <v-card>
      <v-progress-linear v-if="loading" v-bind:indeterminate="true"></v-progress-linear>
      <v-alert dismissible v-model="alert" transition="scale-transition">
        {{message}}
      </v-alert>
          <v-card-title>
              Please enter your pincode to unlock the software
          </v-card-title>
          <v-card-text>

            <v-layout wrap>
              <v-flex xs12>
                  <v-text-field type="password" :rules="ruleReq" v-model="pinCode" label="Pincode" required></v-text-field>
              </v-flex>
            </v-layout>

          </v-card-text>
        <v-card-actions>
          <v-btn color="primary" raised @click.stop="toggle()">enter</v-btn>
          </v-card-actions>
        </v-card>
   </v-dialog>
</template>

<script>
import Vue from 'vue'
import Transient from '../store/transient.js'
import Persistent from '../store/persistent.js'

export default {
  name: 'Pincode',
  data () {
    return {
      loading: false,
      alert: false,
      message: null,
      pinCode: null,
      showPincode: true,
      ruleReq: [
        (v) => !!v || 'Pincode is required'
      ]
    }
  },
  methods: {
    openWallets () {
      var wallets = Persistent.getters.wallets
      for (var i = 0; i < wallets.length; i++) {
        this.openWallet(wallets[i])
      }
    },
    openWallet (wallet) {
      console.log(wallet)
      this.loading = true
      var data = {
        message: {
          xPub: wallet._xPub,
          pinCode: this.pinCode
        }
      }
      this.$http.post(Vue.prototype.$baseUrl + '/api/wallet/open', data).then(function (res) {
        if (res.body.message &&
            res.body.xPub !== null &&
            res.body.message.decodeKey !== null) {
          // Transient.commit('addWallet', res.body.message)
          Transient.commit('setPinCode', this.pinCode)
        } else {
          this.message = 'unable to open wallet server says ' + res.body
          this.alert = true
        }
        this.loading = false
      }, response => {
        this.loading = false
        // this.pinCodeOpen = true
        if (response.body.status === 404) {
          Persistent.commit('suicide', data.message.xPub)
        }
        this.alert = true
        let serverSays = JSON.parse(response.bodyText).error
        this.message = response.status + ' unable to open wallet server says: "' + serverSays + '"'
      })
    },
    toggle () {
      this.openWallets()
    }
  }
}
</script>
<style>
  .progress-linear {
  margin-bottom: 1px;
}
</style>
