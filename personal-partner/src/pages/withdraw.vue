<template>
  <div class="withdraw" v-show="showPage">
    <div class="no-withdraw-content" v-if="isNowithdraw">
      <div class="no-withdraw-rule" @click="openWithdrawRule">
        *提现规则
      </div>
      <img :src="statusInfo.src">
      <div class="no-withdraw-text" v-html="statusInfo.tips">
      </div>
      <div class="no-withdraw-btn" v-if="isNowithdraw" @click="backIndex">
        确认
      </div>
    </div>
    <div v-if="!isNowithdraw">
      <div class="withdraw-content">
        <div class="withdraw-content-header flex-row">
          <div class="content-head-text">
            可提现金额
          </div>
          <div class="content-head-balance">
            ￥{{round(balance)}}
          </div>
        </div>
        <div class="withdraw-content-input">
          <div class="content-input-text">
            提现金额
          </div>
          <div class="content-input">
            <div class="content-input-unit">￥</div>
            <input type="text" :placeholder="withdrawText" v-model="amount">
          </div>
        </div>
      </div>
      <div class="withdraw-rule" @click="openWithdrawRule">
        *提现规则
      </div>
      <div class="withdraw-btn" @click="withdraw">
        提现
      </div>
      <div class="withdraw-gotoTradeDetail">
        <img src="static/img/withdraw/tradedetail.png" @click="gotoTradeDetail">
      </div>
    </div>
    <template>
      <mt-popup class="picker-popup-wd" v-model="withdrawRuleShow">
        <div class="popup-wd-header">
          <div class="popup-wd-content-title">提现规则</div>
          <div class="popup-wd-close">
            <img src="static/img/common/btn_close.png" @click="closeWithdrawRule">
          </div>
        </div>
        <div class="popup-wd-content" v-html="withdrawRuleContent">
          <!-- <p>1、如何将“合伙人”收益提现？</p>
          <p style="text-indent:1em;">操作方法：每周二为提现日，当日进入“合伙人”店铺首页【去提现】->输入提现金额->【提现】。资金将发放到合伙人微信零钱，请确保关注 微信公众号“四川移动合伙人”，并绑定手机号（绑定手机号为“合伙人”注册手机号）。</p>
          <p>2、如何查看“合伙人”提现记录：</p>
          <p style="text-indent:1em;">操作方法：进入合伙人店铺首页【去提现】->【查看交易明细】，可查询交易明细。</p>
          <p>3、合伙人提现到账时间说明：</p>
          <p style="text-indent:1em;">提现后24小时内发放到微信零钱</p>
          <p>4、合伙人提现额度限制：</p>
          <p style="text-indent:1em;">每笔提现金额20元（含）—— 1000元（含），每周二可以提现，当天只能提现1次。</p>
          <p>5、提现失败说明：</p>
          <p style="text-indent:1em;">提现失败后，资金将会原路退回到“合伙人”账户。</p> -->
        </div>
      </mt-popup>
    </template>
  </div>
</template>

