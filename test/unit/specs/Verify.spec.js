/**
 * Usage:
 *  ./node_modules/jest/bin/jest.js --silent test/unit/specs/Verify.spec.js
 */
import Vue from 'vue'
import Verify from '../../../src/components/Verify.vue'
import Transient from '../../../src/store/transient.js'
import Persistent from '../../../src/store/persistent.js'
import {Wallet} from '../../../src/store/wallet'
import {Coins} from '../../../src/store/coins.js'

describe('Verify.vue', () => {

  let vm

  function setupImportWallet(ticker) {
    let wallet = new Wallet(Coins.getByTicker(ticker), 'plop')
    let mnemonic = 'praise you muffin lion enable neck grocery crumble super myself license ghost'
    wallet.import (mnemonic)
    return wallet
  }

  beforeEach(function () {
    const Constructor = Vue.extend(Verify)
    vm = new Constructor().$mount()

  })

  it('should check the name of my vue', () => {
    expect(vm.$options.name).toEqual('Verify')
  })

  it('can submit wallet and feed two stores', () =>  {
    // given ...
    let wallet = setupImportWallet('BTC')
    Transient.commit('setNewWallet', wallet)
    Transient.commit('setPinCode', '123456')
    let mnemonic  = Transient.getters.newWallet._mnemonic
    // then
    vm.storeWallet('70deea93-71ce-4087-8591-3036d06f397f')
    // expect ...
    expect(Persistent.getters.wallets[0]._mnemonic).not.toEqual(mnemonic)
    expect(Transient.getters.wallets[0]._mnemonic).toEqual(mnemonic)
    expect(Transient.getters.wallets[0]._xPub).toEqual(Persistent.getters.wallets[0]._xPub)
    expect(Transient.getters.wallets[0]._yPub).toEqual(Persistent.getters.wallets[0]._yPub)
    expect(Transient.getters.wallets[0]._zPub).toEqual(Persistent.getters.wallets[0]._zPub)
    expect(Transient.getters.wallets[0]._name).toEqual(Persistent.getters.wallets[0]._name)
    expect(Transient.getters.wallets[0]._coin).toEqual(Persistent.getters.wallets[0]._coin)
    expect(Transient.getters.newWallet).toEqual(null)
  })

})
