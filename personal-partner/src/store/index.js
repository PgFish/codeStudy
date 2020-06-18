import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';

import base from './modules/base/index';
Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    base
  },
  plugins: process.env.NODE_ENV !== 'production'
    ? [createLogger()]
    : []
});
