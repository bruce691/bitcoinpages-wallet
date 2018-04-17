import bitcoin from '../../node_modules/bitcoinjs-lib/src/index.js'
import bitcoinMessage from '../../node_modules/bitcoinjs-message/index.js'
import bip39 from '../../node_modules/bip39/index.js'
import { StorageDecoder } from '../store/storageDecoder.js'
import axios from 'axios'

export class Wallet {
  constructor (coin, name) {
    if (coin === null || coin.ticker === null) {
      throw new Error('storage/wallet invalid instanciation')
    }
    this._coin = coin
    this._name = name
    this._balance = 0.0
  }
  get coin () {
    return this._coin
  }

  get name () {
    return this._name
  }

  getMnemonic () {
    var st = new StorageDecoder()
    return st.decode(this._mnemonic)
  }

  fromScratch () {
    this._mnemonic = bip39.generateMnemonic()
    return this.import(this._mnemonic)
  }

  import (mnemonic) {
    this._mnemonic = mnemonic
    this._seed = bip39.mnemonicToSeed(mnemonic)
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Mnemonic cannot be validated')
    }
    this._node = bitcoin.HDNode.fromSeedBuffer(this._seed)
    this._xPriv = this._node.toBase58()
    this._xPub = this._node.derivePath("m/44'/0'/0'").neutered().toBase58()
    this._yPub = 'y' + this._node.derivePath("m/49'/0'/0'").neutered().toBase58().substring(1)
    this._zPub = 'z' + this._node.derivePath("m/84'/0'/0'").neutered().toBase58().substring(1)
    return this
  }

  sanitize () {
    var st = new StorageDecoder(this._xPub44)
    this._xPriv = st.encode(this._node.toBase58())
    this._mnemonic = st.encode(this._mnemonic)
    delete this.backuped
    delete this.backupVerified
  }

  fromStorage (data) {
    var st = new StorageDecoder(data._xPub44)
    this._xPriv = st.decode(data._xPriv)
    this._mnemonic = st.decode(data._mnemonic)
    this._balance = 0.0
    return this
  }

  getNode (st) {
    if (typeof st === 'undefined') {
      throw new Error('storage/wallet/getNode decoder required')
    }
    return bitcoin.HDNode.fromBase58(st.decode(this._xPriv))
  }

  getNetwork () {
    switch (this._coin.ticker) {
      case 'BTCT':
        return bitcoin.networks.testnet
      case 'BTC':
        return bitcoin.networks.bitcoin
      case 'LTC':
        return bitcoin.networks.litecoin
      case 'LTCT':
        return this.stubLTCTNetwork()
      default:
        throw new Error('store/wallet: unable to get network')
    }
  }

  getPath (type, account, change, index) {
    return 'm/' + type + '\'/' + this._coin.derivationPath + '\'/' + account + '\'/' + change + '/' + index
  }

  getChildAddress (type, account, change, idx) {
    // var node = bitcoin.HDNode.fromBase58(this._xPriv, this._coin.network)
    return this._node.derivePath(this.getPath(type, account, change, idx))
  }

  signCreateMessage (pinCode) {
    var root44 = this.getChildAddress('44', 0, 0, 0)
    var toSign = this.buildToSign(root44.keyPair.getAddress().toString(), pinCode)
    var signature = bitcoinMessage.sign(toSign,
                      root44.keyPair.d.toBuffer(32),
                      root44.keyPair.compressed)
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('signing address ', root44.keyPair.getAddress().toString())
      console.log('message to sign', toSign)
      console.log('payload', atob(toSign))
      console.log('signing private key', root44.keyPair.toWIF())
      console.log('signature ', signature.toString('base64'))
    }
    return { signature: signature.toString('base64'), message: toSign }
  }

  buildToSign (walletId, pinCode) {
    let toSign = {}
    toSign['ticker'] = this._coin.ticker
    toSign['xPub'] = this._xPub
    toSign['yPub'] = this._yPub
    toSign['zPub'] = this._zPub
    toSign['pinCode'] = pinCode
    toSign['name'] = this.name
    return btoa(JSON.stringify(toSign))
  }

  getBip49Address (child) {
    var keyhash = bitcoin.crypto.hash160(child.getPublicKeyBuffer())
    var scriptSig = bitcoin.script.witnessPubKeyHash.output.encode(keyhash)
    var addressBytes = bitcoin.crypto.hash160(scriptSig)
    var outputScript = bitcoin.script.scriptHash.output.encode(addressBytes)
    var address = bitcoin.address.fromOutputScript(outputScript, this._coin.network)
    return address
  }

  getBip84Address (keyPair) {
    var pubKey = keyPair.getPublicKeyBuffer()
    var scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(pubKey))
    var address = bitcoin.address.fromOutputScript(scriptPubKey)
    return address
  }

  getTransactions (addresses) {
    var data = {
      addrs: addresses,
      height: 0
    }
    console.log(data)
    axios.post('https://api.ei8ht.com.au/3/addrtxs', data).then(function (res) {
      console.log('status', res)
      if (res.body.error) {
        // EventBus.$emit(Events.apiError, res.body.status, res.body.error)
      }
    }).catch(function (error) {
      console.error(error)
    })
  }
}
