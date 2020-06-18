<template>
  <div class="share-shop">
    <div class="header">
      <img class="header-bg" src="static/img/shareshop/shareshop_bg.png" />
      <div class="header-profile-box">
        <div class="head-img">
          <img :src="headPicture">
        </div>
        <div class="user-info">
          <div class="phone-no">{{phone + '的店铺'}}</div>
        </div>
      </div>
    </div>
    <div style="height: 30px; width: 100%; background: #fff;"></div>
    <div class="clear-float"></div>
    <div class="category-list" v-if="list.length > 0" ref="scrollNav">
      <template v-for="(category, j) in list">
        <div :key="'category_' + category.id" class="category-item" :class="{'category-item-selected': selectedCategory === category.id}" @click="categoryChange(category.id)">
          <div class="category-divider" v-if="j > 0"></div>
          <div class="category-name" :class="{'is-ios': isIOS}">{{category.name}}</div>
        </div>
      </template>
    </div>
    <div class="fee-list">
      <template v-for="(category, j) in list" v-if="category.id === selectedCategory">
        <template v-for="(fee, i) in category.packageList">
          <div class="fee-item" :class="{'fee-item-1': i === 0}" :key="'category_' + category.id + '_fee_' + fee.id" @click="jump(fee, category.id)">
            <div class="fee-img">
              <img :src="fee.icon">
            </div>
            <!-- 2:特惠流量,7:玩出无穷新意,8:智慧生活 -->
            <template v-if="/^2|7|8$/.test(category.id) || /^\d+$/.test(fee.remark)">
              <div class="fee-intro">
                <div class="fee-title">{{fee.productName}}</div>
                <div class="fee-profile">{{fee.typeIntroduce}}</div>
              </div>
            </template>
            <template v-else>
              <div class="fee-intro">
                <div class="fee-title">{{fee.packageName}}</div>
                <div class="fee-profile">{{fee.packageBrief}}</div>
              </div>
            </template>
            <!-- <div class="fee-operations" @click="prevDef($event)">
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
            </div> -->
          </div>
          <!-- <div class="fee-data" :class="{'fee-data-show': expandArr.indexOf(i) >= 0}">
            <div class="fee-data-order-no">订单量：{{pInt(fee.orderNum)}}</div>
          </div> -->
        </template>
      </template>
    </div>
    <div v-if="!lastPage && isLoading" class="is-loading">加载中...</div>
    <div v-if="list.length === 0 && !isLoading" class="no-record">产品升级中，敬请期待...</div>

    <!-- 图片占位 -->
    <img :src="advertisement.imgUrl" style="width: 100%; visibility: hidden; margin-top: 4px; pointer-events: none;" v-if="isAdsShow && advertisement.imgUrl" />
    <div class="share-ads" @touchmove="prevDef($event)" @click="goImgLink($event)" v-if="isAdsShow && advertisement.imgUrl">
      <img :src="advertisement.imgUrl" />
      <div class="ads-close-btn" @click.self="closeAds($event)"></div>
    </div>
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
  </div>
