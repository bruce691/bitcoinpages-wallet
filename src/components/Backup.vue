<template>
      <v-dialog max-width="480" :value="dialogOpen" persistent>
        <v-card>
          <v-card-title>
              <h3 class="green--text">Please backup</h3>
              This is your secret mnemonic phrase to recover your wallet.<br>
              Do not use a computer,&nbsp;<span class="red--text">no print, no screenshot,</span> 
              <span class="green--text">&nbsp;please use a pen and paper.</span>
          </v-card-title>
          <v-card-text>
            <v-layout wrap>
              <v-flex xs12>
                <template v-for="(item, index) in mnemonics">
                    <v-btn>{{ item }}</v-btn>
                </template>
              </v-flex>
              <v-flex xs12>

              </v-flex>
            </v-layout>

          </v-card-text>
        <v-card-actions>
          <p class="red--text">In the next  step we'll verify you took notes.</p>
          <v-btn color="primary" raised @click.stop="toggle()">Backup Done</v-btn>
          </v-card-actions>
        </v-card>
   </v-dialog>
</template>

<script>
import Transient from '../store/transient.js'

export default {
  name: 'Backup',
  computed: {
    wallet () {
      return Transient.getters.newWallet
    },
    dialogOpen: function () {
      return Transient.getters.newWallet !== null &&
              Transient.getters.newWallet.backuped === false
    },
    mnemonics () {
      if (this.wallet && this.wallet._mnemonic) {
        if (process.env.NODE_ENV === 'development') {
          console.log(this.wallet._mnemonic)
        }
        return this.wallet._mnemonic.split(' ')
      }
    }
  },
  methods: {
    toggle () {
      var wallet = Transient.getters.newWallet
      wallet.backuped = true
      wallet.backupVerified = false
      Transient.commit('setNewWallet', null)
      Transient.commit('setNewWallet', wallet)
    }
  }
}
</script>
