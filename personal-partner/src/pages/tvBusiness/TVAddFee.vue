<template>
  <div class="tv-add-fee">
    <template v-if="bannerList.length > 0">
      <cube-slide ref="banner" :data="bannerList" class="banner">
        <cube-slide-item v-for="(item, index) in bannerList" :key="index" @click.native="bannerJump(item)">
          <img :src="item.picUrl">
        </cube-slide-item>
      </cube-slide>
    </template>
    <div class="no-img" v-else>
      暂无图片
    </div>
    <div class="content-section">
      <div class="broadband-search-row">
        <palm-input class="broadband-search-input" placeholder="请输入手机号" maxlength="11" v-model="phone"/>
        <!-- <palm-sms-button class="sms-button" :phone.sync="phone" @success="getSmsSuc"></palm-sms-button> -->
        <div class="sms-button" @click.self="getSms" :class="{'btn-disabled': isSending}">{{smsTip}}</div>
      </div>
      <div class="broadband-search-row">
        <palm-input class="broadband-search-input" placeholder="请输入验证码" maxlength="6" v-model="sms"/>
        <div class="btn-broadband-search" @click="search209">查询209</div>
      </div>
      <div class="broadband-search-row">
        <div class="select-209" @click="open209Picker" :class="{'disabled-209': list209.length <= 1}">
          {{confirm209 || '请选择209宽带号码'}}
          <img class="check-select-icon" src="static/img/tvbusiness/caret.png" />
        </div>
        <div class="btn-broadband-search btn-search-tv" @click="getTvNoList">查询电视资费</div>
      </div>
      <div class="tv-select-row">
        <div class="tv-select" @click="openTvNoListPicker" :class="{'disabled': tvNoList.length <= 0}">
          {{confirmTvNo ? confirmTvNo : '请选择电视账号'}}
          <img class="check-select-icon" src="static/img/tvbusiness/caret.png" />
        </div>
      </div>
      <!-- <div class="tv-select-row" v-show="confirmTvNo">
        <div class="tv-select" @click="openFeeListPicker">
          {{selectedFee.feeName ? selectedFee.feeName : '请选择电视资费'}}
          <img class="check-select-icon" src="static/img/tvbusiness/caret.png" />
        </div>
      </div> -->
      <div class="submit-btn" @click="submit">立即办理</div>
      <div class="tab-wrap">
        <div class="tab-items">
          <div class="tab-item" :class="{'tab-active': tabIndex === 0}" @click="tabSwitch($event, 0)">业务简介</div>
          <div class="tab-item" :class="{'tab-active': tabIndex === 1}" @click="tabSwitch($event, 1)">业务详情</div>
          <!-- <div class="clear-float"></div> -->
        </div>
        <div class="tab-content">
  <!--         <div class="tab-content-item content-left" v-if="tabIndex === 0 && /http/ig.test(selectedFee.detailUrl)"><img :src="selectedFee.detailUrl" /></div> -->
          <div class="tab-content-item content-right" v-if="tabIndex === 0 && selectedFee.businessIntro" v-html="selectedFee.businessIntro"></div>
          <div class="tab-content-item content-right" v-if="tabIndex === 0 && !selectedFee.businessIntro"><div style="color: #aaa;">（无）</div></div>
          <div class="tab-content-item content-right" v-if="tabIndex === 1 && selectedFee.businessDetail" v-html="selectedFee.businessDetail"></div>
          <div class="tab-content-item content-right" v-if="tabIndex === 1 && !selectedFee.businessDetail"><div style="color: #aaa;">（无）</div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import { Indicator, Toast, MessageBox } from 'mint-ui'
