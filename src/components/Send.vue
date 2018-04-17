<template>
    <v-content>
    <v-flex xs12>
        <v-card class="blue darken-4 white--text">
          <v-container  grid-list-xl>
            <v-layout row wrap justify-center align-center >

              <v-flex xs7>
                  <div class="headline"> 
                      <router-link :to="{ name: 'Wallet', params: { id: id }}">
                        {{ wallet._name }}</router-link>
                        <span class="body-1">({{ wallet._coin.ticker }})</span><br> 
                        send {{wallet._coin.name}}
                    </div>
              </v-flex>
              <v-flex xs5>
                <center>
                <video style="margin-left: -20px; position: relative; 
                margin-top: -20px; object-fit: fill;" @click.stop="toggleScan()" id="preview" 
                width="135px"
                height="90px"></video>
                </center>
              </v-flex>

              <v-flex xs7>  
                <v-text-field append-icon="build" :error="errorAmount"  v-model="amount" label="Amount" required></v-text-field>                  
              </v-flex>
              <v-flex xs5>{{ quoteAmount }} {{ user.currency.symbol }}</v-flex>
              <v-flex xs12>  
              <v-text-field :append-icon-cb="() => toggleScan()" 
                              v-on:input="onInput()" append-icon="camera_enhance" 
                              :error="errorAddress"  v-model="sendTo" label="Address" required>
                </v-text-field>
              </v-flex>
              <v-flex xs7>  
              <v-text-field type="number" v-model="feeRate" label="Fee Rate" required></v-text-field>                                  
              </v-flex>
              <v-flex xs5>
                satoshy / bytes
              </v-flex>              
              <v-flex xs12>
                    <v-text-field  v-model="note" label="Note"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
          <v-card-actions>
            <v-btn large @click.stop="cancel()">Cancel</v-btn>
            <v-btn large color="green darken-3" @click.stop="verify()">Verify</v-btn>
            <v-btn large color="yellow darken-3" :disabled="hexTransaction === null" @click.stop="sign()">Broadcast</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>            
    </v-content>
</template>

<script>
import Persistent from '../store/persistent'
import Transient from '../store/transient'
import {Wallet} from '../store/wallet'
import Instascan from 'instascan'
import { Address, TransactionBuilder, ECPair } from 'bitcoinjs-lib'
import { EventBus } from '../event-bus.js'
import Events from '../store/event-api.js'

const ADDR_CHANGE = 1
const ADDR_RECEIVE = 0

