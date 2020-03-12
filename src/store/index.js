import Vue from 'vue';
import Vuex from 'vuex';

import state from '@/store/state';
import getters from '@/store/getter';
import mutations from '@/store/mutation';

Vue.use(Vuex);

export default new Vuex.Store({
  state,

  getters,

  mutations,

  strict: true,
});
