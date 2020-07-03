<template>
  <div class="giveback flex-vc">
    <div>
      <div class="giveback-header">
        <img src="static/img/giveback/header.png" />
      </div>
      <div class="giveback-list flex-row">
        <div class="giveback-list-item" :class="{'isSelected': selectedGiveback === 'GIVEBACK_20'}" @click="getGivebackRule('GIVEBACK_20')">
          <img src="static/img/giveback/group_20.png?v=20181016" />
        </div>
        <div class="giveback-list-item" :class="{'isSelected': selectedGiveback === 'GIVEBACK_50'}" @click="getGivebackRule('GIVEBACK_50')">
          <img src="static/img/giveback/group_50.png?v=20181016" />
        </div>
      </div>
      <div class="giveback-verifycode">
        <div class="giveback-verifycode-row">
          <input type="tel" v-model="phone"  maxlength="11" placeholder="请输入手机号码"/>
        </div>

        <div class="giveback-verifycode-row flex-row">
          <input type="text" placeholder="请输入验证码" v-model="sms" maxlength="6"/>
          <div class="giveback-verifycode-btn" :class="{'btn-disabled': isSending}" @click="getSms">{{smsTip}}</div>
          <!-- <div class="sms-btn" :class="{'btn-disabled': isSending}" @click="getSms"></div> -->
        </div>
      </div>
      <div class="giveback-btn-section">
        <div class="giveback-btn" @click="hanlde">现在办理</div>
      </div>
    </div>
    <div class="giveback-rule flex-vc">
      <div class="giveback-rule-label">
        <img src="static/img/giveback/giveback_rule.png" />
      </div>
      <div class="giveback-rule-content">
        <div v-html="currentSelected.detail"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { Constants, baseUrl, getRequestParams, sendGetRequest, sendJsonPostRequest, getJsApiConfig, encryptByDES, YEK_SED, getSession } from 'src/assets/utils.js';
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
      ruleList: {},
      phone: '',
      sms: '',
      smsTip: '点击获取验证码',
      isSending: false,
      selectedGiveback: '',
      currentSelected: {},
      givebackMapping: {
        GIVEBACK_20: 'AZ421230',
        GIVEBACK_50: 'AZ421231'
      },
      partnerId: ''
    };
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
        this.smsTip = '点击获取验证码';
      }
    }
  },
  created() {
    if (this.$route.query.partnerId || this.$route.query.partnerId === 0) {
      this.partnerId = this.$route.query.partnerId;
    } else {
      let serverUserInfo = getSession('ptDetailInfo', true);
      if (serverUserInfo) {
        this.partnerId = serverUserInfo.id;
      }
    }
    let shareObj = {
      title: '话费存一得二',
      desc: '话费存一得二，优惠没文案，简单粗暴免费送',
      link: `${window.location.origin + baseUrl}/common/redirect?info=path=givebacklistenpartnerId=${this.partnerId}`,
      imgUrl: `${window.location.origin + baseUrl}/partner/static/img/giveback/share_logo.png`,
      timelineTitle: '话费存一得二，优惠没文案，简单粗暴免费送',
      showList: [
        'menuItem:share:qq',
        'menuItem:share:weiboApp',
        'menuItem:share:appMessage',
        'menuItem:share:timeline',
        'menuItem:favorite',
        'menuItem:share:QZone'
      ]
    };
    getJsApiConfig(shareObj);
    document.title = '"合伙人"专享存送';

    Indicator.close();
    this.getGivebackRule('GIVEBACK_20');
  },
  methods: {
    getGivebackRule: function(code) {
      this.selectedGiveback = code;
      if (this.ruleList[code]) {
        this.currentSelected = this.ruleList[code];
        return;
      }
      let url = baseUrl + '/richText/get';
      let params = Qs.stringify({
        code: code
      });
      url = url + '?' + params;
      let rtnObj = {};
      let reqParams = getRequestParams(url, '', (vue, json) => {
        Indicator.close();
        if (json && '' + json.status === '0' && '' + json.data.enabled === '0') {
          rtnObj.name = json.data.name;
          rtnObj.code = json.data.remark;
          rtnObj.detail = json.data.detail;
          vue.currentSelected = rtnObj;
          vue.ruleList[code] = rtnObj;
        } else {
          vue.ruleList[code] = '';
        }
      }, (vue, ex) => {
        Indicator.close();
        vue.ruleList[code] = '';
      }, '');
      Indicator.open();
      sendGetRequest(this, reqParams);
    },
    getSms: function() {
      if (!Constants.cmccMobileReg.test(this.phone)) {
        Toast({ message: '请输入正确的移动手机号码！', duration: 1200 });
        return;
      }
      if (this.isSending) {
        Toast({ message: `请等待${this.smsTip}`, duration: 1200 });
        return;
      }
      let url = `${baseUrl}/verifyCode/send`; // 获取短信验证码
      let params = {
        'phone': encryptByDES.CBC('' + this.phone, YEK_SED)
      };
      let reqParams = getRequestParams(url, params, (vue, json) => {
        Indicator.close();
        if (json.status === 0) {
          Toast(json.msg || '短信验证码发送成功');
        } else {
          Toast(json.msg || '短信验证码发送失败，请重试');
        }
      }, (vue, ex) => {
        Indicator.close();
        Toast('网络异常，短信验证码发送失败');
      }, '');
      Indicator.open();
      this.isSending = true;
      sendJsonPostRequest(this, reqParams);
    },
    hanlde: function() {
      if (!this.currentSelected || (this.currentSelected && !this.currentSelected.code)) {
        Toast({ message: '未获取到资费代码，请刷新页面重试', duration: 1200 });
        return;
      }
      if (!Constants.cmccMobileReg.test(this.phone)) {
        Toast({ message: '请输入正确的移动手机号码！', duration: 1200 });
        return;
      }
      if (!/\d{6}/.test(this.sms)) {
        Toast({ message: '请输入正确的验证码！', duration: 1200 });
        return;
      }
      let url = `${baseUrl}/business/submit/cs`;
      let params = {
        'TARIFF_INFO': {
          'TYPE': 'BUSINESS_MODE',
          'CODE': this.currentSelected.code,
          'NAME': this.currentSelected.name,
          'ACTIVE_CODE': this.currentSelected.code,
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
        'PARTNER_ID': (this.partnerId || this.partnerId === 0) ? ('' + this.partnerId) : '-1'
      };
      let reqParams = getRequestParams(url, params, (vue, json) => {
        Indicator.close();
        console.log(json);
        if (json && ('' + json.ROOT.RETURN_CODE === '0')) {
          MessageBox.alert('办理成功！').then(() => {
            // pageRouter(vue, {path: '/', query: {p: this.$route.query.p, ptid: this.$route.query.ptid}});
            vue.sms = vue.phone = '';
          });
        } else {
          Toast(json.ROOT ? (json.ROOT.DETAIL_MSG || json.ROOT.RETURN_MSG || '失败') : '失败');
        }
      }, (vue, ex) => {
        Indicator.close();
        Toast('异常: ' + ex);
      }, '');
      Indicator.open();
      sendJsonPostRequest(this, reqParams);
    }
  }
};
</script>
<style lang="less" scoped>
/*   body {
    background: #DCEEFC;
  } */
  .flex-vc {
    display: -webkit-box;
    display: -webkit-flex;
    ;
    display: flex;
    display: -ms-flex;
    flex-direction: column;
    /* justify-content: space-between; */
  }
  .flex-row {
    display: -webkit-box;
    display: -webkit-flex;
    ;
    display: flex;
    display: -ms-flex;
  }
  .giveback {
    background: #DCEEFC;
    position: absolute;
    /*padding-bottom: 50px;*/
    max-width: 550px;
    min-width: 270px;
    margin: 0 auto;
    left: 0;
    right: 0;
    min-height: 100%;
  }
  .giveback-header {
    width: 100%;
    /*height: 125px;*/
  }
  .giveback-header img{
    width: 100%;
    /*height: 100%;*/
    pointer-events: none;
  }
  .giveback-rule {
    /* height: 235px; */
    flex: 1 1 150px;
    margin: 0 18px 20px 18px;
  }

  .giveback-rule-label {
    /* margin: 15px 0 10px 15px; */
    text-align: center;
    color: #3B98ED;
    font-size: 15px;
    margin-bottom: 10px;
    height: 25px;
  }
  .giveback-rule-label img {
    height: 100%;
  }
  .giveback-rule-content {
    border: 1px solid #8BC4E9;
    border-radius: 4px;
    /* height: 200px; */
    flex: 1 1 110px;
    background-color: #fff;
    padding: 15px 10px;
    overflow-y: auto;
    word-break: break-all;
    overflow-x: hidden;
  }
  .giveback-list {
    margin: 0 30px 15px 30px;
  }
  .giveback-list-item {
    flex: 1;
    margin-right: 20px;
    height: 50px;
    border: 1px solid rgba(0, 0, 0, 0);
    overflow: hidden;
  }
  .giveback-list-item:last-child {
    margin-right: 0px;
  }
  .giveback-list-item img{
    pointer-events: none;
    width: 100%;
    height: 100%;
    position: relative;
    /* top: 2px; */
    /*border-radius: 12px;*/
  }
  .giveback-list-item.isSelected {
    border: 1px solid #2D9CF7;
    border-radius: 4px;
  }
  .giveback-verifycode .giveback-verifycode-row {
    margin: 0 30px 15px 30px;
    height: 40px;
  }
  .giveback-verifycode-row input {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 4px;
    line-height: 1.5;
    font-size: 15px;
    padding-left: 15px;
    background-color: #fff;
    color: #333;
  }
  .giveback-verifycode-btn {
    width: 100px;
    flex: 1 0 100px;
    height: 40px;
    border-radius: 4px;
    font-size: 12px;
    background-color: #2D9CF7;
    color: #fff;
    line-height: 40px;
    text-align: center;
    margin-left: 15px;
  }
  .giveback-verifycode-btn.btn-disabled {
    background: #ccc;
  }
  .giveback-btn-section {
    padding-top: 5px;
  }
  .giveback-btn-section .giveback-btn {
    margin: 0 30px 15px 30px;
    background-color: #2D9CF7;
    color: #fff;
    line-height: 40px;
    height: 40px;
    text-align: center;
    border-radius: 4px;
    font-size: 16px;
  }

</style>
