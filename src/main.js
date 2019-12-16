import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import axiosRetry from 'axios-retry';
import VModal from 'vue-js-modal';
import PortalVue from 'portal-vue';
import VueSidebarMenu from 'vue-sidebar-menu';
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css';
import Buefy from 'buefy';
import './assets/global.scss';

import App from './App.vue';
import router from './router';
import store from './store';
import Icons from './icons';
import PlayerPlugin from './player';

Vue.config.productionTip = false;

axiosRetry(axios, {
  retries: 3,
  shouldResetTimeout: true,
  retryCondition: error => axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED',
});

Vue.use(VueAxios, axios);
Vue.use(VueSidebarMenu);
Vue.use(PortalVue);
Vue.use(VModal);
Vue.use(Buefy, {
  defaultIconPack: 'fas',
  defaultIconComponent: 'font-awesome-icon',
});
Vue.component('font-awesome-icon', Icons);

Vue.use(PlayerPlugin);

new Vue({
  router,
  store,
  render: h => h(App),
  beforeCreate() {
    this.$store.dispatch('GET_CATEGORY_CATALOGUE');
    this.$store.dispatch('GET_MOVIE_CATALOGUE');
  },
}).$mount('#app');
