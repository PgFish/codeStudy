<template>
  <div class="fee-detail" style="background: #FFFFFF; min-height: 100%; max-width: 550px; min-width: 270px; margin: 0 auto;">
    <div class="fee-detail-roulette" ref="roulette">
      <!--
          speed: 动画持续时间（毫秒），默认300
          auto: 自动播放切换的时间间隔（毫秒），默认3000
          defaultIndex: 初始显示的轮播图的索引，默认0
          continuous: 是否可以循环播放，默认true
          showIndicators: 是否显示页码小圆点，默认true
          prevent: 是否在 touchstart 事件触发时阻止事件的默认行为。设为 true 可提高运行在低版本安卓浏览器时的性能，默认false
          stopPropagation: 是否在 touchstart 事件触发时阻止冒泡，默认false
      -->
      <mt-swipe class="img-wrap"
        :auto="4000"
        :speed="300"
        :defaultIndex="0"
        :continuous="true"
        :showIndicators="true"
        :prevent="false"
        :stopPropagation="false">
        <mt-swipe-item v-if="banners.length === 0">
          <div class="no-img" v-if="isLoading">图片加载中</div>
          <div class="no-img" v-else>没有图片</div>
          <!-- <img v-else src="../../../assets/campuszone/1.png" class="no-img-img"> -->
        </mt-swipe-item>
        <mt-swipe-item :key="index" v-for="(item, index) in banners" @click.native="go($event, item.linkUrl)"><img class="img" :src="item.picUrl" :alt="item.id"></mt-swipe-item>
        <div class="clear-float"></div>
      </mt-swipe>
    </div>
    <div class="submit-btn" @click="showInputPanel">立即办理</div>
    <div class="tab-wrap">
      <div class="tab-items">
        <div class="tab-item" :class="{'tab-active': tabIndex === 0}" @click="tabSwitch($event, 0)">活动详情</div>
        <div class="tab-item" :class="{'tab-active': tabIndex === 1}" @click="tabSwitch($event, 1)">办理须知</div>
        <div class="clear-float"></div>
      </div>
      <div class="tab-content">
        <div class="tab-content-item content-left" v-if="tabIndex === 0 && /http/ig.test(result.detailUrl)"><img :src="result.detailUrl" /></div>
        <div class="tab-content-item content-right" v-if="tabIndex === 0 && !/http/ig.test(result.detailUrl)"><div style="color: #aaa;">（无）</div></div>
        <div class="tab-content-item content-right" v-if="tabIndex === 1 && result.businessRule" v-html="result.businessRule"></div>
        <div class="tab-content-item content-right" v-if="tabIndex === 1 && !result.businessRule"><div style="color: #aaa;">（无）</div></div>
      </div>
    </div>
    <div class="input-mask" v-if="inputPanelShow" @click.self="closeInputPanel" @touchmove="prevDef($event)">
      <div class="input-panel">
        <div class="panel-title">{{result.packageName}}</div>
        <div class="panel-phone">
          <palm-input type="tel" v-model="phone" maxlength="11" placeholder="请输入四川移动手机号" />
        </div>
        <div class="panel-sms">
          <palm-input type="text" v-model="sms" maxlength="6" placeholder="请输入验证码" />
          <div class="sms-btn" @click.self="getSms" :class="{'btn-disabled': isSending}">{{smsTip}}</div>
        </div>
        <div class="agree-box">
          <palm-agreement tickColor="#2d8cf7" textStyle="color:#333;" linkStyle="color:#2d8cf7;" v-model="ifAgree"></palm-agreement>
        </div>
        <div class="submit-confirm" @click.self="submit">立即办理</div>
      </div>
    </div>
  </div>
</template>

