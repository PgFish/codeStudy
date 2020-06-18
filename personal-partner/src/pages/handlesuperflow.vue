<template>
  <div class="superflow-detail" style="background: #FFFFFF; min-height: 100%; max-width: 550px; min-width: 270px; margin: 0 auto;">
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
    <div class="flow-list">
      <template v-for="(item, index) in flowList">
        <div class="flow-item" :key="index" :class="{'selected': index === selectedFlow, 'last-one': index % 3 === 2}" @click="switchFlow(item, index)">
          <div class="flow-item-block-wrap">
            <div class="flow-item-block">
              <div class="flow-name">{{item.packageName}}</div>
              <div class="flow-intro">{{item.packageBrief}}</div>
            </div>
          </div>
          <img class="flow-item-active-icon" src="static/img/active.png" />
        </div>
        <!-- extraCnt === 0: 没有余数，则在每行的最后一个追加flow-detail -->
        <template v-if="selectedItem.packageInstructions && extraCnt === 0">
          <div class="flow-detail" :class="computedTriangleStyle" v-if="index % 3 === 2 && parseInt(index/3, 10) === selectedLine" v-html="selectedItem.packageInstructions"></div>
        </template>
        <!-- extraCnt !== 0: 有余数，证明最后一行不足3个，则flow-detail应追加到最后一行的第extraCnt个元素后 -->
        <template v-if="selectedItem.packageInstructions && extraCnt !== 0">
          <div class="flow-detail" :class="computedTriangleStyle" v-if="(selectedLine < totalLine && index % 3 === 2 && parseInt(index/3, 10) === selectedLine) || (selectedLine===totalLine && (index+1)%3===extraCnt && parseInt(index/3, 10) === selectedLine)" v-html="selectedItem.packageInstructions"></div>
        </template>
      </template>
      <div class="clear-float"></div>
    </div>
    <div class="submit-btn" @click="showInputPanel">立即办理</div>
    <div class="tab-wrap">
      <div class="tab-items">
        <div class="tab-item" :class="{'tab-active': tabIndex === 0}" @click="tabSwitch($event, 0)">业务简介</div>
        <div class="tab-item" :class="{'tab-active': tabIndex === 1}" @click="tabSwitch($event, 1)">业务详情</div>
        <!-- <div class="clear-float"></div> -->
      </div>
      <div class="tab-content">
