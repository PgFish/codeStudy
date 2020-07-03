<template>
  <div id="app" :class="{'emp': isEmp}">
    <router-view v-if="hasAuth"></router-view>
    <!-- <div class="console-panel" v-html="consoleLogs"></div> -->
    <div class="protocol-popup" v-if="showAgree">
      <div class="agree-body">
        <div class="agree-text" v-html="agreement">
        </div>
        <div class="agree-footer">
          <div class="agree-btn agree-btn-cancel" @click="clickDisagree">不同意</div>
          <div class="agree-btn agree-btn-confirm" @click="clickAgree">同意</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getParamValue, isZTBoolean, isWechatBoolean, isDZGBoolean, sourceType } from 'src/assets/utils';
import { Indicator } from 'mint-ui';
import { allowPages } from 'src/permission.js';

export default {
  data() {
    return {
      hasAuth: false,
      isEmp: false,
      consoleLogs: '',
      showAgree: false,
      agreement: ''
    };
  },
  mounted() {
    this.Bus.$on('openAgree', (agreement) => {
      console.log('openAgreeTriggerred');
      if (agreement) {
        this.agreement = agreement;
        this.showAgree = true;
      }
    });
  },
  created() {
    this.Bus.loading = this.Bus.$createToast({
      time: 0,
      txt: '加载中...',
      mask: true
    })
    if (sourceType === 'employee') {
      this.isEmp = true;
    }
    if (isZTBoolean) {
      document.title = '四川移动合伙人';
    } else {
      document.title = '加载中...';
    }
    Indicator.open();
    // this.consoleLogs += '<p>有无getShareInfoShowRightTopShareBtn方法：' + (typeof getShareInfoShowRightTopShareBtn) + ',' + (typeof getShareInfoShowRightTopShareBtn !== 'undefined') + '</p>';
    // this.consoleLogs += '<p>有无jumpShare.jumpToShare方法：' + (typeof jumpShare !== 'undefined' && jumpShare.jumpToShare) + '</p>';
    // this.consoleLogs += '<p>isZT：' + window.getShareInfoShowShareBtnWithType + '</p>';
    let backDoor = getParamValue('royyi') === '1' || process.env.NODE_ENV === 'development';
    let isWX = isWechatBoolean; // 是微信的链接，并且是微信浏览器
    let isZT = isZTBoolean; // 是掌厅链接，并且是掌厅浏览器
    let isDZG = isDZGBoolean; // 是大掌柜链接，并且是大掌柜浏览器

    let pageReg = new RegExp('#/(' + allowPages + ')', 'i');
    let exceptPages = pageReg.test(window.location.hash); // 放开权限的页面
    // this.consoleLogs += '<p>当前页面hash路由：' + window.location.hash + '</p>';
    if (backDoor || exceptPages || isWX || isZT || isDZG) {
      this.hasAuth = true;
    } else {
      setTimeout(() => {
        Indicator.close();
      }, 2000);
      this.hasAuth = false;
      document.title = 'Error';
    }
  },
  methods: {
    clickDisagree () {
      this.Bus.$emit('closeAgree', false);
      this.showAgree = false;
    },
    clickAgree () {
      this.Bus.$emit('closeAgree', true);
      this.showAgree = false;
    }
  }
};
</script>
<style lang="less">
  @import "../static/css/main.css";
  .emp {
    max-width: 550px;
    margin: 0 auto;
    top: 0;
    left: 0;
    right: 0;
    box-shadow: 0 0 5px 0 #e0e0e0;
  }
  .console-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 250px;
    height: 300px;
    z-index: 9999999;
    background: rgba(0, 0, 0, .7);
    color: #fff;
    padding: 4px;
    overflow-y: auto;
    word-break: break-all;
    font-size: 12px;
  }
  .protocol-popup {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, .7);
    z-index: 99999;
    .agree-body {
      width: 90%;
      max-width: 486PX;
      margin: 0 auto;
      right: 5%;
      height: 90%;
      position: absolute;
      top: 5%;
      left: 5%;
      background: #fff;
      border-radius: 6px;
      .agree-text {
        text-align: left;
        // text-indent: 32px;
        padding: 20px 20px 50px 20px;
        overflow: scroll;
        height:100%;
        * {
          max-width: 100%;
        }
      }
      .agree-footer {
        height: 50px;
        width: 100%;
        border-top: 1px solid #eee;
        position: relative;
        overflow: hidden;
        border-radius: 6px;
        background-color: #FFFFFF;
        display: flex;
        top: -50px;
        .agree-btn {
          width: 50%;
          line-height: 50px;
          text-align: center;
          font-size: 16px;
          &.agree-btn-confirm {
            color: #2d9cf7;
          }
        }
      }
    }
  }
</style>
