import Vue from 'vue'
import Router from 'vue-router'
import Wallets from '@/components/Wallets'
import Settings from '@/components/Settings'
import WalletVue from '@/components/Wallet'
import Receive from '@/components/Receive'
import Send from '@/components/Send'
import Rates from '@/components/Rates'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Rates',
      component: Rates
    },
    {
      path: '/wallets',
      name: 'Wallets',
      component: Wallets
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    },
    {
      path: '/wallet/:id',
      name: 'Wallet',
      component: WalletVue,
      props: true
    },
    {
      path: '/wallet/:id/receive',
      name: 'Receive',
      component: Receive,
      props: true
    },
    {
      path: '/wallet/:id/send',
      name: 'Send',
      component: Send,
      props: true
    }
  ]
})
