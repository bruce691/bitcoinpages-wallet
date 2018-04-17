<template>
  <v-content>
    <v-container fluid>
      <v-flex xs12 md10 offset-md1>
        <v-card style="margin-top: 6px;" class="blue darken-4" >
          <v-card-text>
              <v-flex xs12>
                  <v-text-field v-model="user.name"  label="Name" required></v-text-field>
              </v-flex>
              <v-flex xs12 sm6>Currency:
                <v-select
                  v-bind:items="currencies"
                  v-model="user.currency"
                  label="Select currency"
                  single-line
                  item-text="name"
                  item-value="code"
                  return-object
                ></v-select>
              </v-flex>
              <v-card-actions>
                <v-btn @click="save()" large class="info">Save</v-btn>
              </v-card-actions>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-container>
  </v-content>
</template>

<script>
import Currencies from '../store/currencies.js'
import Persistent from '../store/persistent'
import Events from '../store/event-api'
import { EventBus } from '../event-bus.js'

export default {
  name: 'Settings',
  data () {
    return {
      currencies: Currencies,
      currency: Currencies[0]
    }
  },
  computed: {
    user () {
      return Persistent.getters.user
    }
  },
  methods: {
    save () {
      console.log('save')
      Persistent.commit('updateUserName', this.user)
      console.log(this.user.currency)
    }
  },
  created: function () {
    EventBus.$emit(Events.setTitle, 'Settings')
  }
}
</script>