</template>
<script>
  import { baseUrl, getRequestParams, sendGetRequest, decryptByDES, YEK_SED, isWechatBoolean, handleShare, getJsApiConfig, showMenuItems, pageRouter, getSession, saveSession, isIOS } from 'src/assets/utils';
  import { Indicator, MessageBox, Toast } from 'mint-ui';
  import QRCode from 'qrcode';

  export default {
    components: {
      Indicator,
      MessageBox,
      Toast
    },
    data() {
      return {
        ptUserInfo: {},
        phone: '',
        realName: '',
        list: [],
        lastPage: false,
        isLoading: true,
        expandArr: [],
        currentShareFee: {},
        tipShow: false,
        qrcodeShow: false,
        partnerId: '',
        selectedCategory: '',
        advertisement: {},
        isAdsShow: true,
        headPicture: '',
        isIOS: isIOS()
      };
    },
    watch: {

    },
    created() {
      Indicator.close();
      document.title = '店铺';
      this.partnerId = this.$route.query.ptid;
      let phone = decryptByDES.CBC('' + this.$route.query.p, YEK_SED);
      if (phone.length === 11) {
        this.phone = `${phone.substr(0, 3)}****${phone.substr(7, 4)}`;
        this.getList();
      } else {
        document.title = 'Error';
      }
      console.log(this.phone, this.partnerId);
      this.countRecord();
      this.getAds();
    },
    mounted() {

    },
    methods: {
      getAds: function() {
        if (getSession('shareshop_ads')) {
          this.advertisement = getSession('shareshop_ads', true);
          return;
        }
        let url = `${baseUrl}/common/getSystemConfig?typeCode=SHOP_SHARE_ADS`;
        let reqParams = getRequestParams(
          url,
          '',
          (vue, json) => {
            console.log(json);
            if (json && json.status === 0 && json.data.length > 0) {
              vue.advertisement = json.data[0];
              saveSession('shareshop_ads', vue.advertisement);
            }
          },
          (vue, ex) => {
            console.log(ex);
          }
        );
        sendGetRequest(this, reqParams);
      },
      closeAds: function(e) {
        this.prevDef(e);
        console.log('closeAds');
        this.isAdsShow = false;
      },
      goImgLink: function(e) {
        this.prevDef(e);
        if (!/^http/.test(this.advertisement.value)) {
          return;
        }
        this.advertisement.value = this.advertisement.value.replace(/\/gpas/i, baseUrl);
        let url = this.advertisement.value + `listeninviteCode=${this.$route.query.inviteCode}`;
        window.location.href = url;
      },
      categoryChange: function(categoryId) {
        this.$store.commit('SET_TABINDEX', Object.assign({}, {
          categoryId: categoryId,
          scrollLeft: this.$refs.scrollNav.scrollLeft
        }));
        this.selectedCategory = categoryId;
      },
      countRecord: function() {
        let phoneNumber = this.$route.query.p;
        let shareUrl = `${window.location.origin + baseUrl}/common/redirect?info=path=shareshoplistenp=${phoneNumber}listenptid=${this.partnerId}`;
        console.log(shareUrl);
        let obj = {
          title: '欢迎进入我的移动营业厅',
          desc: '移动业务一键办理，号卡免费领，流量特惠办，更有超多福利等你来，点击立即进入>>',
          link: shareUrl,
          imgUrl: `${window.location.origin + baseUrl}/partner/static/img/cmcc_logo.png`
        };
        getJsApiConfig(obj);
        if (getSession('shareshop_cnt')) return;
        saveSession('shareshop_cnt', '1');
        let url = `${baseUrl}/shareStatistics/statisticShare?phoneNumber=${phoneNumber}&type=2`; // type=1表示点击分享按钮，type=2表示进入分享页面
        let reqParams = getRequestParams(url); // 统计不需要处理返回值
        sendGetRequest(this, reqParams);
      },
      prevDef: function (e) {
        e.stopPropagation();
        e.preventDefault();
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
      getList: function() {
        let url = `${baseUrl}/packageSalary/listForShare?phone=${this.$route.query.p}`;
        let reqParams = getRequestParams(
          url,
          '',
          (vue, json) => {
            vue.isLoading = false;
            Indicator.close();
            console.log(json);
            if (json.status !== 0) {
              Toast(json.msg || '没有可选的资费');
              return;
            }
            vue.ptUserInfo = {
              'headimgurl': json.data.headImg,
              'phone': json.data.phone
            };
            let newImg = new Image();
            newImg.src = vue.ptUserInfo.headimgurl;
            newImg.onload = () => {
              vue.headPicture = vue.ptUserInfo.headimgurl;
            };
            newImg.onerror = () => {
              console.info('图片加载失败');
              vue.headPicture = 'static/img/cmcc_logo.png';
            };
            vue.list = vue.list.concat(json.data.categoryList);
            if (vue.list.length > 0) {
              // vue.selectedCategory = vue.list[0].id;
              if (vue.$store.getters.getTabIndexId) {
                vue.selectedCategory = vue.$store.getters.getTabIndexId.categoryId;
                vue.$nextTick(() => {
                  vue.$refs.scrollNav.scrollLeft = vue.$store.getters.getTabIndexId.scrollLeft;
                });
              } else {
                vue.selectedCategory = vue.list[0].id;
              }
            }
          },
          (vue, ex) => {
            vue.isLoading = false;
            Toast('网络异常');
            Indicator.close();
          }
        );
        sendGetRequest(this, reqParams);
      },
      expand: function (e, index, fee) {
        e.stopPropagation();
        // Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_index_dataBtn', 'WT.event', 'gpas_btn_data_' + fee.id] });
        var findIndex = this.expandArr.indexOf(index);
        if (findIndex >= 0) {
          this.expandArr.splice(findIndex, 1);
        } else {
          this.expandArr.push(index);
        }
      },
      jump: function (fee, categoryId) {
        if ('' + categoryId !== '1' || fee.remark) { // 非号卡业务
          // if (/^2|7|8$/.test(categoryId)) { // 2:特惠流量;7:玩出无穷新意;8:智慧生活，跳转本地页面
          //   pageRouter(this, { path: '/handlesuperflow', query: { id: fee.id } });
          // } else
          if ('' + categoryId === '5') { // 合家欢，跳转本地页面
            pageRouter(this, { path: '/familyDetail', query: { id: fee.id } });
          } else {
            if ('' + fee.deployMethod === '0') { // 自定义跳转
              if ('' + fee.remark === '1') { // 权益新升级
                pageRouter(this, { path: '/promisefee', query: { id: fee.id, partnerId: this.partnerId } });
              } else if ('' + fee.remark === '8') { // 电视业务
                pageRouter(this, { path: '/tvaddfee', query: { id: fee.id, partnerId: this.partnerId } });
              } else if ('' + fee.remark === '10') { // 聚合业务
                pageRouter(this, { path: '/consobusiness', query: { id: fee.id, partnerId: this.partnerId } });
              } else { // 未配置跳转方式，默认跳转通用资费模板（原特惠流量页面）
                pageRouter(this, { path: '/handlesuperflow', query: { id: fee.id, partnerId: this.partnerId } });
                // pageRouter(this, { path: '/feedetail', query: { id: fee.id } });
              }
            } else { // 后台配置，默认跳转通用资费模板（原特惠流量页面）
              pageRouter(this, { path: '/handlesuperflow', query: { id: fee.id } });
            }
          }
          return
        }
        if ('' + categoryId === '1') { // 0元号卡资费，跳转本地页面
          let jumpUrl = this.buildUrl(fee.publicUrl);
          window.location.href = jumpUrl;
        }
      },
      share: function (e, fee, categoryId) {
        e.stopPropagation();
        // Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_index_shareBtn', 'WT.event', 'gpas_btn_share_' + fee.id] });
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
        // Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_index_qrBtn', 'WT.event', 'gpas_btn_qr_' + fee.id] });
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
  background: #e8e8e8;
}
.share-shop {
  max-width: 550px;
  min-width: 270px;
  margin: 0 auto;
  min-height: 100%;
  background: #f2f2f2;
  /* 头部个人信息区 */
  .header {
    position: relative;
    background: #fff;
    z-index: 1;
    .header-bg {
      position: relative;
      width: 100%;
      height: 88px;
      z-index: 0;
    }
    .header-profile-box {
      position: absolute;
      bottom: 0;
      width: 90%;
      left: 0;
      right: 0;
      margin: 0 auto;
      height: 70px;
      background: #FFFFFF;
      box-shadow: 0 4px 20px 0 rgba(62,139,248,0.30);
      border-radius: 10px;
      .head-img {
        position: absolute;
        left: 20px;
        top: -10px;
        height: 60px;
        line-height: 60px;
        width: 60px;
        img {
          width: 60px;
          height: 60px;
          border-radius: 100%;
          border: 0;
          outline: none;
        }
      }
      .user-info {
        position: absolute;
        top: 0;
        left: 90px;
        padding: 8px 0 0;
        line-height: 1.5;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        width: calc(100% - 90px);
        .phone-no {
          margin-top: 10px;
          font-size: 14px;
          color: #333;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
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
      flex: 0 0 auto;
      height: 35px;
      line-height: 35px;
      text-align: center;
      color: #333;
      position: relative;
      font-size: 14px;
      padding: 0 16px;
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
  .fee-list {
    .fee-item {
      width: 100%;
      background: #fff;
      height: 90px;
      margin-top: 1px;
      position: relative;
      padding: 18px 14px;
      overflow: hidden;
      cursor: pointer;
    }
    .fee-item.fee-item-1 {
      margin-top: 0;
    }
    .fee-img {
      float: left;
      position: relative;
      width: 66px;
      height: 55px;
    }
    .fee-img img {
      width: 55px;
      height: 55px;
    }
    .fee-intro {
      float: left;
      width: calc(100% - 175px);
      height: 100%;
      line-height: 1.7;
      padding-top: 1px;
    }
    .fee-title {
      white-space: nowrap;
      overflow: hidden;
      /*text-overflow: ellipsis;*/
      color: #333;
      font-size: 15px;
      font-weight: bold;
      /*margin-top: 4px;*/
    }
    .fee-profile {
      overflow: hidden;
      width: calc(100% - 10px);
      /*white-space: nowrap;
      text-overflow: ellipsis;*/
      word-break: break-all;
      color: #8d8d8d;
      font-size: 12px;
      height: 28px;
      line-height: 15px;
    }
    .fee-share-profit {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #b29d79;
      font-size: 10px;
    }
    .fee-operations {
      width: 125px;
      height: 90px;
      position: absolute;
      right: 0;
      top: 0;
      padding: 20px 15px 20px 0;
    }
    .oper-btn {
      height: 100%;
      position: relative;
      float: left;
      padding-top: 6px;
      cursor: pointer;
    }
    .oper-btn-active {
      opacity: 0.7;
    }
    .btn-qr-code {
      margin-left: 10px;
    }
    .btn-share {
      margin-left: 10px;
    }
    .btn-img {
      width: 30px;
      height: 30px;
      position: relative;
    }
    .btn-img img {
      width: 100%;
      height: 100%;
    }
    .btn-text {
      color: #7e7975;
      font-size: 10px;
      text-align: center;
      margin-top: 2px;
    }
    .fee-data {
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
    .fee-data:before {
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
    .fee-data:after {
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
    .fee-data-show {
      /*overflow: initial;*/
      /*visibility: visible;*/
      border-top: 1px solid #cfcfcf;
      height: 30px;
    }
    .fee-data-show.fee-data:before {
      /*display: block;*/
      opacity: 1;
      /*visibility: visible;*/
    }
    .fee-data-show.fee-data:after {
      visibility: visible;
    }
    .fee-data-order-no {
      float: right;
      width: 50%;
      height: 1px;
      overflow: hidden;
      transition: all 0.5s ease-in-out;
    }
    .fee-data-est-profit {
      float: left;
      width: 50%;
      height: 1px;
      overflow: hidden;
      transition: all 0.5s ease-in-out;
    }
    .fee-data-show .fee-data-order-no,
    .fee-data-show .fee-data-est-profit {
      /*overflow: initial;*/
      height: 30px;
    }
  }
  .share-ads {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 100%;
    text-align: center;
    max-width: 550px;
    min-width: 270px;
    .ads-close-btn {
      position: absolute;
      top: 0;
      right: 1.5%;
      width: 6.5%;
      height: 38%;
    }
    img {
      width: 100%;
    }
  }
  .is-loading {
    width: 100%;
    padding: 4px;
    text-align: center;
    color: #777;
    font-size: 12px;
    z-index: 0;
  }
  .no-record {
    width: 100%;
    padding: 20px;
    text-align: center;
    color: #777;
    font-size: 16px;
  }
  .tip-layer {
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
  .qrcode-layer {
    background: rgba(0, 0, 0, 0.4);
  }
  .tip-layer * {
    user-select: none;
  }
  .tip-layer .close-btn {
    position: absolute;
    left: 0;
    top: 0;
    width: 50px;
    height: 50px;
    padding: 13px;
    cursor: pointer;
  }
  .tip-layer .close-btn img {
    width: 24px;
    height: 24px;
  }
  .tip-layer .top-tip {
    font-size: 22px;
    position: absolute;
    right: 146px;
    top: 66px;
  }
  .tip-layer .connect-string {
    width: 55px;
    height: 55px;
    position: absolute;
    right: 66px;
    transform: rotate(17deg);
    top: 40px;
  }
  .tip-layer .pointer-hand {
    width: 30px;
    height: 40px;
    position: absolute;
    right: 20px;
    top: 10px;
    animation: jump 0.5s linear infinite;
  }
  .tip-layer .canvas-area {
    padding: 20px 0 10px;
    position: relative;
    text-align: center;
  }
  .tip-layer .canvas-area img {
    pointer-events: all;
    width: 70%;
    max-width: 420px;
    margin: 0 auto;
    margin-top: 30px;
  }
  .tip-layer .qr-tip {
    width: 100%;
    font-size: 18px;
    color: #fff;
    text-align: center;
  }
}
img {
  pointer-events: none;
}
@keyframes jump {
  0% {
    transform: translateY(-2px);
  }
  100% {
    transform: translateY(2px);
  }
}
</style>