export default {
  name: 'Send',
  props: ['id'],
  data () {
    return {
      user: null,
      errorAmount: false,
      errorAddress: false,
      alert: false,
      alertMsg: null,
      wallet: null,
      sendTo: null,
      amount: 0,
      note: null,
      feeRate: 50,
      fee: null,
      maxFee: 100,
      scanning: false,
      scanner: null,
      hexTransaction: null,
      signed: false,
      changeAddres: null
    }
  },
  computed: {
    walletData () {
      return Persistent.getters.wallets[this.id]
    },
    quoteFee () {

    },
    quoteAmount () {
      var rate = 1
      switch (this.wallet._coin.ticker) {
        case 'BTC':
          rate = Transient.getters.btcRate
          break
        case 'LTC':
          rate = Transient.getters.ltcRate
          break
      }
      if (rate !== null && rate.value !== null) {
        return this.amount * rate.value
      } else {
        console.log('error getting rates')
        return 0
      }
    }
  },
  created: function () {
    this.wallet = new Wallet(this.walletData._coin, this.walletData._name)
    this.wallet = this.wallet.fromStorage(this.walletData)
    this.user = Persistent.getters.user
  },
  methods: {
    onChange () {
      if (this.sendTo.length > 0) {
        this.validateB58(this.sendTo)
      }
    },
    cancel () {
      this.hexTransaction = null
      this.signed = false
      this.$router.push({name: 'Wallet', params: { id: this.id }})
    },
    getChangeAddress () {
      console.log(ADDR_CHANGE)
    },
    toggleScan () {
      if (this.scanning === false) {
        console.log('start scanning')
        if (this.scanner === null) {
          this.initScanner()
        }
        this.startScan()
        console.log('started')
      } else {
        console.log('stoping scanner')
        this.scanner.stop()
        this.scanning = false
      }
    },
    validateB58 (address) {
      try {
        return Address.fromBase58Check(address)
      } catch (e) {
        this.alert = true
        this.alertMsg = 'invalid address'
        return false
      }
    },
    initScanner () {
      this.scanner = new Instascan.Scanner({ video: document.getElementById('preview') })
      var me = this
      this.scanner.addListener('scan', function (content) {
        if (content.indexOf(':') > 0) {
          content = content.split(':')[1]
        }
        if (me.validateB58()) {
          me.sendTo = content
        }
        me.scanning = false
        me.scanner.stop()
      })
      console.log('init scanner done')
    },
    startScan () {
      var me = this
      Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
          me.scanner.start(cameras[0])
          me.scanning = true
        } else {
          me.alertMsg = 'No cameras found.'
          me.alert = true
        }
      }).catch(function (e) {
        console.log(e)
        me.alertMsg = e
        me.alert = true
        me.scanning = false
      })
    },
    broadcast () {
      EventBus.$emit(Events.loadingStart)
      var data = {
        message: {
          hex: this.wallet._coin.ticker,
          xPub: this.wallet._xPub44
        },
        manifest: ['hex', 'xPub'],
        signature: null
      }
      data.signature = this.wallet.signMessage(data)
      var baseUrl = ''
      if (process.env.NODE_ENV === 'development') {
        baseUrl = 'http://localhost:8080'
      }
      this.$http.post(baseUrl + '/api/tx/broadcast', data).then(function (res) {
        if (res.body.message !== null) {
          // OK
        } else {
          // KO
        }
        EventBus.$emit(Events.loadingEnd)
      }, response => {
        EventBus.$emit(Events.loadingEnd)
        if (response.status !== null) {
          // NO network
        } else {
          // KO
        }
      })
    },
    snackMessage (msg) {
      console.log(msg)
      this.alert = true
      this.alertMsg = msg
    },
    buildUtxo () {
      var utxo = []
      var collectAmount = 0
      var txsize = 0
      var fee = 0
      for (var i = 0; i < this.utxos.length; i++) {
        txsize = (i + 1) * 180 + 2 * 34 + 10
        fee = txsize * this.feeRate
        collectAmount += this.utxos[i].amount * 100000000
        utxo.push(this.utxos[i])
        if (collectAmount >= (this.amount + fee)) {
          break
        }
      }
      if (collectAmount < this.amount + fee) {
        var available = (collectAmount - fee) / 100000000 * 1000
        this.snackMessage('insufffisant funds available: ' + available)
        return null
      }
      return utxo
    },
    calcChange (utxo, amount, fee) {
      var utxoWeight = 0
      for (var i = 0; i < utxo.length; i++) {
        utxoWeight += (this.utxos[i].amount * 100000000)
      }
      var change = utxoWeight - amount - fee
      var changeAmount = parseInt(change)
      if (changeAmount < 1000) {
        return null // avoid dust.
      }
      return changeAmount
    },
    verify () {
      try {
        parseInt(this.amount * 100000)
      } catch (e) {
        this.snackMessage('invalid amout')
        return false
      }
      if (this.changeAddress === null ||
          !this.validateB58(this.changeAddress)) {
        this.snackMessage('Error generating change address.')
        return false
      }
      const network = this.wallet.getNetwork
      let tx = new TransactionBuilder(network)
      const utxoSet = this.buildUtxo(this.amount, this.feeRate)
      if (utxoSet === null) {
        this.snackMessage('insufisant funds')
        return false
      }
      for (var i = 0; i < utxoSet.length; i++) {
        tx.addInput(utxoSet[i].txid, utxoSet[i].n)
      }
      this.fee = Math.round((192 + (utxoSet.length * 180)) * this.feeRate)
      const change = this.calcChange(utxoSet)
      // and change
      if (change != null) {
        tx.addOutput(this.changeAddress, change)
      }
      // add recipent
      try {
        tx.addOutput(this.sendTo, parseInt(this.amount * 100000))
      } catch (e) {
        this.snackMessage(e)
        return false
      }
      // build
      try {
        var unsigned = tx.buildIncomplete().toHex()
      } catch (e) {
        this.snackMessage(e)
        return false
      }
      return { network: network, tx: unsigned, utxoSet: utxoSet }
    },
    sign: function (tx, utxo, network) {
      var done = []
      for (var i = 0; i < utxo.length; i++) {
        var key1 = this.wallet.getBIP49Path(ADDR_RECEIVE, utxo[i].addrIdx)
        var key = ECPair.fromWIF(key1.keyPair.toWIF(), network)
        // var redeemScriptHex=utxo[i].redeemScript.trim()
        // var redeemScript = Buffer.Buffer.from(redeemScriptHex, 'hex');
        try {
          // console.log("signing with idx: " + utxo[i].addrIdx);
          // tx.sign(i, key, redeemScript);
          tx.sign(i, key)
          // console.log("step1:" + tx.buildIncomplete().toHex());
          // tx.sign(i, k2, redeemScript);
          // console.log("step2:" + tx.buildIncomplete().toHex());
        } catch (e) {
          var txt = e + ' uid: ' + utxo[i].userId + ' idx: ' + utxo[i].addrIdx
          this.snackMessage(txt)
        }
        done.push(utxo[i].addrIdx)
      }
      return tx
    }
  }
}
</script>
