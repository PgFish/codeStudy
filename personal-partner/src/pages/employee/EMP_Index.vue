<template>
  <div class="index">
    <div class="header">
      <img src="static/img/employee/share-bg.png" alt="">
      <img @click="editNickName" class="header-edit" src="static/img/employee/edit.png" alt="">
      <div class="header-top">
        <div class="header-profile-header">
        <div class="head-img">
          <img :src="realName ? 'static/img/dzg_head_img.png' : (userInfo.headimgurl || 'static/img/cmcc_logo.png')">
        </div>
        <div class="user-info">
          <div class="phone-no"><div>{{nickName}}</div>{{phone}}</div>
        </div>
      </div>
      <div class="header-profile-box">
        <div class="middle">
          <template>
            <div class="middle-item deal-finish" @click="toOrderList">
              <div class="middle-item-number">{{baseInfo.orderNum ? pInt(baseInfo.orderNum) : 0}}</div>
              <div class="middle-item-text"><img class="icon" src="static/img/employee/order_num.png" />已成交(单)</div>
            </div>
            <div class="split-line"></div>
            <div class="middle-item receive-profit" @click="toOrderList">
              <div class="middle-item-number">{{baseInfo.integral ? round(baseInfo.integral) : 0}}</div>
              <div class="middle-item-text"><img class="icon" src="static/img/employee/points.png" />到账积分</div>
            </div>
          </template>
        </div>
      </div>
      </div>
      <img class="header-bg" src="static/img/employee/banner.png" />
    </div>
    <div class="category-list" v-if="list.length > 0">
      <template v-for="(category, j) in list">
        <div :key="'category_' + category.id" class="category-item" :class="{'category-item-selected': selectedCategory === category.id}" @click="categoryChange(category.id)">
          <div class="category-divider" v-if="j > 0"></div>
          <div class="category-name" :class="{'is-ios': isIOS}">{{category.name}}</div>
        </div>
      </template>
    </div>
    <div class="fee-list">
      <div v-for="(category, j) in list" v-show="category.id === selectedCategory">
        <template v-for="(fee, i) in category.packageList">
          <div class="fee-item" :class="{'fee-item-1': i === 0}" :key="'category_' + category.id + '_fee_' + fee.id" @click="jump(fee.publicUrl, fee.id, category.id)">
            <div class="fee-img">
              <img :src="fee.icon ? fee.icon : 'static/img/employee/defaut-bg.png'">
            </div>
            <template v-if="'' + category.id !== '2'">
              <div class="fee-intro">
                <div class="fee-title">{{fee.packageName}}</div>
                <div class="fee-profile">{{fee.packageBrief}}</div>
                <div class="fee-share-profit">分享赚{{round(fee.integral)}}积分</div>
              </div>
            </template>
            <!-- 特惠流量处理 -->
            <template v-else>
              <div class="fee-intro">
                <div class="fee-title fee-title-superflow">{{fee.productName}}</div>
                <div class="fee-profile">{{fee.typeIntroduce}}</div>
                <div class="fee-share-profit">分享赚{{round(fee.integral)}}积分</div>
              </div>
            </template>
            <div class="fee-operations" @click="prevDef($event)">
              <div class="oper-btn" :class="{'oper-btn-active': expandArr.indexOf('category_' + category.id + '_fee_' + fee.id) >= 0}" @click="expand($event, fee, category.id)">
                <div class="btn-img">
                  <img src="static/img/index/btn_data.png" alt="">
                </div>
                <div class="btn-text">数据</div>
              </div>
              <div class="oper-btn btn-qr-code" @click="showQrCode($event, fee, category.id)">
                <div class="btn-img">
                  <img src="static/img/index/btn_qrcode.png" alt="">
                </div>
                <div class="btn-text">二维码</div>
              </div>
              <div class="oper-btn btn-share" @click="share($event, fee, category.id)">
                <div class="btn-img">
                  <img src="static/img/index/btn_share.png" alt="">
                </div>
                <div class="btn-text">分享</div>
              </div>
            </div>
          </div>
          <div class="fee-data" :class="{'fee-data-show': expandArr.indexOf('category_' + category.id + '_fee_' + fee.id) >= 0}">
            <!-- <div class="fee-data-order-no">预估收益：{{pInt(fee.integral)}}</div> -->
            <div class="fee-data-order-no">订单量：{{pInt(fee.orderNum)}}</div>
          </div>
        </template>
      </div>
    </div>
    <div v-if="!lastPage && isLoading" class="is-loading">加载中...</div>
    <div v-if="list.length === 0 && !isLoading" class="no-record">产品升级中，敬请期待...</div>
    <div class="tip-layer" v-if="tipShow" @touchmove="prevDef($event)" @click="closeTipLayer">
      <!-- <div class="close-btn">
        <img src="static/img/btn_close.png">
      </div> -->
      <div class="top-tip">戳这里完成分享</div>
      <img class="connect-string" src="static/img/index/connect_string.png">
      <img class="pointer-hand" src="static/img/index/hand.png">
      <!-- <div class="canvas-area"><img :src="posterSrc"></div> -->
      <!-- <div class="qr-tip">扫码分享</div> -->
    </div>

    <div class="tip-layer qrcode-layer" v-if="qrcodeShow" @touchstart="touchStart" @touchend="touchEnd" @touchmove="prevDef($event)" @click="closeQrcodeLayer">
      <div class="canvas-area"><img :src="posterSrc"></div>
    </div>
    <!-- 引导用户分享 -->
    <div class="share-guide" :class="{'has-top-ads': !noTopAds}" @touchmove="prevDef($event)" ref="shareGuide" v-if="showShareGuide">
      <div class="share-guide-padding" :class="{'is-ios': isIOS}"></div>
      <div class="fee-list" :class="{'is-ios': isIOS}">
        <div v-for="(category, j) in list" v-show="category.id === selectedCategory" :key="j">
          <template v-for="(fee, i) in category.packageList">
            <div class="fee-item" :class="{'fee-item-1': i === 0}" :key="'category_' + category.id + '_fee_' + fee.id">
              <div class="fee-img dom-unvisible">
                <img :src="fee.icon">
              </div>
              <div class="fee-intro dom-unvisible">
                <div class="fee-title">{{fee.packageName}}</div>
                <div class="fee-profile">{{fee.packageBrief}}</div>
                <div class="fee-share-profit">分享赚{{round((fee.activateSalary - 0) + (fee.firstRechargeSalary - 0))}}积分</div>
              </div>
              <div class="fee-operations" @click="prevDef($event)">
                <div class="oper-btn dom-unvisible" :class="{'oper-btn-active': expandArr.indexOf('category_' + category.id + '_fee_' + fee.id) >= 0}" @click="expand($event, fee, category.id)">
                  <div class="btn-img">
                    <img src="static/img/index/btn_data.png" alt="">
                  </div>
                  <div class="btn-text">数据</div>
                </div>
                <div class="oper-btn btn-qr-code dom-unvisible">
                  <div class="btn-img">
                    <img src="static/img/index/btn_qrcode.png" alt="">
                  </div>
                  <div class="btn-text">二维码</div>
                </div>
                <div class="oper-btn btn-share" @click="shareByGuide($event, fee, category.id)">
                  <div class="btn-img">
                    <img src="static/img/index/btn_share.png" alt="">
                  </div>
                  <div class="btn-text">分享</div>
                </div>
              </div>
              <span class="share-guide-text">分享赚{{round((fee.activateSalary - 0) + (fee.firstRechargeSalary - 0))}}积分</span>
            </div>
            <div class="fee-data dom-unvisible" :class="{'fee-data-show': expandArr.indexOf(i) >= 0}">
              <div class="fee-data-order-no">订单量：{{pInt(fee.orderNum)}}</div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSession, baseUrl, getRequestParams, sendGetRequest, sendJsonPostRequest, showMenuItems, saveStorage,
  getStorage, isWechat, handleShare, pageRouter, saveSession, encryptByDES, YEK_SED, isIOS } from 'src/assets/utils.js';
