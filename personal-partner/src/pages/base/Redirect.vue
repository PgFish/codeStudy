<template>
  <div class="listner"></div>
</template>
<script>
import { baseUrl, pageRouter } from 'src/assets/utils.js';
import { Indicator, MessageBox, Toast } from 'mint-ui';
import Qs from 'qs';

export default {
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  data() {
    return {
      userInfo: {}
    };
  },
  created() {
    document.title = '加载中...';
    Indicator.open();
    // let that = this;
    // // 设置微信的页面分享参数（仅作为过渡，不起作用）
    // let shareObj = {
    //   title: '登录',
    //   desc: ` `,
    //   link: `${window.location.origin + baseUrl}/common/new/redirect?to=emp`,
    //   imgUrl: `${window.location.origin + baseUrl}/partner/static/img/employee/cmcc.png`,
    //   hideList: [
    //     'menuItem:share:qq',
    //     'menuItem:share:weiboApp',
    //     // 'menuItem:share:appMessage',
    //     // 'menuItem:share:timeline',
    //     // 'menuItem:favorite',
    //     'menuItem:share:facebook',
    //     'menuItem:share:QZone',
    //     'menuItem:copyUrl',
    //     'menuItem:openWithSafari',
    //     'menuItem:openWithQQBrowser',
    //     'menuItem:share:email'
    //   ],
    //   excuteFn: () => {
    //   },
    //   success: () => {
    //   },
    //   cancel: () => {
    //   }
    // };
    // getJsApiConfig(shareObj);
    this.doRedirect();
  },
  methods: {
    doRedirect: function() {
      let queryObj = Qs.parse(window.location.search.substr(1));
      let to = queryObj.to;
      let pageName = queryObj.pageName;
      if (to) {
        let url = `${window.location.origin + baseUrl}/partner/?to=${to}#/${to}`;
        if (process.NODE_ENV === 'development') {
          url = `${window.location.origin}/?to=${to}#/${to}`;
        }
        delete queryObj.to;
        let queryStr = Qs.stringify(queryObj);
        if (queryStr) {
          url += `?${queryStr}`;
        }
        Indicator.close();
        window.location.replace(url);
      } else if (pageName) {
        let url = `${window.location.origin + baseUrl}/partner/?pageName=${pageName}#/${pageName}`;
        if (process.NODE_ENV === 'development') {
          url = `${window.location.origin}/?pageName=${pageName}#/${pageName}`;
        }
        delete queryObj.pageName;
        let queryStr = Qs.stringify(queryObj);
        if (queryStr) {
          url += `?${queryStr}`;
        }
        Indicator.close();
        window.location.replace(url);
      } else {
        Indicator.close();
        pageRouter(this, { path: '/error', query: { errorInfo: '参数错误' } }, 'replace');
      }
    }
  }
};
</script>
<style lang="less">
</style>
