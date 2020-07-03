<template>
  <div class="order-management">
    <div class="top-tabs">
      <div class="top-tab-item" :class="{'selected': topTabSelectedIndex === 1}" @click="switchTopTab(1)">
        <img src="static/img/orderList/order_top_right.png">
        <span class="top-tab-item-text">其他订单</span>
      </div>
      <div class="top-tab-item" :class="{'selected': topTabSelectedIndex === 0}" @click="switchTopTab(0)">
        <img src="static/img/orderList/order_top_left.png">
        <span class="top-tab-item-text">号卡订单</span>
      </div>
      <div class="top-tab-divider"></div>
    </div>
    <template v-if="topTabSelectedIndex === 0">
      <div class="status-tab-list flex-row" v-if="roleType !== 3">
        <div class="status-tab" :class="{'selected': selectedTab === index}" v-for="(item, index) in statusList" :key="index" @click="tabSelected(index, item)">
          <div class="order-red-dot" v-if="item.redDot"></div>
          <div>{{item.name}}</div>
          <div class="status-tab-count">{{item.count}}</div>
        </div>
      </div>
      <div class="content-list-tips flex-row" v-if="showListTips">
        <div class="list-tips-text">目前只展示昨天及之前的订单</div>
        <div class="list-tips-close" @click="closeTips">
          <img src="static/img/common/btn_close.png">
        </div>
      </div>
      <div class="content-list" :class="{'padt-35': showListTips}" v-infinite-scroll="loadMore"
            :infinite-scroll-disabled="lastPage || isNoRecord"
            infinite-scroll-distance="10" @click="reloadList">
        <div class="content-list-item" v-for="(item, index) in orderList" :key="index" @click="gotoLogistics(item)">
          <div class="item-top flex-row">
            <img class="item-top-image" :src="item.packageIcon || 'static/img/common/order_default_icon.png'">
            <div class="item-top-text">
              <div class="title">{{item.businessName}}</div>
              <div>开卡号码： {{item.cardNumber}}</div>
            </div>
            <div class="content-list-item-status" v-if="roleType !== 3">
              <img :src="item.orderStatusInfo ? item.orderStatusInfo.path : ''">
            </div>
          </div>
          <div class="item-bottom">
            <!-- <div class="item-bottom-text float-left">下单时间: {{item.createOrderTime}}</div> -->
            <div class="item-bottom-text float-right">{{item.description}}</div>
          </div>
        </div>
        <div class="tips" v-if="orderList.length === 0">
          <div class="record-loading" v-if="isLoading">
            <mt-spinner type="triple-bounce"></mt-spinner>
          </div>
          <template v-else>没有查询到订单!</template>
        </div>
        <template v-if="orderList.length > 0">
          <div class="record-loading" v-if="!lastPage">
            <mt-spinner type="triple-bounce"></mt-spinner>
          </div>
          <div class="record-loading" v-else>底线在此</div>
        </template>
      </div>
    </template>
    <template v-if="topTabSelectedIndex === 1">
      <div class="status-tab-list flex-row" v-if="roleType !== 3">
        <div class="status-tab" :class="{'selected': selectedTab === index}" v-for="(item, index) in otherOrderStatusList" :key="index" @click="otherOrderTabSelected(index, item)">
          <!-- <div class="order-red-dot" v-if="item.redDot"></div> -->
          <div>{{item.name}}</div>
          <div class="status-tab-count">{{item.count}}</div>
        </div>
      </div>
      <div class="content-list-tips flex-row" v-if="showListTips">
        <div class="list-tips-text">目前只展示昨天及之前的订单</div>
        <div class="list-tips-close" @click="closeTips">
          <img src="static/img/common/btn_close.png">
        </div>
      </div>
      <div class="content-list" :class="{'padt-35': showListTips}" v-infinite-scroll="otherOrderLoadMore"
            :infinite-scroll-disabled="otherOrderLastPage || otherOrderIsNoRecord"
            infinite-scroll-distance="10" @click="otherOrderReloadList">
        <div class="content-list-item" v-for="(item, index) in otherOrderList" :key="index" @click="gotoLogistics(item)">
          <div class="item-top flex-row">
            <img class="item-top-image" :src="item.icon || 'static/img/common/order_default_icon.png'">
            <div class="item-top-text">
              <div class="title">{{item.businessName}}</div>
              <div>办理号码： {{item.receivePhoneNumber}}</div>
            </div>
            <div class="content-list-item-status" v-if="roleType !== 3">
              <img :src="item.orderStatusInfo ? item.orderStatusInfo.path : ''">
            </div>
          </div>
          <div class="item-bottom">
            <!-- <div class="item-bottom-text float-left">下单时间: {{item.createOrderTime}}</div> -->
            <div class="item-bottom-text float-right">{{item.description}}</div>
          </div>
        </div>
        <div class="tips" v-if="otherOrderList.length === 0">
          <div class="record-loading" v-if="isLoading">
            <mt-spinner type="triple-bounce"></mt-spinner>
          </div>
          <template v-else>没有查询到订单!</template>
        </div>
        <template v-if="otherOrderList.length > 0">
          <div class="record-loading" v-if="!otherOrderLastPage">
            <mt-spinner type="triple-bounce"></mt-spinner>
          </div>
          <div class="record-loading" v-else>底线在此</div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import { baseUrl, getRequestParams, sendGetRequest, saveSession, pageRouter, getStorage, saveStorage, getSession } from 'src/assets/utils.js';
