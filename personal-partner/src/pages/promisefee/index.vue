<template>
  <div class="promise-fee">
    <div class="banner">
      <img src="static/img/promisefee/indexBanner.png?v=1" />
    </div>
    <div class="input-section">
      <div class="phone-box">
        <palm-input type="tel" maxlength="11" v-model="phone" placeholder="请输入用户手机号码" />
      </div>
      <div class="sms-wrap">
        <div class="sms-box">
          <palm-input type="tel" maxlength="6" v-model="sms" placeholder="请输入验证码" />
        </div>
        <div class="sms-btn" @click="getSms">{{smsTip}}</div>
      </div>
      <div class="submit-btn" @click="getPromiseFee">查询每月享用流量（语音）额度</div>
    </div>
    <div class="promise-section" v-if="isPromiseInfoShow">
      <div class="promise-text" v-html="promptStr"></div>
      <!-- <div class="promise-text">计算月份：<span style="color:#333333;">{{promiseInfo.arpu_month ? (promiseInfo.arpu_month) : (isPromiseInfoLoading ? '加载中...' : '未知')}}</span></div>
      <div class="promise-text">承诺消费金额：<span style="color:#333333;">{{promiseInfo.arpu_value ? (promiseInfo.arpu_value + '元') : (isPromiseInfoLoading ? '加载中...' : '未知')}}</span></div>
      <div class="promise-text">网龄：<span style="color:#333333;">{{promiseInfo.net_age ? (promiseInfo.net_age + '个月') : (isPromiseInfoLoading ? '加载中...' : '未知')}}</span></div>
      <div class="promise-text">入库时间：<span style="color:#333333;">{{promiseInfo.oper_date ? (promiseInfo.oper_date ) : (isPromiseInfoLoading ? '加载中...' : '未知')}}</span></div> -->
      <div class="stock-info">{{stockMsg}}</div>
      <!--<div class="submit-btn" @click="inStock" v-if="canStock">确认入库</div>-->
      <div class="submit-btn" @click="toStockHandle" v-if="!canStock">去办理</div>
    </div>
  </div>
