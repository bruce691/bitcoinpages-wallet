import Vue from 'vue'
import Vuex from 'vuex'
import Rates from './rates'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    pinCode: null,
    wallets: [],
    newWallet: null,
    userCurrency: 'EUR',
    socket: {
      isConnected: true,
      message: '',
      reconnectError: false
    },
    rates: {
      'BTC': {
        'day': null,
        'spot': null,
        'trend': {
          'hour': null,
          'day': null
        }
      },
      'LTC': {
        'day': null,
        'spot': null,
        'trend': {
          'hour': null,
          'day': null
        }
      }
    },
    fees: {
      LTC: null,
      BTC: null
    }
  },
  mutations: {
    setPinCode: (state, pinCode) => {
      state.pinCode = pinCode
    },
    addWallet: (state, wallet) => {
      state.wallets.unshift(wallet)
    },
    setNewWallet: (state, newWallet) => {
      state.newWallet = newWallet
    },
    setBTCPrice: (state, p) => {
      state.rates.BTC = p
    },
    setLTCPrice: (state, p) => {
      state.rates.LTC = p
    },
    SOCKET_ONOPEN (state, event) {
      state.socket.isConnected = true
      state.socket.connecting = false
    },
    SOCKET_ONCLOSE (state, event) {
      state.socket.isConnected = false
    },
    SOCKET_ONERROR (state, event) {
      console.error(state, event)
    },
    // default handler called for all methods
    SOCKET_ONMESSAGE (state, message) {
      switch (message.method) {
        case 'wallet.rates':
          if (message.result) {
            state.rates = Rates.build(message.result)
          }
          break
        case 'wallet.fees':
          console.log('should store fees ' + message.result)
          // store fees
          break
        default:
          console.log('received unknown ', message)
          break
      }
      state.message = message
    },
    // mutations for reconnect methods
    SOCKET_RECONNECT (state, count) {
      state.socket.reconnectCount = count
    },
    SOCKET_RECONNECT_ERROR (state) {
      state.socket.reconnectError = true
    }
  },
  getters: {
    isConnected: state => state.socket.isConnected,
    pinCode: state => state.pinCode,
    wallets: state => state.wallets,
    newWallet: state => state.newWallet,
    rates: state => state.rates
  }
})
