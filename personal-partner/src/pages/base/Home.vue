<template>
  <div class="content" :class="{'overflow-hidden': isSlideShow}">
    <div class="slide-bar-mask" v-if="isSlideShow" @touchmove="prevD($event)" @click="closeSlideBar($event)"></div>
    <div class="slide-bar slide-transition" :class="{'slide-bar-show': isSlideShow}" @touchmove="stopP($event)">
      <div class="slide-head">
        <img class="slide-head-img" :src="realName ? 'static/img/dzg_head_img.png' : (userInfo.headimgurl || 'static/img/cmcc_logo.png')">
        <div class="slide-nick-name">{{realName || ((userInfo.nickname || '我') + '的店铺')}}</div>
        <div class="slide-phone-no">{{phone}}</div>
        <div class="slide-invitation-code" v-if="serverUserInfo.roleType === 2">我的邀请码：{{serverUserInfo.invitationCode}}</div>
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
            <div class="my-inviter-code">推荐人邀请码：{{serverUserInfo.inviteCode || ''}} <span @click="changeCode" v-if="serverUserInfo.roleType === 1">更换邀请码</span></div>
          </template>
          <div class="my-inviter-code" v-if="serverUserInfo.roleType === 3">邀请码：{{serverUserInfo.inviteCode || ''}} <span @click="changeCode" v-if="serverUserInfo.roleType === 1">更换邀请码</span></div>
          <template v-if="serverUserInfo.roleType === 1 && ifCaptainBtn">
            <!-- <div class="my-inviter-name">我的推荐人：{{serverUserInfo.inviteName}}</div> -->
            <div class="slide-body-item" @click="toBecomeCaptain($event)">升级队长</div>
          </template>
        </template>
        <div class="slide-body-item" @click="toGpas_qa($event)">常见问题</div>
        <div class="slide-body-item" @click="toGpas_introduction($event)">关于我们</div>
        <!-- <div class="slide-body-item" @click="exitLogin($event)">退出登录</div> -->
        <div class="slide-body-item" @click="switchTo($event)">切换到渠道合伙人</div>
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
      <div class="top-ads" v-if="showTopAds && topAds.length > 0">
        <div class="top-ads-speaker"><img src="static/img/common/top_ads_speaker.png" /></div>
        <div class="top-ads-words" ref="adsScollerWrap" @click="toAds(topAds[curIndex].linkUrl)">
          <div class="top-ads-words-scroller" ref="adsScoller" :class="{'exceed-width': isExceed}">{{topAds[curIndex].content}}</div>
        </div>
        <div class="top-ads-close" @click="closeAds($event)"><img src="static/img/common/top_ads_close.png" /></div>
      </div>
      <router-view :class="{'has-top-ads': showTopAds && topAds.length > 0}"></router-view>
      <v-footer :showFooterCover.sync="showFooterCover"></v-footer>
      <div class="to-online-service" v-if="sourceId" @click="getOnlineSvc">
        <img src="static/img/index/service.png" />
      </div>
    </div>
    <div class="change-code-tip" v-if="showChangCode">
      <div class="change-code-msgbox">
        <div class="code-header">请输入新的邀请码</div>
        <div class="code-content">
          <div class="mint-msgbox-input">
            <input maxlength="4" type="text" v-model="newCode">
            <div class="code-prompt">注：邀请码30天内只能更换一次</div>
          </div>
        </div>
        <div class="code-btns">
          <button @click="cancleChangeCode" class="mint-msgbox-btn mint-msgbox-cancel">取消</button>
          <button @click="submitChangeCode" class="mint-msgbox-btn mint-msgbox-confirm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Indicator, MessageBox, Toast } from 'mint-ui';
