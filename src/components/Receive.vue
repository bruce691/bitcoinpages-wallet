<template>
    <v-content>
          


    <v-flex xs12 sm10 offset-sm1>
            <v-card style="margin-top: 6px;" class="blue darken-4 white--text" height="300px">
              <v-container fluid grid-list-lg>
                <v-layout row>
                  <v-flex xs7>
                    <div>
                      <div class="headline"> 
                         <router-link :to="{ name: 'Wallet', params: { id: id }}">
                           {{ wallet._name }}</router-link>
                           <span class="body-1">({{ wallet._coin.ticker }})</span><br> 
                           free address 
                        </div>
                      <div>
                        <span class="body-1">{{ freshAddress._path.join('/') }}</span>
                        <v-text-field :error="error"  v-model="freshAddress._name" label="Name" required></v-text-field>
                      </div><br>            
                      <div>{{ freshAddress._address }}</div>
                    </div>
                  </v-flex>
                  <v-flex xs5 >
                    <v-card-media id="qrcode"  
                      src="blanck.gif"
                      height="200px"
                      contain>
                    </v-card-media>
                  </v-flex>
                </v-layout>
              </v-container>
                <v-card-actions>
              <v-btn large color="yellow darken-3" class="white--text "  @click.stop="requestNewAddress()">
                  New address
              </v-btn>
                  <v-btn large class="info" @click.stop="close()">Done</v-btn>
                </v-card-actions>
            </v-card>
              </v-flex>

            <v-flex xs12 sm10 offset-sm1>
              <v-list style="margin-top: 6px;" class="blue darken-2 white--text" twoLine>
                <template v-for="(item, index) in addresses">
                  <v-list-tile 
                    class="blue darken-2 white--text"
                    @click.stop="open(index)"
                    :key="item._address"
                    ripple>
                    <v-list-tile-content>
           <v-list-tile-title><h6>{{ item._name }}</h6></v-list-tile-title>
              <v-list-tile-sub-title>{{ item._address }} </v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                      <v-icon color="yellow darken-3" style="margin-right: 4px;">edit</v-icon>
                    </v-list-tile-action>                
                  </v-list-tile>
                </template>
              </v-list>
            </v-flex>
            
    </v-content>
</template>

<script>
import Persistent from '../store/persistent'
import {Wallet} from '../store/wallet'
import {Address} from '../store/address'
import qrcode from '../../node_modules/qrcode-generator/qrcode.js'
import Vue from 'vue'

const ADDR_RECEIVE = 0

export default {
  name: 'Receive',
  props: ['id'],
  data () {
    return {
      error: false,
      freshAddress: null,
      wallet: null,
      addresses: []
    }
  },
  computed: {
    walletData () {
      return Persistent.getters.wallets[this.id]
    }
  },
  created: function () {
    this.wallet = new Wallet(this.walletData._coin, this.walletData._name)
    this.wallet = this.wallet.fromStorage(this.walletData)
    this.addresses = Persistent.getters.receiveAddrForWallet(this.walletData._xPub49)
    if (this.addresses.length === 0) {
      console.log('address length is 0, requesting new')
      this.getFreshAddress()
    } else {
      console.log('some fresh address exists')
      this.freshAddress = this.addresses[0]
      console.log(this.freshAddress)
    }
    var me = this
    Vue.nextTick(function () {
      me.makeQrCode()
    })
  },
  methods: {
    close () {
      Persistent.commit('updateAddress', this.freshAddress)
      this.$router.push({name: 'Wallet', params: { id: this.id }})
    },
    open (index) {
      this.freshAddress = this.addresses[index]
      var me = this
      Vue.nextTick(function () {
        me.makeQrCode()
      })
    },
    makeQrCode () {
      var typeNumber = 4
      var errorCorrectionLevel = 'L'
      var qr = qrcode(typeNumber, errorCorrectionLevel)
      qr.addData('bitcoin:' + this.freshAddress._address)
      qr.make()
      var tag = qr.createImgTag(10, 5)
      var startFromSrc = tag.slice(tag.search('src'))
      var source = startFromSrc.slice(5, startFromSrc.search(' ') - 1)
      var st = 'background: url(' + source + ') center center / contain no-repeat;'
      document.getElementsByClassName('card__media__background')[0].setAttribute('style', st)
      return tag
    },
    requestNewAddress () {
      for (var i = 0; i < this.addresses.length; i++) {
        var addr = this.addresses[i]
        if (addr._name === null ||
            addr._name.trim() === '') {
          this.error = true
          this.freshAddress = addr
          var me = this
          Vue.nextTick(function () {
            me.makeQrCode()
          })
          return
        }
      }
      Persistent.commit('updateAddress', this.freshAddress)
      this.getFreshAddress()
    },
    getFreshAddress () {
      this.addresses = Persistent.getters.receiveAddrForWallet(this.walletData._xPub49)
      console.log('rec add', this.addresses)
      for (var i = 0; i < this.addresses.length; i++) {
        if (this.addresses[i]._name === null &&
            this.addresses[i]._change === false) {
          this.freshAddress = this.addresses[i]
          return
        }
      }
      const xPub = this.walletData._xPub49
      const nextIdx = this.addresses.length
      const path = this.wallet.getBIP49Path(ADDR_RECEIVE, nextIdx)
      const child = this.wallet.getAddress(path)
      const addr = child.getAddress().toString()
      this.freshAddress = new Address(xPub, path, addr, null)
      this.addresses.unshift(this.freshAddress)
      Persistent.commit('addAddress', this.freshAddress)
      var me = this
      Vue.nextTick(function () {
        me.makeQrCode()
      })
    }
  }
}
</script>
