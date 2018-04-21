<template>
  <v-content>
    <v-container>
      <v-flex sm11 md10 offset-md1 v-if="rateObject.BTC.day">
        <v-card style="margin-top: 6px;" class="blue darken-4" >
          <v-card-text>
            <h5 class="text-xs-center grey--text" style="margin-bottom: 0px;">1 BTC - 24H</h5>
            <h2 class="text-xs-center">{{ rateObject.BTC.day }}</h2>
            <h5 class="text-xs-center" style="margin-top: 0px;">
              <span v-if="rateObject.BTC.trend.hour">1H
                <span v-bind:class="{ 'red--text': (rateObject.BTC.trend.hour < 0), 
                                    'green--text': (rateObject.BTC.trend.hour >= 0) }">
                  {{ rateObject.BTC.trend.hour }}</span>%
              </span>
              <span v-if="rateObject.BTC.trend.day !==null"> <span class="grey--text">|</span> 24H
                <span v-bind:class="{ 'red--text': (rateObject.BTC.trend.day < 0), 
                                    'green--text': (rateObject.BTC.trend.day >= 0) }">
                  {{ rateObject.BTC.trend.day }}</span>%
              </span>
              <br>
              <span class="blue-grey--text">spot {{ rateObject.BTC.spot }}</span>
              </h5>
          </v-card-text>
      </v-card>
      </v-flex>
        
      <v-flex sm11 md10 offset-md1 v-if="rateObject.LTC.day">
        <v-card  style="margin-top: 6px; margin-bottom: 80px;" class="blue darken-4" >
          <v-card-text>
            <h5 class="text-xs-center grey--text" style="margin-bottom: 0px;">1 LTC - 24H</h5>
            <h2 class="text-xs-center">{{ rateObject.LTC.day }}</h2>
            <h5 class="text-xs-center" style="margin-top: 0px;">
              <!-- last : {{ BTC24H }} -->
              <span v-if="rateObject.LTC.trend.hour  !==null">1H
                <span v-bind:class="{ 'red--text': (rateObject.LTC.trend.hour < 0), 
                                    'green--text': (rateObject.LTC.trend.hour >= 0) }">
                  {{ rateObject.LTC.trend.hour }}</span>%
              </span>
              <span v-if="rateObject.LTC.trend.day"> <span class="grey--text">|</span> 24H
                <span v-bind:class="{ 'red--text': (rateObject.LTC.trend.day < 0), 
                                    'green--text': (rateObject.LTC.trend.day >= 0) }">
                  {{ rateObject.LTC.trend.day }}</span>%
              </span>
              <br>
              <span class="blue-grey--text">spot {{ rateObject.LTC.spot }}</span>
            </h5>
          </v-card-text>
      </v-card>
      </v-flex>

    </v-container>
    
    <v-bottom-nav class="black-text indigo lighten-1" :value="true">
      <v-btn :to="{name: 'Wallets'}" raised value="favorites">
        <span>Open wallets</span>
        <v-icon light>account_balance_wallet</v-icon>
      </v-btn>
    </v-bottom-nav>

  </v-content>

</template>

<script>
import { EventBus } from '../event-bus.js'
import Persistent from '../store/persistent'
import Transient from '../store/transient'
import Events from '../store/event-api'

export default {
  name: 'Rates',
  components: {},
  data () {
    return {
    }
  },
  computed: {
    userCurrency () {
      return Persistent.getters.user.currency
    },
    rateObject () {
      return Transient.getters.rates
    }
  },
  mounted: function () {
    EventBus.$emit(Events.setTitle, 'Price')
    this.update()
    this.updateLoop()
  },
  methods: {
    updateLoop: function () {
      setInterval(this.update, 2 * 60 * 1000)
    },
    update: function () {
    }
  }
}
</script>
<style>
ul a {
  text-decoration: none
}
</style>