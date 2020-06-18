<template>
  <div class="statics">
    <div class="header">
      <img class="header-bg" src="static/img/index/index_bg.png" />
      <div class="header-profile-box">
        <div class="head-img" @click="showSlideBar($event)">
          <img :src="realName ? 'static/img/dzg_head_img.png' : (userInfo.headimgurl || 'static/img/cmcc_logo.png')">
        </div>
        <div class="user-info">
          <div class="phone-no">{{phone + '的店铺'}}</div>
        </div>
        <div class="middle" @click="tostaticsList">
          <div class="middle-item deal-finish">
            <div class="middle-item-number">{{baseInfo.todayOrderNum ? pInt(baseInfo.todayOrderNum) : 0}}</div>
            <div class="middle-item-text">已成交/单</div>
          </div>
          <div class="middle-item receive-profit">
            <div class="middle-item-number">{{baseInfo.orderNum ? round(baseInfo.orderNum) : 0}}</div>
            <div class="middle-item-text">共成交/单</div>
          </div>
        </div>
      </div>
    </div>
    <div class="statics-section">
      <div class="statics-search">
        <div class="statics-search-date" @click="showStartDate">
          {{ startDate ? startDate : '起始日期' }}
          <img src="static/img/common/dropdown.png" /></div>
        <div class="statics-search-date" @click="showEndDate">
          {{ endDate ? endDate : '结束日期' }}
          <img src="static/img/common/dropdown.png" />
        </div>
        <div class="statics-search-btn-section">
          <div class="statics-search-btn" @click="todoSearch">查询</div>
        </div>
      </div>
      <div class="content-list-item-header">
        <div class="content-list-item-content">日期</div>
        <div class="content-list-item-content">团队人数</div>
        <div class="content-list-item-content">业务总量</div>
      </div>
      <mt-loadmore ref="loadmore" class="content-list" v-infinite-scroll="loadMore"
            :infinite-scroll-disabled="lastPage || isNoRecord"
            infinite-scroll-distance="10">
        <div class="content-list-item" v-for="(item, index) in staticsList" :key="index">
          <div class="content-list-item-content">{{item.date}}</div>
          <div class="content-list-item-content">{{item.num}}</div>
          <div class="content-list-item-content">{{item.bzNum}}</div>
        </div>
        <div class="tips" v-if="staticsList.length === 0">
          <div class="record-loading" v-if="isLoading">
            <mt-spinner type="triple-bounce"></mt-spinner>
          </div>
          <template v-else>没有查询到订单!</template>
        </div>
        <template v-if="staticsList.length > 0">
          <div class="record-loading" v-if="!lastPage">
            <mt-spinner type="triple-bounce"></mt-spinner>
          </div>
          <div class="record-loading" v-else>底线在此</div>
        </template>
      </mt-loadmore>
    </div>
    <mt-datetime-picker type="date" year-format="{value} 年"
                month-format="{value} 月"
                date-format="{value} 日" :start-date="startPicker" :end-date="new Date()" ref="startDatePicker" @confirm="confirmStartDate">
    </mt-datetime-picker>
    <mt-datetime-picker type="date" year-format="{value} 年"
                month-format="{value} 月"
                date-format="{value} 日" :start-date="startDate ? new Date(startDate) : new Date('2019-01-01')" :end-date="new Date()" ref="endDatePicker" @confirm="confirmEndDate">
    </mt-datetime-picker>
  </div>
</template>

