<template>
  <div class="content" :class="{'overflow-hidden': isSlideShow}">
    <div class="slide-bar-mask" v-if="isSlideShow" @touchmove="prevD($event)" @click="closeSlideBar($event)"></div>
    <div class="slide-bar slide-transition" :class="{'slide-bar-show': isSlideShow}" @touchmove="stopP($event)">
      <div class="slide-head">
        <img class="slide-head-img" :src="realName ? 'static/img/dzg_head_img.png' : (userInfo.headimgurl || 'static/img/cmcc_logo.png')">
        <div class="slide-nick-name">{{realName || ((userInfo.nickname || '我') + '的店铺')}}</div>
        <div class="slide-phone-no">{{phone}}</div>
      </div>
      <div class="slide-body">
        <!-- roleType，1：队员，2：队长，3：团长。若为0或者为空，则为政企合伙人/装维合伙人 -->
        <template v-if="!serverUserInfo.roleType">
          <template v-if="serverUserInfo.partnerType !== 5 && serverUserInfo.inviteCode">
            <div class="my-inviter-name">我的推荐人：{{serverUserInfo.inviteName}}</div>
            <div class="my-inviter-phone">联系电话：{{serverUserInfo.invitePhone}}</div>
            <div class="my-inviter-code">邀请码：{{serverUserInfo.inviteCode}}</div>
          </template>
          <!-- <template v-if="serverUserInfo.partnerType !== 5 && !serverUserInfo.inviteCode && showGovPartnerInviteCode">
            <div class="slide-body-item" @click="toBindInviter($event)">绑定推荐人</div>
          </template> -->
          <template v-if="serverUserInfo.partnerType === 5 && showGovPartnerInviteCode">
            <div class="slide-body-item" @click="toMyInviteCodes($event)">我的邀请码</div>
          </template>
        </template>
        <template v-else>
          <template v-if="serverUserInfo.roleType !== 3">
            <!-- <div class="my-inviter-name">我的推荐人：{{serverUserInfo.inviteName}}</div> -->
            <div class="my-inviter-phone">推荐人账号：{{serverUserInfo.invitePhone}}</div>
          </template>
          <template v-if="serverUserInfo.roleType === 1 && ifCaptainBtn">
            <!-- <div class="my-inviter-name">我的推荐人：{{serverUserInfo.inviteName}}</div> -->
            <div class="slide-body-item" @click="toBecomeCaptain($event)">升级队长</div>
          </template>
        </template>
        <div class="slide-body-item" @click="toGpas_qa($event)">常见问题</div>
        <div class="slide-body-item" @click="toGpas_introduction($event)">关于我们</div>
        <div class="slide-body-item" @click="exitLogin($event)">退出登录</div>
      </div>
    </div>
    <div class="slide-bar-msgbox" v-if="showMsgBox" @click.self="closeMsgBox($event)">
      <div class="slide-bar-msgbox-content">
        <div class="slide-bar-msgbox-head">提示</div>
        <div class="slide-bar-msgbox-body">确认退出？</div>
        <div class="slide-bar-msgbox-foot">
          <div class="slide-bar-msgbox-cancel" @click.self="closeMsgBox($event)">取消</div>
          <div class="slide-bar-msgbox-confirm" @click.self="confirmExit($event)">确定</div>
        </div>
      </div>
    </div>
    <div class="main-container slide-transition" :class="{'is-slide-bar-show': isSlideShow}">
      <router-view></router-view>
      <v-footer :showFooterCover.sync="showFooterCover"></v-footer>
    </div>
  </div>
</template>