<!--         <div class="tab-content-item content-left" v-if="tabIndex === 0 && /http/ig.test(preferentialFlow.detailUrl)"><img :src="selectedItem.detailUrl" /></div> -->
        <div class="tab-content-item content-right" v-if="tabIndex === 0 && preferentialFlow.detailUrl" v-html="preferentialFlow.detailUrl"></div>
        <div class="tab-content-item content-right" v-if="tabIndex === 0 && !preferentialFlow.detailUrl"><div style="color: #aaa;">（无）</div></div>
        <div class="tab-content-item content-right" v-if="tabIndex === 1 && preferentialFlow.businessRule" v-html="preferentialFlow.businessRule"></div>
        <div class="tab-content-item content-right" v-if="tabIndex === 1 && !preferentialFlow.businessRule"><div style="color: #aaa;">（无）</div></div>
      </div>
    </div>
    <div class="input-mask" v-if="inputPanelShow" @click.self="closeInputPanel" @touchmove="prevDef($event)">
      <div class="input-panel">
        <div class="panel-title">{{selectedItem.packageName}}</div>
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
      flowList: [],
      selectedFlow: 0,
      selectedLine: 0,
      selectedItem: {},
      preferentialFlow: {},
      computedTriangleStyle: 'flow-detail-0',
      totalLine: 1,
      extraCnt: 0,
      TYPE_MODE_MAP: {
        0: 'MAIN_MODE',
        1: 'ADD_MODE',
        2: 'BUSINESS_MODE',
        3: 'BUSINESS_SMS_MODE'
      },
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
        that.getList();
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
    switchFlow: function(item, index) {
      this.selectedFlow = index;
      this.selectedLine = parseInt(index / 3, 10); // 当前选中行
      console.log('行码：', this.selectedLine);
      this.selectedItem = item;
      this.computedTriangleStyle = `flow-detail-${index % 3}`; // 设置三尖角位置
    },
    prevDef: function(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    getList: function() {
      let url = `${baseUrl}/packageSalary/getByPfId`;
      let params = {
        'pfId': this.$route.query.id
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          vue.isLoading = false;
          Indicator.close();
          console.log(json);
          if (json.status !== 0) {
            Toast('查询资费失败。' + json.msg);
            return;
          }
          vue.banners = json.data.bannerList;
          vue.flowList = json.data.packageSalaryList;
          if (!vue.flowList || (vue.flowList && vue.flowList.length <= 0)) {
            MessageBox.alert('活动已下线');
            return;
          }
          vue.preferentialFlow = json.data.preferentialFlow;
          vue.totalLine = parseInt(vue.flowList.length / 3, 10) - 1; // 总行数totalLine。为了和selectedLine保持一致，第一行为0
          vue.extraCnt = vue.flowList.length % 3; // 余数
          if (vue.extraCnt !== 0) {
            vue.totalLine = vue.totalLine + 1; // 余数如果不为0，则行数应+1
          }
          console.log(vue.extraCnt);

          vue.selectedItem = this.flowList[0];
          let currentProduct = json.data.preferentialFlow;
          document.title = currentProduct.productName || '资费办理';
          let shareTitle = currentProduct.shareTitle || currentProduct.productName;
          let shareBrief = currentProduct.shareBrief || currentProduct.typeIntroduce;
          let shareUrl = `${window.location.origin + baseUrl}/common/redirect?info=path=handlesuperflowlistenid=${currentProduct.id}listenpartnerId=${vue.partnerId}`;
          let shareIcon = /^http/i.test(currentProduct.icon) ? currentProduct.icon : `${window.location.origin + baseUrl}/partner/static/img/cmcc_logo.png`;
          let shareObj = {
            title: shareTitle,
            desc: shareBrief,
            link: shareUrl,
            imgUrl: shareIcon,
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
      if (!this.selectedItem.packageCode || !this.selectedItem.id) {
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
          'TYPE': this.TYPE_MODE_MAP[this.selectedItem.packageTariffType] || 'ADD_MODE',
          'CODE': this.selectedItem.packageCode,
          'NAME': this.selectedItem.packageName,
          'ACTIVE_CODE': this.selectedItem.packageCode,
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
        'BUSINESS_ID': this.selectedItem.id,
        'PARTNER_ID': (this.partnerId || this.partnerId === 0) ? ('' + this.partnerId) : '-1',
        'CATEGORY_TYPE': 0
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
.superflow-detail {
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
  .flow-list {
    position: relative;
    width: 100%;
    flex-wrap: wrap;
    padding: 10px 20px;
    .flow-item {
      border: 1px solid #cecece;
      border-radius: 4px;
      width: 30%;
      float: left;
      height: 70px;
      margin: 10px 0;
      margin-right: 5%;
      text-align: center;
      position: relative;
      /*overflow: hidden;*/
      color: #333;
      font-size: 12px;
      &.last-one {
        margin-right: 0;
      }
      .flow-item-block-wrap {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
      }
      .flow-item-active-icon {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 20px;
        display: none;
        transform: translateX(0px);
      }
      &.selected {
        border: 1px solid #3d8cf7;
        .flow-item-active-icon {
          display: block;
        }
      }
      .flow-item-block {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        transform: translateY(-50%);
        .flow-name {
          font-size: 14px;
        }
        .flow-intro {
          color: #999;
        }
        * {
          word-break: break-all;
        }
      }
    }
    .flow-detail {
      width: 100%;
      float: left;
      min-height: 40px;
      border: 1px solid #b3cdd6;
      margin: 0 auto;
      border-radius: 6px;
      padding: 12px 4px;
      background: #e4f6fd;
      color: #333;
      font-size: 12px;
      position: relative;
      &:before {
        left: calc(15% - 6px);
        content: "";
        width: 0;
        height: 0;
        position: absolute;
        top: -12px;
        border: 6px solid transparent;
        border-bottom-color: #b3cdd6;
      }
      &:after {
        left: calc(15% - 6px);
        content: "";
        width: 0;
        height: 0;
        position: absolute;
        top: -10px;
        border: 6px solid transparent;
        border-bottom-color: #e4f6fd;
      }
      &.flow-detail-0 {
        &:before {
          left: calc(15% - 6px);
        }
        &:after {
          left: calc(15% - 6px);
        }
      }
      &.flow-detail-1 {
        &:before {
          left: calc(50% - 6px);
        }
        &:after {
          left: calc(50% - 6px);
        }
      }
      &.flow-detail-2 {
        &:before {
          left: calc(85% - 6px);
        }
        &:after {
          left: calc(85% - 6px);
        }
      }
    }
  }
  .tab-wrap, .tab-items {
    position: relative;
  }
  .tab-items {
    display: flex;
    border-top: 1px solid #efefef;
    border-bottom: 1px solid #efefef;
  }
  .tab-wrap .tab-items .tab-item {
    flex: 1 1 50%;
    text-align: center;
    height: 40px;
    line-height: 40px;
    /*margin: 0 5%;*/
    color: #333;
    font-size: 14px;
    background: #eee;
    /*border-bottom: 2px solid rgba(0, 0, 0, 0);*/
  }
  .tab-wrap .tab-items .tab-item.tab-active {
    /*border-bottom: 2px solid #3d8cf7;*/
    /*color: #3d8cf7;*/
    background: #fff;
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
    padding: 0;
    display: block;
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
    width: 0;
    flex: 1;
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
  .input-mask .input-panel .agree-box {
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