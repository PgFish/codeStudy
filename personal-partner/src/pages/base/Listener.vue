<template>
  <div class="listner"></div>
</template>
<script>
  import { baseUrl, getSession, getJsApiConfig, pageRouter } from 'src/assets/utils.js';
  import { Indicator, MessageBox, Toast } from 'mint-ui';
  import { allowPages } from 'src/permission.js';
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
      Indicator.close();
      let that = this;
      // 设置微信的页面分享参数（仅作为过渡，不起作用）
      let shareObj = {
        title: '四川移动合伙人',
        desc: '猛戳进入立即注册/登录，请搜索关注“四川移动合伙人”公众号了解更多',
        link: `${window.location.origin + baseUrl}/register/wx/oAuth/userInfo`,
        imgUrl: `${window.location.origin + baseUrl}/partner/static/img/cmcc_logo.png`,
        hideList: [
          'menuItem:share:qq',
          'menuItem:share:weiboApp',
          // 'menuItem:share:appMessage',
          // 'menuItem:share:timeline',
          // 'menuItem:favorite',
          'menuItem:share:facebook',
          'menuItem:share:QZone',
          'menuItem:copyUrl',
          'menuItem:openWithSafari',
          'menuItem:openWithQQBrowser',
          'menuItem:share:email'
        ],
        excuteFn: () => {
          that.doRedirect();
        },
        success: () => {
        },
        cancel: () => {
        }
      };
      getJsApiConfig(shareObj);
    },
    methods: {
      doRedirect: function() {
        let srcInfo = getSession('ptSourceInfo', true); // 获取链接中的参数
        if (srcInfo) {
          this.userInfo = srcInfo.userInfo; // 链接中的用户信息
          let info = srcInfo.info;
          console.log(info);
          if (info) {
            info = info.replace(/listen/ig, '&'); // 由于微信不支持传多个参数，则在参数中用key=valuelistenkey=value的格式，在这里把listen替换为&
            let jsonInfo = Qs.parse(info); // 使用Qs插件，将key=value&格式的字符串转换为json格式
            if (jsonInfo.path) { // 判断jsonInfo中是否有path参数
              if (!/^\//.test(jsonInfo.path)) {
                jsonInfo.path = '/' + jsonInfo.path; // 为path加上/
              }
              /*
              * rule: 返利规则
              * introduce: 合伙人介绍
              * giveback: 存送活动
              * feedetail: 资费办理
              * followreward: 关注有礼活动
              * shareshop: 分享的店铺
              */
              let pageReg = new RegExp('/(' + allowPages + ')', 'i');
              if (pageReg.test(jsonInfo.path)) {
                let queryObj = JSON.parse(JSON.stringify(jsonInfo));
                delete queryObj.path; // 去掉json中的path值，保留其余的参数作为跳转页面的路由参数
                pageRouter(this, {path: jsonInfo.path, query: queryObj}, 'replace');
              }
              // <---------------------以上路径属于不需要登录则可以跳转的情况--------------------->
            } else {
              let prefix = `${window.location.origin + baseUrl}/home/`;
              let url = prefix + info;
              console.log(url);
              // window.location.replace(url + '?params=' + getParamValue('params'));
              window.location.replace(url);
            }
          }
        }
      }
    }
  };
</script>
<style>
</style>
