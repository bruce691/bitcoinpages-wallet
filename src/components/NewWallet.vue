<template>
  <v-content>

    <v-dialog-new v-bind:step="step"
                  v-if="step === STEP_NEW_WALLET"
                  @set-step="setStep">
    </v-dialog-new>

    <v-backup v-bind:step="step"
              v-if="step === STEP_BACKUP"
              @set-step="setStep">

    </v-backup>

    <v-verify v-bind:step="step"
              v-if="step === STEP_VERIFY"
              @set-step="setStep">
    </v-verify>

  </v-content>
</template>
<script>
  import NewWalletDialog from '@/components/NewWalletDialog'
  import BackupVue from '@/components/Backup'
  import VerifyVue from '@/components/Verify'

  export default {
    name: 'Wallets',
    data () {
      return {
        step: 1,
        STEP_NEW_WALLET: 1,
        STEP_BACKUP: 2,
        STEP_VERIFY: 3
      }
    },
    components: {
      'v-dialog-new': NewWalletDialog,
      'v-backup': BackupVue,
      'v-verify': VerifyVue
    },
    methods: {
      setStep: function (step) {
        this.step = step
      }
    }
  }
</script>
