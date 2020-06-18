import Vue from 'vue';
import App from './App';
import Mint from 'mint-ui';
import 'mint-ui/lib/style.css';
import './cube-ui';
import router from './router';
import store from './store/index';
import * as utils from 'src/assets/utils.js';
import api from 'assets/utils/api'
import Bus from 'assets/utils/bus';
import * as Dialog from 'assets/utils/dialog'
import PalmInput from 'components/PalmInput';
import PalmAgreement from 'components/PalmAgreement';

Vue.prototype.utils = utils;
Vue.prototype.api = api
Vue.prototype.Bus = Bus;
Vue.prototype.Dialog = Dialog

Vue.component('PalmInput', PalmInput);
Vue.component('PalmAgreement', PalmAgreement);

Vue.use(Mint);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

// 为IE版本<=10的浏览器加上window.location.origin属性
if (!window.location.origin) {
  window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
}

let indexScrollTop = 0;
router.beforeEach((route, redirect, next) => {
  if (route.path !== '/') {
    indexScrollTop = document.body.scrollTop;
  }
  document.title = route.meta.title || document.title;
  next();
});

router.afterEach(route => {
  if (route.path !== '/') {
    document.body.scrollTop = 0;
  } else {
    Vue.nextTick(() => {
      document.body.scrollTop = indexScrollTop;
    });
  }
});
