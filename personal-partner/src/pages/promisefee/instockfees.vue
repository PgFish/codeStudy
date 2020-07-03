<template>
  <div class="in-stock" @click="closePhoneTip" v-show="pageReady">
    <div class="input-group-wrap">
      <img class="act-banner" src="static/img/promisefee/instockBanner.png">
      <div class="input-group">
        <div class="busi-name">{{selectedFee.name}}</div>
        <div class="select-box">
          <div class="select-item" :class="{'btn-status': btnIsSelect}" @click="selectItem(0)">送{{flowNum}}流量</div>
          <div class="select-item" :class="{'btn-status': !btnIsSelect}" @click="selectItem(1)">送{{callNum}}通话</div>
        </div>
        <div class="input-box phone-input">
          <palm-input type="tel" v-model="phone" placeholder="请输入手机号码" :disabled="true" maxlength="11" @click.native="showTip($event)" />
          <!-- <input type="phone" v-model="phone" placeholder="请输入手机号码" maxlength="11" @click="showTip($event)"> -->
          <div class="tip-wrap" :class="{'tip-show': isTipShow}" @click="fillPhone">
            <div class="last-input-no">{{ tipPhone + ' ' }}<span class="tip-words">上次办理号码</span></div>
          </div>
        </div>
        <div class="input-box">
          <div class="sms-input">
            <palm-input type="tel" v-model="sms" placeholder="请输入验证码" maxlength="6" />
          </div>
          <div class="sms-btn" @click="checkPhone">{{smsTip}}</div>
          <div class="clear-float"></div>
        </div>
        <palm-agreement style="padding-left:4px;margin-bottom:10px;" tickColor="#47A9E2" textStyle="color:#333;" linkStyle="color:#47A9E2;" v-model="ifAgree"></palm-agreement>
        <div class="btn-submit" @click="submit">办理</div>
      </div>
    </div>
    <div class="busi-title">业务详情:</div>
    <div class="busi-content" v-html="selectedFee.details"></div>
  </div>
