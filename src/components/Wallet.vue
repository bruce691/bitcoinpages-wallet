<template>
  <v-content>

    <v-flex xs12 sm10 offset-sm1>
      <v-card style="margin-top: 6px;" class="blue darken-4" height="200px" >
            <v-card-title primary-title>
              <div class="headline">{{wallet._name}}</div>
            </v-card-title>
            <v-card-text>
                              <v-layout row>
              <v-flex xs7>
                0 €
              </v-flex>
              <v-flex xs5>
              <h3>0 BTC</h3>
              </v-flex>
                              </v-layout>
            </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs12 sm10 offset-sm1>
      <v-card style="margin-top: 6px;" class="blue darken-3 white--text">    
        <v-card-text>
          <v-layout row wrap>
            <v-flex sm12>
                <v-list  class="blue darken-3 white--text" dense>
                  <template v-for="(item, index) in transactions">
                    <v-list-tile
                      @click.stop="open(index)"
                      avatar
                      ripple
                      :key="item._name">
                      <v-list-tile-content>
                          {{ item._name }}
                 
                      </v-list-tile-content>
                      <v-list-tile-action>
                        <v-list-tile-action-text><h6>{{ item._amount }} {{ walet._coin.ticker }}</h6></v-list-tile-action-text>
                      </v-list-tile-action>                
                    </v-list-tile>              
                  </template>
                </v-list>
            </v-flex>      
          </v-layout>
      </v-card-text>
      </v-card>
    </v-flex>

    <v-bottom-nav light class="indigo darken-1" :value="true">
      <v-btn color="white" :to="{ name: 'Send', params: { id: id }}" value="send">
        <span>Send</span>
        <v-icon>gavel</v-icon>
      </v-btn>
      <v-btn color="white" :to="{ name: 'Receive', params: { id: id }}" value="receive">
        <span>Receive</span>
        <v-icon>receipt</v-icon>
      </v-btn>
    </v-bottom-nav>

  </v-content>
</template>

<script>
import Persistent from '../store/persistent'

export default {
  name: 'WalletVue',
  props: ['id'],
  data () {
    return {
      transactions: []
    }
  },
  computed: {
    wallet () {
      return Persistent.getters.wallets[this.id]
    }
  },
  mounted: function () {

  },
  methods: {
    open: function (id) {
      // this.$router.push({name: 'Transaction', params: { id: id }})
    }
  }
}
</script>
