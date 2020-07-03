<template>
  <div class="check-in" v-if="pageReady">
    <div class="top-bg"></div>
    <div class="btn-rule" @click.self="showRule = true">活动规则</div>
    <div class="tick-box">
      <div class="tick-check">
        <img class="task-icon" src="static/img/checkin/task_check.png" />
        <div class="check-header">签到领好礼</div>
        <check-in class="check-in-item"
                  :dots="tickDots"
                  :days="tickDays"
                  active-dot-color="#FFA86B"
                  inactive-dot-color="#FFF2C6"
                  active-font-color="#fff"
                  inactive-font-color="#FBB13B"
                  last-day-img="static/img/checkin/gift_check.png"></check-in>
        <div class="tick-btn" @click="sign">
          <img :src="todayIsSign || isSigning || tickDays >= 5 ? 'static/img/checkin/btn_check_disabled.png' : 'static/img/checkin/btn_check.png'" />
        </div>
      </div>
      <div class="tick-check share">
        <img class="task-icon share" src="static/img/checkin/task_share.png" />
        <div class="check-header share">分享领好礼</div>
        <check-in class="check-in-item"
                  :dots="shareDots"
                  :days="shareDays"
                  active-dot-color="#D9B275"
                  inactive-dot-color="#FFF2C6"
                  active-font-color="#fff"
                  inactive-font-color="#FBB13B"
                  last-day-img="static/img/checkin/gift_share.png"></check-in>
        <div class="tick-btn" @click="toShare">
          <img :src="shareDays >= 5 ? 'static/img/checkin/btn_share_disabled.png' : 'static/img/checkin/btn_share.png'" />
        </div>
      </div>
      <div class="tick-tip">
        <img class="tip-bell" src="static/img/checkin/bell.png" />
        <span class="tip-text">注：同时完成上述两个任务才能领取1G国内流量</span>
      </div>
    </div>
    <div class="bottom-area">
      <div class="left">
        <img src="static/img/checkin/flow_logo.png" />
      </div>
      <div class="right" @click="submit">
        <img :src="isReceive || !canReceive || isSubmitting ? 'static/img/checkin/btn_submit_disabled.png' : 'static/img/checkin/btn_submit.png'" />
      </div>
    </div>
    <div class="pop-mask" :class="{'show': showPopMsg}">
      <div class="pop-panel">
        <img src="static/img/checkin/pop_bg.png" />
        <div class="pop-msg" v-html="popMsg"></div>
      </div>
    </div>
    <div class="rule-popup" v-if="showRule" @click.self="showRule = false">
      <div class="rule-panel">
        <div class="rule-header">
        </div>
        <div class="rule-body" v-html="actInfo.detail"></div>
        <div class="rule-footer"></div>
        <div class="btn-close" @click="showRule = false">
          <img src="static/img/btn_close.png" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { baseUrl, getRequestParams, sendJsonPostRequest, getSession, sendGetRequest, pageRouter, logout, getJsApiConfig } from 'src/assets/utils.js';
import { Indicator, MessageBox, Toast } from 'mint-ui';
import CheckIn from '@/components/Checkin';

