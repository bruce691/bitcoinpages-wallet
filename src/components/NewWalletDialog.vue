<template>
    <v-dialog v-model="visible" persistent max-width="500px">
    <v-card>
        <v-card-title>
        <span class="headline">New {{coin.name}} wallet {{name}}</span>
        </v-card-title>
        <v-card-text>
        <v-container grid-list-md>
          <v-layout v-if="loading" wrap>
            <v-flex xs12  class="text-xs-center">
              <v-computing></v-computing>
            </v-flex>
          </v-layout>

            <v-layout v-if="!loading" wrap>
            <v-flex xs12>
                <v-text-field :rules="ruleReq" v-model="name" label="Name" required></v-text-field>
            </v-flex>
            <v-flex xs12 sm6>
              <v-select
                :rules="ruleReq"
                v-bind:items="coinDefs"
                v-model="coin"
                label="Select coin"
                single-line
                item-text="name"
                item-value="ticker"
                return-object
                :hint="`${coin.ticker}, ${coin.name}`"
                persistent-hint
              ></v-select>
            </v-flex>
            </v-layout>
        </v-container>
        <small v-if="!loading">*indicates required field</small>
        </v-card-text>
        <v-card-actions v-if="!loading">
        <v-spacer></v-spacer>
        <v-btn color="blue darken-3" raised @click.native="dismiss()">Dismiss</v-btn>
        <v-btn color="yellow darken-3" raised @click.native="createWallet()">Save</v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>
</template>

<script>
import { Coins } from '../store/coins.js'
import { Wallet } from '../store/wallet.js'
import Transient from '../store/transient.js'
import Computing from '@/components/Computing'
import router from '../router'

export default {
  name: 'NewWalletDialog',
  props: ['step'],
  components: {
    'v-computing': Computing
  },
  data () {
    return {
      visible: true,
      loading: false,
      coin: { name: '', ticker: '' }, // an object of coin defs.
      coinDefs: Coins.getArray(),
      name: null,
      ruleReq: [
        (v) => !!v || 'Field is required'
      ]
    }
  },
  mounted: function () {
    if (Transient.getters.newWallet) {
      this.name = Transient.getters.newWallet.name
      this.coin = Transient.getters.newWallet.coin
    }
  },
  methods: {
    wallet () {
      return Transient.getters.newWallet
    },
    dismiss () {
      router.push('Wallets')
    },
    walletCreated () {
      this.loading = false
      this.$emit('set-step', 2)
    },
    makeWallet () {
      var me = this
      return new Promise(() => {
        let wallet = new Wallet(me.coin, me.name).fromScratch()
        Transient.commit('setNewWallet', wallet)
      })
    },
    createWallet () {
      if (this.coin.name === '' || this.name === null || this.name.trim().length < 1) {
        return
      }
      this.loading = true
      if (!Transient.getters.newWallet) {
        var me = this
        setTimeout(function () {
          me.makeWallet().then(me.walletCreated())
        }, 500)
      } else {
        this.walletCreated()
      }
    }
  }
}
</script>