import Bus from 'src/assets/bus/bus';
import { Toast, Indicator, MessageBox } from 'mint-ui';
import Qs from 'qs';
export default {
  data() {
    return {
      selectedTab: 0,
      statusList: [],
      orderList: [],
      lastPage: true,
      isNoRecord: true,
      isLoading: false,
      pageNumber: 1,
      showListTips: true,
      topTabSelectedIndex: 0,
      otherOrderStatusList: [],
      otherOrderList: [],
      otherOrderPageNumber: 1,
      otherOrderLastPage: true,
      otherOrderIsNoRecord: true,
      roleType: 3
    };
  },
  components: {
    Toast,
    Indicator,
    MessageBox
  },
  watch: {
  },
  created() {
    Indicator.close();
    document.title = '订单管理';
    this.statusList = [{
      name: '全部', count: 0, id: ''
    }, {
      name: '已返利', count: 0, id: '-10', redDot: getStorage('pt_order_1_red_dot_' + this.$route.query.p, true)
    }, {
      name: '待返利', count: 0, id: '-5'
    }, {
      name: '已失效', count: 0, id: '20'
    }];
    this.otherOrderStatusList = [{
      name: '全部', count: 0, state: 0, 'rewardStatus': -1, sn: '0--1'
    }, {
      name: '已返利', count: 0, state: 5, 'rewardStatus': 1, sn: '5-1'
    }, {
      name: '待返利', count: 0, state: 5, 'rewardStatus': 0, sn: '5-0'
    }, {
      name: '已失效', count: 0, state: 10, 'rewardStatus': -1, sn: '10--1'
    }];
    this.orderStatusMapping = {
      '0': { name: '待激活', path: 'static/img/orderList/DJH.png' },
      '1': { name: '已下单', path: 'static/img/orderList/YXD.png' },
      '5': { name: '已发货', path: 'static/img/orderList/YFH.png' },
      '10': { name: '已激活', path: 'static/img/orderList/YJH.png' },
      '12': { name: '已激活', path: 'static/img/orderList/YJH.png' },
      '18': { name: '已激活', path: 'static/img/orderList/YJH.png' },
      '15': { name: '已充值', path: 'static/img/orderList/YCZ.png' },
      '20': { name: '已失效', path: 'static/img/orderList/YSX.png' }
    };
    this.otherOrderStatusMapping = {
      '5-1': { name: '已返利', path: 'static/img/orderList/YFL.png' },
      '5-0': { name: '待返利', path: 'static/img/orderList/DFL.png' },
      '10-x': { name: '办理失败', path: 'static/img/orderList/BLSB.png' }
    };
    // this.getOrderInfo('');
    this.switchTopTab(1, true);
    let serverUserInfo = getSession('ptDetailInfo', true);
    this.roleType = serverUserInfo.roleType;
    console.log(this.roleType);
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
    switchTopTab: function(index, ifFirstLoad) {
      if (!ifFirstLoad && this.topTabSelectedIndex === index) return; // 禁止重复点击
      this.topTabSelectedIndex = index;
      this.selectedTab = 0;
      Indicator.open();
      if (index === 0) {
        this.pageNumber = 1;
        this.getOrderInfo('');
      } else if (index === 1) {
        this.otherOrderPageNumber = 1;
        this.otherOrderList = [];
        this.otherOrderStatusSelected = this.otherOrderStatusList[0];
        this.getOtherOrderList();
      }
    },
    otherOrderTabSelected: function(index, item) {
      this.selectedTab = index;
      this.otherOrderStatusSelected = item;
      this.otherOrderPageNumber = 1;
      this.otherOrderList = [];
      Indicator.open();
      this.getOtherOrderList();
    },
    tabSelected: function(index, item) {
      this.statusList[index].redDot = false;
      // saveStorage('pt_order_' + index + '_red_dot', false);
      Bus.$emit('on-footer-tab-select', { tabName: 'order', isShow: () => { return getStorage('pt_order_' + index + '_red_dot_' + this.$route.query.p, true); }, preFn: () => { saveStorage('pt_order_' + index + '_red_dot_' + this.$route.query.p, false); } });
      this.selectedTab = index;
      this.selected = item.id;
      this.pageNumber = 1;
      Indicator.open();
      this.getOrderInfo(item.id);
    },
    otherOrderLoadMore: function() {
      // 当最后一页时或者当页面正在加载下一页时，阻止访问接口
      if (this.otherOrderLastPage || this.isLoading || this.otherOrderIsNoRecord) return;
      this.otherOrderPageNumber++;
      this.getOtherOrderList();
    },
    loadMore: function() {
      // 当最后一页时或者当页面正在加载下一页时，阻止访问接口
      if (this.lastPage || this.isLoading || this.isNoRecord) return;
      this.pageNumber++;
      this.getOrderInfo(this.selected);
    },
    otherOrderReloadList: function() {
      if (!this.otherOrderIsNoRecord || this.isLoading) return;
      this.otherOrderPageNumber = 1;
      this.otherOrderList = [];
      Indicator.open();
      this.getOtherOrderList();
    },
    reloadList: function() {
      if (!this.isNoRecord || this.isLoading) return;
      this.pageNumber = 1;
      this.getOrderInfo(this.selected);
    },
    getOtherOrderList: function() {
      let url = `${baseUrl}/business/dirStream/list`;
      let params = {
        'partnerPhone': this.$route.query.p,
        'pageNumber': this.otherOrderPageNumber,
        'pageSize': 10,
        'state': this.otherOrderStatusSelected.state,
        'rewardStatus': this.otherOrderStatusSelected.rewardStatus,
        'type': -1
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          // json = {
          //   'status': 0,
          //   'msg': 'ok',
          //   'data': {
          //     'aggregation': {
          //       'all': 0,
          //       'reward_status_1': 0,
          //       'fail': 0,
          //       'reward_status_0': 0
          //     },
          //     'order': {
          //       'list': [{
          //         'id': 51,
          //         'orderId': 'H20190221174404940891155074540',
          //         'gpPhoneNumber': '18202841276',
          //         'receivePhoneNumber': '18202841276',
          //         'businessName': '111',
          //         'businessCode': 'ACAZ29871',
          //         'type': 5,
          //         'operateTime': '2019-02-24 17:47:12',
          //         'rewardStatus': 1,
          //         'status': 5,
          //         'remark': 'bossResultCode=101713712,msg= 用户已经办理了相同业务 禁止继续受理 业务 ',
          //         'orderAmount': 0,
          //         'salaryAmount': 7,
          //         'businessId': 134,
          //         'bossOrderStatus': 1,
          //         'bossOrderId': 'OS1519022051867744',
          //         'bossOrderUpdateTime': '2019-02-24 18:47:12'
          //       },
          //       {
          //         'id': 50,
          //         'orderId': 'H20190221174404940891155074340',
          //         'gpPhoneNumber': '18202841276',
          //         'receivePhoneNumber': '18382049058',
          //         'businessName': '合家欢',
          //         'businessCode': 'ACAZ29871',
          //         'type': 5,
          //         'operateTime': '2019-02-23 17:56:59',
          //         'rewardStatus': 1,
          //         'status': 10,
          //         'remark': 'bossResultCode=101713712,msg= 用户已经办理了相同业务 禁止继续受理 业务 ',
          //         'orderAmount': 0,
          //         'salaryAmount': 6,
          //         'businessId': 134,
          //         'bossOrderStatus': 1,
          //         'bossOrderId': 'OS1519022051867743',
          //         'bossOrderUpdateTime': '2019-02-23 18:56:59'
          //       }],
          //       'pageNumber': 1,
          //       'pageSize': 2,
          //       'totalPage': 1,
          //       'totalRow': 2,
          //       'lastPage': true,
          //       'firstPage': true
          //     }
          //   },
          //   'success': true
          // };
          // console.log(json);
          Indicator.close();
          vue.isLoading = false;
          if (json && json.status === 0) {
            vue.otherOrderLastPage = json.data.order.lastPage;
            vue.otherOrderPageNumber = json.data.order.pageNumber;
            vue.otherOrderIsNoRecord = json.data.order.totalRow === 0;
            vue.otherOrderStatusList.forEach((item, index) => {
              item.count = 0; // TODO
              if (index === 0) {
                item.count = json.data.aggregation.all;
              } else if (index === 1) {
                item.count = json.data.aggregation.reward_status_1;
              } else if (index === 2) {
                item.count = json.data.aggregation.reward_status_0;
              } else if (index === 3) {
                item.count = json.data.aggregation.fail;
              } else {
                item.count = 0;
              }
            });
            vue.otherOrderList = vue.otherOrderList.concat(json.data.order.list);
            vue.otherOrderList.forEach((item, index) => {
              item.receivePhoneNumber = item.receivePhoneNumber ? `${item.receivePhoneNumber.substr(0, 3)}****${item.receivePhoneNumber.substr(7, 4)}` : '';
              item.orderStatusInfo = vue.otherOrderStatusMapping[item.status + '-' + item.rewardStatus];
              switch (item.status + '-' + item.rewardStatus) {
                case '5-1':
                  item.description = '已返利 ' + vue.round(item.salaryAmount) + '元';
                  break;
                case '5-0':
                  item.description = '待返利 ' + vue.round(item.salaryAmount) + '元';
                  break;
                default:
                  if ('' + item.status === '10') {
                    item.description = '办理失败';
                    item.orderStatusInfo = vue.otherOrderStatusMapping['10-x'];
                  } else {
                    item.description = '暂无返利';
                  }
              }
            });
          }
        },
        (vue, ex) => {
          Indicator.close();
          console.log(ex);
        }
      );
      this.isLoading = true;
      sendGetRequest(this, reqParams);
    },
    getOrderInfo: function(orderStatus) {
      // Indicator.open();
      this.isLoading = true;
      let url = baseUrl + '/order/listAll';
      let params = Qs.stringify({
        phone: this.$route.query.p,
        orderStatus: orderStatus,
        pageNumber: this.pageNumber,
        pageSize: 10
      });
      url = url + '?' + params;
      let reqParams = getRequestParams(url, '', this.getOrderInfoSuc, this.getOrderInfoFail, '');
      sendGetRequest(this, reqParams);
    },
    getOrderInfoSuc: function(vue, json) {
      Indicator.close();
      vue.isLoading = false;
      if (vue.pageNumber === 1) {
        vue.orderList = [];
      }
      if (json && json.status === 0) {
        vue.lastPage = json.data.orders.lastPage;
        vue.pageNumber = json.data.orders.pageNumber;
        vue.isNoRecord = json.data.orders.totalRow === 0;
        vue.statusList.forEach((item, index) => {
          item.count = json.data.aggregation[index];
        });
        vue.orderList = vue.orderList.concat(json.data.orders.list);
        vue.orderList.forEach((item, index) => {
          // item.receiverName = item.receiverName ? item.receiverName.substring(0, 1) + '*' : '';
          item.cardNumber = item.cardNumber ? `${item.cardNumber.substr(0, 3)}****${item.cardNumber.substr(7, 4)}` : '';
          item.orderStatusInfo = vue.orderStatusMapping[item.orderStatus];
          switch ('' + item.orderStatus) {
            case '12':
            case '18':
              item.description = '已返利 ' + vue.round(item.playerActivateFree) + '元';
              break;
            case '15':
              let displaySalary = (item.playerRechargeFree - 0) + (item.playerActivateFree - 0);
              item.description = '已返利 ' + vue.round(displaySalary) + '元';
              item.standardTime = item.rechargeReceiveTime;
              break;
            default:
              item.description = '暂无返利';
          }
          // if ('' + item.orderStatus === '10') {
          //   item.description = '已返利 ' + vue.round(item.activateSalary) + '元';
          // } else if ('' + item.orderStatus === '15') {
          //   item.description = '已返利 ' + vue.round(item.firstRechargeSalary + item.activateSalary) + '元';
          // } else {
          //   item.description = '暂无返利';
          // }
        });
      }
    },
    getOrderInfoFail: function(vue, ex) {
      console.log(ex);
      vue.isLoading = false;
      Indicator.close();
      Toast('异常：' + ex);
    },
    gotoLogistics: function(item) {
      // if ('' + item.orderStatus !== '10' || '' + item.orderStatus !== '15') { return; }
      item.topType = this.topTabSelectedIndex;
      saveSession('orderInfo', JSON.stringify(item));
      pageRouter(this, { path: 'logistics', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
    },
    closeTips: function() {
      this.showListTips = false;
    }
  }
};
</script>
<style lang="less">
  body {
    background: #F0F0F0;
  }
/*   .content {
    height: 100%;
  }
  .main-section {
    height: 100%;
  } */
  .order-red-dot {
    border-radius: 100%;
    border: 1px solid #ff6d6f;
    width: 8px;
    height: 8px;
    background: #ff6d6f;
    position: absolute;
    top: 10px;
    right: 12%;
  }
  .flex-row {
    display: -webkit-box;
    display: -webkit-flex;
    ;
    display: flex;
    display: -ms-flex;
  }
  .float-left {
    float: left;
  }
  .float-right {
    float: right;
  }
  .record-loading {
    text-align: center;
    color: #AAA;
    /* background: #EEE; */
    padding: 15px 0 1%;
    font-size: 12px;
  }
  .order-management {
    height: 100%;
/*     width: 100%;
    position: absolute; */
    position: relative;
    min-height: 100%;
    background: #efefef;
    .top-tabs {
      position: relative;
      border-top: 1px solid #efefef;
      border-bottom: 1px solid #efefef;
      display: flex;
      .top-tab-divider {
        width: 2px;
        background: #efefef;
        position: absolute;
        height: 30px;
        top: 10px;
        left: 50%;
      }
      .top-tab-item {
        background: #fff;
        flex: 0 0 50%;
        position: relative;
        height: 50px;
        display: flex;
        align-content: center;
        align-items: center;
        justify-content: center;
        color: #333;
        img {
          flex: 0 0 auto;
          width: 58px;
        }
        .top-tab-item-text {
          flex: 0 0 auto;
          font-size: 14px;
          margin-left: 4px;
        }
        &.selected {
          color: #3D8CF7;
        }
      }
    }
  }
  .order-management img {
    pointer-events: none;
  }
  .order-management .status-tab-list {
    height: 50px;
    background-color: #fff;
    /* border-bottom: 1px solid #ccc; */
  }
  .order-management .status-tab-list .status-tab {
    text-align: center;
    font-size: 12px;
    padding: 12px 0;
    color: #333;
    flex: 1;
    position: relative;
  }
  .order-management .status-tab-list .status-tab.selected {
    border-bottom: 2px solid #3D8CF7;
  }
  .order-management .status-tab.selected .status-tab-count {
    color: #3D8CF7;
  }
  .order-management .status-tab .status-tab-count {
    color: #888;
    margin-top: 3px;
  }
  .order-management .tips{
    margin-top: 10px;
    text-align: center;
    font-size: 12px;
    color: #878787;
  }
  .order-management .content-list {
    height: calc(100% - 102px);
    padding-bottom: 50px;
    overflow: auto;
  }
  .order-management .content-list-item {
    height: 95px;
    margin-top: 10px;
    background-color: #fff;
  }
  .order-management .content-list-item .item-top {
    border-bottom: 1px solid #e5e5e5;
    position: relative;
    height: 70px;
    padding: 10px;
  }
  .order-management .content-list-item .item-bottom {
    font-size: 10px;
    color: #888;
    padding: 5px 10px 10px 12px;
  }
  .order-management .content-list-item .item-top-image {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
  .order-management .content-list-item .item-top-text {
    font-size: 11px;
    font-weight: 600;
    color: #8D8D8D;
    margin: 2px 0;
    width: calc(100% - 120px);
  }
  .order-management .content-list-item .item-top-text .title {
    color: #333;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .order-management .content-list-item-status {
    position: absolute;
    right: 10px;
    height: 50px;
  }
  .order-management .content-list-item-status img{
    height: 100%;
  }
  .order-management .content-list-tips {
    position: absolute;
    width: 100%;
    height: 35px;
    line-height: 35px;
    background-color: #fff;
    color: #3D8CF7;
    padding-left: 20px;
    font-size: 12px;
    border-top: 1px solid #ccc;
    z-index: 1;
  }
  .order-management .list-tips-text {
    flex: 1 1 auto;
  }
  .order-management .list-tips-close {
    height: 100%;
    padding: 5px 10px 0 0;
  }
  .order-management .list-tips-close img {
    height: 15px;
  }
  .order-management .padt-35 {
    padding-top: 35px;
  }
</style>
