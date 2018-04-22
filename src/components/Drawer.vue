<template>

<v-navigation-drawer
      temporary
      v-model="drawer"
      :mini-variant="mini"
      dark
      absolute
    >
      <v-list class="pa-1">
        <v-list-tile v-if="mini" @click.stop="mini = !mini">
          <v-list-tile-action>
            <v-icon>chevron_right</v-icon>
          </v-list-tile-action>
        </v-list-tile>
        <v-list-tile avatar tag="div">
          <v-list-tile-avatar>
            <v-icon>perm_identity</v-icon>
            <!--
            <img src="https://randomuser.me/api/portraits/men/85.jpg" />
          -->
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{ user.name }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon @click.stop="mini = !mini">
              <v-icon>chevron_left</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
      <v-list class="pt-0" dense>
        <v-divider light></v-divider>
        <v-list-tile v-for="item in items" :key="item.title" @click="navigate(item.route)">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
</template>
<script>

import { EventBus } from '../event-bus.js'
import router from '../router'
import Persistent from '../store/persistent'

export default {
  created: function () {
    EventBus.$on('toggle-drawer', this.toggle)
  },
  methods: {
    toggle () {
      this.drawer = !this.drawer
    },
    navigate (location) {
      router.push(location)
    }
  },
  computed: {
    user () {
      return Persistent.getters.user
    }
  },
  data () {
    return {
      drawer: null,
      username: '',
      items: [
        { title: 'Settings', icon: 'settings', route: '/settings' }
        // { title: 'Wallets', icon: 'account_balance_wallet', route: '/' },
        // { title: 'Submit Ads', icon: 'rss_feed', route: '/' },
        // { title: 'Directory', icon: 'contacts', route: '/' },
        // { title: 'About', icon: 'question_answer', route: '/' }
      ],
      mini: false,
      right: null
    }
  }
}
</script>