<script>
import { Indicator, MessageBox, Toast } from 'mint-ui';
import vFooter from './EMP_Footer.vue';
import { logout, getSession, baseUrl, getRequestParams, sendJsonPostRequest, removeSession, removeStorage, getJsApiConfig, pageRouter, encryptByDES, YEK_SED } from 'src/assets/utils';
import Bus from 'src/assets/bus/bus';
export default {
  components: {
    vFooter,
    MessageBox,
    Indicator,
    Toast
  },
  data () {
    return {
      isLoading: false,
      userInfo: {},
      sourceId: false,
      excludeReg: /\/rule|\/introduce/i.test(this.$route.path),
      isSlideShow: false,
      phone: '',
      realName: '',
      serverUserInfo: '',
      showGovPartnerInviteCode: true,
      showMsgBox: false,
      showFooterCover: false
    };
  },
  watch: {
    '$route' (to, from) {
      if (!this.excludeReg && !getSession('partnerticket')) {
        logout(this);
      }
    }
  },
  created () {
    let that = this;
    Bus.$on('show-footer-cover', (ifTrue = false) => {
      console.log(ifTrue);
      that.showFooterCover = ifTrue;
    });
    Bus.$on('on-zt-head-img-tab', (ifShow) => {
      setTimeout(() => {
        this.isSlideShow = ifShow;
      }, 10);
    });
    let serverUserInfo = getSession('ptDetailInfo');
    let partnerId = serverUserInfo.id;
    let phoneNumber = encryptByDES.CBC('' + serverUserInfo.phone, YEK_SED);
    let obj = {
      title: '为你推荐一款超值业务，点击可享更多流量和套餐优惠哟',
      desc: '更多精彩超值业务，等你来办！',
      link: `${window.location.origin + baseUrl}/common/new/redirect?to=emp/shareshop&p=${phoneNumber}&ptid=${partnerId}`,
      imgUrl: `${window.location.origin + baseUrl}/partner/static/img/employee/cmcc.png`
    };
    this.doCheck();
    getJsApiConfig(obj);
  },
  methods: {
    cleanAndBackToLogin () {
      removeStorage('partnerticket');
      removeStorage('ptPublicOpenId');
      removeStorage('ptDetailInfo');
      removeSession('partnerticket');
      removeSession('ptPublicOpenId');
      removeSession('ptDetailInfo');
      pageRouter(this, {path: '/emp'}, 'replace');
    },
    doCheck () {
      let serverUserInfo = getSession('ptDetailInfo');
      if (serverUserInfo && serverUserInfo.phone) {
        let phone = serverUserInfo.phone;
        this.check(phone);
      } else {
        this.cleanAndBackToLogin();
      }
    },
    check (phone) {
      let url = `${baseUrl}/register/employee/check`;
      let params = {
        phone: phone
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          console.log(json);
          if (json.status !== 0) {
            Toast('请重新登录');
            vue.cleanAndBackToLogin();
          }
        }
      );
      Indicator.open();
      sendJsonPostRequest(this, reqParams);
    },
    stopP: function(e) {
      e.stopPropagation();
    },
    prevD: function(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    closeSlideBar: function(e) {
      e.stopPropagation();
      this.isSlideShow = false;
    },
    toGpas_qa(e) {
      e.stopPropagation();
      let prefix = window.location.origin;
      if (/192.168.|localhost|127.0.0.1/.test(prefix) || process.env.NODE_ENV === 'development') {
        prefix = 'https://gptest.palmte.cn';
      }
      let url = prefix + baseUrl + '/home/gpas_qa.html';
      window.location.href = url;
    },
    toGpas_introduction(e) {
      e.stopPropagation();
      let prefix = window.location.origin;
      if (/192.168.|localhost|127.0.0.1/.test(prefix) || process.env.NODE_ENV === 'development') {
        prefix = 'https://gptest.palmte.cn';
      }
      let url = prefix + baseUrl + '/home/gpas_introduction.html';
      window.location.href = url;
    },
    exitLogin: function(e) {
      e.stopPropagation();
      this.showMsgBox = true;
    },
    closeMsgBox: function(e) {
      e.stopPropagation();
      this.showMsgBox = false;
    },
    confirmExit: function(e) {
      e.stopPropagation();
      let url = `${baseUrl}/exit/exitLogin`;
      let params = {
        'phone': this.$route.query.p
      };
      let reqParams = getRequestParams(url, params, this.exitLoginSuc, this.exitLoginSuc);
      Indicator.open();
      sendJsonPostRequest(this, reqParams);
    },
    exitLoginSuc: function(vue, json) {
      Indicator.close();
      vue.showMsgBox = false;
      console.log(json);
      vue.cleanAndBackToLogin();
    },
    exitLoginFail: function(vue, ex) {
      Indicator.close();
      vue.showMsgBox = false;
      Toast('网络异常！');
      console.info('退出登录异常：', ex);
    }
  }
};
// function isIE() {
//   if (!!window.ActiveXObject || 'ActiveXObject' in window) {
//     return true;
//   } else {
//     return false;
//   }
// }
// function isIE11() {
//   if ((/Trident\/7\./).test(navigator.userAgent)) {
//     return true;
//   } else {
//     return false;
//   }
// }
</script>
<style>
.change-code-tip {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 2014;
  text-align: center;
  .change-code-msgbox {
    transform: translate3d(-50%, -50%, 0);
    background-color: #fff;
    width: 85%;
    border-radius: 3px;
    font-size: 16px;
    position: fixed;
    top: 50%;
    left: 50%;
    .code-header {
      padding: 15px 0 0;
    }
    .code-content {
      padding: 10px 20px 15px;
      border-bottom: 1px solid #ddd;
      min-height: 36px;
      position: relative;
      .code-prompt {
        text-align: left;
        font-size: 12px;
        color: #666;
        padding-top: 10px;
      }
    }
    .code-btns {
      display: flex;
      height: 40px;
      line-height: 40px;
    }
  }
}
.content {
  height: 100%;
  background: #f2f2f2;
}
.overflow-hidden {
  overflow: hidden;
}
.main-container {
  height: 100%;
  background: #f2f2f2;
  position: relative;
}
.top-ads {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9;
  background: #e8e8e8;
}
.top-ads-words {
  position: relative;
  height: 26px;
  line-height: 26px;
  color: #845B38;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  margin: 0 25px 0 36px;
}
a {
  text-decoration: none;
  color: #845B38;
}
.top-ads-speaker {
  position: absolute;
  top: 0;
  left: 6px;
  width: 26px;
  height: 26px;
  z-index: 2;
}
.top-ads-speaker img {
  position: absolute;
  top: 7px;
  left: 7px;
  width: 13px;
  height: 13px;
  pointer-events: none;
}
.top-ads-close {
  position: absolute;
  top: 0;
  right: 0;
  width: 26px;
  height: 26px;
  z-index: 2;
}
.top-ads-close img {
  position: absolute;
  top: 7px;
  left: 7px;
  width: 12px;
  height: 12px;
  pointer-events: none;
}
.has-top-ads {
  position: relative;
  /*height: calc(100% - 25px) !important;*/
  padding-top: 25px;
  /*background: #f2f2f2;*/
  height: 100%;
}
.to-online-service {
  width: 37px;
  height: 43px;
  position: fixed;
  right: 0;
  top: 150px;
  cursor: pointer;
  z-index: 1;
}
.to-online-service img {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.slide-bar-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, .7);
  z-index: 999999998;
}
.slide-bar {
  position: fixed;
  left: -60%;
  top: 0;
  width: 60%;
  height: 100%;
  background: #fff;
  z-index: 999999999;
}
.slide-bar-show {
  transform: translateX(100%);
}
.is-slide-bar-show {
  /*left: 60%;*/
  transform: translateX(60%);
}
.slide-transition {
  transition: all linear .2s;
}
.slide-head {
  width: 100%;
  height: 200px;
  text-align: center;
  position: relative;
  background: #3d8cf7;
}
.slide-head-img {
  width: 80px;
  height: 80px;
  border-radius: 100%;
  border: 0;
  outline: none;
  margin-top: 30px;
  pointer-events: none;
}
.slide-nick-name {
  font-size: 18px;
  color: #fff;
  letter-spacing: 2px;
  margin-top: 8px;
}
.slide-phone-no {
  font-size: 14px;
  color: #fff;
  letter-spacing: 1px;
  margin-top: 8px;
}
.slide-body {
  height: calc(100% - 200px);
  position: relative;
}
.my-inviter-name, .my-inviter-phone, .my-inviter-code {
  font-size: 12px;
  color: #333;
  margin: 20px 0 20px 10%;
  span {
    color: #2D9CF7;
    padding-left: 20px;
  }
}
.slide-body-item {
  margin: 20px 0 20px 10%;
  color: #2D9CF7;
  font-size: 14px;
  cursor: pointer;
}
.slide-bar-msgbox {
  z-index: 999999999;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
}
.slide-bar-msgbox-content {
  position: absolute;
  top: 45%;
  transform: translateY(-45%);
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 80%;
  max-width: 500px;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}
.slide-bar-msgbox-head {
  height: 40px;
  line-height: 40px;
  width: 100%;
  text-align: center;
  color: #333;
  font-size: 15px;
  font-weight: bold;
  letter-spacing: 2px;
}
.slide-bar-msgbox-body {
  padding: 2px 20px 30px 20px;
  text-align: center;
  width: 100%;
  font-size: 14px;
  color: #777;
  border-bottom: 1px solid #dedede;
}
.slide-bar-msgbox-foot {
  height: 40px;
  width: 100%;
  position: relative;
}
.slide-bar-msgbox-cancel, .slide-bar-msgbox-confirm {
  float: left;
  height: 40px;
  line-height: 40px;
  width: 50%;
  text-align: center;
  font-size: 14px;
}
.slide-bar-msgbox-cancel {
  color: #aaa;
}
.slide-bar-msgbox-confirm {
  color: #2D9CF7;
}
</style>
