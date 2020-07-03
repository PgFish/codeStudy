<template>
  <div class="invite-code-share-container">
    <div class="my-invite-code-wrap">
      <div class="my-invite-code-top">
        <div class="my-invite-code-top-box">
          <div class="my-invite-code-name">{{title}}</div>
          <div class="my-invite-code">{{inviteCode}}</div>
          <button class="my-invite-code-copy-btn" id="inviteCodeCopy">复制</button>
        </div>
      </div>
      <div class="my-invite-code-bottom">
        <div class="my-invite-qr-code" v-if="qrcodeSrc" @touchstart="touchStart" @touchend="touchEnd" @click="fullScreen(qrcodeSrc)">
          <img :src="qrcodeSrc" />
          <div class="code-tip">点击放大</div>
        </div>
        <mt-spinner type="fading-circle" class="circle-loading" v-else></mt-spinner>
        <div class="my-invite-code-share" @click="share(codeType, inviteCode)">分享</div>
      </div>
      <div class="my-invite-code-left-circle"></div>
      <div class="my-invite-code-right-circle"></div>
    </div>
    <div class="code-share-tip-layer" @click.self="closeTipLayer" v-if="tipShow" @touchmove="prevDef($event)">
      <div class="close-btn" @click="closeTipLayer">
        <img src="static/img/btn_close.png">
      </div>
      <div class="top-tip">戳这里完成分享</div>
      <img class="connect-string" src="static/img/index/connect_string.png">
      <img class="pointer-hand" src="static/img/index/hand.png">
      <div class="qrcode-area"><img :src="qrcodeSrc"></div>
      <div class="qr-tip">扫码分享</div>
    </div>

    <div class="code-share-tip-layer" @touchstart="touchStart" @touchend="touchEnd" @click="closeFullScreen" v-if="isFullScreen" @touchmove="prevDef($event)">
      <div class="qrcode-fullscreen"><img :src="fullScreenSrc"></div>
    </div>
  </div>
