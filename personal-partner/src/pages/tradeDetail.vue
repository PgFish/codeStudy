<template>
  <div class="tradeDetail">
    <div class="header">
      <img class="header-bg" src="static/img/tradedetail/tradedetail_bg.png" />
      <div class="header-profile-box">
        <div class="head-img">
          <img :src="realName ? 'static/img/dzg_head_img.png' : (userInfo.headimgurl || 'static/img/cmcc_logo.png')">
        </div>
        <div class="user-info">
          <!-- <div class="nick-name">
            <div class="text-left">{{realName || (userInfo.nickname || '我')}}</div>
            <div class="text-right">的店铺</div>
          </div>
          <div class="phone-no">{{phone}}</div> -->
          <div class="phone-no">{{phone + '的店铺'}}</div>
          <div class="go-withdraw" @click="toWithdraw">
            <img src="static/img/index/to_withdraw.png" />
          </div>
        </div>
        <div class="middle" @click="toOrderList">
          <div class="middle-item deal-finish">
            <div class="middle-item-number">{{orderNum ? pInt(orderNum) : 0}}</div>
            <div class="middle-item-text">已成交/单</div>
          </div>
          <div class="middle-item receive-profit">
            <div class="middle-item-number">{{totalIncome ? round(totalIncome) : 0}}</div>
            <div class="middle-item-text">到账收益/元</div>
          </div>
        </div>
      </div>
    </div>
    <div style="height: 30px; width: 100%; background: #fff;"></div>
    <!-- <div class="tradeDetail-header flex-row">
      <div class="tradeDetail-head-img">
        <img :src="realName ? 'static/img/dzg_head_img.png' : (userInfo.headimgurl || 'static/img/cmcc_logo.png')">
      </div>
      <div class="tradeDetail-user-info">
        <div class="tradeDetail-user-info-name flex-row">
          <div class="tradeDetail-user-info-nickname">
            {{realName || userInfo.nickname}}
          </div>
          <div class="tradeDetail-user-info-name-text">
            累计收益
          </div>
        </div>
        <div class="tradeDetail-user-info-total">￥{{round(totalIncome)}}</div>
      </div>
    </div> -->
    <!-- <div class="clear-float"></div> -->
    <div class="tradeDetail-content" v-infinite-scroll="loadMore"
          :infinite-scroll-disabled="lastPage || isNoRecord"
          infinite-scroll-distance="10" @click="reloadList">
      <div class="content-item flex-row" v-for="(item, index) in tradeList" :key="index">
        <div class="content-item-text">
          <div class="item-text-name" :class="{'red-color': item.isFail}">
            {{item.name}}-{{item.code}}
          </div>
          <div class="item-text-type" :class="{'red-color': item.isFail}">
            {{item.status}}
          </div>
          <div class="item-text-date">
            {{item.date}}
          </div>
        </div>
        <div class="content-item-trade">
          {{item.icon + round(item.cash)}}
        </div>
      </div>
      <div class="tips" v-if="tradeList.length === 0">
        暂无交易明细!
      </div>
      <template v-if="tradeList.length > 0">
        <div class="record-loading" v-if="!lastPage">
          <mt-spinner type="triple-bounce"></mt-spinner>
        </div>
        <div class="record-loading" v-else>底线在此</div>
      </template>
    </div>
  </div>
</template>