<script>
import { baseUrl, getRequestParams, sendGetRequest, sendJsonPostRequest, Constants, encryptByDES, YEK_SED, getJsApiConfig, isQQ, getSession } from 'src/assets/utils.js';
import { Indicator, MessageBox, Toast } from 'mint-ui';
// import QRCode from 'qrcode';
// import Bus from 'src/assets/bus/bus';
export default {
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  data () {
    return {
      result: '',
      banners: [],
      isLoading: false,
      screenWidth: document.body.clientWidth,
      tabIndex: 0,
      inputPanelShow: false,
      phone: '',
      sms: '',
      smsTip: '获取',
      isSending: false,
      partnerId: '',
      ifAgree: false
    };
  },
  watch: {
    screenWidth(val) {
      this.$refs.roulette.style.height = this.$refs.roulette.offsetWidth * 0.48 + 'px';
    },
    isSending(val) {
      if (val) {
        let smsCnt = 60;
        this.smsTip = smsCnt + 's';
        let timer = setInterval(() => {
          smsCnt--;
          this.smsTip = smsCnt + 's';
          if (smsCnt <= 0) {
            clearInterval(timer);
            this.isSending = false;
          }
        }, 1000);
      } else {
        this.smsTip = '获取';
      }
    }
  },
  created () {
    if (isQQ()) {
      document.title = '资费办理';
    }
    if (this.$route.query.partnerId || this.$route.query.partnerId === 0) {
      this.partnerId = this.$route.query.partnerId;
    } else {
      let serverUserInfo = getSession('ptDetailInfo', true);
      if (serverUserInfo) {
        this.partnerId = serverUserInfo.id;
      }
    }
    let that = this;
    let shareObj = {
      excuteFn: () => {
        that.getDetail();
      }
    };
    getJsApiConfig(shareObj);
  },
  mounted () {
    this.$refs.roulette.style.height = this.$refs.roulette.offsetWidth * 0.48 + 'px';
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth;
        this.screenWidth = window.screenWidth;
      })();
    };
  },
  methods: {
    prevDef: function(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    getDetail: function() {
      let url = `${baseUrl}/packageSalary/query?id=${this.$route.query.id}`;
      let reqParams = getRequestParams(
        url,
        '',
        (vue, json) => {
          vue.isLoading = false;
          Indicator.close();
          console.log(json);
          if (json.status !== 0) {
            Toast('查询资费失败。' + json.msg);
            return;
          }
          vue.banners = json.data.bannerList;
          vue.result = json.data;
          if (!vue.result.packageCode) {
            MessageBox.alert('活动已下线');
            return;
          }
          document.title = json.data.packageName || '资费办理';
          let shareObj = {
            title: json.data.shareTitle,
            desc: json.data.shareBrief,
            link: `${window.location.origin + baseUrl}/common/redirect?info=path=feedetaillistenid=${json.data.id}listenpartnerId=${this.partnerId}`,
            imgUrl: /^http/i.test(json.data.icon) ? json.data.icon : `${window.location.origin + baseUrl}/partner/static/img/cmcc_logo.png`,
            showList: [
              'menuItem:share:qq',
              'menuItem:share:weiboApp',
              'menuItem:share:appMessage',
              'menuItem:share:timeline',
              'menuItem:favorite',
              'menuItem:share:QZone'
            ]
          };
          if (this.$route.query.sysFrom === 'employee') {
            shareObj.imgUrl = `${window.location.origin + baseUrl}/partner/static/img/employee/cmcc.png`;
          }
          getJsApiConfig(shareObj);
        },
        (vue, ex) => {
          vue.isLoading = false;
          document.title = '资费办理';
          Indicator.close();
          console.info(ex);
          Toast('网络异常');
        }
      );
      Indicator.open();
      this.isLoading = true;
      sendGetRequest(this, reqParams);
    },
    go: function(e, url) {
      e.stopPropagation();
      if (url) {
        window.location.href = url;
      }
    },
    tabSwitch: function(e, index) {
      e.stopPropagation();
      this.tabIndex = index;
    },
    showInputPanel: function() {
      if (!this.result.packageCode || !this.result.id) {
        Toast('未查询到资费，请联系管理员');
        return;
      }
      this.inputPanelShow = true;
    },
    closeInputPanel: function() {
      this.inputPanelShow = false;
    },
    getSms: function() {
      if (!Constants.cmccMobileReg.test(this.phone)) {
        Toast({message: '请输入正确的移动手机号码！', duration: 1200});
        return;
      }
      if (this.isSending) {
        Toast({message: `请等待${this.smsTip}`, duration: 1200});
        return;
      }
      let url = `${baseUrl}/verifyCode/send`; // 获取短信验证码
      let params = {
        'phone': encryptByDES.CBC('' + this.phone, YEK_SED)
      };
      let reqParams = getRequestParams(url, params, (vue, json) => {
        Indicator.close();
        if (json.status === 0) {
          Toast(json.msg || '短信验证码发送成功');
        } else {
          Toast(json.msg || '短信验证码发送失败，请重试');
        }
      }, (vue, ex) => {
        Indicator.close();
        Toast('网络异常，短信验证码发送失败');
      }, '');
      Indicator.open('正在获取验证码');
      this.isSending = true;
      sendJsonPostRequest(this, reqParams);
    },
    submit: function() {
      if (!Constants.cmccMobileReg.test(this.phone)) {
        Toast({message: '请输入正确的移动手机号码！', duration: 1200});
        return;
      }
      if (!/\d{6}/.test(this.sms)) {
        Toast({message: '请输入正确的验证码！', duration: 1200});
        return;
      }
      if (!this.ifAgree) {
        Toast({message: '请阅读并同意《业务办理协议》', duration: 1200});
        return;
      }
      this.inputPanelShow = false;
      MessageBox.confirm('您确认办理该移动业务吗？').then(action => {
        console.log(action);
        if (action === 'confirm') {
          this.submitToServer();
        }
      }).catch(ex => {
        console.log(ex);
      });
    },
    submitToServer: function() {
      console.log('办理');
      let url = `${baseUrl}/business/directional/submit`;
      let params = {
        'TARIFF_INFO': {
          // 'TYPE': 'ADD_MODE_HHR',
          'TYPE': 'ADD_MODE',
          'CODE': this.result.packageCode,
          'NAME': this.result.packageName,
          'ACTIVE_CODE': this.result.packageCode,
          'FLAG_CODE': '1'
        },
        'SERVICE_INFO': {
          'PHONE_NO': '' + this.phone
        },
        'SALE_TYPE': '1',
        'EMP_INFO': {
          'EMP_CODE': 'ob0086',
          'PHONE_NO': '' + this.phone // !这里暂时改成 用户的手机号 路由
        },
        'VERIFY_INFO': {
          'TYPE': '1',
          'CODE': '' + this.sms
        },
        'MEMBER_USER_NAME': '13880451171',
        'BUSINESS_ID': this.result.id,
        'PARTNER_ID': (this.partnerId || this.partnerId === 0) ? ('' + this.partnerId) : '-1'
      };
      let reqParams = getRequestParams(url, params, (vue, json) => {
        Indicator.close();
        console.log(json);
        if (json && ('' + json.ROOT.RETURN_CODE === '0')) {
          MessageBox.alert('办理成功！').then(() => {
            // pageRouter(vue, {path: '/', query: {p: this.$route.query.p, ptid: this.$route.query.ptid}});
            vue.sms = vue.phone = '';
          });
        } else {
          Toast(json.ROOT ? (json.ROOT.DETAIL_MSG || json.ROOT.RETURN_MSG || '失败') : '失败');
        }
      }, (vue, ex) => {
        Indicator.close();
        Toast('异常: ' + ex);
      }, '');
      Indicator.open('办理中');
      sendJsonPostRequest(this, reqParams);
    }
  }
};
</script>

