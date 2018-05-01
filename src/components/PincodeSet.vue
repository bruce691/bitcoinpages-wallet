<template>
      <v-dialog v-model="setPinCodeOpen" fullscreen>
        <v-card>
          <v-card-title>
            <h2>Set a pincode</h2>
          </v-card-title>
          <v-card-text>

            <v-layout wrap>
            <v-flex xs12>
                <v-text-field type="password" :rules="ruleReq" v-model="pinCode" label="Pincode" required></v-text-field>
            </v-flex>
            <v-flex xs12>
                <v-text-field type="password" :rules="ruleMatch" v-model="pinCode2" label="Pincode (again)" required></v-text-field>
            </v-flex>
          </v-layout>
          </v-card-text>
        <v-card-actions>
          <v-btn color="primary" raised @click.stop="toggle()">Done</v-btn>
          </v-card-actions>
        </v-card>
   </v-dialog>
</template>

<script>
import { EventBus } from '../event-bus.js'

export default {
  name: 'SetPincode',
  props: ['setPinCodeOpen'],
  data () {
    return {
      pinCode: null,
      pinCode2: null,
      ruleMatch: [
        (v) => v === this.pinCode || 'Pincodes must match'
      ],
      ruleReq: [
        (v) => !!v || 'Pincode is required'
      ]
    }
  },
  methods: {
    toggle () {
      if (this.pinCode !== null && this.pinCode === this.pinCode2) {
        EventBus.$emit('set-pincode-done', this.pinCode)
      }
    }
  }
}
</script>
