<template>
      <v-dialog max-width="480" :value="true" persistent>
        <v-card>
            <v-alert v-model="alert" transition="scale-transition">
              {{message}}
            </v-alert>
          <v-card-title>

              <h3>Backup verifications</h3>
              <p class="red--text" v-if="!validated">
                Please set your secret mnemonic phrase in correct order using buttons</p>
          </v-card-title>
          <v-card-text>
            <v-layout wrap>
              <v-flex xs12>
                <template v-for="(item, index) in solution">
                    <v-btn @click.stop="removeFromSolution(item, index)">{{ item }}</v-btn>
                </template>
              </v-flex>
              <v-flex xs12>
                <hr>
              </v-flex>
              <v-flex xs12>
                <template v-for="(item, index) in shuffled">
                    <v-btn @click.stop="add2solution(item, index)" color="secondary" raised>{{ item }}</v-btn>
                </template>
              </v-flex>
            </v-layout>

          </v-card-text>
        <v-card-actions>
          <v-btn @click.stop="dismiss()">Dismiss</v-btn>
          <v-btn color="primary" raised @click.stop="submitWallet()" :disabled="validated === false">Done</v-btn>
          </v-card-actions>
        </v-card>
   </v-dialog>
</template>

<script>
import Transient from '../store/transient.js'
import Persistent from '../store/persistent.js'
import {EventBus} from '../event-bus.js'
import Events from '../store/event-api.js'
import {Wallet} from '../store/wallet'
import router from '../router'

export default {
  name: 'Verify',
  props: ['wallet2backup'],
  data () {
    return {
      visible: true,
      solution: [],
      message: 'invalid solution',
      alert: false,
      validated: false
    }
  },
  computed: {
    wallet () {
      return Transient.getters.newWallet
    },
    mnemonic () {
      if (this.wallet !== null) {
        return this.wallet._mnemonic
      } else {
        return null
      }
    },
    shuffled () {
      if (this.mnemonic) {
        var a = this.mnemonic.split(' ')
        var j, x, i
        for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1))
          x = a[i]
          a[i] = a[j]
          a[j] = x
        }
        return a
      }
    }
  },
  methods: {
    add2solution (item, index) {
      this.alert = false
      this.solution.push(item)
      this.shuffled.splice(index, 1)
      if (this.solution.length === 12) {
        this.validated = true
      }
    },
    removeFromSolution (item, index) {
      this.validated = false
      this.solution.splice(index, 1)
      this.shuffled.push(item)
      this.alert = false
      if (this.solution.length === 12) {
        this.validated = true
      }
    },
    dismiss () {
      router.push('Wallets')
    },
    storeWallet (decodeKey) {
      let wallet = new Wallet(Transient.getters.newWallet._coin, Transient.getters.newWallet._name)
      wallet._walletId = Transient.getters.newWallet._walletId
      wallet._mnemonic = Transient.getters.newWallet._mnemonic
      wallet._sPub = Transient.getters.newWallet._sPub
      wallet._xPub = Transient.getters.newWallet._xPub
      wallet._yPub = Transient.getters.newWallet._yPub
      wallet._zPub = Transient.getters.newWallet._zPub
      wallet.decodeKey = decodeKey

      Transient.commit('addWallet', wallet)
      let wallet2 = new Wallet(Transient.getters.newWallet._coin, Transient.getters.newWallet._name)
      wallet2._mnemonic = Transient.getters.newWallet._mnemonic
      wallet2._walletId = Transient.getters.newWallet._walletId
      wallet2._sPub = Transient.getters.newWallet._sPub
      wallet2._xPub = Transient.getters.newWallet._xPub
      wallet2._yPub = Transient.getters.newWallet._yPub
      wallet2._zPub = Transient.getters.newWallet._zPub
      wallet2.sanitize()

      Persistent.commit('addWallet', wallet2)
      Transient.commit('clearNewWallet')
      this.dismiss()
    },
    submitWallet () {
      if (!this.validated) return
      var data = this.wallet.signCreateMessage(Transient.getters.pinCode, false)
      this.$http.post(this.$baseUrl + '/api/wallet/create', data).then(function (res) {
        if (res.body.error) {
          EventBus.$emit(Events.apiError, res.body.status, res.body.error)
          return
        }
        if (res.body.message &&
            res.body.walletId !== null &&
            res.body.message.decodeKey !== null) {
          try {
            this.storeWallet(res.body.message.decodeKey)
            router.push('Wallets')
          } catch (e) {
            console.log(e)
            EventBus.$emit(Events.apiError, '', e)
          }
        } else {
          console.log('unable to get open key')
          EventBus.$emit(Events.apiError, '200', '{ message: "unable to get open key"}')
        }
        EventBus.$emit(Events.loadingEnd)
      }, response => {
        if (response.status !== null) {
          EventBus.$emit(Events.apiError, 'unable to connect', 'please check your network connection')
        } else {
          EventBus.$emit(Events.apiError, response.status, response.bodyText)
        }
        EventBus.$emit(Events.loadingEnd)
      })
    }
  }
}
</script>
<style>

</style>