</template>
<script type="text/javascript">
import { Indicator, Toast, MessageBox } from 'mint-ui';
import { Constants, baseUrl, getRequestParams, sendJsonPostRequest, sendGetRequest, getSession } from 'src/assets/utils.js';
export default {
  components: {
  },
  data() {
    return {
      isTipShow: false,
      phone: this.$route.query.handlePhone || '',
      tipPhone: '',
      sms: '',
      smsTip: '获取验证码',
      isSmsSending: false,
      actList: [],
      selectedFee: '',
      btnIsSelect: true,
      flowNum: '',
      callNum: '',
      ifAgree: false,
      lowFee: this.$route.query.lowFee,
      pageReady: false
    };
  },
  watch: {
    btnIsSelect(val) {
      if (this.feeIndex) {
        if (val) {
          this.selectedFee = this.actList[this.feeIndex];
        } else {
          this.selectedFee = this.actList[parseInt(this.feeIndex) + 8];
        }
      }
    },
    phone(val) {
      this.isTipShow = this.checkSamePhone(val);
      if (val.length === 11) {
        let storedPhone = JSON.parse(localStorage.getItem('custPhone'));
        if (Constants.cmccMobileReg.test(val)) {
          if (((storedPhone && storedPhone.PHONE !== val) || !storedPhone)) {
            let custPhone = {
              PHONE: val,
              EXP_DATE: new Date().getTime() + 30 * 60 * 1000
            };
            console.log(custPhone);
            localStorage.setItem('custPhone', JSON.stringify(custPhone));
          }
        }
      }
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
    setTimeout(() => {
      if (!this.lowFee || !window.sessionStorage.getItem('from_promisefee_index')) { // 如果此页面获取不到保底消费金额，则跳转回首页重新办理
        this.pageReady = false
        let partnerId = this.$route.query.partnerId;
        let businessId = this.$route.query.id;
        this.utils.pageRouter(this, { path: '/promisefee', query: { partnerId: partnerId, id: businessId } });
        return
      }
      this.pageReady = true
      document.title = '办理';
      let serverUserInfo = getSession('ptDetailInfo', true);
      if (this.$route.query.partnerId) {
        this.partnerId = this.$route.query.partnerId;
      } else if (serverUserInfo) {
        this.partnerId = serverUserInfo.id;
      }
      console.log('partnerId', this.partnerId);
      this.getFees();
      this.getList();
    }, 50)
  },
  mounted() {
  },
  methods: {
    selectItem(index) {
      if (index + '' === '0') {
        this.btnIsSelect = true;
      } else {
        this.btnIsSelect = false;
      }
    },
    showTip: function(e) {
      e.stopPropagation();
      this.rememberPhone();
      console.log(this.tipPhone);
      if (this.tipPhone === this.phone) {
        this.isTipShow = false;
      } else if (this.tipPhone) {
        this.isTipShow = true;
      }
    },
    closePhoneTip: function() {
      this.isTipShow = false;
    },
    rememberPhone: function() {
      let custPhone = JSON.parse(localStorage.getItem('custPhone'));
      if (custPhone) {
        let expDate = custPhone.EXP_DATE;
        if (new Date().getTime() - expDate >= 0) {
          localStorage.removeItem('custPhone');
        } else {
          this.tipPhone = custPhone.PHONE;
        }
      }
    },
    fillPhone: function() {
      this.isTipShow = false;
      this.phone = this.tipPhone;
    },
    checkSamePhone: function(inputPhone) {
      return this.tipPhone.indexOf(inputPhone) === 0 && this.tipPhone !== this.phone;
    },
    getFees: function() {
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
          if ('' + json.ResultCode === '1000') {
            let actList = json.Data;
            actList.sort((m, n) => m.sort - n.sort);
            vue.actList = actList;
            vue.feeIndex = this.$route.query.feeIndex;
            let netAge = this.$route.query.netAge;
            if (netAge >= 120) {
              vue.feeIndex = parseInt(vue.feeIndex) + 4;
            }
            if (vue.feeIndex) {
              vue.selectedFee = vue.actList[vue.feeIndex];
              let flowCodeArr = vue.actList[vue.feeIndex].code.split('_');
              let allCodeArr = vue.actList[parseInt(vue.feeIndex) + 8].code.split('_');
              vue.flowNum = flowCodeArr[flowCodeArr.length - 1];
              vue.callNum = allCodeArr[allCodeArr.length - 1].replace('M', '分钟');
            } else {
              vue.selectedFee = '';
              MessageBox.alert('未获取到推荐资费，请重试');
            }
          } else {
            Toast({ message: '配置异常，请联系管理员', position: 'bottom' });
          }
        },
        (vue, ex) => {
          Indicator.close();
          Toast({ message: '网络错误，请稍候再试', position: 'bottom' });
        }
      );
      sendGetRequest(this, reqParams);
    },
    getSms: function() {
      if (!this.feeIndex) {
        return;
      }
      if (this.isSmsSending) {
        Toast({ message: '请等待' + this.smsTip, position: 'bottom' });
        return;
      }
      if (!Constants.cmccMobileReg.test(this.phone)) {
        Toast({ message: '请输入正确的移动手机号', position: 'bottom' });
        return;
      }
      let params = {
        'phoneNumber': '' + this.phone,
        'type': 'MARK',
        'oprType': '1',
        'tariffCode': this.selectedFee.value,
        'lowFee': '' + this.lowFee
      };
      var url = baseUrl + '/business/sendMsg';
      var reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          Indicator.close();
          if (json.ResultCode === 1000) {
            MessageBox.alert('获取验证码成功');
            return true;
          } else {
            MessageBox.alert('获取验证码失败。:' + json.Message);
          }
        },
        (vue, ex) => {
          console.log(ex);
          Indicator.close();
          Toast({ message: '服务器异常，请稍后再试', position: 'bottom' });
        }
      );
      Indicator.open();
      sendJsonPostRequest(this, reqParams);
    },
    switchFee: function(item) {
      this.selectedFee = item;
      if (this.selectedFee.detail) {
        this.selectedFee.detail = this.selectedFee.detail.replace(/\s(width|height)(=["']\d+["']|:[^;]+[a-z]+;)/gi, ' ');
      }
    },
    getCheckPhoneParams: function() {
      let type = '2';
      var meansId = (type === '2' ? this.selectedFee.value : '');
      var backCode = (type === '3' ? this.selectedFee.value : '');
      var actId = (type === '2' ? this.selectedFee.value.substr(0, 4) : '');
      var data = {
        'BODY': {
          'PHONE_NO': '' + this.phone,
          'MASTER_SERV_ID': '1001',
          'TWICE_CONFIRM': 'N',
          'REQUEST_INFO': {
            'OPR_INFO': {
              'ACT_ID': actId,
              'CHANNEL_TYPE': '3',
              'CONTACT_ID': '',
              'CUST_ADVINCE': '',
              'LOGIN_NO': 'ob0086',
              'MEANS_ID': meansId,
              'BACK_CODE': backCode,
              'PROVINCE_GROUP': '10008',
              'RECOMMEND_NO': '',
              'PHONE_NO': this.phone
            }
          }
        },
        'SERVICE_NO': this.phone
      };
      return data;
    },
    // 校验号码是否可以办里
    checkPhone: function() {
      if (this.isSmsSending) {
        Toast({ message: '请等待' + this.smsTip, position: 'bottom' });
        return;
      }
      var data = this.getCheckPhoneParams();
      var url = Constants.dzgApiV2HostRest + '/s4035IntChk?token=' + '';
      var reqParams = getRequestParams(
        url,
        data,
        (vue, json) => {
          console.log(json);
          var root = json.ROOT;
          if (root && root.RETURN_CODE === 0 && root.OUT_DATA) {
            Indicator.close();
            if (root.OUT_DATA.PASS_FLAG === 'Y') {
              vue.getSms();
            } else {
              var msg = '';
              if (root.OUT_DATA.MEAN_ALL.LIMIT_INFO instanceof Array) {
                var limitInfo = root.OUT_DATA.MEAN_ALL.LIMIT_INFO;
                for (var i = 0; i < limitInfo.length; i++) {
                  if (limitInfo[i].PASS_FLAG === 'N') {
                    msg = limitInfo[i].NOTE;
                    break;
                  }
                }
                // msg = root.OUT_DATA.MEAN_ALL.LIMIT_INFO[0].NOTE;
              } else {
                msg = root.OUT_DATA.MEAN_ALL.LIMIT_INFO.NOTE;
              }
              MessageBox.alert(msg);
            }
          } else {
            Indicator.close();
            MessageBox.alert(root.RETURN_MSG);
          }
        },
        (vue, ex) => {
          console.log(ex);
          Indicator.close();
          Toast({ message: '服务器异常，号码校验失败', position: 'bottom' });
        }
      );
      Indicator.open();
      sendJsonPostRequest(this, reqParams);
    },
    submit: function() {
      let self = this;
      if (!this.feeIndex) {
        return;
      }
      if (!Constants.cmccMobileReg.test(this.phone)) {
        Toast({ message: '请输入正确的四川移动手机号', position: 'bottom' });
        return;
      }
      if (!/\d{6}/.test(this.sms)) {
        Toast({ message: '请输入正确的6位数字验证码', position: 'bottom' });
        return;
      }
      if (!this.selectedFee.value) {
        Toast({ message: '资费错误，请联系管理员', position: 'bottom' });
        return;
      }
      if (!this.ifAgree) {
        this.$createToast({
          time: 1200,
          txt: '请阅读并同意《业务办理协议》',
          type: 'warn'
        }).show()
        return
      }
      MessageBox.confirm('确认是否办理？').then(action => {
        self.clickComfirm();
      });
    },
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
          let shareUrl = `${window.location.origin + baseUrl}/common/redirect?info=path=instockfeeslistenid=${vue.$route.query.id}listenpartnerId=${vue.$route.query.partnerId}listenfeeIndex=${vue.$route.query.feeIndex}listenhandlePhone=${vue.$route.query.handlePhone}listennetAge=${vue.$route.query.netAge}`;
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
    async clickComfirm() {
      let self = this;
      for (let i = 0; i < self.flowList.length; i++) {
        if (self.flowList[i].packageCode === self.selectedFee.value) {
          self.businessId = self.flowList[i].id
        }
      }
      // let params = {
      //   'TARIFF_INFO': {
      //     'TYPE': 'BUSINESS_MODE',
      //     'CODE': this.selectedFee.value,
      //     'NAME': this.selectedFee.name,
      //     'ACTIVE_CODE': this.selectedFee.value,
      //     'FLAG_CODE': '1'
      //   },
      //   'SERVICE_INFO': {
      //     'PHONE_NO': '' + this.phone
      //   },
      //   'VERIFY_INFO': {
      //     'TYPE': '1',
      //     'CODE': '' + this.sms
      //   },
      //   'XY_PARTNER_ID': this.partnerId,
      //   'BUSINESS_ID': getParamValue('businessId')
      // };
      let url = `${baseUrl}/business/directional/submit`;
      let params = {
        'TARIFF_INFO': {
          'TYPE': 'BUSINESS_MODE',
          'CODE': this.selectedFee.value,
          'NAME': this.selectedFee.name,
          'ACTIVE_CODE': this.selectedFee.value,
          'FLAG_CODE': '1'
        },
        'SERVICE_INFO': {
          'PHONE_NO': '' + this.phone
        },
        'SALE_TYPE': '1',
        'EMP_INFO': {
          'EMP_CODE': 'ob0086',
          'PHONE_NO': '' + this.phone // !这里暂时改成 用户的手机号 路由
        },
        'VERIFY_INFO': {
          'TYPE': '1',
          'CODE': '' + this.sms
        },
        'MEMBER_USER_NAME': '13880451171',
        'BUSINESS_ID': this.businessId,
        'PARTNER_ID': (this.partnerId || this.partnerId === 0) ? ('' + this.partnerId) : '-1'
      };
      // var url = baseUrl + '/school/business/submit';
      var reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          Indicator.close();
          if (json.ROOT && json.ROOT.RETURN_CODE === 0) {
            MessageBox.alert('办理成功');
            self.sms = self.phone = '';
          } else {
            MessageBox.alert('办理失败:' + json.ROOT ? (json.ROOT.DETAIL_MSG || json.ROOT.RETURN_MSG || '失败') : '失败');
          }
        },
        (vue, ex) => {
          console.log(ex);
          Indicator.close();
          Toast({ message: '服务器异常，请稍后再试', position: 'bottom' });
        }
      );
      Indicator.open();
      sendJsonPostRequest(this, reqParams);
    }
  }
};
</script>
<style lang="less">
  button {
    cursor: pointer;
  }
  .in-stock {
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

    .input-group-wrap {
      /*background: #EE3139;*/
      /*background: #2D9CF7;*/
      /*background: #060F25;*/
      position: relative;
      .act-banner {
        width: 100%;
      }
      .input-group {
        /*background: #EE3139;*/
        padding: 6% 6% 6% 6%;
        position: relative;
        .busi-name {
          font-size: 14px;
          color: #333;
          padding-bottom: 14px;
        }
        .input-box {
          padding-bottom: 10px;
          height: 60px;
          position: relative;
          &.phone-input input {
            height: 100%;
            /* border: 1px solid #EE3139; */
            /*border: 1px solid #2D9CF7;*/
            /*border: 1px solid #fff;*/
            border-radius: 6px;
            width: 100%;
          }
          .tip-wrap {
            display: none;
            padding: 0 1px;
            position: absolute;
            width: 100%;
            top: -44px;
            left: 0;
            z-index: 1000;
            &.tip-show {
              display: block;
            }
            .last-input-no {
              padding: 0 10px;
              font-size: 20px;
              background: rgba(255, 255, 255, 0.9);
              box-shadow: 0 0px 5px 0 #777;
              height: 46px;
              line-height: 46px;
              /*border: 1px solid #D8D8D8;*/
              border-radius: 4px;
              .tip-words {
                position: absolute;
                left: 150px;
                font-size: 14px;
                color: #AAAAAA;
              }
            }
          }
          .sms-input, .sms-btn {
            font-size: 14px;
            height: 100%;
            float: left;
            position: relative;
          }
          .sms-input {
            width: 60%;
            input {
              width: 100%;
              height: 100%;
              /*border: 1px solid #EE3139;*/
              /*border: 1px solid #2D9CF7;*/
              /*border: 1px solid #fff;*/
              border-radius: 6px;
            }
          }
          .sms-btn {
            width: 35%;
            margin-left: 5%;
            color: #fff;
            line-height: 50px;
            text-align: center;
            background: #3D8CF7;
            /*background: #FCE13F;*/
            /*background: #F6A846;*/
            border-radius: 6px;
            cursor: pointer;
          }
        }
        .btn-submit {
          font-size: 14px;
          width: 100%;
          height: 44px;
          line-height: 44px;
          text-align: center;
          background: #3D8CF7;
          /*background: #FCE13F;*/
          /*background: #F6A846;*/
          border-radius: 6px;
          color: #fff;
          font-weight: 400;
          cursor: pointer;
        }
        .btn-disabled {
          background: #F4F4F4;
          color: #CCCCCC;
        }
      }
      img {
        width: 100%;
        margin-bottom: -2%;
      }
    }
    .busi-title-description {
      margin: 3% 0 10px 0;
      color: #3B98ED;
      font-size: .95rem;
      padding-left: 4%;
      font-family: PingFangSC-Regular;
      /*background: #060F25;*/
      /*color: #FFF;*/
    }
    .busi-content-description {
      min-height: 50px;
      width: 90%;
      margin: 10px auto;
      border: 1px solid #8BC4E9;
      padding: .5rem 1rem;
      /*background-color:#D9EDF6;*/
      background: #EFFAFF;
      position: relative;
      border-radius: 3px;
      color:#555555;
      font-family: PingFangSC-Regular;
      font-size: 1rem;
      word-wrap:break-word;
    }
    .bd-split {
      margin-top: 1rem;
      height: 4px;
      background: #EEEFF3;
      /*background: #060F25;*/
    }
    .busi-title {
      margin: 20px 0 0px 0;
      color: #555555;
      /*color: #fff;*/
      font-size: 14px;
      padding-left: 4%;
      font-family: PingFangSC-Regular;
    }
    .busi-content {
      min-height: 100px;
      width: 100%;
      margin: 0 auto;
      padding: .5rem 1rem .5rem 5%;
      position: relative;
      font-size: .8rem;
      color: #555555;
      font-family: PingFangSC-Regular;
      word-wrap:break-word;
      font-size: 14px!important;
      line-height: 1.5!important;
      font-weight: normal!important;
      word-break: break-all!important;
      * {
        font-size: 14px!important;
        line-height: 1.5!important;
        font-weight: normal!important;
        word-break: break-all!important;
      }
      p, table, img {
        max-width: 100%;
      }
    }
  .select-box {
    display: flex;
    justify-content: space-between;
    padding-bottom: 16px;
  }
  .select-box .select-item {
    font-size: 14px;
    text-align: center;
    color: #333333;
    letter-spacing: 0;
    border-radius: 4px;
    line-height: 40px;
    width: 48%;
    height: 40px;
    border: 1px solid #979797;
  }
  .select-box .btn-status {
    background-color: #3D8CF7;
    color: #ffffff;
    border: 1px solid #3D8CF7;
  }
  }
</style>
