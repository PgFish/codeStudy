<template>
  <div>
    <!-- <div class="console-panel" v-html="consoleLogs"></div> -->
    <div class="showfirst" v-if="showfirst">
      <img class="showfirst-img" src="static/img/guide/guideLogo.png">
      <div class="showfirst-guide" @click="gotoGuide">第一次来？新手教程</div>
      <div class="showfirst-index" @click="gotoIndex">跳过</div>  
    </div>
    <div v-if="showGuide" class="guide-img" @click="guideStart">
      <img :src="isZW ? zwGuide[num] : guide[num]">
    </div>
    <div class="index" v-if="showIndex">
      <div class="header">
        <div class="head-img" @click="showSlideBar($event)">
          <img :src="realName ? 'static/img/dzg_head_img.png' : (userInfo.headimgurl || 'static/img/cmcc_logo.png')">
        </div>
        <div class="user-info">
          <div class="nick-name">{{realName || ((userInfo.nickname || '我') + '的店铺')}}</div>
          <div class="phone-no">{{phone}}</div>
        </div>
        <div class="to-withdraw" @click="toWithdraw">
          <div class="to-arrow"><img src="static/img/index/right_arrow.png"></div>
          <div class="to-left">
            <div class="to-text">去提现</div>
            <div class="to-amt">￥{{baseInfo.drawSalary ? round(baseInfo.drawSalary) : 0}}</div>
          </div>
        </div>
      </div>
      <div class="middle" @click="toOrderList">
        <div class="middle-item deal-finish">
          <div class="middle-item-number">{{baseInfo.orderNum ? pInt(baseInfo.orderNum) : 0}}</div>
          <div class="middle-item-text">已成交/单</div>
        </div>
        <!-- <div class="middle-item pre-profit">
          <div class="middle-item-number">{{baseInfo.estimateSalary ? round(baseInfo.estimateSalary) : 0}}</div>
          <div class="middle-item-text">预估收益/元</div>
        </div> -->
        <div class="middle-item receive-profit">
          <div class="middle-item-number">{{baseInfo.accountSalary ? round(baseInfo.accountSalary) : 0}}</div>
          <div class="middle-item-text">到账收益/元</div>
        </div>
      </div>
      <div class="third-line">
        <div class="third-line-left" :class="{'third-line-zw': isZW}">
          <div class="display-table-cell" @click="toRule">
            <div class="index-red-dot" v-if="ruleRedDot"></div>
            <img class="third-line-img" src="static/img/index/return_rules.png">
            <span class="third-line-text">返利规则</span>
          </div>
        </div>
        <div class="third-line-seperator" v-if="!isZW"></div>
        <div class="third-line-center" v-if="!isZW">
          <div class="display-table-cell" @click="toIntro">
            <div class="index-red-dot" v-if="introduceRedDot"></div>
            <img class="third-line-img" src="static/img/index/partner_intro.png">
            <span class="third-line-text">“合伙人”介绍</span>
          </div>
        </div>
        <div class="third-line-seperator"></div>
        <div class="third-line-right" :class="{'third-line-zw': isZW}">
          <div class="display-table-cell" @click="toActivity">
            <img class="third-line-img" src="static/img/index/activity.png">
            <span class="third-line-text">活动</span>
            <img class="third-line-act-icon" src="static/img/index/activity_hot.png">
          </div>
        </div>
      </div>
      <div class="clear-float"></div>
      <!-- <div v-infinite-scroll="loadMore"
        :infinite-scroll-disabled="lastPage"
        infinite-scroll-distance="10" class="fee-list" ref="loadFresh" :top-method="loadTop" @top-status-change="handleTopChange" :auto-fill="true" :bottom-all-loaded="false" :top-distance="10"> -->
      <div class="fee-list">
        <template v-for="(category, j) in list">
          <div :key="'category_' + category.id" class="category-name">
            <div class="category-label"></div>
            {{category.name}}
          </div>
          <template v-for="(fee, i) in category.packageList">
            <div class="fee-item" :class="{'fee-item-1': i === 0}" :key="'category_' + category.id + '_fee_' + fee.id" @click="jump(fee.publicUrl, fee.id, category.id)">
              <div class="fee-img">
                <img :src="fee.icon">
              </div>
              <div class="fee-intro">
                <div class="fee-title">{{fee.packageName}}</div>
                <div class="fee-profile">{{fee.packageBrief}}</div>
                <div class="fee-share-profit">分享赚{{round((fee.activateSalary - 0) + (fee.firstRechargeSalary - 0))}}元</div>
              </div>
              <div class="fee-operations" @click="prevDef($event)">
                <div class="oper-btn" :class="{'oper-btn-active': expandArr.indexOf(i) >= 0}" @click="expand($event, i, fee)">
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
            <div class="fee-data" :class="{'fee-data-show': expandArr.indexOf(i) >= 0}">
              <div class="fee-data-order-no">订单量：{{pInt(fee.orderNum)}}</div>
            </div>
          </template>
        </template>
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
      <div class="ads-popup" v-if="showAds">
        <div class="ads-panel">
          <img src="static/img/index/act_follow_reward.png" class="ads-img" />
          <div class="btn-close" @click="closeAds">
            <img src="static/img/btn_close.png" />
          </div>
        </div>
      </div>
      <!-- 引导用户分享 -->
      <div class="share-guide" :class="{'no-top-ads': shareGuideGoUpper}" @touchmove="prevDef($event)" ref="shareGuide" v-if="showShareGuide">
        <div class="share-guide-padding"></div>
        <div class="fee-list">
          <template v-for="(category, j) in list">
            <div :key="'category_' + category.id" class="category-name dom-unvisible">
              <div class="category-label"></div>
              {{category.name}}
            </div>
            <template v-for="(fee, i) in category.packageList">
              <div class="fee-item" :class="{'fee-item-1': i === 0}" :key="'category_' + category.id + '_fee_' + fee.id">
                <div class="fee-img dom-unvisible">
                  <img :src="fee.icon">
                </div>
                <div class="fee-intro dom-unvisible">
                  <div class="fee-title">{{fee.packageName}}</div>
                  <div class="fee-profile">{{fee.packageBrief}}</div>
                  <div class="fee-share-profit">分享赚{{round((fee.activateSalary - 0) + (fee.firstRechargeSalary - 0))}}元</div>
                </div>
                <div class="fee-operations" @click="prevDef($event)">
                  <div class="oper-btn dom-unvisible" :class="{'oper-btn-active': expandArr.indexOf(i) >= 0}">
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
                <span class="share-guide-text">分享赚{{round((fee.activateSalary - 0) + (fee.firstRechargeSalary - 0))}}元</span>
              </div>
              <div class="fee-data dom-unvisible" :class="{'fee-data-show': expandArr.indexOf(i) >= 0}">
                <div class="fee-data-order-no">订单量：{{pInt(fee.orderNum)}}</div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { closeIllegalPage, getSession, baseUrl, getRequestParams, sendGetRequest, showMenuItems, saveStorage,
  getStorage, isWechatBoolean, handleShare, pageRouter, isWechat, sourceType, saveSession } from 'src/assets/utils.js';
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
      isZW: false,
      qrcodeShow: false,
      partnerId: '',
      showAds: false,
      showShareGuide: false,
      shareGuideGoUpper: false
    };
  },
  watch: {
  },
  created () {
    Indicator.close();
    document.title = '店铺';
    let that = this;
    Bus.$on('top-ads-closed', ifTrue => {
      that.shareGuideGoUpper = ifTrue && getSession('adsClosed');
    });
    setTimeout(() => {
      that.shareGuideGoUpper = getSession('adsClosed');
    }, 50);
    let deadLineTime = new Date(2018, 11, 31, 23, 59, 59, 0).getTime(); // 2018年12月31日23时59分活动下线
    let currentTime = new Date().getTime();
    let expired = currentTime >= deadLineTime;
    let hideIndexAds = getSession('hideIndexAds', true); // 本次关闭关注有礼活动的广告
    this.showAds = this.$route.query.from !== 'followreward' && !expired && !hideIndexAds; // 显示关注有礼活动的广告图弹层

    let hideShareGuide = getStorage('hideShareGuide_' + this.$route.query.p, true); // 本次关闭引导分享的遮罩
    this.showShareGuide = this.$route.query.from === 'followreward' && !hideShareGuide; // 显示引导分享的遮罩
    Bus.$emit('show-footer-cover', this.showShareGuide);

    this.introduceRedDot = getStorage('pt_shop_introduce_red_dot_' + this.$route.query.p, true); // 首页合伙人介绍红点
    this.ruleRedDot = getStorage('pt_shop_rule_red_dot_' + this.$route.query.p, true); // 首页返利规则红点
    console.log(this.introduceRedDot, this.ruleRedDot);
    // console.log(window.localStorage.getItem('firstLoad'));
    // let firstLoad = window.localStorage.getItem('firstLoad');
    // console.log('1', this.showGuide);
    let serverUserInfo = getSession('ptDetailInfo', true); // 获取服务器返回的用户信息
    if (serverUserInfo) {
      this.partnerId = serverUserInfo.id;
    }
    let srcInfo = getSession('ptSourceInfo', true); // 获取参数params中的用户信息
    if (srcInfo) {
      this.userInfo = srcInfo.userInfo;
      if (sourceType === 'zhuangwei' || (sourceType === 'dzg' && !isWechat() && this.userInfo.realName)) {
        this.isZW = true;
      }
      if (!this.userInfo) {
        this.userInfo = {};
      }
      console.log('userInfo', this.userInfo);
    } else {
      closeIllegalPage(this);
      return;
    }
    let sourceId = this.userInfo.openid;
    if (sourceType !== 'public' && sourceType !== 'zhuangwei') {
      sourceId = this.userInfo.phone;
    }
    saveStorage('20181114zt_intro_' + sourceId, '1');
    if (!isWechat() && this.userInfo.realName) {
      this.realName = this.userInfo.realName;
    }
    let phone = this.$route.query.p;
    this.getGuideCompletedObject(phone);
    this.phone = `${phone.substr(0, 3)}****${phone.substr(7, 4)}`;
    Indicator.open();
    // this.getConfig();
    this.getList();
  },
  mounted () {
    let ptDetailInfo = getSession('ptDetailInfo', true);
    if ('' + ptDetailInfo.partnerType !== '5' && this.$route.query.qrInviteCode) {
      Bus.$emit('on-head-img-tab', true);
    }
  },
  methods: {
    closeAds: function(e) {
      this.showAds = false;
      saveSession('hideIndexAds', true);
    },
    shareByGuide: function(e, fee, categoryId) {
      e.stopPropagation();
      this.showShareGuide = false;
      saveStorage('hideShareGuide_' + this.$route.query.p, true);
      Bus.$emit('show-footer-cover', this.showShareGuide);
      this.share(e, fee, categoryId);
    },
    showSlideBar: function(e) {
      e.stopPropagation();
      Bus.$emit('on-head-img-tab', true);
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
        this.showfirst = true && this.$route.query.from !== 'followreward'; // 如果不是从关注有礼进来的，且从来没显示过新手引导，则显示有移动LOGO的新手引导
        this.showIndex = false || this.$route.query.from === 'followreward'; // 如果从关注有礼进来的，或者没显示过新手引导，则不显示首页
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
        'orderNum': json.data.oerderNum
      };
      vue.list = vue.list.concat(json.data.categoryList);
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
    expand: function (e, index, fee) {
      e.stopPropagation();
      Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_index_dataBtn', 'WT.event', 'gpas_btn_data_' + fee.id] });
      var findIndex = this.expandArr.indexOf(index);
      if (findIndex >= 0) {
        this.expandArr.splice(findIndex, 1);
      } else {
        this.expandArr.push(index);
      }
    },
    toWithdraw: function () {
      Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_index_withdraw', 'WT.event', 'gpas_btn_withdraw'] });
      pageRouter(this, { path: '/withdraw', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
    },
    toOrderList: function () {
      pageRouter(this, { path: '/orderList', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
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
      pageRouter(this, { path: '/activity', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
    },
    jump: function (url, feeId, categoryId) {
      Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_index_feeType', 'WT.event', 'gpas_feeId_' + feeId] });
      if ('' + categoryId === '1') { // 0元号卡资费，跳转本地页面
        let jumpUrl = this.buildUrl(url);
        window.location.href = jumpUrl;
      } else {
        pageRouter(this, { path: '/feedetail', query: { id: feeId } });
      }
    },
    share: function (e, fee, categoryId) {
      e.stopPropagation();
      Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_index_shareBtn', 'WT.event', 'gpas_btn_share_' + fee.id] });
      let shareUrl = this.buildUrl(fee.publicUrl);
      if ('' + categoryId !== '1') { // 非0元号卡资费，跳转本地页面
        shareUrl = this.buildInnerUrl(fee.id);
      }
      if (!isWechatBoolean) {
        Indicator.close();
        console.log(fee);
        let shareObj = {
          shareTitle: fee.shareTitle,
          shareDesc: fee.shareBrief,
          shareLink: shareUrl,
          sharePic: fee.icon
        };
        handleShare(this, shareObj);
        return;
      }
      this.currentShareFee = {};
      console.log(fee);
      // let shareUrl = this.buildUrl(fee.publicUrl);
      let obj = {
        title: fee.shareTitle,
        desc: fee.shareBrief,
        link: shareUrl,
        imgUrl: /^http/i.test(fee.icon) ? fee.icon : `${window.location.origin + baseUrl}/partner/static/img/cmcc_logo.png`
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
    shareSuc: function () {
      this.tipShow = false;
      Toast({ message: '分享成功', position: 'bottom', duration: 1500 });
      // hideMenuItems();
    },
    shareFail: function () {
      this.tipShow = false;
      Toast({ message: '取消分享', position: 'bottom', duration: 1500 });
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
      return `${window.location.origin + baseUrl}/common/redirect?info=path=feedetaillistenid=${feeId}listenpartnerId=${this.partnerId}`;
    },
    showQrCode: function(e, fee, categoryId) {
      e.stopPropagation();
      Indicator.open();
      this.currentShareFee = fee;
      this.currentShareCategoryId = categoryId;
      Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_index_qrBtn', 'WT.event', 'gpas_btn_qr_' + fee.id] });
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
      }
      console.log(shareUrl);
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

          var posterImg = new Image();
          // posterImg.setAttribute('crossOrigin', 'Anonymous');
          posterImg.src = 'static/img/index/poster.png';
          posterImg.onerror = () => {
            this.consoleLogs += '<p>海报图加载失败</p>';
            Indicator.close();
          };
          this.consoleLogs += '<p>准备画海报背景</p>';
          posterImg.onload = () => { // 将海报图画到画布上
            this.consoleLogs += '<p>开始画海报背景</p>';
            ctx.drawImage(posterImg, 0, 0, 420 * scaleNum, 550 * scaleNum);
            this.consoleLogs += '<p>画合伙人LOGO</p>';
            ctx.drawImage(qrLogo, 45 * scaleNum, 30 * scaleNum, 60 * scaleNum, 60 * scaleNum); // 画合伙人LOGO

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
              ctx.drawImage(qrImg, 131.5 * scaleNum, 210 * scaleNum, 152 * scaleNum, 152 * scaleNum);

              // ---> 绘制合伙人昵称、合伙人电话、资费分享标题的文字
              canvasTextAutoWrap(this.currentShareFee.packageName, ctx, 130 * scaleNum, 57 * scaleNum, 300 * scaleNum, 24 * scaleNum, 2, (20 * scaleNum) + 'px 黑体', '#000000');
              // canvasTextAutoWrap(this.phone, ctx, 130 * scaleNum, 85 * scaleNum, 400 * scaleNum, 16 * scaleNum, 1, (16 * scaleNum) + 'px 黑体', '#777777');
              canvasTextAutoWrap(this.currentShareFee.packageBrief, ctx, 115 * scaleNum, 139 * scaleNum, 300 * scaleNum, 24 * scaleNum, 2, (20 * scaleNum) + 'px 黑体', '#333333');
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
function canvasTextAutoWrap (str, ctx, initX, initY, drawWidth, lineHeight, rowNum, font, color) {
  ctx.fillStyle = color;
  ctx.font = font;
  var lineWidth = 0;
  var lastSubStrIndex = 0;
  var cntRow = 1;
  var strWidth = 0;
  for (var w = 0; w < str.length; w++) {
    strWidth += ctx.measureText(str[w]).width;
  }
  // if (str === '30G定向流量;免费体验3个月') {
  //   console.log(strWidth, drawWidth);
  // }
  if (strWidth <= (drawWidth - initX) && rowNum === 2) {
    initY += Math.floor(lineHeight / 2);
  }
  for (var i = 0; i < str.length; i++) {
    lineWidth += ctx.measureText(str[i]).width;
    if (lineWidth > drawWidth - initX) { // 减去initX,防止边界出现的问题
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
    if (i === str.length - 1) {
      ctx.fillText(str.substring(lastSubStrIndex, i + 1), initX, initY);
    }
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
  top: 10px;
  right: 2%;
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
}
.index img {
  pointer-events: none;
}
/* 头部个人信息区 */
.header {
  background: #3d8cf7;
  height: 90px;
}
.index .head-img {
  float: left;
  height: 90px;
  line-height: 90px;
  width: 80px;
}
.index .head-img img {
  width: 55px;
  height: 55px;
  margin: 18px 10px 15px 15px;
  border-radius: 100%;
  border: 0;
  outline: none;
}
.index .user-info {
  float: left;
  height: 90px;
  width: calc(100% - 150px);
  padding: 25px 0;
  line-height: 1.5;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.index .nick-name {
  font-size: 16px;
  color: #fff;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.index .nick-name a {
  color: #fff;
}
.index .phone-no {
  font-size: 12px;
  color: #fff;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
/* 业务信息展示区 */
.index .middle {
  background: #6aaaff;
  height: 50px;
  position: relative;
}
.index .middle-item {
  float: left;
  width: 50%;
  height: 100%;
  position: relative;
  text-align: center;
  line-height: 1.2;
  padding-top: 10px;
  font-family: "黑体";
  cursor: pointer;
}
.index .middle-item-number {
  color: #fff;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.index .middle-item-text {
  color: #fff;
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
.index .category-name {
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
}
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
  width: calc(100% - 175px);
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
}
.index .fee-profile {
  overflow: hidden;
  width: calc(100% - 10px);
  /*white-space: nowrap;
  text-overflow: ellipsis;*/
  word-break: break-all;
  color: #8d8d8d;
  font-size: 11px;
  height: 28px;
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
  width: 125px;
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
.index .index .no-record {
  width: 100%;
  padding: 20px;
  text-align: center;
  color: #777;
  font-size: 16px;
}
.index .oper-btn {
  height: 100%;
  position: relative;
  float: left;
  padding-top: 6px;
  cursor: pointer;
}
.index .oper-btn-active {
  opacity: 0.7;
}
.index .btn-qr-code {
  margin-left: 10px;
}
.index .btn-share {
  margin-left: 10px;
}
.index .btn-img {
  width: 30px;
  height: 30px;
  position: relative;
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
  line-height: 25px;
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
  right: 103px;
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
  right: 103px;
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
  height: 25px;
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
  height: 25px;
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
  width: 70%;
  max-width: 420px;
  margin: 0 auto;
  margin-top: 30px;
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
    height: 221px;
    width: 100%;
    background: rgba(0, 0, 0, 0.7);
  }
  .fee-list {
    position: absolute;
    left: 0;
    top: 221px;
    width: 100%;
    background: rgba(0, 0, 0, 0.7);
    min-height: 100%;
  }
  &.no-top-ads {
    .share-guide-padding {
      height: 196px;
    }
    .fee-list {
      top: 196px;
    }
  }
  .fee-item {
    background: transparent;
    .btn-share {
      .btn-text{
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