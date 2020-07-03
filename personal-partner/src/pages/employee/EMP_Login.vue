<template>
  <div class="employee-login" v-if="showLogin">
    <img class="banner" src="static/img/employee/banner.png" />
    <div class="login-wrap">
      <div class="input-line">
        <div class="label-icon"><img src="static/img/employee/phone.png" /></div>
        <div class="text-input">
          <input type="tel" placeholder="请输入手机号" maxlength="11" v-model="phone" />
        </div>
      </div>
      <div class="input-line">
        <div class="label-icon"><img src="static/img/employee/sms.png" /></div>
        <div class="text-input">
          <input type="tel" placeholder="请输入验证码" maxlength="6" v-model="sms" />
          <div class="ext-btn" @click="getSms">{{smsText}}</div>
        </div>
      </div>
      <div class="submit-btn" @click="clickLogin">登录</div>
    </div>
  </div>
</template>

<script>
import { Constants, baseUrl, getRequestParams, sendJsonPostRequest, encryptByDES, YEK_SED, saveSession, saveStorage, getStorage, pageRouter, getJsApiConfig } from 'src/assets/utils';
import { Indicator, MessageBox, Toast } from 'mint-ui';

export default {
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  data() {
    return {
      showLogin: false,
      phone: '',
      sms: '',
      smsText: '获取验证码',
      isSmsHolding: false
    };
  },
  watch: {
    isSmsHolding(val) {
      if (val) {
        let smsCnt = 60;
        this.smsText = smsCnt + 's';
        let timer = setInterval(() => {
          smsCnt--;
          this.smsText = smsCnt + 's';
          if (smsCnt <= 0) {
            clearInterval(timer);
            this.isSmsHolding = false;
          }
        }, 1000);
      } else {
        this.smsText = '获取验证码';
      }
    }
  },
  created() {
    document.title = '登录';
    let that = this;
    // 设置微信的页面分享参数（仅作为过渡，不起作用）
    let shareObj = {
      title: '登录',
      desc: ` `,
      link: `${window.location.origin + baseUrl}/common/new/redirect?to=emp`,
      imgUrl: `${window.location.origin + baseUrl}/partner/static/img/employee/cmcc.png`,
      hideList: [
        'menuItem:share:qq',
        'menuItem:share:weiboApp',
        // 'menuItem:share:appMessage',
        // 'menuItem:share:timeline',
        // 'menuItem:favorite',
        'menuItem:share:facebook',
        'menuItem:share:QZone',
        'menuItem:copyUrl',
        'menuItem:openWithSafari',
        'menuItem:openWithQQBrowser',
        'menuItem:share:email'
      ],
      excuteFn: () => {
        that.autoLogin();
      },
      success: () => {
      },
      cancel: () => {
      }
    };
    getJsApiConfig(shareObj);
  },
  methods: {
    checkLastLogin () {
      let token = getStorage('partnerticket');
      let partner = getStorage('ptDetailInfo');
      if (token && partner) {
        this.showLogin = false;
        saveStorage('partnerticket', token); // 保存token
        saveStorage('ptDetailInfo', partner); // 保存合伙人信息

        saveSession('partnerticket', token); // 保存token
        saveSession('ptDetailInfo', partner); // 保存合伙人信息

        let routeQry = { p: partner.phone, ptid: partner.id };
        console.log(routeQry);
        this.gotoIndex(this, { path: '/emp/index', query: routeQry }, 'replace');
      } else {
        Indicator.close();
        this.showLogin = true;
      }
    },
    autoLogin () {
      let e = this.$route.query.e;
      if (e) {
        this.showLogin = false;
        let params = {
          e: e
        };
        this.login(params);
      } else {
        this.checkLastLogin();
      }
    },
    clickLogin () {
      let params = {
        'phone': this.phone,
        'verifyCode': this.sms
      };
      if (!Constants.mobileReg.test(this.phone)) {
        Toast('请输入正确的手机号');
        return;
      }
      if (!/\d{6}/.test(this.sms)) {
        Toast('请输入6位数字验证码');
        return;
      }
      this.login(params);
    },
    getSms () {
      if (!Constants.mobileReg.test(this.phone)) {
        Toast({ message: '请输入正确的手机号码！', duration: 1200 });
        return;
      }
      if (this.isSmsHolding) {
        Toast({ message: `请等待${this.smsText}`, duration: 1200 });
        return;
      }
      let url = `${baseUrl}/verifyCode/send`; // 获取短信验证码
      let params = {
        'phone': encryptByDES.CBC('' + this.phone, YEK_SED)
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          Indicator.close();
          if (json.status === 0) {
            vue.sms = '';
            vue.isSmsHolding = true;
            MessageBox.alert(json.msg || '短信验证码发送成功');
          } else {
            MessageBox.alert(json.msg || '短信验证码发送失败，请重试');
          }
        },
        (vue, ex) => {
          Indicator.close();
          Toast('网络异常，短信验证码发送失败');
        }
      );
      Indicator.open();
      sendJsonPostRequest(this, reqParams);
    },
    login (params) {
      let url = `${baseUrl}/register/employee/login`;
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          console.log(json);
          Indicator.close();
          if (json && json.status === 0) {
            saveStorage('partnerticket', json.data.token); // 保存用户的token
            saveStorage('ptPublicOpenId', json.data.partner.openId); // 保存用户的openId(此openId可以从下面一行的ptDetailInfo获取)
            saveStorage('ptDetailInfo', json.data.partner); // 保存服务器返回的合伙人信息

            saveSession('partnerticket', json.data.token); // 保存用户的token
            saveSession('ptPublicOpenId', json.data.partner.openId); // 保存用户的openId(此openId可以从下面一行的ptDetailInfo获取)
            saveSession('ptDetailInfo', json.data.partner); // 保存服务器返回的合伙人信息
            let routeQry = { p: json.data.partner.phone, ptid: json.data.partner.id };
            vue.gotoIndex(vue, { path: '/emp/index', query: routeQry }, 'replace');
          } else {
            MessageBox.alert(json.msg || '登录失败，请重试');
            vue.showLogin = true;
          }
        },
        (vue, ex) => {
          Indicator.close();
          console.log(ex);
          MessageBox.alert('网络错误！' + ex);
          vue.showLogin = true;
        }
      );
      Indicator.open('请稍后');
      sendJsonPostRequest(this, reqParams);
    },
    gotoIndex (that, routeObj, routeType) {
      pageRouter(that, routeObj, routeType);
      // let url = baseUrl + '/companion/version?phone=' + routeObj.query.p;
      // let reqParams = getRequestParams(
      //   url,
      //   '',
      //   (vue, json) => {
      //     Indicator.close();
      //     if (json && json.status === 0) {
      //       let ptreddots = getStorage('ptreddots_' + routeObj.query.p, true);
      //       if (ptreddots) {
      //         if (json.data.introduce && ptreddots.introduce !== json.data.introduce) {
      //           saveStorage('pt_shop_introduce_red_dot_' + routeObj.query.p, true);
      //         }
      //         if (json.data.rule && ptreddots.rule !== json.data.rule) {
      //           saveStorage('pt_shop_rule_red_dot_' + routeObj.query.p, true);
      //         }
      //         if (json.data.salary && ptreddots.salary !== json.data.salary) {
      //           saveStorage('pt_order_1_red_dot_' + routeObj.query.p, true);
      //           saveStorage('pt_trade_red_dot_' + routeObj.query.p, true);
      //         }
      //       } else {
      //         saveStorage('pt_shop_introduce_red_dot_' + routeObj.query.p, true);
      //         saveStorage('pt_shop_rule_red_dot_' + routeObj.query.p, true);
      //         // saveStorage('pt_order_1_red_dot', true);
      //         // saveStorage('pt_trade_red_dot', true);
      //       }
      //       saveStorage('ptreddots_' + routeObj.query.p, json.data);
      //     }
      //     pageRouter(that, routeObj, routeType);
      //   },
      //   (vue, ex) => {
      //     Indicator.close();
      //     console.log(ex);
      //     pageRouter(that, routeObj, routeType);
      //   }
      // );
      // sendGetRequest(this, reqParams);
    }
  }
};
</script>