<script>
import { closeIllegalPage, getSession, baseUrl, getRequestParams, sendGetRequest, pageRouter, isWechat, sourceType, isIOS, dateFormat } from 'src/assets/utils.js';
import { Indicator, MessageBox, Toast } from 'mint-ui';
import Bus from 'src/assets/bus/bus';
export default {
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  data () {
    const Nowdate = new Date();
    const LastTowMonth = new Date(
      Nowdate.getFullYear(),
      Nowdate.getMonth() - 2,
      Nowdate.getDate()
    );
    return {
      baseInfo: {},
      userInfo: {},
      phone: '',
      realName: '',
      pageNumber: 1,
      pageSize: 20,
      lastPage: false,
      isNoRecord: false,
      isLoading: true,
      topStatus: '',
      list: [],
      isZW: false,
      partnerId: '',
      isIOS: isIOS(),
      startPicker: LastTowMonth,
      startDate: dateFormat(LastTowMonth, 'yyyy-MM-dd'),
      endDate: dateFormat(new Date(), 'yyyy-MM-dd'),
      staticsList: []
    };
  },
  watch: {
  },
  created () {
    Indicator.close();
    document.title = '店铺';
    let serverUserInfo = getSession('ptDetailInfo', true); // 获取服务器返回的用户信息
    console.log(serverUserInfo);
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
    if (!isWechat() && this.userInfo.realName) {
      this.realName = this.userInfo.realName;
    }
    let phone = this.$route.query.p;
    this.phone = `${phone.substr(0, 3)}****${phone.substr(7, 4)}`;
    Indicator.open();
    this.getList();
    this.searchList();
  },
  mounted () {
    let ptDetailInfo = getSession('ptDetailInfo', true);
    if ('' + ptDetailInfo.partnerType !== '5' && this.$route.query.qrInviteCode) {
      Bus.$emit('on-head-img-tab', true);
    }
  },
  methods: {
    getRecentTowMonth(year, month, date) {
      return new Date(
        year.getFullYear(),
        month.getMonth() - 2,
        date.getDate()
      );
    },
    showSlideBar(e) {
      e.stopPropagation();
      Bus.$emit('on-head-img-tab', true);
    },
    round(val, n) {
      var result = parseFloat(val);
      if (!n && n !== 0) n = 2;
      return Math.round(result * Math.pow(10, n)) / Math.pow(10, n);
    },
    pInt(val) {
      return parseInt(val, 10);
    },
    prevDef(e) {
      e.stopPropagation();
      e.preventDefault();
    },
    getList() {
      let url = `${baseUrl}/packageSalary/list?phone=${this.$route.query.p}`;
      let reqParams = getRequestParams(url, '', this.getListSuc, this.getEx, '');
      sendGetRequest(this, reqParams);
    },
    getListSuc(vue, json) {
      vue.isLoading = false;
      Indicator.close();
      if (json.status !== 0) {
        Toast(json.msg || '没有可选的资费');
        return;
      }
      vue.baseInfo = {
        'accountSalary': json.data.accountSalary,
        'drawSalary': json.data.drawSalary,
        'estimateSalary': json.data.estimateSalary,
        'orderNum': json.data.orderNum,
        'todayOrderNum': json.data.todayOrderNum
      };
    },
    getEx(vue, ex) {
      vue.isLoading = false;
      Toast('网络异常');
      Indicator.close();
    },
    tostaticsList() {
      pageRouter(this, { path: '/staticsList', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
    },
    showStartDate() {
      this.$refs.startDatePicker.open();
    },
    showEndDate() {
      this.$refs.endDatePicker.open();
    },
    loadMore() {
      // 当最后一页时或者当页面正在加载下一页时，阻止访问接口
      if (this.lastPage || this.isLoading || this.isNoRecord) return;
      this.pageNumber++;
      this.searchList();
    },
    todoSearch() {
      this.pageNumber = 1;
      this.staticsList = [];
      this.searchList();
    },
    searchList() {
      // let phone = '15756400951';
      // this.$route.query.p
      Indicator.open();
      let url = `${baseUrl}/regiment/stat?phone=${this.$route.query.p}&startDate=${this.startDate}&endDate=${this.endDate}&pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`;
      let reqParams = getRequestParams(url, '', this.getSearchListSuc, this.getEx, '');
      sendGetRequest(this, reqParams);
    },
    getSearchListSuc(vue, json) {
      Indicator.close();
      if (json.status !== 0) {
        Toast(json.msg);
        return;
      }
      let basePartners = json.data.partners;
      if (vue.pageNumber !== 1) {
        basePartners = vue.staticsList[vue.staticsList.length - 1].num;
      }
      let originList = [];
      json.data.page.list.forEach((item, index) => {
        if (index === 0) {
          originList.push({
            date: item.date,
            num: basePartners + item.num,
            bzNum: item.bzNum
          });
        } else {
          originList.push({
            date: item.date,
            num: originList[originList.length - 1].num + item.num,
            bzNum: item.bzNum
          });
        }
      });
      vue.staticsList = vue.staticsList.concat(originList);
      vue.lastPage = json.data.page.lastPage;
      vue.isNoRecord = json.data.page.totalRow === 0;
      vue.pageNumber = json.data.page.pageNumber;
    },
    confirmStartDate(date) {
      this.startDate = dateFormat(date, 'yyyy-MM-dd');
    },
    confirmEndDate(date) {
      this.endDate = dateFormat(date, 'yyyy-MM-dd');
    }
  }
};
</script>

<style>
.statics {
  padding-bottom: 60px;
  height: 100%;
  /* 头部个人信息区 */
  .header {
    position: relative;
    background: #fff;
    z-index: 1;
    .header-bg {
      position: relative;
      width: 100%;
      height: 170px;
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
        cursor: pointer;
        img {
          width: 60px;
          height: 60px;
          border-radius: 100%;
          border: 0;
          outline: none;
          pointer-events: none;
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
          margin-top: 10px;
          font-size: 14px;
          color: #333;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
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
      .go-withdraw {
        width: 82px;
        position: absolute;
        right: -1px;
        top: 20px;
        cursor: pointer;
        img {
          width: 82px;
          pointer-events: none;
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
  }
  .statics-section {
    height: calc(100% - 170px);
    padding-top: 25px;
    background: #fff;
    .statics-search {
      display: flex;
      flex: 1;
      height: 35px;
      align-items: center;
      .statics-search-date {
        flex: 1;
        text-align: center;
        border-right: 1px solid #ccc;
        margin: 10px 0;
        color: #333;
        font-size: 14px;
        img {
          width: 15px;
          padding-left: 5px;
          vertical-align: middle;
          margin-top: -2px;
        }
      }
      .statics-search-btn-section {
        text-align: center;
        flex: 0 0 90px;
        .statics-search-btn {
          background-color: #3D8CF7;
          height: 23px;
          line-height: 23px;
          width: 60px;
          border-radius: 3px;
          margin: 5px auto;
          font-size: 11px;
          color: #fff;
        }
      }
    }
    .content-list-item-header {
      width: 96%;
      margin: 0 auto;
      margin-top: 10px;
      display: flex;
      height: 30px;
      border: 1px solid #ccc;
      font-size: 12px;
      .content-list-item-content {
        flex: 1;
        border-right: 1px solid #ccc;
        text-align: center;
        height: 30px;
        line-height: 30px;
        &:last-of-type {
          border-right: 0;
        }
      }
    }
    .content-list {
      height: calc(100% - 75px);
      overflow: auto;
      width: 96%;
      margin: 0 auto;
      .content-list-item {
        display: flex;
        height: 30px;
        border: 1px solid #ccc;
        border-top: 0;
        font-size: 12px;
        .content-list-item-content {
          flex: 1;
          border-right: 1px solid #ccc;
          text-align: center;
          height: 30px;
          line-height: 30px;
          &:last-of-type {
            border-right: 0;
          }
        }
      }
      .tips {
        margin-top: 10px;
        text-align: center;
        font-size: 12px;
        color: #878787;
      }
    }
  }
}
.record-loading {
  text-align: center;
  color: #AAA;
  /* background: #EEE; */
  padding: 15px 0 1%;
  font-size: 12px;
}

</style>