<script>
  import { baseUrl, getRequestParams, sendGetRequest, sendJsonPostRequestWithDES, getParamValue, decryptByDES, YEK_SED, pageRouter } from 'src/assets/utils.js';
  import { Indicator, MessageBox, Toast } from 'mint-ui';
  import Qs from 'qs';
  export default {
    components: {
      Indicator,
      MessageBox,
      Toast
    },
    data() {
      return {
        userInfo: {},
        isNowithdraw: false,
        showPage: false,
        amount: '',
        statusInfo: {},
        balance: 0,
        minWithDrawCash: 20,
        withdrawText: '提现金额需大于等于20',
        withdrawRuleShow: false,
        withdrawRuleContent: ''
      };
    },
    watch: {
      amount(val) {
        // let maxAmount = 800;
        // maxAmount = Number(this.balance) > 800 ? 800 : Number(this.balance);
        let maxAmount = Number(this.balance);
        if (Number(val) > maxAmount) {
          this.amount = maxAmount;
        }
        if (Number(val) >= 1 && val.indexOf('0') === 0) {
          this.amount = val.replace('0', '');
        }
        // if (val === '.') {
        //   this.amount = '0.';
        // }
        let reg = /^\d+\.?\d{0,2}$/;
        if (!reg.test(val)) {
          this.amount = val.substr(0, val.length - 1);
        }
        // if (val)
      }
    },
    created() {
      document.title = '酬金提现';
      let params = decryptByDES.CBC(getParamValue('params'), YEK_SED);
      if (params) {
        this.userInfo = JSON.parse(params).userInfo;
      }
      this.statusMapping = {
        '0': {
          tips: '<p>提现未达到最低要求</p><p>继续加油哦~</p>',
          src: 'static/img/withdraw/nowithdraw.png'
        },
        '5': {
          tips: '<p>您今日提现次数已用完</p><p>请下个提现日再来吧~</p>',
          src: 'static/img/withdraw/nowithdraw.png'
        },
        '6': {
          tips: '<p>您有一笔提现正在处理中</p>',
          src: 'static/img/withdraw/withdrawing.png'
        }
      };
      this.judgeWithdraw();
      this.getWithdrawRule();
    },
    methods: {
      round: function(val, n) {
        var result = parseFloat(val);
        if (!n && n !== 0) n = 2;
        return Math.round(result * Math.pow(10, n)) / Math.pow(10, n);
      },
      roundKeep: function(val, n) {
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
      pInt: function(val) {
        return parseInt(val, 10);
      },
      judgeWithdraw: function() {
        let url = baseUrl + '/packageSalary/salary';
        let params = Qs.stringify({
          phone: this.$route.query.p
        });
        url = url + '?' + params;
        let reqParams = getRequestParams(url, '', this.judgeWithdrawSuc, this.judgeWithdrawFail, '');
        Indicator.open();
        sendGetRequest(this, reqParams);
      },
      judgeWithdrawSuc: function(vue, json) {
        Indicator.close();
        vue.showPage = true;
        if (json && json.status === 0) {
          vue.balance = json.data.salary;
          vue.minWithDrawCash = json.data.minWithDrawCash === undefined ? 20 : json.data.minWithDrawCash;
          vue.withdrawText = '提现金额需大于等于' + vue.minWithDrawCash;
          if (json.data.salary < vue.minWithDrawCash || json.data.status !== 0) {
            vue.statusInfo = vue.statusMapping[json.data.status];
            vue.isNowithdraw = true;
          } else {
            vue.isNowithdraw = false;
          }
        }
      },
      judgeWithdrawFail: function(vue, ex) {
        Indicator.close();
        Toast('异常：' + ex);
      },
      withdraw: function() {
        if (isNaN(Number(this.amount))) {
          Toast('请输入提现金额');
          return;
        }
        if (Number(this.amount) < this.minWithDrawCash) {
          Toast('提现金额不能少于' + this.minWithDrawCash);
          return;
        }
        let url = baseUrl + '/packageSalary/withdraw';
        let params = {
          phone: this.$route.query.p,
          name: this.userInfo.nickname || '',
          cash: this.amount,
          flag: 0
        };
        let reqParams = getRequestParams(url, params, this.withdrawSuc, this.withdrawFail, '');
        sendJsonPostRequestWithDES(this, reqParams);
      },
      withdrawSuc: function(vue, json) {
        let msg = '提现成功';
        if (json && json.status === 0) {
          msg = '提现申请已提交';
        } else {
          msg = json.msg;
        }
        MessageBox.alert(msg).then(action => {
          vue.backIndex();
        });
        // MessageBox.
      },
      withdrawFail: function(vue, ex) {
        Toast('异常:' + ex);
      },
      gotoTradeDetail: function() {
        pageRouter(this, {path: '/tradeDetail', query: {p: this.$route.query.p, ptid: this.$route.query.ptid}});
      },
      backIndex: function() {
        window.history.back(-1);
        // pageRouter(this, {path: '/index', query: {p: this.$route.query.p, ptid: this.$route.query.ptid}});
      },
      openWithdrawRule: function() {
        this.withdrawRuleShow = true;
      },
      closeWithdrawRule: function() {
        this.withdrawRuleShow = false;
      },
      getWithdrawRule: function() {
        let url = baseUrl + '/richText/get';
        let params = Qs.stringify({
          code: 'WITHDRAW_RULE'
        });
        url = url + '?' + params;
        let reqParams = getRequestParams(url, '', (vue, json) => {
          Indicator.close();
          if (json && '' + json.status === '0' && '' + json.data.enabled === '0') {
            vue.withdrawRuleContent = json.data.detail;
          } else {
            vue.withdrawRuleContent = '';
          }
        }, (vue, ex) => {
          Indicator.close();
          vue.withdrawRuleContent = '';
        }, '');
        Indicator.open();
        sendGetRequest(this, reqParams);
      }
    }
  };
</script>
<style>
  body {
    background: #F0F0F0;
  }
  .mgb-10 {
    margin-bottom: 10px;
  }
  .mgt-10 {
    margin-top: 10px;
  }
  .flex-row {
    display: -webkit-box;
    display: -webkit-flex;
    display: box;
    display: flex;
    display: -ms-flex;
  }
  .withdraw {
    height: 100%;
    padding-top: 10px;
    padding-bottom: 50px;
    /* position: absolute; */
  }
  .withdraw .withdraw-content {
    height: 125px;
    /* padding-top: 15px; */
    background-color: #fff;
  }
  .withdraw .withdraw-content .withdraw-content-header {
    margin: 0 5%;
    /* padding-bottom: 15px; */
    border-bottom: 1px solid #979797;
    font-size: 12px;
    height: 40px;
    line-height: 40px;
  }
  .withdraw .withdraw-content-header .content-head-text {
    color: #333;
    margin-right: 10px;
  }
  .withdraw .withdraw-content-header .content-head-balance {
    color: #000;
    font-size: 14px;
    font-weight: bold;
  }
  .withdraw .withdraw-content .withdraw-content-input {
    margin: 0 5%;
  }
  .withdraw .withdraw-content .content-input-unit {
    position: absolute;
    font-size: 24px;
    font-weight: bold;
    line-height: 48px;
  }
  .withdraw .withdraw-content .content-input-text {
    font-size: 12px;
    color: #333;
    padding: 15px 0 5px 0;
  }
  .withdraw .withdraw-content .content-input input{
    color: #333;
    width: 100%;
    height: 48px;
    font-size: 24px;
    font-weight: bold;
    line-height: 1.5;
    border: none;
    outline: none;
    padding-left: 30px;
  }
  .withdraw .withdraw-rule {
    font-size: 11px;
    color: #333;
    margin: 15px 5% 35px 5%;
  }
  .withdraw .withdraw-btn {
    width: 90%;
    height: 45px;
    line-height: 45px;
    margin: 0 5%;
    background-color: #3D8CF7;
    color: #fff;
    border-radius: 4px;
    text-align: center;
    font-size: 18px;
  }
  .withdraw .withdraw-gotoTradeDetail {
    text-align: center;
    margin-top: 50px;
  }
  .withdraw .withdraw-gotoTradeDetail img {
    width: 50%;
  }
  .withdraw .no-withdraw-rule {
    position: absolute;
    font-size: 11px;
    color: #333;
    right: 10px;
    top: 5px;
  }
  .withdraw .no-withdraw-content {
    position: relative;
    background: #fff;
    min-height: 35px;
    /* margin-top: 10px; */
    text-align: center;
    height: 100%;
  }
  .withdraw .no-withdraw-content img{
    margin: 30px 0 15px 0;
    width: 65%;
  }
  .withdraw .no-withdraw-text {
    font-size: 18px;
    color: #555;
  }
  .withdraw .no-withdraw-btn {
    width: 90%;
    height: 45px;
    line-height: 45px;
    margin: 0 5%;
    background-color: #3D8CF7;
    color: #fff;
    border-radius: 4px;
    text-align: center;
    font-size: 18px;
    position: fixed;
    bottom: 85px;
  }
  .withdraw .picker-popup-wd {
    background-color: #fff;
    color: #333;
    border-radius: 10px;
    height: 60%;
    width: 80%;
    /* position: relative; */
  }
  .popup-wd-content-title {
    text-align: center;
    padding: 10px;
    border-bottom: 1px solid #ccc;
  }
  .withdraw .picker-popup-wd .popup-wd-close {
    position: absolute;
    right: 10px;
    top: 12px;
    height: 12px;
  }
  .withdraw .picker-popup-wd .popup-wd-close img {
    height: 100%;
  }
  .withdraw .popup-wd-content {
    padding: 10px 10px 0px 10px;
    margin-bottom: 8px;
    font-size: 14px;
    height: calc(100% - 50px);
    overflow: auto;
    line-height: 1.5;
  }
/*   .withdraw .popup-wd-content p{
    line-height: 1.5;
  } */
  ::-webkit-input-placeholder { /* WebKit browsers */
    color: #999;
    font-size: 18px;
    font-weight: normal;
  }
  :-moz-placeholder { /* Mozilla Firefox 4 to 18 */
    color: #999;
    font-size: 18px;
    font-weight: normal;
  }
  ::-moz-placeholder { /* Mozilla Firefox 19+ */
    color: #999;
    font-size: 18px;
    font-weight: normal;
  }
  :-ms-input-placeholder { /* Internet Explorer 10+ */
    color: #999;
    font-size: 18px;
    font-weight: normal;
  }
</style>