import { Indicator, MessageBox, Toast } from 'mint-ui';
import QRCode from 'qrcode';
import Bus from 'src/assets/bus/bus';
export default {
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  data () {
    return {
      baseInfo: {},
      userInfo: {},
      phone: '',
      realName: '',
      pageNumber: 1,
      pageSize: 10,
      lastPage: false,
      isNoRecord: false,
      isLoading: true,
      topStatus: '',
      list: [],
      expandArr: [],
      currentShareFee: {},
      tipShow: false,
      posterSrc: '',
      guide: ['static/img/guide/new_guide1.png', 'static/img/guide/new_guide2.png', 'static/img/guide/new_guide3.png'],
      zwGuide: ['static/img/guide/zw_guide1.png', 'static/img/guide/zw_guide2.png', 'static/img/guide/zw_guide3.png'],
      num: 0, // 引导页
      showGuide: false,
      showfirst: true,
      showIndex: false,
      consoleLogs: '',
      introduceRedDot: false,
      ruleRedDot: false,
      actRedDot: false,
      isZW: false,
      qrcodeShow: false,
      partnerId: '',
      showAds: false,
      showShareGuide: false,
      noTopAds: false,
      selectedCategory: '',
      isIOS: isIOS(),
      roleType: 1,
      nickName: ''
    };
  },
  watch: {},
  created () {
    Indicator.close();
    document.title = '店铺';
    let that = this;
    Bus.$on('top-ads-closed', ifTrue => {
      that.noTopAds = ifTrue && getSession('adsClosed');
    });
    setTimeout(() => {
      that.noTopAds = getSession('adsClosed');
    }, 50);
    /*
    *  2018年12月31日23时59分活动下线
    *  2019年3月31日23时59分活动下线 - 2019/1/3 16:17改
    */
    // let deadLineTime = new Date(2019, 2, 31, 23, 59, 59, 0).getTime();
    // let currentTime = new Date().getTime();
    // let expired = currentTime >= deadLineTime;

    this.introduceRedDot = getStorage('pt_shop_introduce_red_dot_' + this.$route.query.p, true); // 首页合伙人介绍红点
    this.ruleRedDot = getStorage('pt_shop_rule_red_dot_' + this.$route.query.p, true); // 首页返利规则红点
    this.actRedDot = !getStorage('pt_shop_act_red_dot_clicked_' + this.$route.query.p, true); // 首页活动入口红点
    console.log(this.introduceRedDot, this.ruleRedDot);
    // console.log(window.localStorage.getItem('firstLoad'));
    // let firstLoad = window.localStorage.getItem('firstLoad');
    // console.log('1', this.showGuide);
    let serverUserInfo = getSession('ptDetailInfo', true); // 获取服务器返回的用户信息
    this.nickName = serverUserInfo.nickName ? serverUserInfo.nickName : serverUserInfo.name;
    console.log(serverUserInfo);
    if (serverUserInfo) {
      this.partnerId = serverUserInfo.id;
      this.inviteCode = serverUserInfo.inviteCode;
      this.roleType = serverUserInfo.roleType;
    }
    this.serverUserInfo = serverUserInfo;
    let phone = this.$route.query.p;
    this.getGuideCompletedObject(phone);
    this.phone = `${phone.substr(0, 3)}****${phone.substr(7, 4)}`;
    Indicator.open();
    // this.getConfig();
    this.loginCount();
    this.getList();
  },
  mounted () {
  },
  methods: {
    editNickName() {
      let self = this;
      MessageBox.prompt('修改昵称', '', {
        inputValue: (self.serverUserInfo.nickName ? self.serverUserInfo.nickName : self.serverUserInfo.name)
      }).then((val) => {
        if (val.action === 'confirm') {
          console.log(val.value);
          let url = `${baseUrl}/register/change/name`;
          let params = {
            phone: self.$route.query.p,
            name: val.value
          };
          let reqParams = getRequestParams(
            url,
            params,
            (vue, json) => {
              if (json.status === 0) {
                self.nickName = val.value;
                self.serverUserInfo.nickName = val.value;
                Toast('修改成功');
                saveSession('ptDetailInfo', self.serverUserInfo);
                saveStorage('ptDetailInfo', self.serverUserInfo);
              } else {
                Toast(json.msg);
              }
            },
            () => {
              Toast('网络错误');
            }
          );
          sendJsonPostRequest(this, reqParams);
        } else {
          console.log('取消');
        }
      }).catch((err) => {
        if (err === 'cancel') { // 取消的回调
          console.log('取消');
        }
      });
    },
    loginCount: function() {
      let loginOnce = getSession('loginOnce', true);
      if (loginOnce) return;
      saveSession('loginOnce', '1');
      let url = `${baseUrl}/register/login/count?partnerId=${this.partnerId}`;
      let reqParams = getRequestParams(url);
      sendGetRequest(this, reqParams);
    },
    categoryChange: function(categoryId) {
      this.selectedCategory = categoryId;
    },
    shareShop: function() {
      this.shareCount();
      let phoneNumber = encryptByDES.CBC('' + this.$route.query.p, YEK_SED);
      let url = `${baseUrl}/shareStatistics/statisticShare?phoneNumber=${phoneNumber}&type=1`; // type=1表示点击分享按钮，type=2表示进入分享页面
      let reqParams = getRequestParams(url); // 统计不需要处理返回值
      sendGetRequest(this, reqParams);
      let shareUrl = `${window.location.origin + baseUrl}/common/redirect?info=path=shareshoplistenp=${phoneNumber}listenptid=${this.partnerId}`;
      console.log(shareUrl);
      if (!isWechat()) {
        Indicator.close();
        let shareObj = {
          shareTitle: '欢迎进入我的移动营业厅',
          shareDesc: '移动业务一键办理，号卡免费领，流量特惠办，更有超多福利等你来，点击立即进入>>',
          shareLink: shareUrl,
          sharePic: `${window.location.origin + baseUrl}/partner/static/img/employee/cmcc.png`
        };
        handleShare(this, shareObj);
        return;
      }
      let obj = {
        title: '欢迎进入我的移动营业厅',
        desc: '移动业务一键办理，号卡免费领，流量特惠办，更有超多福利等你来，点击立即进入>>',
        link: shareUrl,
        imgUrl: `${window.location.origin + baseUrl}/partner/static/img/employee/cmcc.png`
      };
      // wx.ready(function() {
      showMenuItems();
      // 监听“发送给好友”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareAppMessage(obj);
      // 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareTimeline(obj);
      // 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareQQ(obj);
      // 监听“分享到微博”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareWeibo(obj);
      // 监听“分享到QQ空间”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareQZone(obj);
      // });
      // wx.updateAppMessageShareData(obj);
      // wx.updateTimelineShareData(obj);
      this.showTipLayer();
    },
    inviteRegister: function(e) {
      e.stopPropagation();
      if (!this.inviteCode) {
        Toast('没有邀请码，请联系管理员');
        return;
      }
      let obj = {
        title: '四川移动合伙人',
        desc: '猛戳进入立即注册/登录，请搜索关注“四川移动合伙人”公众号了解更多',
        link: `${window.location.origin + baseUrl}/register/wx/oAuth/userInfo?info=inviteCode=${this.inviteCode}`,
        imgUrl: `${window.location.origin + baseUrl}/partner/static/img/employee/cmcc.png`
      };
      if (!isWechat()) {
        Indicator.close();
        let shareObj = {
          shareTitle: obj.title,
          shareDesc: obj.desc,
          shareLink: obj.link,
          sharePic: obj.imgUrl
        };
        handleShare(this, shareObj);
        return;
      }
      showMenuItems();
      // 监听“发送给好友”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareAppMessage(obj);
      // 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareTimeline(obj);
      // 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareQQ(obj);
      // 监听“分享到微博”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareWeibo(obj);
      // 监听“分享到QQ空间”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareQZone(obj);
      this.showTipLayer();
    },
    closeAds: function(e) {
      this.showAds = false;
      saveSession('hideIndexAds', true);
    },
    shareByGuide: function(e, fee, categoryId) {
      e.stopPropagation();
      saveStorage('hideShareGuide_' + this.$route.query.p, true);
      this.showShareGuide = false;
      Bus.$emit('show-footer-cover', this.showShareGuide);
      this.share(e, fee, categoryId);
    },
    shareCount: function() {
      if (getSession('new_task_shared_once', true)) {
        return;
      }
      let url = `${baseUrl}/newuserTask/share`;
      let params = {
        'partner_phone': this.$route.query.p
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          if (json.status === 0) {
            saveSession('new_task_shared_once', true);
          }
        }
      );
      sendJsonPostRequest(this, reqParams);
    },
    getGuideCompletedObject: function (phone) {
      let guideCompletedObj = {};
      this.consoleLogs += '<p>____________</p><p>进入页面时：' + getStorage('guideCompleted') + '</p>';
      if (getStorage('guideCompleted')) {
        guideCompletedObj = getStorage('guideCompleted');
      }
      if (guideCompletedObj[phone]) {
        this.showGuide = false;
        this.showIndex = true;
        this.showfirst = false;
      } else {
        this.showGuide = false;
        this.showfirst = true && !/followreward/.test(this.$route.query.from); // 如果不是从关注有礼进来的，且从来没显示过新手引导，则显示有移动LOGO的新手引导
        this.showIndex = false || /followreward/.test(this.$route.query.from); // 如果从关注有礼进来的，或者没显示过新手引导，则不显示首页
      }
    },
    guideCompleted: function () {
      let phone = this.$route.query.p || '';
      let guideCompleted = {};
      if (getStorage('guideCompleted')) {
        guideCompleted = getStorage('guideCompleted');
      }
      guideCompleted[phone] = true;
      saveStorage('guideCompleted', guideCompleted);
      this.consoleLogs += '<p>完成引导后：' + getStorage('guideCompleted') + '</p>';
    },
    gotoGuide: function () {
      this.showfirst = false;
      this.showGuide = true;
      this.showIndex = false;
    },
    gotoIndex: function () {
      this.showfirst = false;
      this.showIndex = true;
      this.showGuide = false;
      // window.localStorage.setItem('firstLoad', 3);
      this.guideCompleted();
    },
    guideStart: function () {
      this.num++;
      if (this.isZW) {
        this.num++;
      }
      if (this.num > 2) {
        // window.localStorage.setItem('firstLoad', '3');
        this.guideCompleted();
        this.showGuide = false;
        this.showIndex = true;
      }
    },
    round: function (val, n) {
      var result = parseFloat(val);
      if (!n && n !== 0) n = 2;
      return Math.round(result * Math.pow(10, n)) / Math.pow(10, n);
    },
    roundKeep: function (val, n) {
      var result = parseFloat(val);
      if (!n && n !== 0) n = 2;
      var resultStr = result.toString();
      var dotPos = resultStr.indexOf('.');
      if (dotPos < 0) {
        dotPos = resultStr.length;
        resultStr += '.';
      }
      while (resultStr.length <= (dotPos + n)) {
        resultStr += '0';
      }
      return resultStr;
    },
    pInt: function (val) {
      return parseInt(val, 10);
    },
    prevDef: function (e) {
      e.stopPropagation();
      e.preventDefault();
    },
    getList: function () {
      // let url = `${baseUrl}/packageSalary/list?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}&phone=${this.$route.query.p}`;
      let url = `${baseUrl}/packageSalary/list?phone=${this.$route.query.p}`;
      let reqParams = getRequestParams(url, '', this.getListSuc, this.getListFail, '');
      sendGetRequest(this, reqParams);
    },
    getListSuc: function (vue, json) {
      vue.isLoading = false;
      Indicator.close();
      console.log(json);
      if (json.status !== 0) {
        Toast(json.msg || '没有可选的资费');
        return;
      }
      vue.baseInfo = {
        'accountSalary': json.data.accountSalary,
        'drawSalary': json.data.drawSalary,
        'estimateSalary': json.data.estimateSalary,
        'orderNum': json.data.orderNum,
        'todayOrderNum': json.data.todayOrderNum,
        'integral': json.data.integral
      };
      vue.list = vue.list.concat(json.data.categoryList);
      if (vue.list.length > 0) {
        vue.selectedCategory = vue.list[0].id;
        let hideShareGuide = getStorage('hideShareGuide_' + this.$route.query.p, true); // 本次关闭引导分享的遮罩
        console.log(hideShareGuide);
        this.showShareGuide = /followreward/.test(this.$route.query.from) && !hideShareGuide; // 显示引导分享的遮罩
        Bus.$emit('show-footer-cover', this.showShareGuide);
      }
      // vue.lastPage = json.data.packageSalarys.lastPage;
      // vue.isNoRecord = json.data.packageSalarys.totalRow <= 0;
    },
    getListFail: function (vue, ex) {
      vue.isLoading = false;
      Toast('网络异常');
      Indicator.close();
    },
    loadTop: function () {
      this.pageNumber = 1;
      this.list = [];
      this.expandArr = [];
      this.lastPage = false;
      this.isLoading = true;
      this.getList();
      this.$refs.loadFresh.onTopLoaded();
    },
    handleTopChange: function (status) {
      this.topStatus = status;
    },
    loadMore: function () {
      if (this.lastPage || this.isLoading || this.isNoRecord) return; // 当最后一页时或者当页面正在加载下一页时，阻止访问接口
      this.isLoading = true;
      this.pageNumber++;
      this.getList();
    },
    expand: function (e, fee, categoryId) {
      e.stopPropagation();
      var findIndex = this.expandArr.indexOf('category_' + categoryId + '_fee_' + fee.id);
      if (findIndex >= 0) {
        this.expandArr.splice(findIndex, 1);
      } else {
        this.expandArr.push('category_' + categoryId + '_fee_' + fee.id);
      }
    },
    toOrderList: function () {
      pageRouter(this, { path: '/emp/orderList', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
    },
    toRule: function () {
      this.ruleRedDot = false;
      saveStorage('pt_shop_rule_red_dot_' + this.$route.query.p, false);
      pageRouter(this, { path: '/rule', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
    },
    toIntro: function () {
      this.introduceRedDot = false;
      saveStorage('pt_shop_introduce_red_dot_' + this.$route.query.p, false);
      pageRouter(this, { path: '/introduce', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
    },
    toActivity: function () {
      this.actRedDot = false;
      saveStorage('pt_shop_act_red_dot_clicked_' + this.$route.query.p, true);
      pageRouter(this, { path: '/activity', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
    },
    toTask: function() {
      console.log('去任务中心');
    },
    // toPromiseFee: function() {
    //   console.log('权益新升级');
    //   let prefix = window.location.href.split('#/')[0];
    //   let url = prefix + '&partnerId=' + this.partnerId + '#/promisefee';
    //   window.location.href = url;
    // },
    jump: function (url, feeId, categoryId) {
      if ('' + categoryId === '1') { // 0元号卡资费，跳转本地页面
        let jumpUrl = this.buildUrl(url);
        window.location.href = jumpUrl;
      } else if ('' + categoryId === '2') { // 特惠流量，跳转本地页面
        pageRouter(this, { path: '/handlesuperflow', query: { id: feeId, sysFrom: 'employee' } });
      } else if ('' + categoryId === '5') { // 合家欢，跳转本地页面
        pageRouter(this, { path: '/familyDetail', query: { id: feeId } });
      } else {
        pageRouter(this, { path: '/feedetail', query: { id: feeId, sysFrom: 'employee' } });
      }
    },
    share: function (e, fee, categoryId) {
      e.stopPropagation();
      this.shareCount();
      let shareUrl = this.buildUrl(fee.publicUrl);
      if ('' + categoryId !== '1') { // 非0元号卡资费，跳转本地页面
        shareUrl = this.buildInnerUrl(fee.id);
        if ('' + categoryId === '2') {
          shareUrl = this.buildCustomShareUrl('handlesuperflow', fee.id);
        } else if ('' + categoryId === '5') {
          shareUrl = this.buildCustomShareUrl('familyDetail', fee.id);
        }
      }
      let shareTitle = fee.shareTitle || fee.packageName;
      let shareBrief = fee.shareBrief || fee.packageBrief;
      if ('' + categoryId === '2') { // 特惠流量
        shareTitle = fee.shareTitle || fee.productName;
        shareBrief = fee.shareBrief || fee.typeIntroduce;
      }
      let shareIcon = `${window.location.origin + baseUrl}/partner/static/img/employee/cmcc.png`;
      if (!isWechat()) {
        Indicator.close();
        console.log(fee);
        let shareObj = {
          shareTitle: shareTitle,
          shareDesc: shareBrief,
          shareLink: shareUrl,
          sharePic: shareIcon
        };
        handleShare(this, shareObj);
        return;
      }
      this.currentShareFee = {};
      console.log(fee);
      // let shareUrl = this.buildUrl(fee.publicUrl);
      let obj = {
        title: shareTitle,
        desc: shareBrief,
        link: shareUrl,
        imgUrl: shareIcon
      };
      // wx.ready(function() {
      showMenuItems();
      // 监听“发送给好友”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareAppMessage(obj);
      // 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareTimeline(obj);
      // 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareQQ(obj);
      // 监听“分享到微博”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareWeibo(obj);
      // 监听“分享到QQ空间”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareQZone(obj);
      // });
      // wx.updateAppMessageShareData(obj);
      // wx.updateTimelineShareData(obj);
      this.showTipLayer(fee);
    },
    buildUrl: function (originUrl, shareType) {
      if (/\?/.test(originUrl)) {
        originUrl += `&userId=${this.$route.query.ptid}`;
      } else {
        originUrl += `?userId=${this.$route.query.ptid}`;
      }
      if (!/rs=/i.test(originUrl)) {
        originUrl += `&rs=280105`;
      }
      let url = `${window.location.origin + baseUrl}/packageSalary/share?url=${encodeURIComponent(originUrl)}`;
      if (shareType === 'qr') {
        url = originUrl;
      }
      return url;
    },
    buildInnerUrl: function(feeId) {
      let url = `${window.location.origin + baseUrl}/common/redirect?info=path=feedetaillistenid=${feeId}listenpartnerId=${this.partnerId}`;
      url += `listensysFrom=employee`;
      return url;
    },
    buildCustomShareUrl: function(pageName, id) {
      let url = `${window.location.origin + baseUrl}/common/redirect?info=path=${pageName}listenid=${id}listenpartnerId=${this.partnerId}`;
      url += `listensysFrom=employee`;
      return url;
    },
    showQrCode: function(e, fee, categoryId) {
      e.stopPropagation();
      Indicator.open();
      this.currentShareFee = fee;
      this.currentShareCategoryId = categoryId;
      this.drawPoster();
    },
    closeQrcodeLayer: function() {
      if (this.duringTime >= 600) {
        return;
      }
      this.currentShareFee = {};
      this.qrcodeShow = false;
    },
    showTipLayer: function (fee) {
      this.tipShow = true;
      // Indicator.open();
      // this.drawPoster();
    },
    closeTipLayer: function () {
      this.currentShareFee = {};
      this.tipShow = false;
    },
    // poster, qrUrl, qrX, qrY, qrW, qrH,
    drawPosterByParams: function (params) {
      console.log(params);
      if (!params.qrText) {
        Indicator.close();
        return;
      }
      var scaleNum = 2.5; // 画布扩大倍数
      var opts = {
        errorCorrectionLevel: 'Q',
        type: 'image/png',
        width: params.qrW * scaleNum,
        rendererOpts: {
          quality: 0.3
        },
        margin: params.qrMargin || 0
      };
      QRCode.toCanvas(params.qrText, opts).then(qrCanvas => {
        console.log('画好了');
        var qrLogo = new Image();
        qrLogo.setAttribute('crossOrigin', 'Anonymous'); // 图片跨域
        qrLogo.src = params.qrLogo; // 设置二维码LOGO图片
        qrLogo.onerror = () => {
          this.consoleLogs += '<p>Logo加载失败</p>';
          Indicator.close();
        };
        qrLogo.onload = () => {
          this.consoleLogs += '<p>开始在二维码上画LOGO</p>';
          qrCanvas.getContext('2d').drawImage(qrLogo, (params.qrW - params.qrLogoW) / 2 * scaleNum, (params.qrH - params.qrLogoH) / 2 * scaleNum, params.qrLogoW * scaleNum, params.qrLogoH * scaleNum); // 在二维码上画LOGO

          var posterCanvas = document.createElement('canvas');
          posterCanvas.setAttribute('style', 'width: ' + params.bgW + 'px; height: ' + params.bgH + 'px'); // 设置画布样式大小
          posterCanvas.setAttribute('width', '' + (params.bgW * scaleNum));
          posterCanvas.setAttribute('height', '' + (params.bgH * scaleNum)); // 设置画布实际大小
          var ctx = posterCanvas.getContext('2d');
          // CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
          //   if (w < 2 * r) r = w / 2
          //   if (h < 2 * r) r = h / 2
          //   this.beginPath()
          //   this.moveTo(x + r, y)
          //   this.arcTo(x + w, y, x + w, y + h, r)
          //   this.arcTo(x + w, y + h, x, y + h, r)
          //   this.arcTo(x, y + h, x, y, r)
          //   this.arcTo(x, y, x + w, y, r)
          //   this.strokeStyle = '#fff'
          //   this.stroke()
          //   // this.closePath()
          //   this.fillStyle = '#fff'
          //   this.fill()
          //   return this
          // }
          var posterImg = new Image();
          posterImg.src = params.bgImg;
          posterImg.setAttribute('crossOrigin', 'anonymous');
          posterImg.onerror = () => {
            this.consoleLogs += '<p>海报图加载失败</p>';
            Indicator.close();
          };
          this.consoleLogs += '<p>准备画海报背景</p>';
          posterImg.onload = () => { // 将海报图画到画布上
            this.consoleLogs += '<p>开始画海报背景</p>';
            try {
              ctx.drawImage(posterImg, 0, 0, params.bgW * scaleNum, params.bgH * scaleNum);
            } catch (e) {
              console.log(e);
            }
            var qrImg = new Image();
            // qrImg.setAttribute('crossOrigin', 'Anonymous')
            qrImg.src = qrCanvas.toDataURL('image/png');
            qrImg.onerror = () => {
              this.consoleLogs += '<p>二维码加载失败</p>';
              Indicator.close();
            };
            this.consoleLogs += '<p>准备画二维码到海报上</p>';
            qrImg.onload = () => { // 将带有LOGO的二维码画到画布上
              this.consoleLogs += '<p>开始画二维码到海报上</p>';
              ctx.drawImage(qrImg, (params.qrX + params.qrOffsetX) * scaleNum, (params.qrY + params.qrOffsetY) * scaleNum, params.qrW * scaleNum, params.qrH * scaleNum);
              ctx.stroke();
              posterCanvas.setAttribute('style', 'width: ' + (params.bgW / 2) + 'px; height: ' + (params.bgH / 2) + 'px'); // 设置画布样式大小
              this.posterSrc = posterCanvas.toDataURL('image/png');
              // this.posterCanvas = posterCanvas
              Indicator.close();
              this.qrcodeShow = true;
            };
          };
        };
      }).catch(ex => {
        Indicator.close();
        console.log(ex);
      });
    },
    drawPoster: function () {
      let opts = {
        errorCorrectionLevel: 'Q',
        type: 'image/png',
        width: 1000,
        rendererOpts: {
          quality: 0.3
        }
      };
      this.consoleLogs += '<p>____________</p><p>开始生成二维码</p>';
      let shareUrl = this.buildUrl(this.currentShareFee.publicUrl, 'qr');
      if ('' + this.currentShareCategoryId !== '1') { // 非0元号卡资费，跳转本地页面
        shareUrl = this.buildInnerUrl(this.currentShareFee.id);
        if ('' + this.currentShareCategoryId === '2') { // 热门业务/特惠流量
          shareUrl = this.buildCustomShareUrl('handlesuperflow', this.currentShareFee.id);
          var params = {
            qrText: shareUrl,
            qrX: 450,
            qrY: 600,
            qrW: 125,
            qrH: 125,
            qrMargin: 2,
            qrOffsetX: 0,
            qrOffsetY: 0,
            qrLogo: 'static/img/cmcc_logo.png',
            qrLogoW: 27,
            qrLogoH: 27,
            bgImg: this.currentShareFee.backgroundImage,
            bgW: 630,
            bgH: 825
          };
          this.drawPosterByParams(params);
          return;
        } else if ('' + this.currentShareCategoryId === '5') {
          shareUrl = this.buildCustomShareUrl('familyDetail', this.currentShareFee.id);
        }
      }
      let shareBgImage = this.currentShareFee.backgroundImage;
      let fontColor = this.currentShareFee.fontColor ? this.currentShareFee.fontColor : '#fff';
      console.log(shareUrl, 'backgroundImage', shareBgImage);
      QRCode.toCanvas(shareUrl, opts).then(qrCanvas => {
        var width = 120;
        var height = 120;
        var x = width * 3.3;
        var y = height * 3.3;
        var lw = width * 0.28;
        var lh = height * 0.28;
        var scaleNum = 2; // 画布扩大倍数
        var qrLogo = new Image();
        // qrLogo.setAttribute('crossOrigin', 'Anonymous'); // 图片跨域
        qrLogo.src = 'static/img/cmcc_logo.png'; // 设置二维码LOGO图片
        qrLogo.onerror = () => {
          this.consoleLogs += '<p>Logo加载失败</p>';
          Indicator.close();
        };
        this.consoleLogs += '<p>准备在二维码上画LOGO</p>';
        qrLogo.onload = () => {
          this.consoleLogs += '<p>开始在二维码上画LOGO</p>';
          qrCanvas.getContext('2d').drawImage(qrLogo, x, y, lw * 6, lh * 6); // 在二维码上画LOGO

          var posterCanvas = document.createElement('canvas');
          posterCanvas.setAttribute('style', 'width: 420px; height: 550px;'); // 设置画布样式大小
          posterCanvas.setAttribute('width', '' + (420 * scaleNum));
          posterCanvas.setAttribute('height', '' + (550 * scaleNum)); // 设置画布实际大小
          var ctx = posterCanvas.getContext('2d');
          // ctx.fillStyle = '#FFFFFF';
          // ctx.fillRect(0, 0, 420 * scaleNum, 550 * scaleNum); // 填充整个背景底色
          CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            this.beginPath();
            this.moveTo(x + r, y);
            this.arcTo(x + w, y, x + w, y + h, r);
            this.arcTo(x + w, y + h, x, y + h, r);
            this.arcTo(x, y + h, x, y, r);
            this.arcTo(x, y, x + w, y, r);
            this.strokeStyle = '#fff';
            this.stroke();
            // this.closePath();
            this.fillStyle = '#fff';
            this.fill();
            return this;
          };
          var posterImg = new Image();
          // posterImg.src = 'static/img/index/poster.png';
          if (shareBgImage) {
            posterImg.src = shareBgImage;
          } else {
            posterImg.src = 'static/img/index/poster.png';
          }
          posterImg.setAttribute('crossOrigin', 'anonymous');
          posterImg.onerror = () => {
            this.consoleLogs += '<p>海报图加载失败</p>';
            Indicator.close();
          };
          this.consoleLogs += '<p>准备画海报背景</p>';
          posterImg.onload = () => { // 将海报图画到画布上
            this.consoleLogs += '<p>开始画海报背景</p>';
            try {
              ctx.drawImage(posterImg, 0, 0, 420 * scaleNum, 550 * scaleNum);
            } catch (e) {
              console.log(e);
            }
            this.consoleLogs += '<p>画合伙人LOGO</p>';
            ctx.roundRect(105 * scaleNum, 181 * scaleNum, 210 * scaleNum, 210 * scaleNum, 10 * scaleNum);
            // ctx.drawImage(qrLogo, 45 * scaleNum, 30 * scaleNum, 60 * scaleNum, 60 * scaleNum); // 画合伙人LOGO

            var qrImg = new Image();
            // qrImg.setAttribute('crossOrigin', 'Anonymous');
            qrImg.src = qrCanvas.toDataURL('image/png');
            qrImg.onerror = () => {
              this.consoleLogs += '<p>二维码加载失败</p>';
              Indicator.close();
            };
            this.consoleLogs += '<p>准备画二维码到海报上</p>';
            qrImg.onload = () => { // 将带有LOGO的二维码画到画布上
              this.consoleLogs += '<p>开始画二维码到海报上</p>';
              ctx.drawImage(qrImg, 120 * scaleNum, 196 * scaleNum, 180 * scaleNum, 180 * scaleNum);

              let posterTitle = this.currentShareFee.packageName;
              let posterDesc = this.currentShareFee.packageBrief;
              if ('' + this.currentShareCategoryId === '2') {
                posterTitle = this.currentShareFee.productName;
                posterDesc = this.currentShareFee.typeIntroduce;
              }
              // ---> 绘制合伙人昵称、合伙人电话、资费分享标题的文字
              // canvasTextAutoWrap(posterTitle, ctx, 130 * scaleNum, 57 * scaleNum, 300 * scaleNum, 24 * scaleNum, 2, (20 * scaleNum) + 'px 黑体', '#000000');
              // canvasTextAutoWrap(this.phone, ctx, 130 * scaleNum, 85 * scaleNum, 400 * scaleNum, 16 * scaleNum, 1, (16 * scaleNum) + 'px 黑体', '#777777');
              // canvasTextAutoWrap(posterDesc, ctx, 115 * scaleNum, 139 * scaleNum, 300 * scaleNum, 24 * scaleNum, 2, (20 * scaleNum) + 'px 黑体', '#333333');
              canvasTextAlignCenter(posterTitle, ctx, 108 * scaleNum, 350 * scaleNum, 420 * scaleNum, 26 * scaleNum, 1, (26 * scaleNum) + 'px 黑体', fontColor);
              canvasTextAlignCenter(posterDesc, ctx, 150 * scaleNum, 350 * scaleNum, 420 * scaleNum, 22 * scaleNum, 2, (20 * scaleNum) + 'px 黑体', fontColor);
              canvasTextAlignCenter('扫码立即办理', ctx, 384 * scaleNum, 350 * scaleNum, 420 * scaleNum, 22 * scaleNum, 2, (16 * scaleNum) + 'px 黑体', '#333333');
              ctx.stroke();
              posterCanvas.setAttribute('style', 'width: 210px; height: 275px;'); // 设置画布样式大小
              this.posterSrc = posterCanvas.toDataURL('image/png');
              // this.posterCanvas = posterCanvas;
              Indicator.close();
              this.qrcodeShow = true;
            };
          };
        };
      }).catch(err => {
        console.log(err);
        this.consoleLogs += '<p>生成二维码失败' + err + '</p>';
        Indicator.close();
      });
    },
    touchStart: function(e) {
      this.duringTime = 0;
      this.startTime = new Date().getTime();
    },
    touchEnd: function(e) {
      this.duringTime = new Date().getTime() - this.startTime;
    }
  }
};
/*
* str: 要绘制的字符串
* ctx: canvas对象的getContext('2d')实例
* initX: 绘制字符串起始x坐标
* initY: 绘制字符串起始y坐标
* drawWidth: 绘制的宽度
* lineHeight: 字行高，自己定义个值即可
* rowNum: 最大绘制行数
* font: 绘制字体参数
* color: 绘制颜色参数
*/
// function canvasTextAutoWrap (str, ctx, initX, initY, drawWidth, lineHeight, rowNum, font, color) {
//   ctx.fillStyle = color;
//   ctx.font = font;
//   var lineWidth = 0;
//   var lastSubStrIndex = 0;
//   var cntRow = 1;
//   var strWidth = 0;
//   for (var w = 0; w < str.length; w++) {
//     strWidth += ctx.measureText(str[w]).width;
//   }
//   // if (str === '30G定向流量;免费体验3个月') {
//   //   console.log(strWidth, drawWidth);
//   // }
//   if (strWidth <= (drawWidth - initX) && rowNum === 2) {
//     initY += Math.floor(lineHeight / 2);
//   }
//   for (var i = 0; i < str.length; i++) {
//     lineWidth += ctx.measureText(str[i]).width;
//     if (lineWidth > drawWidth - initX) { // 减去initX,防止边界出现的问题
//       cntRow += 1;
//       if (rowNum && cntRow > rowNum) { // 如果传入最大行数rowNum，则在限制的行数最末端加上...
//         ctx.fillText(str.substring(lastSubStrIndex, i - 2) + '...', initX, initY);
//         break;
//       }
//       ctx.fillText(str.substring(lastSubStrIndex, i), initX, initY);
//       initY += lineHeight;
//       lineWidth = 0;
//       lastSubStrIndex = i;
//     }
//     if (i === str.length - 1) {
//       ctx.fillText(str.substring(lastSubStrIndex, i + 1), initX, initY);
//     }
//   }
//   ctx.textAlign = 'center';
// }
/*
* str: 要绘制的字符串
* ctx: canvas对象的getContext('2d')实例
* initY: 绘制字符串起始y坐标
* drawWidth: 绘制的宽度
* totalWidth: canvas对象总宽度
* lineHeight: 字行高，自己定义个值即可
* font: 绘制字体参数
* color: 绘制颜色参数
*/
function canvasTextAlignCenter (str, ctx, initY, drawWidth, totalWidth, lineHeight, rowNum, font, color) {
  ctx.fillStyle = color;
  ctx.font = font;
  var lineWidth = 0;
  var lastSubStrIndex = 0;
  var cntRow = 1;
  // var strWidth = 0;
  // strWidth = ctx.measureText(str).width;
  let initX = totalWidth / 2;
  // if (strWidth <= drawWidth && rowNum === 2) {
  //   initY += Math.floor(lineHeight / 2);
  // }
  ctx.textAlign = 'center';
  for (var i = 0; i < str.length; i++) {
    lineWidth += ctx.measureText(str[i]).width;
    if (lineWidth > drawWidth) {
      cntRow += 1;
      if (rowNum && cntRow > rowNum) { // 如果传入最大行数rowNum，则在限制的行数最末端加上...
        ctx.fillText(str.substring(lastSubStrIndex, i - 2) + '...', initX, initY);
        break;
      }
      ctx.fillText(str.substring(lastSubStrIndex, i), initX, initY);
      initY += lineHeight;
      lineWidth = 0;
      lastSubStrIndex = i;
    }
  }
  if (cntRow === 1) {
    ctx.fillText(str, initX, initY);
  }
}
</script>

<style>
body {
  background: #f0f0f0;
}
.index-red-dot {
  border-radius: 100%;
  border: 1px solid #ff6d6f;
  width: 8px;
  height: 8px;
  background: #ff6d6f;
  position: absolute;
  top: -2px;
  right: -10px;
}
.showfirst {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999;
  background: #fff;
  text-align: center;
}
.showfirst-img {
  width: 130px;
  margin: 80px auto;
  pointer-events: none;
}
.showfirst-guide {
  width: 80%;
  height: 40px;
  /*border: 1px solid #ccc;*/
  background: #3d8cf7;
  line-height: 40px;
  text-align: center;
  color: #fff;
  margin: 0 auto 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}
.showfirst-index {
  width: 80%;
  height: 40px;
  border: 1px solid #3d8cf7;
  line-height: 40px;
  text-align: center;
  color: #3d8cf7;
  margin: 0 auto 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}
.guide-img {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 99999;
}
.guide-img img {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.mint-loadmore-text {
  font-size: 12px;
}
.index {
  padding-bottom: 60px;
  /*height: 100%;*/
  /*width: 100%;*/
  /*position: absolute;*/
  min-height: 100%;

  /* 头部个人信息区 */
  .header {
    position: relative;
    background: #fff;
    font-size: 0;
    .header-edit {
      pointer-events: all;
      width: 77px;
      height: 26px;
      position: absolute;
      right: 0;
      top: 20px;
      z-index: 2;
      cursor: pointer;
    }
    img {
      width: 100%;
      position: absolute;
    }
    .header-top {
      width: 340px;
      height: 90px;
      background: #FFFFFF;
      box-shadow: 0 2px 10px 0 rgba(62,139,248,0.30);
      border-radius: 10px;
      margin: 0px auto;
      margin-bottom: 35px;
      position: relative;
      top: 26px;
    }
     .header-profile-header {
        display: flex;
        position: absolute;
        top: -24px;
        width: 100%;
      }
      .head-img {
        height: 50px;
        line-height: 50px;
        width: 50px;
        cursor: pointer;
        margin: 10px 10px 10px 20px;
        img {
          width: 50px;
          height: 50px;
          border-radius: 100%;
          border: 0;
          outline: none;
          pointer-events: none;
        }
      }
      .user-info {
        position: relative;
        top: 10px;
        padding-top: 10px;
        padding: 8px 0 0; 
        height: 60px;
        display: flex;
        align-items: center;
        width: calc(100% - 150px);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        .nick-name {
          font-size: 12px;
          color: #333;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          display: flex;
          .text-left, .text-right {
            flex: 0 0 auto;
          }
          .text-left {
            max-width: calc(100% - 120px);
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }
          a {
            color: #333;
          }
        }
        .phone-no {
          /*margin-top: 10px;*/
          font-size: 12px;
          color: #333;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          div {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            width: 150px;
          }
        }
        .go-withdraw {
          position: relative;
          img {
            width: 62px;
          }
        }
      }
    .header-bg {
      position: relative;
      width: 100%;
      height: 144px;
      z-index: 0;
    }
    .header-profile-box {
      width: 100%;
      /* background: #FFFFFF; */
      padding-top: 40px;
      /* 业务信息展示区 */
      .middle {
        width: 100%;
        background: #fff;
        /* height: 55px; */
        border-radius: 10px;
        display: flex;
        .middle-item {
          width: calc((100% - 1px) / 2);
          height: 100%;
          position: relative;
          text-align: center;
          line-height: 1.2;
          font-family: "黑体";
          cursor: pointer;
        }
        .icon {
          width: 11px;
          height: 11px;
          position: relative;
          top: 2px;
          padding-right: 1px;
        }
        .split-line {
          height: 25px;
          width: 1px;
          background: #d8d8d8;
          margin-top: 8px;
        }
        .middle-item-number {
          color: #333;
          font-size: 24px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .middle-item-text {
          color: #777;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .share-shop-btn {
      position: absolute;
      top: 20px;
      right: 0;
      width: 100px;
      z-index: 1;
      cursor: pointer;
      img {
        width: 100px;
        pointer-events: none;
      }
    }
    .share-register {
      position: absolute;
      top: 55px;
      right: 0;
      width: 100px;
      z-index: 1;
      cursor: pointer;
      img {
        width: 100px;
        pointer-events: none;
      }
    }
  }
  .index-nav-items {
    width: 100%;
    display: flex;
    position: relative;
    background: #fff;
    padding: 30px 10px 10px;
    .nav-item {
      flex: 1 1 25%;
      text-align: center;
      cursor: pointer;
      position: relative;
      .nav-item-img {
        width: 42px;
        height: 42px;
        margin: 0 auto;
        position: relative;
      }
      img {
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      .nav-item-name {
        color: #333;
        font-size: 12px;
      }
    }
  }
  .category-list {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    display: flex;
    background: #fff;
    position: relative;
    border-top: 1px solid #E4E4E4;
    border-bottom: 1px solid #E4E4E4;
    .category-item {
      flex: 0 0 25%;
      height: 35px;
      line-height: 35px;
      text-align: center;
      color: #333;
      position: relative;
      font-size: 14px;
      padding: 0 10px;
      cursor: pointer;
      .category-name {
        width: 100%;
        height: 35px;
        line-height: 35px;
        border-bottom: 2px solid rgba(0, 0, 0, 0);
        display: inline;
        padding-bottom: 8px;
        font-weight: bold;
        &.is-ios {
          padding-bottom: 6px;
        }
      }
      &.category-item-selected .category-name {
        color: #3D8CF7;
        border-bottom: 2px solid #3D8CF7;
      }
      .category-divider {
        position: absolute;
        left: 0;
        height: 19px;
        width: 1px;
        top: 8px;
        background: #E4E4E4;
      }
    }
  }
}
.index img {
  pointer-events: none;
}
.index .to-withdraw {
  float: right;
  width: 70px;
  height: 90px;
  position: relative;
  white-space: nowrap;
  padding-right: 15px;
  line-height: 1.2;
  cursor: pointer;
}
.index .to-left {
  float: right;
  padding: 30px 0;
  text-align: right;
  white-space: nowrap;
  width: calc(100% - 20px);
  height: 90px;
}
.index .to-text {
  color: #fff;
  font-size: 12px;
}
.index .to-amt {
  color: #fff;
  font-size: 17px;
  white-space: nowrap;
  z-index: 1;
  position: absolute;
  right: 36px;
  top: 48px;
  /*overflow: hidden;*/
  /*text-overflow: ellipsis;*/
}
.index .to-arrow {
  float: right;
  line-height: 90px;
  padding-left: 12px;
  font-size: 14px;
  width: 20px;
  position: relative;
  /*z-index: 10;*/
}
.index .to-arrow img {
  width: 90%;
}
/* 第三行 */
.index .third-line {
  background: #fff;
  height: 55px;
  position: relative;
}
.index .third-line-left,
.index .third-line-center,
.index .third-line-right {
  float: left;
  width: calc(33.3% - 1px);
  text-align: center;
  height: 56px;
  line-height: 55px;
  display: table;
}
.index .third-line-left {
  width: calc(31.3% - 1px);
  /* width: calc(50% - 1px); */
}
.index .third-line-center {
  width: calc(37.3% - 1px);
  /* width: calc(50% - 1px); */
}
.index .third-line-right {
  width: calc(31.3% - 2px);
}
.index .third-line-zw {
  width: calc(50% - 1px);
}
.index .third-line-seperator {
  float: left;
  width: 2px;
  text-align: center;
  height: 20px;
  margin-top: 18px;
  border-right: 1px solid #e0e0e0;
}
.index .third-line-img {
  width: 30px;
  height: 30px;
  /*display: table-cell;*/
  vertical-align: middle;
}
.index .display-table-cell {
  white-space: nowrap;
  display: table-cell;
  vertical-align: middle;
  cursor: pointer;
  height: 56px;
  overflow: hidden;
  position: relative;
}
.index .third-line-text {
  white-space: nowrap;
  height: 30px;
  /*display: table-cell;*/
  vertical-align: middle;
  /*margin-left: 10px;*/
  color: #333;
  font-size: 12px;
}
.index .third-line-act-icon {
  position: relative;
  height: 17.5px;
  top: -8px;
  left: -4px;
  width: 25px;
}
.index .fee-list {
}
/*.index .category-name {
  background: #fff;
  margin-top: 10px;
  color: #3d8cf7;
  text-indent: 10px;
  position: relative;
  line-height: 20px;
  font-size: 14px;
  padding: 10px 10px;
  border-bottom: 1px solid #eee;
}
.index .category-name .category-label {
  position: absolute;
  height: 20px;
  width: 5px;
  left: 10px;
  top: 10px;
  background: #3d8cf7;
}*/
.index .fee-item {
  width: 100%;
  background: #fff;
  height: 90px;
  margin-top: 1px;
  position: relative;
  padding: 18px 14px;
  overflow: hidden;
  cursor: pointer;
}
.index .fee-item.fee-item-1 {
  margin-top: 0;
}
.index .fee-img {
  float: left;
  position: relative;
  width: 66px;
  height: 55px;
}
.index .fee-img img {
  width: 55px;
  height: 55px;
}
.index .fee-intro {
  float: left;
  width: calc(100% - 183px);
  height: 100%;
  line-height: 1.7;
  padding-top: 1px;
}
.index .fee-title {
  white-space: nowrap;
  overflow: hidden;
  /*text-overflow: ellipsis;*/
  color: #333;
  font-size: 12px;
  font-weight: bold;
  margin-top: -4px;
  &.fee-title-superflow {
    margin-top: 0;
  }
}
.index .fee-profile {
  overflow: hidden;
  width: calc(100% - 10px);
  /*white-space: nowrap;
  text-overflow: ellipsis;*/
  word-break: break-all;
  color: #8d8d8d;
  font-size: 11px;
  /* height: 28px; */
  line-height: 14px;
}
.index .fee-share-profit {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #b29d79;
  font-size: 10px;
}
.index .fee-operations {
  width: 133px;
  height: 90px;
  position: absolute;
  right: 0;
  top: 0;
  padding: 20px 15px 20px 0;
}
.index .is-loading {
  width: 100%;
  padding: 4px;
  text-align: center;
  color: #777;
  font-size: 12px;
  z-index: 0;
}
.index .no-record {
  width: 100%;
  padding: 40px 20px;
  text-align: center;
  color: #777;
  font-size: 16px;
}
.index .oper-btn {
  height: 100%;
  width: 36px;
  position: relative;
  float: left;
  padding-top: 6px;
  cursor: pointer;
  text-align: center;
}
.index .oper-btn-active {
  opacity: 0.7;
}
.index .btn-qr-code {
  margin-left: 5px;
}
.index .btn-share {
  margin-left: 5px;
}
.index .btn-img {
  width: 30px;
  height: 30px;
  position: relative;
  margin: 0 3px;
}
.index .btn-img img {
  width: 100%;
  height: 100%;
}
.index .btn-text {
  color: #7e7975;
  font-size: 10px;
  text-align: center;
  margin-top: 2px;
}
.index .fee-data {
  /*visibility: hidden;*/
  position: relative;
  width: 100%;
  height: 0;
  line-height: 30px;
  text-align: center;
  background: #fff;
  border-top: 1px solid #fff;
  font-size: 10px;
  color: #8d8d8d;
  /*overflow: hidden;*/
  transition: all 0.5s ease-in-out;
}
.index .fee-data:before {
  content: "";
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-bottom-color: #cccccc;
  position: absolute;
  right: 108px;
  top: -16px;
  /*display: none;*/
  /*visibility: hidden;*/
  opacity: 0;
  transition: all 0.2s linear 0.2s;
}
.index .fee-data:after {
  content: "";
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-bottom-color: #fff;
  position: absolute;
  right: 108px;
  top: -14px;
  /*display: none;*/
  visibility: hidden;
  /*opacity: 0;*/
  transition: all 0.2s linear 0.2s;
}
.index .fee-data-show {
  /*overflow: initial;*/
  /*visibility: visible;*/
  border-top: 1px solid #cfcfcf;
  height: 30px;
}
.index .fee-data-show.fee-data:before {
  /*display: block;*/
  opacity: 1;
  /*visibility: visible;*/
}
.index .fee-data-show.fee-data:after {
  visibility: visible;
}
.index .fee-data-order-no {
  float: right;
  width: 50%;
  height: 1px;
  overflow: hidden;
  transition: all 0.5s ease-in-out;
}
.index .fee-data-est-profit {
  float: left;
  width: 50%;
  height: 1px;
  overflow: hidden;
  transition: all 0.5s ease-in-out;
}
.index .fee-data-show .fee-data-order-no,
.index .fee-data-show .fee-data-est-profit {
  /*overflow: initial;*/
  height: 30px;
}
.index .tip-layer {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding-top: 60px;
  z-index: 999999;
  overflow: hidden;
}
.index .qrcode-layer {
  background: rgba(0, 0, 0, 0.4);
}
.index .tip-layer * {
  user-select: none;
}
.index .tip-layer .close-btn {
  position: absolute;
  left: 0;
  top: 0;
  width: 50px;
  height: 50px;
  padding: 13px;
  cursor: pointer;
}
.index .tip-layer .close-btn img {
  width: 24px;
  height: 24px;
}
.index .tip-layer .top-tip {
  font-size: 22px;
  position: absolute;
  right: 146px;
  top: 66px;
}
.index .tip-layer .connect-string {
  width: 55px;
  height: 55px;
  position: absolute;
  right: 66px;
  transform: rotate(17deg);
  top: 40px;
}
.index .tip-layer .pointer-hand {
  width: 30px;
  height: 40px;
  position: absolute;
  right: 20px;
  top: 10px;
  animation: jump 0.5s linear infinite;
}
@keyframes jump {
  0% {
    transform: translateY(-2px);
  }
  100% {
    transform: translateY(2px);
  }
}
.index .tip-layer .canvas-area {
  padding: 20px 0 10px;
  position: relative;
  text-align: center;
}
.index .tip-layer .canvas-area img {
  pointer-events: all;
  width: 80%;
  max-width: 420px;
  margin: 0 auto;
  margin-top: 30px;
  border-radius: 10px;
}
.index .tip-layer .qr-tip {
  width: 100%;
  font-size: 18px;
  color: #fff;
  text-align: center;
}
.index .ads-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  .ads-panel {
    width: 70%;
    max-width: 490px;
    position: absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
    top: 40%;
    transform: translateY(-40%);
    .ads-img {
      width: 100%;
      pointer-events: auto;
      cursor: pointer;
    }
    .btn-close {
      position: absolute;
      left: 0;
      right: 0;
      margin: 0 auto;
      bottom: -40px;
      width: 30px;
      height: 30px;
      border-radius: 100%;
      background: #333;
      overflow: hidden;
      cursor: pointer;
      img {
        width: 34px;
        height: 34px;
        position: absolute;
        top: -2px;
        left: -2px;
        pointer-events: none;
      }
    }
  }
}
.index .share-guide {
  position: absolute;
  width: 100%;
  min-height: 100%;
  left: 0;
  top: 0;
  /*background: rgba(0, 0, 0, 0.7);*/
  /*overflow: hidden;*/
  /*padding-top: 221px;*/
  z-index: 9;
  .share-guide-padding {
    position: absolute;
    top: 0;
    left: 0;
    height: 307px;
    width: 100%;
    background: rgba(0, 0, 0, 0.7);
    &.is-ios {
      height: 312px;
    }
  }
  .fee-list {
    position: absolute;
    left: 0;
    top: 307px;
    width: 100%;
    background: rgba(0, 0, 0, 0.7);
    min-height: calc(100% - 307px);
    &.is-ios {
      top: 312px;
      min-height: calc(100% - 312px);
    }
  }
  &.has-top-ads {
    .share-guide-padding {
      height: 332px;
      &.is-ios {
        height: 337px;
      }
    }
    .fee-list {
      top: 332px;
      min-height: calc(100% - 332px);
      &.is-ios {
        top: 337px;
        min-height: calc(100% - 337px);
      }
    }
  }
  .fee-item {
    background: transparent;
    .btn-share {
      .btn-text {
        color: #fff;
      }
    }
    .share-guide-text {
      position: absolute;
      right: 55px;
      top: 45%;
      color: #fff;
      transform: translateY(-45%);
      letter-spacing: 2px;
    }
  }
}
.index .dom-unvisible {
  visibility: hidden;
}

</style>