<template>
    <v-dialog v-model="dialog" persistent max-width="500px">
    <v-card>
        <v-card-title>
        <span class="headline">New {{coin.name}} wallet {{name}}</span>
        </v-card-title>
        <v-card-text>
        <v-container grid-list-md>
            <v-layout wrap>
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
        <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-3" raised @click.native="dismiss()">Dismiss</v-btn>
        <v-btn color="yellow darken-3" raised @click.native="addWallet()">Save</v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>
</template>

<script>
import { EventBus } from '../event-bus.js'
import { Coins } from '../store/coins.js'
import { Wallet } from '../store/wallet.js'
import Events from '../store/event-api.js'
import Transient from '../store/transient.js'
// import Persistent from '../store/persistent.js'

export default {
  name: 'NewWalletDialog',
  data () {
    return {
      backuped: false,
      dialog: false,
      extra: null,
      coin: { name: '', ticker: '' }, // an object of coin defs.
      coinDefs: Coins.getArray(),
      name: null,
      wallet: null,
      ruleReq: [
        (v) => !!v || 'Field is required'
      ]
    }
  },
  created: function () {
    EventBus.$on(Events.newWalletDialog, this.toggle)
  },
  methods: {
    toggle (extra) {
      this.extra = extra
      this.dialog = !this.dialog
    },
    dismiss (close) {
      this.dialog = false
    },
    addWallet () {
      if (!this.name ||
           this.name.length < 1) {
        return false
      }
      if (this.extra === 'create') {
        this.createWallet()
      } else if (this.extra === 'import') {
        console.log('TODO call import')
        this.dialog = false
      }
    },
    createWallet () {
      this.dialog = false
      if (this.wallet == null) {
        this.wallet = new Wallet(this.coin, this.name).fromScratch()
        this.wallet.backuped = false
      } else {
        this.wallet.backuped = false
        console.log('keeping pre-existing wallet')
      }
      Transient.commit('setNewWallet', null)
      Transient.commit('setNewWallet', this.wallet)
    }
  }
}
</script>