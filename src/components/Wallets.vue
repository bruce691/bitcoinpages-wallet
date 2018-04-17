<template>
    <v-content>
          


    <v-flex xs12 sm10 offset-sm1>
      <v-card style="margin-top: 6px;" class="blue darken-4" >
        <v-card-text>
          <v-layout row wrap>
        <v-flex sm6>
            <h6>{{ btcBalance }} mBTC</h6><br>
            <h6>{{ ltcBalance }} LTC</h6><br>
        </v-flex>
        <v-flex sm6>
            <h1>{{ totalBalance }} {{ user.currency.symbol }}</h1><br>
        </v-flex>    
          </v-layout>
        </v-card-text>
    </v-card>
      <v-card v-if="wallets.length > 0" style="margin-top: 6px;" class="blue darken-3 white--text">    
        <v-card-text>
          <v-layout row wrap>
            <v-flex sm12>
                <v-list  class="blue darken-3 white--text" dense>
                  <template v-for="(item, index) in wallets">
                    <v-list-tile
                      @click.stop="open(index)"
                      avatar
                      ripple
                      :key="item._name">
                      <v-list-tile-content>
                          <h4>{{ item._name }}</h4>
                 
                      </v-list-tile-content>
                      <v-list-tile-action>
                        <v-list-tile-action-text><h6>{{ item._balance }} {{ item._coin.ticker }}</h6></v-list-tile-action-text>
                      </v-list-tile-action>                
                    </v-list-tile>              
                  </template>
                </v-list>
            </v-flex>      
          </v-layout>
      </v-card-text>
      </v-card>
    </v-flex>

    <v-new-wallet-dialog :newUser="newUser"></v-new-wallet-dialog>
    <v-pincode ></v-pincode>
    <v-setpincode :setPinCodeOpen.sync="setPinCodeOpen"></v-setpincode>
    <v-backup :wallet2backup="wallet2backup"></v-backup>
    <v-verify></v-verify>

    <v-bottom-nav class="black-text indigo lighten-1" :value="true">
      <v-btn raised value="import">
        <span>Import</span>
        <v-icon>file_upload</v-icon>
      </v-btn>
      <v-btn @click="newWalletCreate()" raised value="favorites">
        <span>New wallet</span>
        <v-icon light>add</v-icon>
      </v-btn>
    </v-bottom-nav>

  </v-content>

</template>

<script>
import NewWalletDialog from '@/components/NewWalletDialog'
import { EventBus } from '../event-bus.js'
import Pincode from '@/components/Pincode'
import SetPincode from '@/components/SetPincode'
import BackupVue from '@/components/Backup'
import VerifyVue from '@/components/Verify'
import Persistent from '../store/persistent'
import Transient from '../store/transient'
import Events from '../store/event-api'
import {User} from '../store/user'
import Currencies from '../store/currencies'

export default {
  name: 'Wallets',
  data () {
    return {
      user: null,
      newUser: false,
      decoderKey: null,
      setPinCodeOpen: false,
      newPinCode: null,
      wallet2backup: null,
      BTCRate: null,
      LTCRate: null,
      rates: ['       plop']
    }
  },
  components: {
    'v-new-wallet-dialog': NewWalletDialog,
    'v-pincode': Pincode,
    'v-setpincode': SetPincode,
    'v-backup': BackupVue,
    'v-verify': VerifyVue
  },
  computed: {
    wallets () {
      return Persistent.getters.wallets
    },
    newWallet () {
      return Persistent.getters.newWallet
    },
    pinCodeOpen () {
      return Transient.getters.pinCode === null
    },
    btcBalance () {
      return 0
    },
    ltcBalance () {
      return 0
    },
    totalBalance () {
      for (var i = 0; i < this.wallets.length; i++) {
      }
      return 0
    }
  },
  created: function () {
    this.user = Persistent.getters.user
    if (typeof this.user.currency === 'undefined') {
      this.user = new User(null, Currencies[0])
      this.newUser = true
    }
    var me = this
    EventBus.$on(Events.setPinCodeDone, function (newPin) {
      Transient.commit('setPinCode', newPin)
      EventBus.$emit(Events.newWalletDialog, 'create', newPin)
      me.setPinCodeOpen = false
    })
    EventBus.$on(Events.takeBackup, function (wallet) {
      this.wallet2backup = wallet
    })
  },
  methods: {
    newWalletCreate: function () {
      if (Persistent.getters.wallets.length === 0 &&
          Transient.getters.pinCode === null) {
        this.setPinCodeOpen = true
      } else {
        EventBus.$emit(Events.newWalletDialog, 'create')
      }
    },
    newWalletImport: function () {
      EventBus.$emit('new-wallet-dialog', 'import')
    },
    open: function (id) {
      this.$router.push({name: 'Wallet', params: { id: id }})
    }
  }
}
</script>
<style>
ul a {
  text-decoration: none;
}
</style>