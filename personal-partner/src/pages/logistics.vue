<template>
  <div class="logistics">
    <template v-if="orderInfo.topType !== 1">
      <div class="logistics-header">
        <div class="logistics-info flex-row">
          <img class="logistics-info-image" :src="orderInfo.packageIcon || 'static/img/common/order_default_icon.png'">
          <div class="logistics-info-text">
            <div class="title">{{orderInfo.businessName}}</div>
            <div>开卡号码: {{orderInfo.cardNumber}}</div>
          </div>
        </div>
        <div class="logistics-info-order">订单号: {{orderInfo.orderId}}</div>
      </div>
      <div class="logistics-text-content">
        <!-- <div class="text-content-row flex-row borderline">
          <div class="label">下单时间：</div>
          <div class="text">{{orderInfo.createOrderTime}}</div>
        </div> -->
        <div class="text-content-row flex-row borderline">
          <div class="label">激活时间：</div>
          <div class="text">{{orderInfo.activateTime || '号卡未激活'}}</div>
        </div>
        <div class="text-content-row flex-row">
          <div class="label">充值达标时间：</div>
          <div class="text">{{orderInfo.standardTime || '充值未达标'}}</div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="logistics-header">
        <div class="logistics-info flex-row">
          <img class="logistics-info-image" :src="orderInfo.icon || 'static/img/common/order_default_icon.png'">
          <div class="logistics-info-text">
            <div class="title">{{orderInfo.businessName}}</div>
            <div>办理号码: {{orderInfo.receivePhoneNumber}}</div>
          </div>
        </div>
        <div class="logistics-info-order">订单号: {{orderInfo.orderId}}</div>
      </div>
      <div class="logistics-text-content">
        <div class="text-content-row flex-row">
          <div class="label">办理时间：</div>
          <div class="text">{{orderInfo.operateTime}}</div>
        </div>
      </div>
    </template>
    <!-- <div class="logistics-status">
      <div class="logistics-status-title">
        {{orderInfo.orderStatusInfo ? orderInfo.orderStatusInfo.name : ''}}
      </div>
      <div>
        {{orderInfo.description}}
      </div>
    </div> -->
    <!-- <div class="logistics-content">
      <div class="logistics-list">
        <div class="logistics-list-item logistics-list-item-current">
          <div class="status-dot-mask"></div>
          <div class="status-dot status-dot-current"></div>
          <div class="logistics-list-item-address">
            <p>您的订单开始处理</p>
            <p>您的订单开始处理</p>
          </div>
          <div class="logistics-list-item-date">
            <p>2018-07-12  20:43:10</p>
          </div>
        </div>
        <div class="logistics-list-item">
          <div class="status-dot"></div>
          <div class="logistics-list-item-address">
            <p>您的订单开始处理</p>
          </div>
          <div class="logistics-list-item-date">
            <p>2018-07-10  20:43:10</p>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import { getSession } from 'src/assets/utils.js';
import { Indicator, MessageBox, Toast } from 'mint-ui';
export default {
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  data() {
    return {
      userInfo: {},
      orderInfo: {}
    };
  },
  watch: {
  },
  created() {
    Indicator.close();
    document.title = '订单详情';
    let srcInfo = getSession('ptSourceInfo', true);
    console.log(srcInfo);
    this.userInfo = srcInfo.userInfo0;
    if (getSession('orderInfo')) {
      this.orderInfo = getSession('orderInfo');
      console.log('orderinfo:', this.orderInfo);
    }
  },
  methods: {
  }
};
</script>

<style lang="less">
  body {
    background: #F0F0F0;
  }
  .logistics {
    height: 100%;
    padding-top: 10px;
    padding-bottom: 50px;
  }
  .logistics .logistics-header {
    background-color: #fff;
  }
  .logistics .logistics-header .logistics-info {
    background-color: #fff;
    /* height: 85px; */
    /* border-bottom: 1px solid #e5e5e5; */
    padding: 15px 0;
    margin: 0 20px;
    border-bottom: 1px solid #ddd;
  }
  .logistics .logistics-info-order {
    margin: 0 20px;
    font-size: 12px;
    padding: 10px 0;
    /* height: 39px; */
    line-height: 1.5;
    color: #333;
  }
  .logistics .logistics-header .logistics-info-image {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }
  .logistics .logistics-header .logistics-info-text {
    font-size: 14px;
    /* font-weight: 600; */
    color: #8D8D8D;
    /* margin: 5px 0; */
    line-height: 1.5;
  }
  .logistics .logistics-header .logistics-info-text .title {
    color: #333;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 5px;
  }
  .logistics .logistics-text-content {
    background-color: #fff;
    margin: 10px 0;
    padding: 0 20px;
/*     overflow: auto; */
  }
  .logistics .logistics-text-content .text-content-row {
    font-size: 12px;
    padding: 11px 0;
    line-height: 1.5;
  }
  .logistics .text-content-row .label {
    color: #8D8D8D;
  }
  .logistics .text-content-row .text {
    color: #333;
  }
  .logistics .borderline {
    border-bottom: 1px solid #ddd;
  }
  .logistics .logistics-status {
    margin: 10px;
    border-radius: 4px;
    padding: 15px 30px;
    background-color: #fff;
    color: #777;
    font-size: 12px;
  }
  .logistics .logistics-status .logistics-status-title {
    color: #3D8CF7;
    font-weight: bold;
  }
  .logistics .logistics-content {
    background-color: #fff;
    padding: 10px 0;
    height: calc(100% - 120px);
    overflow: auto;
  }
  .logistics .logistics-content .logistics-list {
    margin: 10px 10px 0 40px;
    border-left: 1px solid #E4E4E4;
    padding-left: 30px;
  }
  .logistics .logistics-list .logistics-list-item {
    font-size: 11px;
    margin-bottom: 10px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ddd;
    color: #999;
    min-height: 55px;
    position: relative;
  }
  .logistics .logistics-list .logistics-list-item:last-child {
    border: none;
  }
  .logistics .logistics-list .logistics-list-item-current {
    color: #16AD64;
  }
  .logistics .logistics-list .logistics-list-item-address {
    margin-top: -4px;
  }
  .logistics .logistics-list .logistics-list-item-date {
    position: absolute;
    bottom: 5px;
  }
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    -webkit-border-radius: 50%;
    background-color: #e4e4e4;
    position: absolute;
    left: -34px;
    top: 4px;
  }
  .status-dot-current {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    -webkit-border-radius: 50%;
    background-color: #16AD64;
    position: absolute;
    left: -36px;
    border: 3px solid #8ED5B0;
    z-index: 9999;
  }
  .status-dot-mask {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    -webkit-border-radius: 50%;
    background-color: #fff;
    position: absolute;
    left: -36px;
    z-index: 9998;
  }
</style>
