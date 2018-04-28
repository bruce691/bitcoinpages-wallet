import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import Currencies from '../store/currencies'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [(new VuexPersistence({
    key: 'vuex',
    storage: window.localStorage
  })).plugin],
  state: {
    wallets: [],
    userName: null,
    user: { name: null, currency: Currencies[0] },
    addresses: []
  },
  mutations: {
    addWallet: (state, wallet) => {
      state.wallets.unshift(wallet)
    },
    // this is mainly used @dev, when wallet not on server
    suicide: (state, xPub) => {
      var idx = -1
      for (var i = 0; i < state.wallets.length; i++) {
        if (state.wallets[i]._xPub44 === xPub) {
          idx = i
        }
        if (idx > -1) {
          state.wallets.splice(idx, 1)
        }
      }
    },
    addAddress: (state, address) => {
      for (var i = 0; i < state.addresses.length; i++) {
        var addr = state.addresses[i]
        if (addr._address === address.address) {
          // state.addresses[i]._name = address._name
          console.warn('updated instead of add')
          return
        }
      }
      state.addresses.unshift(address)
    },
    updateAddress: (state, address) => {
      for (var i = 0; i < state.addresses.length; i++) {
        var addr = state.addresses[i]
        if (addr._address === address.address) {
          state.addresses[i]._name = address._name
        }
      }
    },
    updateUserName: (state, userName) => {
      console.log('set ', userName)
      state.userName = userName
    },
    updateUser: (state, user) => {
      console.log('set ', user)
      state.user = user
    }
  },
  getters: {
    receiveAddrForWallet (state) {
      return xPub => state.addresses.filter(item => {
        return item._xPub === xPub &&
         item._change === false &&
         item._free === true
      })
    },
    getAddress (state) {
      return addr => state.items.filter(item => {
        return item._address === addr
      })
    },
    userName (state) {
      console.log('getting', state.userName)
      return state.userName
    },
    getWallets (state) {
      console.log('getting', state.wallets)
      return state.wallets
    },
    wallets: state => state.wallets,
    user: state => state.user
  }
})
