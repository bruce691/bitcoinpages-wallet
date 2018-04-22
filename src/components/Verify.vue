<template>
      <v-dialog max-width="480" :value="dialogOpen" persistent>
        <v-card>
            <v-alert v-model="alert" transition="scale-transition">
              {{message}}
            </v-alert>
          <v-card-title>

              <h3>Backup verifications</h3>
              <p class="red--text">Please set your secret mnemonic phrase in correct order using buttons</p>
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
          <v-btn color="primary" raised @click.stop="submitWallet()" :disabled="validated == false">Done</v-btn>
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

export default {
  name: 'Verify',
  props: ['wallet2backup'],
  data () {
    return {
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
    dialogOpen: function () {
      return Transient.getters.newWallet !== null &&
              Transient.getters.newWallet.backuped === true &&
              Transient.getters.newWallet.backupVerified === false
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
    },
    verified () {
      return false
    }
  },
  mounted: function () {

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
      this.solution.splice(index, 1)
      this.shuffled.push(item)
      this.alert = false
      if (this.solution.length === 12) {
        this.validated = true
      }
    },
    dismiss () {
      Transient.commit('clearNewWallet')
    },
    toggle () {
      if (this.wallet._mnemonic === this.solution.join(' ')) {
        this.wallet.backuped = true
        this.wallet.backupVerified = true
        this.alert = false
      } else {
        this.alert = true
      }
    },
    storeWallet (decodeKey) {
      let wallet = new Wallet(Transient.getters.newWallet._coin, Transient.getters.newWallet._name)
      wallet._mnemonic = Transient.getters.newWallet._mnemonic
      wallet._xPub = Transient.getters.newWallet._xPub
      wallet._yPub = Transient.getters.newWallet._yPub
      wallet._zPub = Transient.getters.newWallet._zPub
      wallet.decodeKey = decodeKey

      Transient.commit('addWallet', wallet)
      let wallet2 = new Wallet(Transient.getters.newWallet._coin, Transient.getters.newWallet._name)
      wallet2._mnemonic = Transient.getters.newWallet._mnemonic
      wallet2._xPub = Transient.getters.newWallet._xPub
      wallet2._yPub = Transient.getters.newWallet._yPub
      wallet2._zPub = Transient.getters.newWallet._zPub
      wallet2.sanitize()

      Transient.commit('clearNewWallet')
      Persistent.commit('addWallet', wallet2)
      this.dismiss()
    },
    submitWallet () {
      var data = this.wallet.signCreateMessage(Transient.getters.pinCode)
      this.$http.post(this.$baseUrl + '/api/wallet/create', data).then(function (res) {
        if (res.body.error) {
          EventBus.$emit(Events.apiError, res.body.status, res.body.error)
          return
        }
        if (res.body.message &&
            res.body.xPub !== null &&
            res.body.message.decodeKey !== null) {
          try {
            this.storeWallet(res.body.message.decodeKey)
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