import vFooter from './Footer.vue';
import { logout, saveStorage, getStorage, removeStorage, getSession, getJsApiConfig, baseUrl, getRequestParams, sendJsonPostRequest, closeIllegalPage, sendGetRequest, saveSession, pageRouter, isWechat, sourceType, encryptByDES, YEK_SED } from 'src/assets/utils';
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
      showTopAds: /\/index|\/tradeDetail|\/orderList/i.test(this.$route.path) && !getSession('adsClosed'),
      showTopAdsPages: /\/index|\/tradeDetail|\/orderList/i.test(this.$route.path),
      topAds: [],
      curIndex: '',
      isLoading: false,
      userInfo: {},
      sourceId: false,
      excludeReg: /\/rule|\/introduce|\/giveback/i.test(this.$route.path),
      isSlideShow: false,
      phone: '',
      realName: '',
      serverUserInfo: '',
      showGovPartnerInviteCode: true,
      showMsgBox: false,
      showFooterCover: false,
      showChangCode: false,
      newCode: '',
      ifCaptainBtn: getStorage('Whether_Become_Captain_Flag') || false,
      isExceed: false
    };
  },
  beforeRouteEnter(to, from, next) {
    if (to.path === '/index') {
      next(vm => {
        if (vm.serverUserInfo.roleType && vm.serverUserInfo.roleType === 1 && vm.phone !== getStorage('Whether_Become_Captain_Flag')) {
          vm.isBecomeCaptain();
        }
      });
      return;
    }
    next();
  },
  watch: {
    '$route' (to, from) {
      if (!this.excludeReg && !getSession('partnerticket')) {
        logout(this);
      }
      this.showTopAds = /\/index|\/tradeDetail|\/orderList/i.test(to.path) && !getSession('adsClosed');
    },
    curIndex (val) {
      this.$nextTick(() => {
        const adsScollerWrap = this.$refs.adsScollerWrap
        const adsScollerWrapW = adsScollerWrap.offsetWidth
        const adsScoller = this.$refs.adsScoller
        const adsScollerW = adsScoller.offsetWidth
        if (adsScollerW > adsScollerWrapW) {
          this.isExceed = true
        } else {
          this.isExceed = false
        }
      })
      let time = this.topAds[val].staySeconds;
      let timer = null;
      if (time > 0) {
        timer = setTimeout(() => {
          if (this.curIndex >= this.topAds.length - 1) {
            this.curIndex = 0;
            return;
          }
          this.curIndex++;
        }, time * 1000);
      } else {
        clearTimeout(timer);
      }
    }
  },
  // beforeCreate() {
  //   reload4Ios();
  // },
  created () {
    let that = this;
    Bus.$on('show-footer-cover', (ifTrue = false) => {
      console.log(ifTrue);
      that.showFooterCover = ifTrue;
    });
    Bus.$on('on-head-img-tab', (ifShow) => {
      setTimeout(() => {
        this.isSlideShow = ifShow;
      }, 10);
    });
    Bus.$on('on-inviter-bind', () => {
      setTimeout(() => {
        this.serverUserInfo = getSession('ptDetailInfo', true);
      }, 10);
    });
    console.log(getSession('ptDetailInfo', true));
    this.serverUserInfo = getSession('ptDetailInfo', true);
    if (this.serverUserInfo) {
      this.partnerId = this.serverUserInfo.id;
    }
    let phone = this.$route.query.p;
    this.phone = `${phone.substr(0, 3)}****${phone.substr(7, 4)}`;
    let obj = {
      title: '四川移动合伙人',
      desc: '猛戳进入立即注册/登录，请搜索关注“四川移动合伙人”公众号了解更多',
      link: `${window.location.origin + baseUrl}/register/wx/oAuth/userInfo`,
      imgUrl: `${window.location.origin + baseUrl}/partner/static/img/cmcc_logo.png`
    };
    let phoneNumber = encryptByDES.CBC('' + phone, YEK_SED);
    if (this.partnerId) {
      obj.title = '欢迎进入我的移动营业厅';
      obj.desc = '移动业务一键办理，号卡免费领，流量特惠办，更有超多福利等你来，点击立即进入>>';
      obj.link = `${window.location.origin + baseUrl}/common/redirect?info=path=shareshoplistenp=${phoneNumber}listenptid=${this.partnerId}`;
    }
    getJsApiConfig(obj);
    var s = document.createElement('script'); s.async = false; s.src = 'static/js/webtrends.load.js';
    var s2 = document.getElementsByTagName('script')[0]; s2.parentNode.insertBefore(s, s2);
    if (!this.excludeReg && !getSession('partnerticket')) {
      logout(this);
      return;
    }
    let srcInfo = getSession('ptSourceInfo', true);
    if (srcInfo) {
      this.userInfo = srcInfo.userInfo;
      if (!this.userInfo) {
        this.userInfo = {};
      }
      this.sourceId = this.userInfo.openid;
      if (!this.sourceId) {
        this.sourceId = this.userInfo.phone;
      }
    } else {
      if (!this.excludeReg) {
        closeIllegalPage(this);
        return;
      }
    }
    if (!isWechat() && this.userInfo.realName) {
      this.realName = this.userInfo.realName;
    }
    this.showGovPartnerInviteCode = !(sourceType === 'zhuangwei' || (sourceType === 'dzg' && this.realName));
    if (this.showTopAdsPages) this.getTopAds();
    // 添加百度统计
    // var _hmt = window._hmt || [];
    // var pageURL = window.location.href.replace(window.location.origin, '').replace(window.location.search, '').replace(/\?.*/, '');
    // _hmt.push(['_trackPageview', pageURL]);
    // (function() {
    //   var baiduUidTest = '724bc2c76f33f3ba0050cb8bd59ef2f4';
    //   var baiduUidProd = '65cc2deadf4571dcd172bbf1b4125421';
    //   var baiduUid = baiduUidProd;
    //   if (/localhost|127.0.0.1|dzgtest/.test(window.location.origin)) {
    //     baiduUid = baiduUidTest;
    //   }
    //   var tongji = document.getElementsByClassName('baidu-tongji');
    //   if (tongji.length > 0) {
    //     for (var i = 0; i < tongji.length; i++) {
    //       if (isIE() || isIE11()) {
    //         document.getElementsByClassName('baidu-tongji')[i].removeNode(true);
    //       } else {
    //         document.getElementsByClassName('baidu-tongji')[i].remove();
    //       }
    //     }
    //   }
    //   var hm = document.createElement('script');
    //   hm.className = 'baidu-tongji';
    //   hm.src = 'https://hm.baidu.com/hm.js?' + baiduUid;
    //   var s = document.getElementsByTagName('script')[0];
    //   s.parentNode.insertBefore(hm, s);
    // })();
  },
  methods: {
    isBecomeCaptain() {
      let url = `${baseUrl}/register/partner/canBecome/captain`;
      let params = {
        'phone': this.$route.query.p
      };
      let reqParams = getRequestParams(url, params, (vue, json) => {
        if (json.status === 0) {
          this.toBecomeCaptain();
        } else {
          if (getStorage('Whether_Become_Captain_Flag')) {
            removeStorage('Whether_Become_Captain_Flag');
          }
        };
      }, (vue, ex) => {
        console.log(ex);
      }, '');
      sendJsonPostRequest(this, reqParams);
    },
    toBecomeCaptain() {
      this.isSlideShow = false;
      MessageBox.confirm('', {
        message: '恭喜！由于您一个月内的业务订单达成5笔，已获得升级为队长的资格。队长可享队员业务订单的提成，请问您是否要晋升成为队长？',
        confirmButtonText: '去升级',
        cancelButtonText: '再想想'
      }).then((action) => {
        if (action === 'confirm') { // 确认的回调
          this.becomeCaptain();
        }
      }).catch((err) => {
        if (err === 'cancel') { // 取消的回调
          saveStorage('Whether_Become_Captain_Flag', this.phone);
          this.ifCaptainBtn = true;
          console.log('取消升级队长');
        }
      });
    },
    becomeCaptain() {
      Indicator.open();
      let url = `${baseUrl}/register/partner/become/captain`;
      let params = {
        'phone': this.$route.query.p
      };
      let reqParams = getRequestParams(url, params, (vue, json) => {
        Indicator.close();
        if (json.status === 0) {
          MessageBox.alert('恭喜，升级成功，您已成为队长！快去发展自己的队员吧~').then(() => {
            if (getStorage('Whether_Become_Captain_Flag')) {
              removeStorage('Whether_Become_Captain_Flag');
            }
            this.$router.replace('/login');
          });
        } else {
          Toast(json.msg);
        }
      }, (vue, ex) => {
        Indicator.close();
        console.log(ex);
      }, '');
      sendJsonPostRequest(this, reqParams);
    },
    cancleChangeCode() {
      this.isSlideShow = true;
      this.showChangCode = false;
    },
    submitChangeCode() {
      let url = `${baseUrl}/register/partner/change/captain`;
      let params = {
        'phone': this.$route.query.p,
        'inviteCode': this.newCode
      };
      let reqParams = getRequestParams(url, params, (vue, json) => {
        Indicator.close();
        vue.isLoading = false;
        if (json.status === 0) {
          MessageBox.alert('更换邀请码成功！');
          this.serverUserInfo.inviteCode = this.newCode;
          this.serverUserInfo.invitePhone = json.data.newCaptainPhone;
          saveSession('ptDetailInfo', this.serverUserInfo);
        } else {
          MessageBox.alert('更换邀请码失败！' + json.msg);
        }
      }, (vue, ex) => {
        Indicator.close();
        vue.isLoading = false;
        console.log(ex);
        Toast('网络错误，请稍后重试');
      }, '');
      Indicator.open();
      this.isLoading = true;
      this.showChangCode = false;
      sendJsonPostRequest(this, reqParams);
    },
    changeCode() {
      this.newCode = '';
      this.isSlideShow = false;
      this.showChangCode = true;
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
    getOnlineSvc: function () {
      Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_index_onlineSvc', 'WT.event', 'gpas_onlineSvc'] });
      if (this.isLoading) return;
      let url = `${baseUrl}/custom/service/url/init`;
      let params = {
        'deviceNo': this.sourceId,
        'username': this.sourceId
      };
      let reqParams = getRequestParams(url, params, this.getOnlineSvcSuc, this.getOnlineSvcFail, '');
      Indicator.open();
      this.isLoading = true;
      sendJsonPostRequest(this, reqParams);
    },
    getOnlineSvcSuc: function (vue, json) {
      Indicator.close();
      vue.isLoading = false;
      if (json.status !== 0 || !json.data) {
        MessageBox.alert(json.msg || '获取在线客服链接失败！');
        return;
      }
      window.location.href = json.data;
    },
    getOnlineSvcFail: function (vue, ex) {
      Indicator.close();
      vue.isLoading = false;
      console.log(ex);
      Toast('网络错误，请稍后重试');
    },
    getTopAds: function() {
      // saveSession('adsClosed', '1');
      // Bus.$emit('top-ads-closed', true);
      if (getSession('adsClosed')) return;
      let url = `${baseUrl}/adverTip/list?phone=${this.$route.query.p || ''}`;
      let reqParams = getRequestParams(url, '', this.getAdsSuc, this.getAdsFail);
      sendGetRequest(this, reqParams);
    },
    getAdsSuc: function(vue, json) {
      // json = {
      //   'status': 0,
      //   'msg': '成功',
      //   'data': [
      //     {
      //       'id': 1,
      //       'content': '测试有链接',
      //       'staySeconds': 5,
      //       'linkUrl': 'https://www.baidu.com',
      //       'sort': -3,
      //       'createTime': '2018-09-18 10:07:41',
      //       'enabled': 1,
      //       'remark': '22222222222222'
      //     },
      //     {
      //       'id': 2,
      //       'content': '测试一直',
      //       'staySeconds': -1,
      //       'linkUrl': '',
      //       'sort': 99,
      //       'createTime': '2018-09-18 10:46:22',
      //       'enabled': 1,
      //       'remark': '321'
      //     }
      //   ],
      //   'success': true
      // };
      console.log(json);
      if (json.status !== 0) {
        return;
      }
      vue.topAds = json.data;
      if (vue.topAds && vue.topAds.length > 0) {
        vue.curIndex = 0;
      } else {
        saveSession('adsClosed', '1');
        Bus.$emit('top-ads-closed', true);
      }
    },
    getAdsFail: function(vue, ex) {
      console.log(ex);
    },
    closeAds: function(e) {
      e.stopPropagation();
      this.showTopAds = false;
      saveSession('adsClosed', '1');
      Bus.$emit('top-ads-closed', true);
    },
    toAds: function(link) {
      if (!link) return;
      window.location.href = link;
    },
    toBindInviter: function(e) {
      e.stopPropagation();
      this.isSlideShow = false;
      pageRouter(this, { path: '/bindinviter', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } }, 'replace');
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
    toMyInviteCodes: function(e) {
      e.stopPropagation();
      this.isSlideShow = false;
      pageRouter(this, { path: '/myinvitercodes', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
    },
    exitLogin: function(e) {
      e.stopPropagation();
      // MessageBox.confirm('确定退出？').then(action => {
      //   if (action === 'confirm') {
      //     console.log('确定');
      //     // saveSession('partnerticket', '');
      //     // saveSession('ptPublicOpenId', '');
      //     // saveSession('ptDetailInfo', '');
      //     // this.$router.push('/');
      //   } else {
      //     console.log(action);
      //   }
      // }).catch(e => {
      //   console.log('catch:', e);
      // });
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
      let reqParams = getRequestParams(url, params, this.exitLoginSuc, this.exitLoginSuc, '');
      Indicator.open();
      sendJsonPostRequest(this, reqParams);
    },
    exitLoginSuc: function(vue, json) {
      Indicator.close();
      vue.showMsgBox = false;
      console.log(json);
      saveSession('partnerticket', '');
      saveSession('ptPublicOpenId', '');
      saveSession('ptDetailInfo', '');
      vue.$router.push('/');
    },
    exitLoginFail: function(vue, ex) {
      Indicator.close();
      vue.showMsgBox = false;
      Toast('网络异常！');
      console.info('退出登录异常：', ex);
    },
    switchTo: function(e) {
      e.stopPropagation();
      let url = `${window.location.origin + baseUrl}/campuspartner/pages?pageName=login&from=old`;
      window.location.href = url;
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
<style lang="less">
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
  display: flex;
  flex-wrap: nowrap;
  .top-ads-words-scroller {
    flex: 1;
    white-space: nowrap;
    &.exceed-width {
      animation: xScroll 12s 0s linear infinite;
    }
  }
}
@keyframes xScroll {
  0% {
    transform: translateX(0);
  }
  12% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
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
  animation: blink 600ms infinite;
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
  min-height: 200px;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 8px;
}
.slide-phone-no {
  font-size: 14px;
  color: #fff;
  letter-spacing: 1px;
  margin-top: 8px;
}
.slide-invitation-code {
  font-size: 14px;
  color: #fff;
  letter-spacing: 1px;
  margin-top: 8px;
  padding-bottom: 30px;
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