export default {
  components: {
    'check-in': CheckIn
  },
  data() {
    return {
      tickDots: ['1天', '2天', '3天', '4天', '5天'],
      shareDots: ['1天', '2天', '3天', '4天', '5天'],
      tickDays: 0,
      shareDays: 0,
      todayIsSign: false,
      serverUserInfo: '',
      isReceive: true,
      canReceive: false,
      popMsg: '',
      showPopMsg: false,
      isSigning: false,
      isSubmitting: false,
      pageReady: false,
      showRule: false,
      actInfo: {}
    };
  },
  watch: {
    showPopMsg(val) {
      if (val) {
        setTimeout(() => {
          this.showPopMsg = false;
        }, 5000);
      }
    }
  },
  created() {
    document.title = '新手任务';
    this.serverUserInfo = getSession('ptDetailInfo', true); // 获取服务器返回的用户信息
    if (!this.serverUserInfo) {
      logout(this);
    } else {
      let shareUrl = `${window.location.origin + baseUrl}/register/wx/oAuth/userInfo?info=path=checkin`;
      let obj = {
        title: '做任务，领流量',
        desc: '完成合伙人新手任务，1G国内流量免费领，每月都可以领哦！',
        link: shareUrl,
        imgUrl: `${window.location.origin + baseUrl}/partner/static/img/cmcc_logo.png`
      };
      getJsApiConfig(obj);
      this.getActInfo();
      this.getStatus();
    }
  },
  mounted() {

  },
  methods: {
    getActInfo: function() {
      let url = `${baseUrl}/richText/get?code=ACT_NEWUSER_TASK`;
      let reqParams = getRequestParams(
        url,
        '',
        (vue, json) => {
          if (json.status === 0 && json.data) {
            if ('' + json.data.enabled === '0') {
              vue.actInfo = json.data;
              console.log(vue.actInfo);
              vue.pageReady = true;
            } else {
              vue.pageReady = false;
              MessageBox.alert('抱歉，活动已结束').then(() => {
                window.history.back(-1);
              }).catch(e => {
                window.history.back(-1);
              });
            }
          } else {
          }
        },
        (vue, ex) => {
        }
      );
      sendGetRequest(this, reqParams);
    },
    getStatus: function() {
      let url = `${baseUrl}/newuserTask/index`;
      let params = {
        'partner_phone': this.serverUserInfo.phone
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          Indicator.close();
          console.log(json);
          if (json.status === 0) {
            vue.tickDays = json.data.signCount;
            vue.shareDays = json.data.shareCount;
            vue.isReceive = json.data.isReceive;
            vue.todayIsSign = json.data.todayIsSign;
            vue.canReceive = !vue.isReceive && vue.shareDays === 5 && vue.tickDays === 5;
          } else {
            MessageBox.alert(json.msg || '获取数据失败').then(() => {
              window.history.back(-1);
            }).catch(e => {
              console.log(e);
              window.history.back(-1);
            });
          }
        },
        (vue, ex) => {
          Indicator.close();
          Toast('网络异常');
        }
      );
      sendJsonPostRequest(this, reqParams);
    },
    sign: function() {
      if (this.tickDays >= 5) {
        this.popMsg = '<p>签到已满5次。</p>';
        this.showPopMsg = true;
        return;
      }
      if (this.todayIsSign) {
        this.popMsg = '<p>今日已签到，明日再来吧。</p>';
        this.showPopMsg = true;
        return;
      }
      if (this.isSigning) return;
      let url = `${baseUrl}/newuserTask/sign`;
      let params = {
        'partner_phone': this.serverUserInfo.phone
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          Indicator.close();
          console.log(json);
          vue.isSigning = false;
          if (json.status !== 0) {
            vue.popMsg = '<p>签到失败，' + json.msg + '</p>';
            vue.showPopMsg = true;
          } else {
            vue.popMsg = '<p>恭喜你已完成今日签到打卡，明日再来吧，坚持就有奖励哦！</p>';
            vue.showPopMsg = true;
            vue.getStatus();
          }
        },
        (vue, ex) => {
          vue.isSigning = false;
          Indicator.close();
          Toast('网络异常');
        }
      );
      this.isSigning = true;
      Indicator.open();
      sendJsonPostRequest(this, reqParams);
    },
    toShare: function() {
      if (this.shareDays >= 5) {
        this.popMsg = '<p>分享已满5次。</p>';
        this.showPopMsg = true;
        return;
      }
      let routeQry = { p: this.serverUserInfo.phone, ptid: this.serverUserInfo.id };
      pageRouter(this, { path: '/index', query: routeQry });
    },
    submit: function() {
      if (!this.pageReady) {
        MessageBox.alert('抱歉，活动已结束');
        return;
      }
      if (!this.actInfo.remark || !this.actInfo.name) {
        MessageBox.alert('未获取到活动信息，请联系管理员');
        return;
      }
      if (this.isReceive) {
        this.popMsg = '<p>很抱歉，每个用户仅限领取一次。</p>';
        this.showPopMsg = true;
        return;
      }
      if (this.tickDays !== 5 || this.shareDays !== 5) {
        this.popMsg = '<p>同时完成上述两个任务才能领取1G国内流量。</p>';
        this.showPopMsg = true;
        return;
      }
      if (this.isSubmitting) return;
      let url = `${baseUrl}/newuserTask/drawPostage`;
      let params = {
        'partner_phone': '' + this.serverUserInfo.phone,
        'tariff': {
          'SALE_TYPE': '1',
          'EMP_INFO': {
            'EMP_CODE': 'ob0086',
            'PHONE_NO': '' + this.serverUserInfo.phone
          },
          'VERIFY_INFO': {
            'CODE': '',
            'TYPE': ''
          },
          'SERVICE_INFO': {
            'PHONE_NO': '' + this.serverUserInfo.phone
          },
          'TARIFF_INFO': {
            'CODE': this.actInfo.remark,
            'ACTIVE_CODE': this.actInfo.remark,
            'FLAG_CODE': '1',
            'TYPE': 'ADD_MODE',
            'NAME': this.actInfo.name
          },
          'MEMBER_USER_NAME': '13880451171',
          'omitBusinessCodeCheck': 'omit',
          'omitSmsCheck': 'omit'
        }
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          Indicator.close();
          console.log(json);
          vue.isSubmitting = false;
          if (json.status !== 0) {
            vue.popMsg = json.msg || '<p>很抱歉流量领取失败，详情请查看活动规则</p>';
            vue.showPopMsg = true;
          } else {
            vue.popMsg = '<p>恭喜完成新手任务，1G国内流量领取成功，流量稍后到账请查收~</p>';
            vue.showPopMsg = true;
          }
          vue.getStatus();
        },
        (vue, ex) => {
          vue.isSubmitting = false;
          Indicator.close();
          Toast('网络异常');
        }
      );
      this.isSubmitting = true;
      Indicator.open();
      sendJsonPostRequest(this, reqParams);
    }
  }
};
</script>
<style lang="less">
  .check-in {
    position: relative;
    min-height: 100%;
    background: #fff;
    min-width: 270px;
    max-width: 550px;
    margin: 0 auto;
    padding: 1px 0;
    .btn-rule {
      position: absolute;
      top: 11px;
      right: 0;
      border-top-left-radius: 14px;
      border-bottom-left-radius: 14px;
      height: 24px;
      line-height: 24px;
      padding: 0 6px 0 12px;
      text-align: center;
      background: #B49A66;
      font-size: 12px;
      color: #fff;
      z-index: 2;
      cursor: pointer;
    }
    .top-bg {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
      height: 140px;
      width: 100%;
      /*background: linear-gradient(to right, #A1A1A1 100%, #D8D1C2 100%);*/
      background-image: linear-gradient(to right, #A1A1A1 0%, #D8D1C2 100%);
    }
    .tick-box {
      position: relative;
      z-index: 1;
      width: 93%;
      margin: 0 auto;
      background: rgba(223, 194, 139, .9);
      margin-top: 10px;
      border-radius: 8px;
      padding: 10px 0;
      .tick-check {
        width: 95%;
        margin: 20px auto 40px;
        padding: 0 2% 20px;
        background: #fff;
        border-radius: 6px;
        position: relative;
        &.share {
          margin-bottom: 10px;
        }
        .task-icon {
          position: absolute;
          left: 5%;
          top: -12px;
          width: 62px;
          pointer-events: none;
          &.share {
            top: -13px;
          }
        }
        .check-header {
          height: 60px;
          line-height: 60px;
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          width: 100%;
          color: #CE8B62;
          &.share {
            color: #BC9C6A;
          }
        }

        .tick-btn {
          width: 100%;
          height: auto;
          text-align: center;
          position: relative;
          cursor: pointer;
          img {
            width: 100%;
            pointer-events: none;
          }
        }
      }
      .tick-tip {
        width: 100%;
        position: relative;
        padding: 2.5%;
        display: flex;
        .tip-bell {
          pointer-events: none;
          /*width: 24px;*/
          flex: 0 0 auto;
          width: 24px;
          height: 24px;
          vertical-align: middle;
        }
        .tip-text {
          flex: 1 1 auto;
          vertical-align: center;
          color: #7C7B78;
          font-size: 14px;
          line-height: 24px;
          margin-left: 6px;
        }
      }
    }
    .bottom-area {
      display: flex;
      position: relative;
      padding: 0 2.5%;
      margin: 14px 0;
      .left {
        flex: 1 1 60%;
        position: relative;
        img {
          width: 100%;
          pointer-events: none;
          vertical-align: middle;
        }
      }
      .right {
        flex: 1 1 40%;
        position: relative;
        padding: 1.2% 0;
        cursor: pointer;
        img {
          width: 100%;
          pointer-events: none;
          vertical-align: middle;
        }
      }
    }
    .pop-mask {
      max-width: 550px;
      min-width: 270px;
      margin: 0 auto;
      right: 0;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0);
      z-index: -1;
      opacity: 0.5;
      transition: all 0.5s linear;
      &.show {
        z-index: 2;
        opacity: 1;
      }
      .pop-panel {
        position: absolute;
        top: 13%;
        transform: translateY(-13%);
        left: 0;
        right: 0;
        width: 85%;
        margin: 0 auto;
        img {
          width: 100%;
        }
        .pop-msg {
          position: absolute;
          top: 55%;
          left: 0;
          width: 100%;
          height: 45%;
          color: #CE8B61;
          font-family: 黑体;
          font-weight: bold;
          text-align: center;
          line-height: 24px;
          font-size: 16px;
          padding: 0 8%;
        }
      }
    }
    .rule-popup {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0);
      z-index: 2;
      .rule-panel {
        width: 80%;
        height: 50%;
        position: absolute;
        top: 20%;
        left: 10%;
        background: #fff;
        border-radius: 6px;
        box-shadow: 0 5px 10px 0 rgba(104, 60, 43, 0.60);
        .rule-header {
          height: 20px;
          width: 100%;
          position: relative;
        }
        .rule-body {
          width: 100%;
          height: calc(100% - 40px);
          overflow-y: auto;
          padding: 0 15px;
        }
        .rule-footer {
          height: 20px;
          width: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 6px;
        }
        .btn-close {
          position: absolute;
          left: 0;
          right: 0;
          margin: 0 auto;
          bottom: -50px;
          width: 30px;
          height: 30px;
          border-radius: 100%;
          background: #333;
          overflow: hidden;
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
  }
</style>