<style>
body {
  background: #f0f0f0;
}
.fee-detail {
  .fee-detail-roulette {
    position: relative;
    width: 100%;
  }
  .img-wrap {
    height: 100%;
    width: 100%;
  }
  .img-wrap .img {
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .no-img {
    width: 100%;
    position: absolute;
    top: 40%;
    color: #DFDFDF;
    font-size: 22px;
    font-family: '幼圆';
    font-weight: bold;
    text-align: center;
  }
  .no-img-img {
    height: 100%;
    position: absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
  }
  .submit-btn {
    width: 80%;
    max-width: 300px;
    height: 45px;
    line-height: 45px;
    text-align: center;
    margin: 15px auto;
    background: #3d8cf7;
    color: #fff;
    font-size: 16px;
    border-radius: 50px;
    cursor: pointer;
  }
  .tab-wrap, .tab-items {
    position: relative;
  }
  .tab-items {
    display: flex;
  }
  .tab-wrap .tab-items .tab-item {
    flex: 1 1 50%;
    text-align: center;
    height: 40px;
    line-height: 40px;
    margin: 0 5%;
    color: #333;
    border-bottom: 2px solid rgba(0, 0, 0, 0);
  }
  .tab-wrap .tab-items .tab-item.tab-active {
    border-bottom: 2px solid #3d8cf7;
    color: #3d8cf7;
  }
  .tab-wrap .tab-content {
    position: relative;
    width: 100%;
  }
  .tab-wrap .tab-content .tab-content-item {
    width: 100%;
    position: relative;
  }
  .tab-wrap .tab-content .tab-content-item.content-right {
    padding: 10px;
  }
  .tab-wrap .tab-content .tab-content-item img, .tab-wrap .tab-content .tab-content-item p, .tab-wrap .tab-content .tab-content-item table, .tab-wrap .tab-content .tab-content-item div {
    max-width: 100% !important;
  }
  .tab-wrap .tab-content .tab-content-item img {
    margin-bottom: -10%;
    padding: 0;
    pointer-events: none;
  }
  .input-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .5);
    /*z-index: 9;*/
    min-width: 270px;
    max-width: 550px;
    margin: 0 auto;
  }
  .input-mask .input-panel {
    background: #fff;
    position: absolute;
    top: 45%;
    transform: translateY(-45%);
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 90%;
    max-width: 400px;
    border-radius: 4px;
  }
  .input-mask .input-panel .panel-title {
    text-align: center;
    font-size: 14px;
    color: #333;
    padding: 10px 0 20px;
  }
  .input-mask .input-panel .panel-phone, .input-mask .input-panel .panel-sms {
    width: 90%;
    margin-left: 5%;
    margin-bottom: 10px;
    height: 40px;
    position: relative;
  }
  .input-mask .input-panel .panel-phone input {
    width: 100%;
    height: 100%;
    text-indent: 10px;
  }
  .input-mask .input-panel .panel-sms {
    display: flex;
  }
  .input-mask .input-panel .panel-sms input {
    flex: 1 1 100%;
    /*width: calc(100% - 90px);*/
    height: 100%;
    text-indent: 10px;
  }
  .input-mask .input-panel .panel-sms .sms-btn {
    flex: 0 0 80px;
    height: 40px;
    width: 80px;
    margin-left: 10px;
    text-align: center;
    line-height: 40px;
    background: #3d8cf7;
    color: #fff;
    font-size: 14px;
    border-radius: 4px;
    cursor: pointer;
  }
  .agree-box {
    margin: 0 20px;
  }
  .input-mask .input-panel .submit-confirm {
    height: 40px;
    line-height: 40px;
    width: 90%;
    text-align: center;
    background: #3d8cf7;
    color: #fff;
    font-size: 14px;
    border-radius: 4px;
    margin: 20px auto;
    cursor: pointer;
  }
  .input-mask .input-panel .panel-sms .sms-btn.btn-disabled {
    background: #ccc;
  }
}
</style>