<style lang="less">
  .employee-login {
    position: relative;
    width: 100%;
    min-height: 100%;
    max-width: 550px;
    min-width: 270px;
    margin: 0 auto;
    background: #fff;
    .banner {
      display: block;
      width: 100%;
    }
    .login-wrap {
      background: #FFFFFF;
      box-shadow: 0 2px 5px 0 rgba(0,0,0,0.20);
      border-radius: 4px;
      width: 80%;
      height: 200px;
      margin: -20px auto 0;
      position: relative;
      padding: 40px;
      .input-line {
        position: relative;
        display: flex;
        height: 26px;
        margin-bottom: 40px;
        .label-icon {
          position: relative;
          flex: 0 0 auto;
          width: 24px;
          img {
            position: absolute;
            width: 100%;
            top: 50%;
            transform: translateY(-50%);
            right: 0;
            margin: 0 auto;
          }
        }
        .text-input {
          flex: 1;
          position: relative;
          margin-left: 10px;
          input {
            width: 100%;
            height: 100%;
            border: 0;
            border-bottom: 1px solid #ddd;
            padding-left: 4px;
          }
          ::placeholder {
            color: #999;
          }
          .ext-btn {
            position: absolute;
            right: 0;
            bottom: 10px;
            width: 85px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            background: #3D8CF7;
            color: #fff;
            font-size: 12px;
            border-radius: 100px;
          }
        }
      }
      .submit-btn {
        position: absolute;
        width: 70%;
        height: 45px;
        line-height: 45px;
        background: #3D8CF7;
        color: #fff;
        font-size: 14px;
        text-align: center;
        border-radius: 100px;
        margin: 0 auto;
        left: 0;
        right: 0;
        bottom: -22px;
      }
    }
  }
</style>
