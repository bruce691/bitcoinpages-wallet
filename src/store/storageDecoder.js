import CryptoJS from 'crypto-js'
import { EventBus } from '../event-bus.js'
import Events from '../store/event-api.js'
import Transient from '../store/transient.js'

export class StorageDecoder {
  constructor (walletId) {
    this.wallets = Transient.getters.wallets
    for (var i = 0; i < this.wallets.length; i++) {
      if (this.wallets[i]._walletId === walletId) {
        this._key = this.wallets[i].decodeKey
        console.log('storage decoder initialized')
        return this
      }
    }
    if (typeof this._key === 'undefined') {
      EventBus.$emit(Events.apiError, '500', '{ message: "unable to initialize storage decoder"}')
      setTimeout(function () {
        window.location = '/'
      }, 5000)
      throw new Error('unable to initialize storage decoder')
    }
  }

  set key (pKey) {
    this._key = pKey
  }

  encode (clearText) {
    if (this._key === null) {
      throw new Error('unable to use decode key')
    }
    return CryptoJS.AES.encrypt(clearText, this._key).toString()
  }

  decode (encrypted) {
    if (typeof this._key === 'undefined') {
      throw new Error('unable to use decode key')
    }
    return CryptoJS.AES.decrypt(encrypted, this._key).toString(CryptoJS.enc.Utf8)
  }
}
