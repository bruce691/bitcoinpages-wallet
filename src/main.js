import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import VueResource from 'vue-resource'
// import 'vuetify/dist/vuetify.min.css'
import persistent from './store/persistent'
import transient from './store/transient'

Vue.config.productionTip = false

Vue.use(VueResource)

Vue.use(Vuetify)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  persistent,
  transient,
  template: '<App/>',
  components: { App }
})
