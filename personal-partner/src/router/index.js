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
      component: () => import('../pages/base/Home.vue'),
      children: [
        {
          path: '/',
          component: () => import('../pages/index.vue')
        },
        {
          path: '/orderList',
          component: () => import('../pages/orderList.vue')
        },
        {
          path: '/tradeDetail',
          component: () => import('../pages/tradeDetail.vue')
        },
        {
          path: '/statistics',
          component: () => import('../pages/statistics.vue')
        },
        {
          path: '/withdraw',
          component: () => import('../pages/withdraw.vue')
        },
        {
          path: '/logistics',
          component: () => import('../pages/logistics.vue')
        },
        {
          path: '/introduce',
          component: () => import('../pages/introduce.vue')
        },
        {
          path: '/rule',
          component: () => import('../pages/rule.vue')
        },
        {
          path: '/moneyStrategy',
          component: () => import('../pages/moneyStrategy.vue')
        },
        {
          path: '/bindinviter',
          component: () => import('../pages/bindinviter.vue')
        },
        {
          path: '/myinvitercodes',
          component: () => import('../pages/myinvitercodes.vue')
        }
      ]
    },
    {
      path: '/activity',
      component: () => import('../pages/activity.vue')
    },
    {
      path: '/chest',
      component: () => import('../pages/chestActivity.vue')
    },
    {
      path: '/giveback',
      component: () => import('../pages/giveback.vue')
    },
    {
      path: '/login',
      component: () => import('../pages/base/Login.vue')
    },
    {
      path: '/error',
      component: () => import('../pages/base/Error.vue')
    },
    {
      path: '/listener',
      component: () => import('../pages/base/Listener.vue')
    },
    {
      path: '/codeshare',
      component: () => import('../pages/codeshare.vue')
    },
    {
      path: '/feedetail',
      component: () => import('../pages/feedetail.vue')
    },
    {
      path: '/followreward',
      component: () => import('../pages/followreward.vue')
    },
    {
      path: '/shareshop',
      component: () => import('../pages/shareshop.vue')
    },
    {
      path: '/checkin',
      component: () => import('../pages/checkin.vue')
    },
    {
      path: '/familyDetail',
      component: () => import('../pages/familyDetail.vue')
    },
    {
      path: '/familyMember',
      component: () => import('../pages/familyMember.vue')
    },
    {
      path: '/handlesuperflow',
      component: () => import('../pages/handlesuperflow.vue')
    },
    {
      path: '/redirect',
      component: () => import('../pages/base/Redirect.vue')
    },
    {
      path: '/emp',
      redirect: '/emp/login'
    },
    {
      path: '/emp/login',
      component: () => import('../pages/employee/EMP_Login.vue')
    },
    {
      path: '/emp/index',
      component: () => import('../pages/employee/EMP_Home.vue'),
      children: [
        {
          path: '/',
          component: () => import('../pages/employee/EMP_Index.vue')
        },
        {
          path: '/emp/orderList',
          component: () => import('../pages/employee/EMP_OrderList.vue')
        },
        {
          path: '/emp/orderDetail',
          component: () => import('../pages/employee/EMP_OrderDetail.vue')
        }
      ]
    },
    {
      path: '/emp/shareshop',
      component: () => import('../pages/employee/EMP_ShareShop.vue')
    },
    {
      path: '/promisefee',
      component: () => import('../pages/promisefee/index.vue')
    },
    {
      path: '/instockfees',
      component: () => import('../pages/promisefee/instockfees.vue')
    },
    {
      path: '/tvaddfee',
      component: () => import('../pages/tvBusiness/TVAddFee.vue')
    },
    {
      path: '/consobusiness',
      component: () => import('../pages/ConsoBusiness.vue')
    }
  ]
});
