import Vue from 'vue';
import Vuelidate from 'vuelidate';
import uploader from 'vue-simple-uploader';
import VueClipboard from 'vue-clipboard2';

import App from '@/App.vue';
import vuetify from '@/plugins/vuetify';
import router from '@/router';
import store from '@/store';

Vue.use(Vuelidate);
Vue.use(uploader);
Vue.use(VueClipboard);

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App),
}).$mount('#app');
