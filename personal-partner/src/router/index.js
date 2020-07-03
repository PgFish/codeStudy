import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/index',
      component: resolve => require(['../pages/base/Home.vue'], resolve),
      children: [
        {
          path: '/',
          component: resolve => require(['../pages/index.vue'], resolve)
        },
        {
          path: '/orderList',
          component: resolve => require(['../pages/orderList.vue'], resolve)
        },
        {
          path: '/tradeDetail',
          component: resolve => require(['../pages/tradeDetail.vue'], resolve)
        },
        {
          path: '/statistics',
          component: resolve => require(['../pages/statistics.vue'], resolve)
        },
        {
          path: '/withdraw',
          component: resolve => require(['../pages/withdraw.vue'], resolve)
        },
        {
          path: '/logistics',
          component: resolve => require(['../pages/logistics.vue'], resolve)
        },
        {
          path: '/introduce',
          component: resolve => require(['../pages/introduce.vue'], resolve)
        },
        {
          path: '/rule',
          component: resolve => require(['../pages/rule.vue'], resolve)
        },
        {
          path: '/moneyStrategy',
          component: resolve => require(['../pages/moneyStrategy.vue'], resolve)
        },
        {
          path: '/bindinviter',
          component: resolve => require(['../pages/bindinviter.vue'], resolve)
        },
        {
          path: '/myinvitercodes',
          component: resolve => require(['../pages/myinvitercodes.vue'], resolve)
        }
      ]
    },
    {
      path: '/activity',
      component: resolve => require(['../pages/activity.vue'], resolve)
    },
    {
      path: '/chest',
      component: resolve => require(['../pages/chestActivity.vue'], resolve)
    },
    {
      path: '/giveback',
      component: resolve => require(['../pages/giveback.vue'], resolve)
    },
    {
      path: '/login',
      component: resolve => require(['../pages/base/Login.vue'], resolve)
    },
    {
      path: '/error',
      component: resolve => require(['../pages/base/Error.vue'], resolve)
    },
    {
      path: '/listener',
      component: resolve => require(['../pages/base/Listener.vue'], resolve)
    },
    {
      path: '/codeshare',
      component: resolve => require(['../pages/codeshare.vue'], resolve)
    },
    {
      path: '/feedetail',
      component: resolve => require(['../pages/feedetail.vue'], resolve)
    },
    {
      path: '/followreward',
      component: resolve => require(['../pages/followreward.vue'], resolve)
    },
    {
      path: '/shareshop',
      component: resolve => require(['../pages/shareshop.vue'], resolve)
    },
    {
      path: '/checkin',
      component: resolve => require(['../pages/checkin.vue'], resolve)
    },
    {
      path: '/familyDetail',
      component: resolve => require(['../pages/familyDetail.vue'], resolve)
    },
    {
      path: '/familyMember',
      component: resolve => require(['../pages/familyMember.vue'], resolve)
    },
    {
      path: '/handlesuperflow',
      component: resolve => require(['../pages/handlesuperflow.vue'], resolve)
    },
    {
      path: '/redirect',
      component: resolve => require(['../pages/base/Redirect.vue'], resolve)
    },
    {
      path: '/emp',
      redirect: '/emp/login'
    },
    {
      path: '/emp/login',
      component: resolve => require(['../pages/employee/EMP_Login.vue'], resolve)
    },
    {
      path: '/emp/index',
      component: resolve => require(['../pages/employee/EMP_Home.vue'], resolve),
      children: [
        {
          path: '/',
          component: resolve => require(['../pages/employee/EMP_Index.vue'], resolve)
        },
        {
          path: '/emp/orderList',
          component: resolve => require(['../pages/employee/EMP_OrderList.vue'], resolve)
        },
        {
          path: '/emp/orderDetail',
          component: resolve => require(['../pages/employee/EMP_OrderDetail.vue'], resolve)
        }
      ]
    },
    {
      path: '/emp/shareshop',
      component: resolve => require(['../pages/employee/EMP_ShareShop.vue'], resolve)
    },
    {
      path: '/promisefee',
      component: resolve => require(['../pages/promisefee/index.vue'], resolve)
    },
    {
      path: '/instockfees',
      component: resolve => require(['../pages/promisefee/instockfees.vue'], resolve)
    },
    {
      path: '/tvaddfee',
      component: resolve => require(['../pages/tvBusiness/TVAddFee.vue'], resolve)
    },
    {
      path: '/consobusiness',
      component: resolve => require(['../pages/ConsoBusiness.vue'], resolve)
    }
  ]
});