</template>
<script>
import { baseUrl, isWechat, handleShare, getJsApiConfig } from 'src/assets/utils.js';
import { Indicator, MessageBox, Toast } from 'mint-ui';
import Clipboard from 'clipboard';
import QRCode from 'qrcode';
export default {
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  data() {
    return {
      title: '邀请码',
      codeType: '',
      codeTypeMap: {
        '1': '行客邀请码',
        '2': '校客邀请码',
        '3': '商客邀请码'
      },
      inviteCode: '',
      qrcodeSrc: '',
      tipShow: false,
      isFullScreen: false,
      fullScreenSrc: ''
    };
  },
  watch: {
  },
  created() {
    Indicator.close();
    this.title = this.codeTypeMap[this.$route.query.ct] || '邀请码';
    document.title = this.title;
    console.log(this.$route.query.ct, this.$route.query.c);
    this.codeType = this.$route.query.ct;
    this.inviteCode = this.$route.query.c;
    let url = this.buildUrl(this.codeType, this.inviteCode, 'public');
    let obj = {
      title: '政企合伙人',
      timelineTitle: '政企合伙人-' + this.title + '：' + this.inviteCode,
      desc: this.title + '：' + this.inviteCode,
      link: url,
      imgUrl: `${window.location.origin + baseUrl}/partner/static/img/cmcc_logo.png`,
      hideList: [
        // 'menuItem:share:qq',
        // 'menuItem:share:weiboApp',
        // 'menuItem:share:appMessage',
        // 'menuItem:share:timeline',
        // 'menuItem:favorite',
        // 'menuItem:share:facebook',
        // 'menuItem:share:QZone',
        'menuItem:copyUrl'
        // 'menuItem:openWithSafari',
        // 'menuItem:openWithQQBrowser',
        // 'menuItem:share:email'
      ],
      success: () => {
      },
      cancel: () => {
      }
    };
    getJsApiConfig(obj);
    this.drawQrCode();
  },
  mounted() {
    this.clip = new Clipboard('#inviteCodeCopy', {
      text: () => {
        return this.inviteCode;
      }
    });
    this.clip.on('success', (ev) => { // 复制到剪切板成功
      // console.log('成功', ev);
      Toast({
        message: '复制到剪切板成功！'
      });
    });
    this.clip.on('error', (ev) => { // 复制到剪切板失败
      // console.log('失败', ev);
      Toast({
        message: '复制到剪切板失败！请手动复制'
      });
    });
  },
  methods: {
    prevDef: function (e) {
      e.stopPropagation();
      e.preventDefault();
    },
    share: function(codeType, code) {
      let url = this.buildUrl(codeType, code);
      console.log(url);
      if (!isWechat()) {
        Indicator.close();
        let shareObj = {
          shareTitle: '政企合伙人',
          shareDesc: this.title + '：' + this.inviteCode,
          shareLink: url,
          sharePic: ''
        };
        handleShare(this, shareObj);
        return;
      }
      this.tipShow = true;
    },
    buildUrl: function(codeType, code, urlType) {
      let url = `${window.location.origin + baseUrl}/partner/#/codeshare?ct=${codeType}&c=${code}`;
      if (process.env.NODE_ENV === 'development') {
        url = `${window.location.origin}/#/codeshare?ct=${codeType}&c=${code}`;
      }
      if (urlType === 'public') {
        url = `${window.location.origin + baseUrl}/packageSalary/share?url=${encodeURIComponent(url)}`;
      }
      return url;
    },
    buildQRUrl: function(inviteCode) {
      let url = `${window.location.origin + baseUrl}/register/wx/oAuth/userInfo?info=inviteCode=${inviteCode}`;
      return url;
    },
    drawQrCode: function() {
      let url = this.buildQRUrl(this.inviteCode);
      let opts = {
        errorCorrectionLevel: 'Q',
        type: 'image/png',
        width: 1000,
        rendererOpts: {
          quality: 0.3
        },
        margin: 0
      };
      this.consoleLogs += '<p>____________</p><p>开始生成二维码</p>';
      QRCode.toCanvas(url, opts).then(qrCanvas => {
        var width = 120;
        var height = 120;
        var x = width * 3.3;
        var y = height * 3.3;
        var lw = width * 0.28;
        var lh = height * 0.28;

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
          this.qrcodeSrc = qrCanvas.toDataURL('image/png');
        };
      });
    },
    closeTipLayer: function() {
      this.tipShow = false;
    },
    fullScreen: function(clickedSrc) {
      if (this.duringTime >= 600) {
        return;
      }
      this.fullScreenSrc = clickedSrc;
      this.isFullScreen = true;
    },
    closeFullScreen: function() {
      if (this.duringTime >= 600) {
        return;
      }
      this.isFullScreen = false;
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
</script>
<style lang="less">
  .invite-code-share-container {
    background: #f0f0f0;
    padding: 20px 5%;
    height: 100%;
  }
  .my-invite-code-wrap {
    height: 300px;
    width: 100%;
    max-width: 300px;
    margin: 0 auto 20px;
    background: #fff;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
  }
  .my-invite-code-top {
    height: 145px;
    border-bottom: 1px dashed #ccc;
    position: relative;
    padding-top: 30px;
  }
  .my-invite-code-top-box {
    width: 65%;
    height: 115px;
    margin: 0 auto;
    max-width: 195px;
    border-top: 2px solid #777;
  }
  .my-invite-code-name {
    width: 50%;
    max-width: 150px;
    text-align: center;
    font-size: 15px;
    height: 20px;
    line-height: 20px;
    margin: 0 auto;
    margin-top: -10px;
    background: #fff;
  }
  .my-invite-code {
    text-align: center;
    font-size: 32px;
    margin-top: 10px;
    color: #000;
  }
  .my-invite-code-copy-btn {
    width: 80px;
    height: 25px;
    text-align: center;
    line-height: 25px;
    background: #3D8CF7;
    color: #fff;
    border-radius: 20px;
    margin: 10px auto;
    font-size: 12px;
    border: none;
    -webkit-appearance: none;
    outline: none;
    display: block;
  }
  .my-invite-code-bottom {
    height: 145px;
    position: relative;
    padding-top: 15px;
  }
  .my-invite-code-bottom .my-invite-qr-code {
    width: 110px;
    height: 110px;
    margin: 0 auto;
  }
  .my-invite-code-left-circle, .my-invite-code-right-circle {
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 100%;
    background: #f0f0f0;
    top: 137px;
    z-index: 2;
  }
  .my-invite-code-left-circle {
    left: -8px;
  }
  .my-invite-code-right-circle {
    right: -8px;
  }
  .my-invite-qr-code img {
    width: 100%;
    height: 100%;
  }
  .my-invite-code-share {
    position: absolute;
    top: 15px;
    right: 15px;
    height: 20px;
    width: 45px;
    text-align: center;
    line-height: 20px;
    border-radius: 20px;
    border: 1px solid #3D8CF7;
    color: #3D8CF7;
    font-size: 12px;
  }

  .code-share-tip-layer {
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
  .code-share-tip-layer * {
    user-select: none;
  }
  .code-share-tip-layer .close-btn {
    position: absolute;
    left: 0;
    top: 0;
    width: 50px;
    height: 50px;
    padding: 13px;
    cursor: pointer;
  }
  .code-share-tip-layer .close-btn img {
    width: 24px;
    height: 24px;
  }
  .code-share-tip-layer .top-tip {
    font-size: 18px;
    position: absolute;
    right: 146px;
    top: 66px;
  }
  .code-share-tip-layer .connect-string {
    width: 55px;
    height: 55px;
    position: absolute;
    right: 66px;
    transform: rotate(17deg);
    top: 40px;
  }
  .code-share-tip-layer .pointer-hand {
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
  .code-share-tip-layer .qrcode-area {
    padding: 10px;
    margin: 50px auto 20px;
    position: relative;
    text-align: center;
    width: 150px;
    height: 150px;
    background: #fff;
  }
  .code-share-tip-layer .qrcode-area img {
    pointer-events: all;
    width: 100%;
    height: 100%;
  }
  .code-share-tip-layer .qr-tip {
    width: 100%;
    font-size: 18px;
    color: #fff;
    text-align: center;
  }
  .code-share-tip-layer .qrcode-fullscreen {
    width: 85%;
    padding: 10px;
    margin: 0 auto;
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background: #fff;
  }
  .code-share-tip-layer .qrcode-fullscreen img {
    pointer-events: all;
    width: 100%;
    height: 100%;
  }
  .circle-loading {
    display: block;
    margin: 40px auto;
    width: 28px;
  }
  .code-tip {
    width: 100%;
    font-size: 10px;
    text-align: center;
    color: #333;
  }
</style>