export default {
  components: {
    Indicator,
    Toast,
    MessageBox
  },
  data() {
    return {
      partnerId: '',
      pfId: this.$route.query.id,
      bannerList: [],
      phone: '',
      sms: '',
      list209: [],
      confirm209: '',
      tvNoList: [],
      confirmTvNo: '',
      productIdList: [],
      canHandle: true,
      feeList: [],
      selectedFee: {},
      tabIndex: 0,
      smsTip: '发送验证码',
      isSending: false,
      isLoading: false
    }
  },
  watch: {
    isSending(val) {
      if (val) {
        let smsCnt = 60;
        this.smsTip = smsCnt + 's';
        let timer = setInterval(() => {
          smsCnt--;
          this.smsTip = smsCnt + 's';
          if (smsCnt <= 0) {
            clearInterval(timer);
            this.isSending = false;
          }
        }, 1000);
      } else {
        this.smsTip = '发送验证码';
      }
    }
  },
  created() {
    this.Bus.loading && this.Bus.loading.hide()
    let serverUserInfo = this.utils.getSession('ptServerInfo')
    if (this.$route.query.partnerId) {
      this.partnerId = this.$route.query.partnerId
    } else if (serverUserInfo) {
      this.partnerId = serverUserInfo.id
    }
    this.getFeeList()
  },
  mounted () {
  },
  methods: {
    getSms: function() {
      if (!this.utils.Constants.cmccMobileReg.test(this.phone)) {
        Toast({ message: '请输入正确的移动手机号码！', duration: 1200 });
        return;
      }
      if (this.isSending) {
        Toast({ message: `请等待${this.smsTip}`, duration: 1200 });
        return;
      }
      let url = `${this.utils.baseUrl}/verifyCode/send`; // 获取短信验证码
      let params = {
        'phone': this.utils.encryptByDES.CBC('' + this.phone, this.utils.YEK_SED)
      };
      let reqParams = this.utils.getRequestParams(url, params, (vue, json) => {
        Indicator.close();
        if (json.status === 0) {
          vue.isSending = true;
          Toast(json.msg || '短信验证码发送成功');
        } else {
          Toast(json.msg || '短信验证码发送失败，请重试');
        }
      }, (vue, ex) => {
        Indicator.close();
        Toast('网络异常，短信验证码发送失败');
      }, '');
      Indicator.open();
      this.utils.sendJsonPostRequest(this, reqParams);
    },
    // submit: function() {
    //   if (!this.utils.Constants.cmccMobileReg.test(this.phone)) {
    //     Toast({message: '请输入正确的移动手机号码！', duration: 1200});
    //     return;
    //   }
    //   if (!/\d{6}/.test(this.sms)) {
    //     Toast({message: '请输入正确的验证码！', duration: 1200});
    //     return;
    //   }
    //   if (!this.ifAgree) {
    //     Toast({message: '请阅读并同意《业务办理协议》', duration: 1200});
    //     return;
    //   }
    //   this.inputPanelShow = false;
    //   MessageBox.confirm('您确认办理该移动业务吗？').then(action => {
    //     console.log(action);
    //     if (action === 'confirm') {
    //       this.submitToServer();
    //     }
    //   }).catch(ex => {
    //     console.log(ex);
    //   });
    // },
    tabSwitch (e, index) {
      e.stopPropagation()
      this.tabIndex = index
    },
    bannerJump (item) {
      if (/^http/i.test(item.linkUrl)) {
        window.location.href = item.linkUrl
      } else {
        console.log('配置的URL不正确')
      }
    },
    getSmsSuc (val) {
      console.log('触发短信发送成功事件:', val)
      if (val) this.sms = ''
    },
    open209Picker () {
      if (this.list209.length <= 0) {
        this.$createToast({
          time: 1000,
          txt: '请先查询209',
          type: 'warn'
        }).show()
        return
      }
      if (this.list209.length === 1) {
        return
      }
      this.$createPicker({
        title: '请选择宽带号码',
        alias: {
          value: 'KD_PHONE_NO',
          text: 'KD_PHONE_NO'
        },
        data: [this.list209],
        selectedIndex: [this.confirm209Index],
        onSelect: (selectedVal, selectedIndex, selectedText) => {
          console.log(selectedVal.join(','), selectedIndex.join(','), selectedText.join(''))
          this.confirm209Index = selectedIndex.join(',')
          this.confirm209 = selectedText.join('')
          this.confirm209 = selectedVal.join(',')
          this.tvNoList = []
          this.confirmTvNo = ''
          // this.selectedFee = {}
        },
        onCancel: () => {
          console.log('取消')
        }
      }).show()
    },
    openTvNoListPicker () {
      if (this.tvNoList.length <= 0) {
        this.$createToast({
          time: 1000,
          txt: '无可选电视账号，请先查询电视资费',
          type: 'warn'
        }).show()
        return
      }
      this.$createPicker({
        title: '请选择电视账号',
        alias: {
          value: 'value',
          text: 'value'
        },
        data: [this.tvNoList],
        selectedIndex: [this.confirmTvNoIndex],
        onSelect: (selectedVal, selectedIndex, selectedText) => {
          console.log(selectedVal.join(','), selectedIndex.join(','), selectedText.join(''))
          this.confirmTvNoIndex = selectedIndex.join(',')
          this.confirmTvNo = selectedText.join('')
          this.confirmTvNo = selectedVal.join(',')
        },
        onCancel: () => {
          console.log('取消')
        }
      }).show()
    },
    search209 () {
      if (!this.utils.Constants.mobileReg.test(this.phone)) {
        this.$createToast({
          time: 1000,
          txt: '请输入正确的手机号',
          type: 'warn'
        }).show()
        return
      }
      if (!/\d{6}/.test(this.sms)) {
        this.$createToast({
          time: 1000,
          txt: '请输入6位数验证码',
          type: 'warn'
        }).show()
        return
      }
      this.list209 = this.tvNoList = []
      this.confirm209 = this.confirmTvNo = ''
      // this.selectedFee = {}
      let url = `${this.utils.baseUrl}/tv/getBroadbandNo`;
      let params = {
        'phoneNo': this.phone,
        'verifyCode': this.sms
      }
      let reqParams = this.utils.getRequestParams(
        url,
        params,
        (vue, json) => {
          Indicator.close();
          // json = {
          //   'status': 0,
          //   'msg': 'ok',
          //   'data': {
          //     'USER_INFO_LIST': [{
          //       'ID_NO': '11711069448287',
          //       'CUST_ID': '11804035780428',
          //       'RUN_CODE': 'A',
          //       'KD_PHONE_NO': '20931110644',
          //       'RUN_TIME': '20190605181202'
          //     }, {
          //       'ID_NO': '11811095918748',
          //       'CUST_ID': '11804035780428',
          //       'RUN_CODE': 'E',
          //       'KD_PHONE_NO': '20975810618',
          //       'RUN_TIME': '20190710152700'
          //     }]
          //   },
          //   'success': true
          // }
          if (json.status !== 0) {
            this.$createToast({
              time: 1000,
              txt: `${json.msg || '失败。'}`,
              type: 'warn'
            }).show()
            return
          }
          this.list209 = []
          if (json.data.USER_INFO_LIST instanceof Array) {
            this.list209 = json.data.USER_INFO_LIST
          } else {
            this.list209.push(json.data.USER_INFO_LIST)
            this.confirm209 = this.list209[0].KD_PHONE_NO
          }
        },
        (vue, ex) => {
          Indicator.close();
          console.info(ex);
          MessageBox.alert('获取209宽带号码异常');
        }
      );
      Indicator.open();
      this.utils.sendJsonPostRequest(this, reqParams);
    },
    async getTvNoList () {
      if (!this.confirm209) {
        this.$createToast({
          time: 1000,
          txt: '请先选择209宽带号码',
          type: 'warn'
        }).show()
        return
      }
      this.confirmTvNo = ''
      // this.selectedFee = {}
      let url = `${this.utils.baseUrl}/tv/queryTvInfo`; // 查询电视账号
      let params = {
        phoneNo: this.confirm209
      }
      // let res = await this.api.tvBusiness.queryTvInfo(params)
      // console.log(res)
      let reqParams = this.utils.getRequestParams(
        url,
        params,
        (vue, json) => {
          Indicator.close();
          if (json.status !== 0) {
            this.$createToast({
              time: 1000,
              txt: `${json.msg || '失败。'}`,
              type: 'warn'
            }).show()
            return
          }
          let tvNoList = json.data.PRODPRC_LIST
          if (!tvNoList || (tvNoList && tvNoList.length <= 0)) {
            MessageBox.alert(`\`${this.confirm209}\`无对应的电视账号`);
            return;
          }
          this.tvNoList = []
          this.tariffMap = {}
          tvNoList.forEach(item => {
            if (item.CUST_TELEPHONE) {
              this.tvNoList = this.tvNoList.concat({ value: item.CUST_TELEPHONE })
              if (typeof item.CUST_TELEPHONE !== 'string') {
                item.CUST_TELEPHONE.forEach((tel) => {
                  this.tariffMap[tel] = item.PROD_PRCID
                })
              } else {
                this.tariffMap[item.CUST_TELEPHONE] = item.PROD_PRCID
              }
            }
          })
          console.log(this.tvNoList)
        },
        (vue, ex) => {

        }
      );
      Indicator.open();
      this.utils.sendGetRequest(this, reqParams);
    },
    async getFeeList () {
      let url = `${this.utils.baseUrl}/packageSalary/getByPfId`;
      let params = {
        'pfId': this.pfId
      };
      let reqParams = this.utils.getRequestParams(
        url,
        params,
        (vue, json) => {
          vue.isLoading = false;
          Indicator.close();
          console.log(json);
          if (json.status !== 0) {
            Toast('查询资费失败。' + json.msg);
            return;
          }
          vue.bannerList = json.data.bannerList;
          vue.feeList = json.data.packageSalaryList;
          if (!vue.feeList || (vue.feeList && vue.feeList.length <= 0)) {
            MessageBox.alert('活动已下线');
            return;
          }
          vue.preferentialFlow = json.data.preferentialFlow;
          vue.totalLine = parseInt(vue.feeList.length / 3, 10) - 1; // 总行数totalLine。为了和selectedLine保持一致，第一行为0
          vue.extraCnt = vue.feeList.length % 3; // 余数
          if (vue.extraCnt !== 0) {
            vue.totalLine = vue.totalLine + 1; // 余数如果不为0，则行数应+1
          }
          console.log(vue.extraCnt);

          vue.selectedFee = this.feeList[0];
          let currentProduct = json.data.preferentialFlow;
          vue.selectedFee.businessIntro = currentProduct.detailUrl.replace(/\s(width|height)(=["']\d+["']|:[^;]+[a-z]+;)/gi, ' ');
          vue.selectedFee.businessDetail = currentProduct.businessRule.replace(/\s(width|height)(=["']\d+["']|:[^;]+[a-z]+;)/gi, ' ');
          document.title = currentProduct.productName || '资费办理';
          let shareTitle = currentProduct.shareTitle || currentProduct.productName;
          let shareBrief = currentProduct.shareBrief || currentProduct.typeIntroduce;
          let shareUrl = `${window.location.origin + this.utils.baseUrl}/common/redirect?info=path=tvaddfeelistenid=${currentProduct.id}listenpartnerId=${vue.partnerId}`;
          let shareIcon = /^http/i.test(currentProduct.icon) ? currentProduct.icon : `${window.location.origin + this.utils.baseUrl}/partner/static/img/cmcc_logo.png`;
          let shareObj = {
            title: shareTitle,
            desc: shareBrief,
            link: shareUrl,
            imgUrl: shareIcon,
            showList: [
              'menuItem:share:qq',
              'menuItem:share:weiboApp',
              'menuItem:share:appMessage',
              'menuItem:share:timeline',
              'menuItem:favorite',
              'menuItem:share:QZone'
            ]
          };
          if (this.$route.query.sysFrom === 'employee') {
            shareObj.imgUrl = `${window.location.origin + this.utils.baseUrl}/partner/static/img/employee/cmcc.png`;
          }
          this.utils.getJsApiConfig(shareObj);
        },
        (vue, ex) => {
          vue.isLoading = false;
          Indicator.close();
          console.info(ex);
          MessageBox.alert('获取电视资费异常');
        }
      );
      Indicator.open();
      this.isLoading = true;
      this.utils.sendGetRequest(this, reqParams);
    },
    submit () {
      if (!this.utils.Constants.mobileReg.test(this.phone)) {
        this.$createToast({
          time: 1000,
          txt: '请输入正确的手机号',
          type: 'warn'
        }).show()
        return
      }
      if (!/\d{6}/.test(this.sms)) {
        this.$createToast({
          time: 1000,
          txt: '请输入6位数验证码',
          type: 'warn'
        }).show()
        return
      }
      if (!this.confirm209) {
        this.$createToast({
          time: 1000,
          txt: '请选择209宽带号码',
          type: 'warn'
        }).show()
        return
      }
      if (!this.confirmTvNo) {
        this.$createToast({
          time: 1000,
          txt: '请选择电视账号',
          type: 'warn'
        }).show()
        return
      }
      if (!this.selectedFee.packageCode) {
        this.$createToast({
          time: 1000,
          txt: '请选择电视资费',
          type: 'warn'
        }).show()
        return
      }
      let url = `${this.utils.baseUrl}/tv/submitTv`;
      let params = {
        'partner': {
          'PARTNER_ID': this.partnerId,
          'BUSINESS_ID': this.selectedFee.id,
          'PHONE': this.phone
        }
      }
      if (/^209/.test(this.confirmTvNo) || this.confirmTvNo.length !== 11) {
        params.rest = {
          'accountNo': this.confirm209,
          'phoneNo': this.confirm209,
          'tariffId': this.tariffMap[this.confirmTvNo],
          'tv_no': this.confirmTvNo,
          'operate_type': 1,
          'PRODUCT_ID': this.selectedFee.packageCode
        }
      } else {
        params.rest = {
          'accountNo': this.confirm209,
          'phoneNo': this.confirmTvNo,
          'tariffId': this.tariffMap[this.confirmTvNo],
          'operate_type': 1,
          'PRODUCT_ID': this.selectedFee.packageCode
        }
      }
      let reqParams = this.utils.getRequestParams(
        url,
        params,
        (vue, res) => {
          Indicator.close();
          console.log(res)
          if (res.status === 0) {
            vue.$createDialog({
              type: 'alert',
              title: '提示',
              content: '办理成功',
              icon: 'cubeic-alert'
            }).show()
            vue.sms = ''
            vue.list209 = vue.tvNoList = []
            vue.confirm209 = vue.confirmTvNo = ''
            // vue.selectedFee = {}
          } else {
            vue.$createDialog({
              type: 'alert',
              title: '提示',
              content: '办理失败！' + res.msg,
              icon: 'cubeic-alert'
            }).show()
          }
        },
        (vue, ex) => {
          Indicator.close();
          MessageBox.alert('办理异常，请重试');
          console.log(ex);
        }
      );
      Indicator.open();
      this.utils.sendJsonPostRequest(this, reqParams);
    }
  }
}
</script>

<style lang="less">
  .tv-add-fee {
    position: relative;
    width: 100%;
    min-height: 100%;
    background-color: #fff;
    min-width: 270PX;
    input {
      border: 1px solid rgba(141, 141, 141, 0.5) !important;
    }
    .banner {
      position: relative;
      width: 100%;
      min-height: 100px;
      img {
        width: 100%;
      }
    }
    .no-img {
      position: relative;
      font-size: 16px;
      color: #eee;
      text-align: center;
      width: 100%;
      height: 150px;
      padding: 65px 0;
      border-bottom: 1px solid #eee;
    }
    .content-section {
      position: relative;
      .broadband-search-row {
        display: flex;
        display: -webkit-flex;
        padding: 10px 15px;
        position: relative;
        .broadband-search-input {
          width: 100%;
          flex: 1 1 140px;
          margin-right: 15px;
          border: 1px solid rgba(141, 141, 141, 0.5);
          border-radius: 2px;
          width: 100%;
          line-height: 1.5;
          padding-left: 10px;
        }
        .sms-button {
          background: #47A9E2;
          height: 40px;
          width: 90px;
          line-height: 40px;
          color: #fff;
          text-align: center;
          font-size: 12px;
          border-radius: 4px;
        }
        .select-209 {
          width: 100%;
          height: 40px;
          line-height: 40px;
          margin-right: 15px;
          position: relative;
          padding: 0 4% 0 10px;
          word-break: keep-all;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1 1 140px;
          border: 1px solid rgba(141, 141, 141, 0.5);
          border-radius: 2px;
          font-size: 14px;
          &.disabled-209 {
            background: #d8d8d8;
          }
          .check-select-icon {
            height: 18%;
            top: 45%;
            position: absolute;
            right: 4%;
          }
        }
        .btn-broadband-search {
          width:  90px;
          height: 40px;
          flex: 0 0 90px;
          background-color: #47A9E2;
          border-radius: 4px;
          text-align: center;
          line-height: 40px;
          color: #fff;
          font-family: "STHeitiSC-Light";
          font-size: 12px;
          &.btn-search-tv {
            flex: 0 0 120px;
          }
          &.btn-disabled {
            background: #d8d8d8;
          }
        }
      }
      .tv-select-row {
        margin: 10px 15px;
        min-height: 40px;
        height: 40px;
        line-height: 40px;
        .tv-select {
          width: 100%;
          height: 100%;
          position: relative;
          padding: 0 4% 0 10px;
          word-break:keep-all;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          flex: 1 1 140px;
          border: 1px solid rgba(141, 141, 141, 0.5);
          border-radius: 2px;
          font-size: 14px;
          .check-select-icon {
            height: 18%;
            top: 45%;
            position: absolute;
            right: 4%;
          }
          &.disabled {
            background: #d8d8d8;
          }
        }
      }

      .tab-wrap {
        position: relative;
        .tab-items {
          position: relative;
          display: flex;
          border-top: 1px solid #efefef;
          border-bottom: 1px solid #efefef;
          .tab-item {
            flex: 1 1 50%;
            text-align: center;
            height: 40px;
            line-height: 40px;
            /*margin: 0 5%;*/
            color: #333;
            font-size: 14px;
            background: #eee;
            /*border-bottom: 2px solid rgba(0, 0, 0, 0);*/
            &.tab-active {
              /*border-bottom: 2px solid #3d8cf7;*/
              /*color: #3d8cf7;*/
              background: #fff;
            }
          }
        }
        .tab-content {
          position: relative;
          width: 100%;
          min-height: 200px;
          .tab-content-item {
            width: 100%;
            position: relative;
            &.content-right {
              padding: 10px;
            }
            * {
              max-width: 100%;
              // font-size: 12px!important;
            }
            img {
              padding: 0;
              display: block;
              pointer-events: none;
            }
          }
        }
      }
      .submit-btn {
        width: 80%;
        // max-width: 500PX;
        height: 45px;
        line-height: 45px;
        text-align: center;
        margin: 30px auto;
        background: #47A9E2;
        color: #fff;
        font-size: 16px;
        border-radius: 6px;
        cursor: pointer;
      }

      .fee-detail-content {
        padding: 15px 5vw 50px 5vw;
        /*padding-bottom: 50px;*/
        font-family: ".PingFangSC-Regular";
        font-size: 1em;
        color: #555;
        letter-spacing: 0;
      }
      .fee-detail-content p {
        /*margin-bottom: 5px; */
        line-height: 150%;
      }
      .btn-section{
        position: fixed;
        bottom: 0;
        width: 100%;
        height: 50px;
        transform: translateZ(0);
      }
      .btn-tv-handle {
        background-color: #47A9E2;
        font-family: "FZLTZHK--GBK1-0";
        font-size: 18px;
        color: #FFF;
        /* letter-spacing: 0; */
        line-height: 50px;
        text-align: center;
      }
    }
  }
</style>