<script>
import { baseUrl, getRequestParams, sendGetRequest, isWechat, closeIllegalPage, getSession, pageRouter } from 'src/assets/utils.js';
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
      phone: '',
      userInfo: {},
      lastPage: true,
      isNoRecord: true,
      isLoading: false,
      pageNumber: 1,
      orderNum: 0,
      totalIncome: 0,
      tradeList: [],
      realName: ''
    };
  },
  watch: {
  },
  created() {
    Indicator.close();
    document.title = '交易明细';
    let srcInfo = getSession('ptSourceInfo', true);
    if (srcInfo) {
      this.userInfo = srcInfo.userInfo;
      if (!this.userInfo) {
        this.userInfo = {};
      }
    } else {
      closeIllegalPage(this);
      return;
    }
    if (!isWechat() && this.userInfo.realName) {
      this.realName = this.userInfo.realName;
    }
    this.statusMapping = {
      1: { status: '激活返利', icon: '+', name: 'packageName', code: 'cardNumber' },
      2: { status: '充值返利', icon: '+', name: 'packageName', code: 'cardNumber' },
      5: { status: '提现成功', icon: '-', name: 'oppositeName', code: 'oppositeNumber' },
      6: { status: '提现中', icon: '-', name: 'oppositeName', code: 'oppositeNumber' },
      7: { status: '提现失败', icon: '-', name: 'oppositeName', code: 'oppositeNumber' }
    };
    let phone = this.$route.query.p;
    this.phone = `${phone.substr(0, 3)}****${phone.substr(7, 4)}`;
    this.getOrderDetail();
  },
  methods: {
    toWithdraw: function () {
      // Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_index_withdraw', 'WT.event', 'gpas_btn_withdraw'] });
      pageRouter(this, { path: '/withdraw', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
    },
    toOrderList: function () {
      pageRouter(this, { path: '/orderList', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
    },
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
    loadMore: function() {
      // 当最后一页时或者当页面正在加载下一页时，阻止访问接口
      if (this.lastPage || this.isLoading || this.isNoRecord) return;
      this.pageNumber++;
      this.getOrderDetail();
    },
    reloadList: function() {
      if (!this.isNoRecord || this.isLoading) return;
      this.pageNumber = 1;
      this.getOrderDetail();
    },
    getOrderDetail: function() {
      let url = baseUrl + '/packageSalary/detail';
      // Indicator.open();
      this.isLoading = true;
      let params = Qs.stringify({
        phone: this.$route.query.p,
        pageNumber: this.pageNumber
      });
      url = url + '?' + params;
      let reqParams = getRequestParams(url, '', this.getOrderDetailSuc, this.getOrderDetailFail, '');
      sendGetRequest(this, reqParams);
    },
    getOrderDetailSuc: function(vue, json) {
      vue.isLoading = false;
      if (vue.pageNumber === 1) {
        vue.tradeList = [];
      }
      if (json && json.status === 0) {
        let tradeList = [];
        vue.lastPage = json.data.details.lastPage;
        vue.pageNumber = json.data.details.pageNumber;
        vue.isNoRecord = json.data.details.totalRow === 0;
        vue.totalIncome = json.data.salary;
        vue.orderNum = json.data.orderNum;
        json.data.details.list.forEach((item, index) => {
          let statusInfo = vue.statusMapping[item.type];
          if (!statusInfo) {
            return;
          }
          let isFail = false;
          if ('' + item.type === '7') {
            isFail = true;
          }
          let obj = {
            name: item[statusInfo.name],
            code: this.handleNumber(item[statusInfo.code]),
            date: item.time,
            status: statusInfo.status,
            icon: statusInfo.icon,
            cash: isNaN(Number(item.cash)) ? '0.00' : Number(item.cash).toFixed(2),
            isFail: isFail
          };
          tradeList.push(obj);
        });
        vue.tradeList = vue.tradeList.concat(tradeList);
      }
    },
    getOrderDetailFail: function(vue, ex) {
      vue.isLoading = false;
      Toast('异常：' + ex);
    },
    handleNumber: function(number) {
      if (number && number.length >= 11) {
        let length = number.length;
        return `${number.substr(0, 3)}****${number.substr(length - 4, 4)}`;
      }
    }
  }
};
</script>

<style lang="less">
  body {
    background: #F0F0F0;
  }
  .flex-row {
    display: -webkit-box;
    display: -webkit-flex;
    ;
    display: flex;
    display: -ms-flex;
  }
  .red-color {
    color: #e8383c;
  }
  .record-loading {
    text-align: center;
    color: #AAA;
    /* background: #EEE; */
    padding: 15px 0 1%;
    font-size: 12px;
  }
  .tradeDetail {
    min-height: 100%;
    /*width: 100%;
    position: absolute; */
    /* 头部个人信息区 */
    .header {
      position: relative;
      background: #fff;
      z-index: 1;
      .header-bg {
        position: relative;
        width: 100%;
        height: 150px;
        z-index: 0;
      }
      .header-profile-box {
        position: absolute;
        bottom: -10px;
        width: 90%;
        left: 0;
        right: 0;
        margin: 0 auto;
        height: 125px;
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
          .nick-name {
            font-size: 13px;
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
          }
          .go-withdraw {
            position: relative;
            img {
              width: 62px;
            }
          }
        }
        /* 业务信息展示区 */
        .middle {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: #fff;
          height: 75px;
          border-radius: 10px;
          padding: 0 10%;
          .middle-item {
            float: left;
            width: 50%;
            height: 100%;
            position: relative;
            text-align: center;
            line-height: 1.2;
            padding-top: 16px;
            font-family: "黑体";
            cursor: pointer;
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
        /*.go-withdraw {
          width: 82px;
          position: absolute;
          right: -1px;
          top: 20px;
          cursor: pointer;
          img {
            width: 82px;
            pointer-events: none;
          }
        }*/
      }
    }
  }
  .tradeDetail img {
    pointer-events: none;
  }
  /* 头部个人信息区 */
  .tradeDetail .tradeDetail-header {
    background: #3D8CF7;
    height: 90px;
    /* margin-bottom: 10px; */
  }
  .tradeDetail .tradeDetail-head-img {
    /* float: left; */
    height: 90px;
    line-height: 90px;
    width: 95px;
  }
  .tradeDetail .tradeDetail-head-img img {
    width: 60px;
    height: 60px;
    margin: 15px 15px 15px 20px;
    border-radius: 100%;
    border: 0;
    outline: none;
  }
  .tradeDetail .tradeDetail-user-info {
    /* float: left; */
    height: 90px;
    width: calc(100% - 95px);
    padding: 25px 0;
    line-height: 1.5;
/*     overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis; */
    color: #fff;
  }
  .tradeDetail .tradeDetail-user-info-name {
    font-size: 12px;
    color: #fff;
  }
  .tradeDetail .tradeDetail-user-info-nickname {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .tradeDetail .tradeDetail-user-info-name-text {
    flex: 1;
    min-width: 60px;
  }
  .tradeDetail .tradeDetail-user-info-total {
    font-size: 16px;
    color: #fff;
    margin-top: 5px;
  }
  .tradeDetail .tradeDetail-content {
    padding-bottom: 50px;
    height: calc(100% - 90px);
    overflow: auto;
  }
  .tradeDetail .tradeDetail-content .content-item {
    min-height: 75px;
    padding: 12px 5%;
    background-color: #fff;
    margin-bottom: 1px;
  }
  .tradeDetail .content-item .content-item-text {
    flex: 1;
  }
  .tradeDetail .content-item .content-item-trade {
    /* float: right; */
    line-height: 50px;
    /* color: #333; */
    color: #3d8cf7;
    font-weight: bold;
    text-align: left;
    min-width: 40px;
    padding-left: 20px;
  }
  .tradeDetail .content-item .item-text-name {
    font-weight: bold;
    font-size: 12px;
    color: #333;
  }
  .tradeDetail .content-item .item-text-type {
    font-size: 11px;
    color: #8d8d8d;
    margin-top: 7px;
  }
  .tradeDetail .content-item .item-text-date {
    font-size: 9px;
    color: #888;
    margin-top: 2px;
  }
  .tradeDetail .tips{
    margin-top: 10px;
    text-align: center;
    color: #878787;
    font-size: 12px;
  }
</style>
