<template>
  <v-toolbar dark color="indigo darken-3">
    <v-toolbar-side-icon  @click="toggleDrawer()"></v-toolbar-side-icon>
    <v-toolbar-title class="white--text">{{ title }}</v-toolbar-title>
    <!--
    <v-spacer></v-spacer>
    <v-btn icon>
      <v-icon>refresh</v-icon>
    </v-btn>
    -->
  </v-toolbar>
</template>

<script>

import { EventBus } from '../event-bus.js'
import Events from '../store/event-api'

export default {
  name: 'toolbar',
  data () {
    return {
      title: null
    }
  },
  methods: {
    toggleDrawer: function () {
      EventBus.$emit('toggle-drawer')
    }
  },
  created: function () {
    var me = this
    EventBus.$on(Events.setTitle, function (title) {
      me.title = title
    })
  }
}
</script>