</template>
<script type="text/javascript">
import { Indicator, Toast, MessageBox } from 'mint-ui';
import { baseUrl, Constants, getRequestParams, sendJsonPostRequest, sendGetRequest } from 'src/assets/utils.js';
import Qs from 'qs';
export default {
  components: {
  },
  data() {
    return {
      phone: '',
      sms: '',
      promptStr: '',
      smsTip: '获取验证码',
      isSmsSending: false,
      isPromiseInfoShow: false,
      stockMsg: '',
      promiseInfo: '',
      isPromiseInfoLoading: false,
      canStock: true
    };
  },
  watch: {
    phone(val) {
      this.isPromiseInfoShow = false;
      this.promiseInfo = '';
    },
    isSmsSending(val) {
      if (val) {
        let smsCnt = 60;
        this.smsTip = smsCnt + 's';
        let timer = setInterval(() => {
          smsCnt--;
          this.smsTip = smsCnt + 's';
          if (smsCnt <= 0) {
            clearInterval(timer);
            this.isSmsSending = false;
          }
        }, 1000);
      } else {
        this.smsTip = '获取验证码';
      }
    }
  },
  created() {
    Indicator.close();
    document.title = '权益新升级（全省）';
    this.getList();
  },
  methods: {
    getList: function() {
      let url = `${baseUrl}/packageSalary/getByPfId`;
      let params = {
        'pfId': this.$route.query.id
      };
      let reqParams = getRequestParams(
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
          vue.banners = json.data.bannerList;
          vue.flowList = json.data.packageSalaryList;
          if (!vue.flowList || (vue.flowList && vue.flowList.length <= 0)) {
            MessageBox.alert('活动已下线');
            return;
          }
          vue.preferentialFlow = json.data.preferentialFlow;
          vue.totalLine = parseInt(vue.flowList.length / 3, 10) - 1; // 总行数totalLine。为了和selectedLine保持一致，第一行为0
          vue.extraCnt = vue.flowList.length % 3; // 余数
          if (vue.extraCnt !== 0) {
            vue.totalLine = vue.totalLine + 1; // 余数如果不为0，则行数应+1
          }
          console.log(vue.extraCnt);

          vue.selectedItem = this.flowList[0];
          let currentProduct = json.data.preferentialFlow;
          document.title = currentProduct.productName || '资费办理';
          let shareTitle = currentProduct.shareTitle || currentProduct.productName;
          let shareBrief = currentProduct.shareBrief || currentProduct.typeIntroduce;
          let shareUrl = `${window.location.origin + baseUrl}/common/redirect?info=path=promisefeelistenid=${vue.$route.query.id}listenpartnerId=${vue.$route.query.partnerId}`;
          let shareIcon = /^http/i.test(currentProduct.icon) ? currentProduct.icon : `${window.location.origin + baseUrl}/partner/static/img/cmcc_logo.png`;
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
            shareObj.imgUrl = `${window.location.origin + baseUrl}/partner/static/img/employee/cmcc.png`;
          }
          vue.utils.getJsApiConfig(shareObj);
        },
        (vue, ex) => {
          vue.isLoading = false;
          document.title = '资费办理';
          Indicator.close();
          console.info(ex);
          Toast('网络异常');
        }
      );
      Indicator.open();
      this.isLoading = true;
      sendGetRequest(this, reqParams);
    },
    getSms: function() {
      if (this.isSmsSending) {
        Toast({message: '请等待' + this.smsTip, position: 'bottom'});
        return;
      }
      if (!Constants.cmccMobileReg.test(this.phone)) {
        Toast({message: '请输入正确的移动手机号', position: 'bottom'});
        return;
      }
      let url = Constants.dzgApiV2Host + '/sms/send?phoneNumber=' + this.phone + '&smsType=9&empCode=ob0086';
      let reqParams = getRequestParams(
        url,
        '',
        (vue, json) => {
        //   vue.Bus.loading.hide();
          Indicator.close();
          if (json && json.ResultCode === 1000) {
            vue.isSmsSending = true;
            vue.sms = '';
            Toast({message: '短信验证码发送成功', position: 'bottom'});
          } else {
            Toast({message: '短信验证码发送失败', position: 'bottom'});
          }
        },
        (vue, ex) => {
          console.log('短信验证码发送失败', ex);
          //   vue.Bus.loading.hide();
          Indicator.close();
          Toast({message: '短信验证码发送失败', position: 'bottom'});
        }
      );
      Indicator.open();
      sendGetRequest(this, reqParams);
    },
    getPromiseFee: function() { // 承诺消费查询
      if (!Constants.cmccMobileReg.test(this.phone)) {
        Toast({message: '请输入正确的移动手机号', position: 'bottom'});
        return;
      }
      if (!/\d{6}/.test(this.sms)) {
        Toast({message: '请输入6位数字验证码', position: 'bottom'});
        return;
      }
      let url = `${Constants.dzgApiV2Host}/h5/data/SMMCCalculateARPU`;
      let params = {
        'phoneNo': this.phone,
        'smsCode': this.sms,
        'busiType': '1'
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          console.log(json);
          vue.isPromiseInfoLoading = false;
          Indicator.close();
          if (json.ResultCode !== 1000) {
            MessageBox.alert(json.Message);
            return;
          }
          if (json.Data) {
            let rootObj = json.Data;
            if (rootObj.ROOT && rootObj.ROOT.BODY && ('' + rootObj.ROOT.BODY.RETURN_CODE === '0') && rootObj.ROOT.BODY.OUT_DATA) {
              if (rootObj.ROOT.BODY.OUT_DATA.ARPU_INFO) {
                vue.promiseInfo = rootObj.ROOT.BODY.OUT_DATA.ARPU_INFO;
              }
              if (vue.promiseInfo.flag === '0') {
                vue.canStock = true;
                vue.inStock();
              } else {
                vue.stockMsg = '';
              }
              let feeAmt = this.promiseInfo.arpu_value;
              let feeIndex = '';
              let miguFlowNum = 0;
              if (feeAmt >= 18 && feeAmt <= 48) {
                feeIndex = 0;
                miguFlowNum = 10;
              } else if (feeAmt > 48 && feeAmt <= 68) {
                feeIndex = 1;
                miguFlowNum = 20;
              } else if (feeAmt > 68 && feeAmt <= 98) {
                feeIndex = 2;
                miguFlowNum = 30;
              } else if (feeAmt > 98) {
                feeIndex = 3;
                miguFlowNum = 40;
              }
              vue.getFees(feeIndex, vue.promiseInfo.net_age, miguFlowNum);
              vue.feeIndex = '' + feeIndex;
              vue.isPromiseInfoShow = true;
            } else {
              vue.canStock = true;
              vue.isPromiseInfoShow = false;
              MessageBox.alert('承诺消费查询失败！' + rootObj.ROOT.RETURN_MSG || rootObj.ROOT.BODY.DETAIL_MSG);
            }
          } else {
            vue.canStock = true;
            vue.isPromiseInfoShow = false;
            MessageBox.alert('承诺消费查询失败！');
          }
        },
        (vue, ex) => {
        //   vue.Bus.loading.hide();
          Indicator.close();
          vue.isPromiseInfoShow = false;
          vue.isPromiseInfoLoading = false;
          vue.canStock = true;
          console.log(ex);
          MessageBox.alert('承诺消费查询失败！');
        }
      );
      this.isPromiseInfoShow = false;
      this.isPromiseInfoLoading = true;
      this.promiseInfo = {};
      //   this.Bus.loading.hide();
      Indicator.close();
      sendGetRequest(this, reqParams);
    },
    getFees: function(feeIndex, netAge, miguFlowNum) {
      Indicator.open();
      let url = Constants.dzgApiV2Host + '/h5/common/getSystemConfig';
      let params = {
        'service_type': 'PROMISE_FEES_QS'
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          console.log(json);
          Indicator.close();
          //   vue.Bus.loading.hide();
          if ('' + json.ResultCode === '1000' && json.Data && json.Data.length > 0) {
            let actList = json.Data;
            actList.sort((m, n) => m.sort - n.sort);
            vue.actList = actList;
            if (netAge >= 120) {
              feeIndex = parseInt(feeIndex) + 4;
            }
            if (feeIndex + '') {
              vue.canStock = false;
              vue.selectedFee = vue.actList[feeIndex];
              let flowCodeArr = vue.actList[feeIndex].code.split('_');
              let allCodeArr = vue.actList[parseInt(feeIndex) + 8].code.split('_');
              let flowNum = flowCodeArr[flowCodeArr.length - 1];
              let callNum = allCodeArr[allCodeArr.length - 1].replace('M', '分钟');
              let videoFlowNum = miguFlowNum;
              vue.promptStr = '亲，您当前网龄为' + netAge + '个月，每月承诺消费' + vue.promiseInfo.arpu_value + '元（与近期消费持平），可参与每月享用<span style="font-weight: 700">' + flowNum + '</span>流量或<span style="font-weight: 700">' + callNum + '</span>国内主叫分钟数活动（2选1）。流量为全国通用流量<span style="font-weight: 700">' + (parseInt(flowNum) - miguFlowNum) + 'G</span>，全国咪咕视频定向流量<span style="font-weight: 700">' + videoFlowNum + 'G</span>';
            } else {
              vue.canStock = true;
              vue.selectedFee = '';
              MessageBox.alert('未获取到推荐资费，请重试');
            }
          } else {
            vue.canStock = true;
            Toast({message: '配置异常，请联系管理员', position: 'bottom'});
          }
        },
        (vue, ex) => {
          Toast({message: '网络错误，请稍候再试', position: 'bottom'});
        }
      );
      sendGetRequest(this, reqParams);
    },
    inStock: function() { // 入库操作
      if (this.isInStockLoading) {
        return;
      }
      let url = `${Constants.dzgApiV2Host}/business/rpc/rest/esb/SMMCSaveARPU`;
      let params = {
        'HEADER': {
          'ROUTE_PHONE_NO': this.phone
        },
        'BODY': {
          'OPR_INFO': {
            'LOGIN_NO': 'ob0086' // 操作工号
          },
          'BUSI_INFO': {
            'ID_NO': '' + this.promiseInfo.id_no, // 用户ID_NO（必传）（从承诺消费查询接口拿 id_no）
            'CHN_TYPE': '1' // 渠道码（必传）：0-营业，1-大掌柜，2-客服
          }
        }
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
        //   vue.Bus.loading.hide();
          vue.isInStockLoading = false;
          console.log(json);
          if (json.ROOT && json.ROOT.BODY && ('' + json.ROOT.BODY.RETURN_CODE === '0')) {
            vue.stockMsg = '成功！';
            vue.canStock = false;
          } else {
            vue.canStock = true;
            vue.stockMsg = '失败！';
            MessageBox.alert('失败！' + json.ROOT.RETURN_MSG || json.ROOT.BODY.DETAIL_MSG);
          }
        },
        (vue, ex) => {
          vue.canStock = true;
          vue.isInStockLoading = false;
          //   vue.Bus.loading.hide();
          console.log(ex);
          MessageBox.alert('承诺消费查询失败！');
        }
      );
      Indicator.open();
      this.isInStockLoading = true;
      sendJsonPostRequest(this, reqParams);
    },
    toStockHandle: function() {
      let feeAmt = this.promiseInfo.arpu_value;
      console.log(feeAmt);
      if (!feeAmt) {
        Toast({message: '未获取到承诺消费金额', position: 'bottom'});
        return;
      }
      if (this.feeIndex === '') {
        Toast({message: '承诺金额未达到最低值18', position: 'bottom'});
        return;
      }
      Indicator.open()
      // let prefix = `${window.location.origin + baseUrl}/partner`;
      // if (process.env.NODE_ENV === 'development') {
      //   prefix = window.location.origin;
      // }
      let searchObj = Qs.parse(window.location.search.substr(1));
      delete searchObj.canAppShare;
      // let searchStr = Qs.stringify(searchObj);
      let partnerId = this.$route.query.partnerId;
      let businessId = this.$route.query.id;
      window.sessionStorage.setItem('from_promisefee_index', '1')
      setTimeout(() => {
        this.utils.pageRouter(this, { path: '/instockfees', query: { lowFee: this.promiseInfo.arpu_value, feeIndex: this.feeIndex, handlePhone: this.phone, netAge: this.promiseInfo.net_age, partnerId: partnerId, id: businessId } });
        Indicator.close()
      }, 100)
      // let url = `${prefix}/?${searchStr}&feeIndex=${this.feeIndex}&handlePhone=${this.phone}&netAge=${this.promiseInfo.net_age}&partnerId=${partnerId}&businessId=${businessId}#/instockfees`;
      // console.log(url);
      // window.location.href = url;
    }
  }
};
</script>
<style>
  .promise-fee {
    width: 100%;
    min-width: 270px;
    margin: 0 auto;
    min-height: 100%;
    max-width: 550px;
    position: relative;
    background: #FFFFFF;
    input {
      padding-left: 10px;
    }
    img {
      pointer-events: none;
    }
    .banner {
      width: 100%;
      position: relative;
      img {
        width: 100%;
        display: block;
      }
    }
    .input-section {
      position: relative;
      padding: 20px 30px;
      .phone-box {
        width: 100%;
        height: 40px;
        position: relative;
        input {
          width: 100%;
          height: 100%;
        }
      }
      .sms-wrap {
        margin-top: 10px;
        position: relative;
        width: 100%;
        height: 40px;
        display: flex;
        .sms-box {
          flex: 1;
          height: 40px;
          position: relative;
          input {
            width: 100%;
            height: 100%;
          }
        }
        .sms-btn {
          flex: 0 0 86px;
          height: 40px;
          margin-left: 15px;
          line-height: 40px;
          text-align: center;
          background: #3D8CF7;
          color: #fff;
          font-size: 14px;
          border-radius: 4px;
          cursor: pointer;
        }
      }
    }
    .promise-section {
      position: relative;
      padding: 20px 30px;
      .promise-text {
        line-height: 2;
        font-size: 14px;
      }
      .marketing-words {
        line-height: 1.5;
        margin: 10px 0;
        color: #333;
        .blue-text {
          color: #3D8CF7;
          font-weight: bold;
        }
      }
      .stock-info {
        margin-top: 20px;
      }
    }
    .submit-btn {
      margin-top: 30px;
      width: 100%;
      height: 40px;
      line-height: 40px;
      text-align: center;
      background: #3D8CF7;
      color: #fff;
      font-size: 14px;
      border-radius: 4px;
      cursor: pointer;
    }
  }
</style>
