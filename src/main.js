import Vue from 'vue';
import Vuelidate from 'vuelidate';
import uploader from 'vue-simple-uploader';

import App from '@/App.vue';
import vuetify from '@/plugins/vuetify';
import router from '@/router';
import store from '@/store';

Vue.use(Vuelidate);
Vue.use(uploader);

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App),
}).$mount('#app');
