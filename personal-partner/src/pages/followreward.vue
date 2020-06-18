<template>
  <div class="follow-reward" v-if="pageReady">
    <img class="bg-img" src="static/img/followreward/background.png" />
    <img class="head-img" src="static/img/followreward/head.png?v=20181214" />
    <div class="input-panel">
      <div class="phone-box">
        <input type="tel" v-model="phone" placeholder="请输入四川移动手机号" maxlength="11" :disabled="signedUp" />
      </div>
      <div class="error-phone-msg" v-if="showErrorPhoneMsg">很抱歉，该活动仅限四川移动用户参与。</div>
      <div class="sms-box">
        <input class="sms-input" type="text" v-model="sms" placeholder="请输入验证码" maxlength="6" />
        <div class="sms-btn" :class="{'btn-disabled': isSending}" @click.self="getSms">{{smsTip}}</div>
      </div>
      <div class="agree-line">
        <input id="agreeCheck" type="checkbox" v-model="ifAgree" /><label for="agreeCheck"></label><span class="check-box-text"><span @click.self="ifAgree = !ifAgree">我已阅读并同意</span><span class="to-agree" @click="getAgree">四川移动合伙人协议</span></span>
      </div>
      <div class="submit-btn" @click.self="submit">{{submitText}}</div>
      <div class="rule-btn">
        <div class="rule-btn-text" @click="showRule = true">
          活动规则
          <div class="circle-left"></div>
          <div class="circle-right"></div>
        </div>
      </div>
      <img class="bottom-img" src="static/img/followreward/pig.png" />
    </div>
    <div class="agree-popup" v-if="showAgree">
      <div class="agree-penel">
        <div class="agree-header"></div>
        <div class="agree-body">
          <div class="agree-text" v-html="agreement"></div>
        </div>
        <div class="agree-footer">
          <div class="agree-btn agree-btn-cancel" @click="clickDisagree">不同意</div>
          <div class="agree-btn agree-btn-confirm" @click="clickAgree">同意</div>
        </div>
      </div>
    </div>
    <div class="rule-popup" v-if="showRule" @click.self="showRule = false">
      <div class="rule-panel">
        <div class="rule-header">
        </div>
        <div class="rule-body" v-html="actInfo.detail"></div>
        <div class="rule-footer"></div>
        <div class="btn-close" @click="showRule = false">
          <img src="static/img/btn_close.png" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { getJsApiConfig, Constants, baseUrl, sendGetRequest, getRequestParams, getSession, sourceType, closeIllegalPage, closePage, encryptByDES, YEK_SED, sendJsonPostRequest, getStorage, saveStorage, removeSession, saveSession, pageRouter, isWechat } from 'src/assets/utils.js';
  import { Indicator, MessageBox, Toast } from 'mint-ui';

  export default {
    components: {
      Indicator,
      MessageBox,
      Toast
    },
    data() {
      return {
        phone: '',
        sms: '',
        ifAgree: false,
        agreement: '',
        showAgree: false,
        submitText: '注册并领取流量',
        signedUp: false,
        showErrorPhoneMsg: false,
        isSending: false,
        smsTip: '获取验证码',
        userInfo: {},
        actInfo: {},
        showRule: false,
        isZW: false,
        pageReady: false
      };
    },
    watch: {
      phone(val) {
        this.showErrorPhoneMsg = !Constants.cmccMobileReg.test(val) && ('' + val).length === 11;
      },
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
          this.smsTip = '获取验证码';
        }
      }
    },
    created() {
      document.title = '移动合伙人关注有礼';
      Indicator.close();
      let shareObj = {
        hideList: [
          'menuItem:share:appMessage',
          'menuItem:share:timeline',
          'menuItem:share:qq',
          'menuItem:share:weiboApp',
          'menuItem:favorite',
          'menuItem:share:facebook',
          'menuItem:share:QZone',
          'menuItem:editTag',
          'menuItem:delete',
          'menuItem:copyUrl',
          'menuItem:originPage',
          'menuItem:readMode',
          'menuItem:openWithQQBrowser',
          'menuItem:openWithSafari',
          'menuItem:share:email'
        ]
      };
      getJsApiConfig(shareObj);

      // let deadLineTime = new Date(2018, 11, 31, 23, 59, 59, 0).getTime();
      // let currentTime = new Date().getTime();
      // let expired = currentTime >= deadLineTime;
      this.getActInfo();
    },
    mounted() {
    },
    methods: {
      getActInfo: function() {
        let url = `${baseUrl}/richText/get?code=ACT_FOLLOW_REWARD`;
        let reqParams = getRequestParams(
          url,
          '',
          (vue, json) => {
            if (json.status === 0 && json.data) {
              if ('' + json.data.enabled === '0') {
                vue.actInfo = json.data;
                console.log(vue.actInfo);
                vue.pageReady = true;
                vue.getIfBinded();
              } else {
                vue.pageReady = false;
                MessageBox.alert('抱歉，活动已结束').then(() => {
                  closePage();
                }).catch(e => {
                  closePage();
                });
              }
            } else {
            }
          },
          (vue, ex) => {
          }
        );
        sendGetRequest(this, reqParams);
      },
      getIfBinded: function() {
        let srcInfo = getSession('ptSourceInfo', true);
        console.log(srcInfo);
        if (srcInfo) {
          this.userInfo = srcInfo.userInfo;// let sourceId = this.srcInfo.openid;
          if (sourceType === 'zhuangwei' || (sourceType === 'dzg' && !isWechat() && this.userInfo.realName)) {
            this.isZW = true;
          }
          let url = `${baseUrl}/register/partner/${this.userInfo.openid}?sourceType=${sourceType}`; // 通过openid获取用户信息，是否绑定了手机号
          console.log(url);
          let reqParams = getRequestParams(
            url,
            '',
            (vue, json) => {
              Indicator.close();
              console.log(json);
              /*
              * 查询用户是否绑定手机号的结果如下
              */
              Indicator.close();
              if (json.status === 0) { // status=0 表示已经绑定了手机号，直接跳转到首页并带上手机号
                if ('' + json.data.partner.partnerType === '9' && !this.isZW) {
                  window.location.replace(`${window.location.origin + baseUrl}/zwregister/wx/oAuth/userInfo`);
                  return;
                }
                saveSession('partnerticket', json.data.token);
                saveSession('ptPublicOpenId', json.data.partner.openId);
                saveSession('ptDetailInfo', json.data.partner);
                vue.phone = json.data.partner.phone;
                vue.submitText = '领取流量';
                vue.signedUp = true;
              } else if (json.status === 1) { // status=1 表示还未绑定手机号，无提示显示绑定页面
                if (json.data && json.data.partner && json.data.partner.phone) {
                  vue.phone = json.data.partner.phone;
                  vue.submitText = '登录并领取流量';
                  vue.signedUp = true;
                }
              } else if (json.status === 2) { // status=2 表示账号已锁定，不让其进入首页，待用户操作后关闭页面
                MessageBox.alert(json.msg || '账号已被锁定，请联系管理员解锁').then(() => {
                  closePage();
                }).catch(e => {
                  closePage();
                });
              } else if (json.status === 3) { // status=3 表示账号已经注销，需要重新绑定，提示并显示绑定页面
              } else { // 其他情况，待用户操作后，直接关闭页面
                MessageBox.alert('发生异常，请退出后重新进入页面').then(() => {
                  closePage();
                }).catch(e => {
                  closePage();
                });
              }
            },
            (vue, ex) => {
              Indicator.close();
              Toast('网络异常');
            }
          );
          Indicator.open();
          sendGetRequest(this, reqParams);
        } else {
          closeIllegalPage(this);
        }
      },
      getSms: function() {
        if (!this.pageReady) {
          MessageBox.alert('抱歉，活动已结束').then(() => {
            closePage();
          }).catch(e => {
            closePage();
          });
          return;
        }
        if (!Constants.cmccMobileReg.test(this.phone)) {
          if (('' + this.phone).length === 11) {
            this.showErrorPhoneMsg = true;
          }
          Toast({message: '请输入正确的移动手机号', duration: 1200});
          return;
        }
        if (this.isSending) {
          Toast({message: `请等待${this.smsTip}`, duration: 1200});
          return;
        }
        let url = `${baseUrl}/verifyCode/sendCmcc`;
        let params = {
          'phone': encryptByDES.CBC('' + this.phone, YEK_SED)
        };
        let reqParams = getRequestParams(url, params, (vue, json) => {
          Indicator.close();
          if (json.status === 0) {
            vue.isSending = true;
            Toast(json.msg || '短信验证码发送成功');
          } else if (json.status === 1) {
            vue.showErrorPhoneMsg = true;
          } else {
            Toast(json.msg || '短信验证码发送失败，请重试');
          }
        }, (vue, ex) => {
          Indicator.close();
          Toast('网络异常，短信验证码发送失败');
        }, '');
        Indicator.open();
        this.showErrorPhoneMsg = false;
        sendJsonPostRequest(this, reqParams);
      },
      submit: function() {
        if (!this.pageReady) {
          MessageBox.alert('抱歉，活动已结束').then(() => {
            closePage();
          }).catch(e => {
            closePage();
          });
          return;
        }
        if (!this.actInfo.remark || !this.actInfo.name) {
          MessageBox.alert('未获取到活动信息，请联系管理员');
          return;
        }
        if (!Constants.cmccMobileReg.test(this.phone)) {
          if (('' + this.phone).length === 11) {
            this.showErrorPhoneMsg = true;
          }
          Toast({message: '请输入正确的移动手机号', duration: 1200});
          return;
        }
        if (!(/\d{6}/.test(this.sms))) {
          Toast({message: '请输入6位数字验证码！', duration: 1200});
          return;
        }
        if (!this.ifAgree) {
          Toast({message: '请阅读并同意《四川移动合伙人协议》', duration: 1200});
          return;
        }
        if (this.isSubmitting) {
          Toast({message: `请勿重复提交！`, duration: 1200});
          return;
        }
        let url = `${baseUrl}/register/partner/bindingTariff`;
        let params = {
          'regisiter': {
            'phone': '' + this.phone,
            'openId': this.userInfo.openid,
            'sourceType': sourceType,
            'verifyCode': '' + this.sms
          },
          'nickName': this.userInfo.nickname,
          'headImg': this.userInfo.headimgurl,
          'tariff': {
            'SALE_TYPE': '1',
            'EMP_INFO': {
              'EMP_CODE': 'ob0086',
              'PHONE_NO': '' + this.phone
            },
            'VERIFY_INFO': {
              'CODE': '' + this.sms,
              'TYPE': '1'
            },
            'SERVICE_INFO': {
              'PHONE_NO': '' + this.phone
            },
            'TARIFF_INFO': {
              'CODE': this.actInfo.remark,
              'ACTIVE_CODE': this.actInfo.remark,
              'FLAG_CODE': '1',
              'TYPE': 'ADD_MODE',
              'NAME': this.actInfo.name
            },
            'MEMBER_USER_NAME': '13880451171',
            'omitBusinessCodeCheck': 'omit',
            'omitSmsCheck': 'omit'
          }
        };
        let reqParams = getRequestParams(
          url,
          params,
          (vue, json) => {
            console.log(json);
            if (json.status === 0) {
              vue.getServerUserInfo('您已成功领取2G流量，赶快分享给好友吧！', '恭喜，领取成功！');
            } else if (json.status === 3) {
              Indicator.close();
              MessageBox.alert(json.msg || '验证码不正确', '抱歉，领取失败！').then(() => {
                vue.sms = '';
              }).catch(e => {
                vue.sms = '';
              });
            } else {
              // MessageBox.alert(json.msg || '领取流量失败！ ');
              vue.getServerUserInfo(json.msg || '领取流量失败！', '抱歉，领取失败！');
            }
          },
          (vue, ex) => {
            Indicator.close();
            Toast('网络异常，请重试');
          }
        );
        Indicator.open('办理中');
        sendJsonPostRequest(this, reqParams);
        console.log(url, params);
      },
      getServerUserInfo: function(message, title) {
        let url = `${baseUrl}/register/partner/${this.userInfo.openid}?sourceType=${sourceType}`; // 通过openid获取用户信息，是否绑定了手机号
        console.log(url);
        let reqParams = getRequestParams(url,
          '',
          (vue, json) => {
            Indicator.close();
            /*
            * 查询用户是否绑定手机号的结果如下
            */
            if (json.status === 0) { // status=0 表示已经绑定了手机号，直接跳转到首页并带上手机号
              if ('' + json.data.partner.partnerType === '9' && !this.isZW) {
                window.location.replace(`${window.location.origin + baseUrl}/zwregister/wx/oAuth/userInfo`);
                return;
              }
              saveSession('partnerticket', json.data.token);
              saveSession('ptPublicOpenId', json.data.partner.openId);
              saveSession('ptDetailInfo', json.data.partner);
              MessageBox.alert(message, title).then(() => {
                Indicator.open();
                let routeQry = {p: json.data.partner.phone, ptid: json.data.partner.id, from: 'followreward'};
                vue.gotoIndex(vue, {path: '/index', query: routeQry}, 'replace');
              });
            } else { // 其他情况，待用户操作后，直接关闭页面
              MessageBox.alert('发生异常，请退出后重新进入页面').then(() => {
                removeSession('partnerticket');
                closePage();
              }).catch(e => {
                removeSession('partnerticket');
                closePage();
              });
            }
          },
          (vue, ex) => {
            Indicator.close();
            MessageBox.alert('发生异常，请退出后重新进入页面').then(() => {
              removeSession('partnerticket');
              closePage();
            }).catch(e => {
              removeSession('partnerticket');
              closePage();
            });
          }
        );
        sendGetRequest(this, reqParams);
      },
      gotoIndex: function(that, routeObj, routeType) {
        let url = baseUrl + '/companion/version?phone=' + routeObj.query.p;
        let reqParams = getRequestParams(
          url,
          '',
          (vue, json) => {
            Indicator.close();
            if (json && json.status === 0) {
              let ptreddots = getStorage('ptreddots_' + routeObj.query.p, true);
              if (ptreddots) {
                if (json.data.introduce && ptreddots.introduce !== json.data.introduce) {
                  saveStorage('pt_shop_introduce_red_dot_' + routeObj.query.p, true);
                }
                if (json.data.rule && ptreddots.rule !== json.data.rule) {
                  saveStorage('pt_shop_rule_red_dot_' + routeObj.query.p, true);
                }
                if (json.data.salary && ptreddots.salary !== json.data.salary) {
                  saveStorage('pt_order_1_red_dot_' + routeObj.query.p, true);
                  saveStorage('pt_trade_red_dot_' + routeObj.query.p, true);
                }
              } else {
                saveStorage('pt_shop_introduce_red_dot_' + routeObj.query.p, true);
                saveStorage('pt_shop_rule_red_dot_' + routeObj.query.p, true);
                // saveStorage('pt_order_1_red_dot', true);
                // saveStorage('pt_trade_red_dot', true);
              }
              saveStorage('ptreddots_' + routeObj.query.p, json.data);
            }
            pageRouter(that, routeObj, routeType);
          },
          (vue, ex) => {
            Indicator.close();
            console.log(ex);
            pageRouter(that, routeObj, routeType);
          }
        );
        sendGetRequest(this, reqParams);
      },
      getAgree: function() {
        if (this.agreement) {
          this.showAgree = true;
          return;
        }
        let url = `${baseUrl}/richText/get?code=PARTNER_AGREEMENT`;
        let reqParams = getRequestParams(url, '', this.getAgreeSuc, this.getAgreeFail);
        Indicator.open();
        sendGetRequest(this, reqParams);
      },
      getAgreeSuc: function(vue, json) {
        Indicator.close();
        console.log(json);
        if (json.status === 0 && json.data && ('' + json.data.enabled === '0')) {
          vue.agreement = json.data.detail;
          vue.showAgree = true;
        } else {
          MessageBox.alert('获取协议失败');
        }
      },
      getAgreeFail: function(vue, ex) {
        Indicator.close();
        console.log(ex);
        MessageBox.alert('获取协议异常，请重试');
      },
      openAgree: function() {
        this.showAgree = true;
      },
      closeAgree: function() {
        this.showAgree = false;
      },
      clickDisagree: function() {
        this.ifAgree = false;
        this.closeAgree();
      },
      clickAgree: function() {
        this.closeAgree();
      }
    }
  };
</script>
<style>
  .follow-reward {
    min-height: 100%;
    width: 100%;
    min-width: 270px;
    max-width: 550px;
    margin: 0 auto;
    position: relative;
    padding-bottom: 80px;
    .bg-img {
      pointer-events: none;
      position: fixed;
      z-index: -1;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .middle-img {
      position: fixed;
      pointer-events: none;
      z-index: -1;
      /*top: 30%;*/
      left: 0;
      width: 100%;
    }
    .bottom-img {
      position: absolute;
      bottom: -43px;
      left: 0;
      right: 0;
      z-index: 0;
      width: 130px;
      margin: 0 auto;
      pointer-events: none;
    }
    .head-img {
      width: 98%;
      pointer-events: none;
      position: relative;
      z-index: 0;
      margin-left: 1%;
      margin-top: 30px;
    }
    .input-panel {
      /*max-width: 330px;*/
      width: 90%;
      margin: 0 auto;
      position: relative;
      background: #FFF1D1;
      box-shadow: 0 5px 10px 0 rgba(104, 60, 43, 0.60);
      border-radius: 6px;
      margin-top: -85%;
      padding: 30px 11%;
    }
    .phone-box {
      width: 100%;
      height: 40px;
      position: relative;
    }
    .error-phone-msg {
      font-size: 12px;
      color: #ff3f3f;
    }
    .sms-box {
      margin-top: 20px;
      display: flex;
      height: 40px;
      width: 100%;
      position: relative;
      input {
        height: 100%;
        flex: 1 1 100%;
      }
      .sms-btn {
        flex: 0 0 95px;
        margin-left: 10px;
        height: 100%;
        line-height: 40px;
        background: #B9141A;
        border-radius: 4px;
        color: #F6E388;
        text-align: center;
        font-size: 12px;
        cursor: pointer;
        &.btn-disabled {
          background: #ccc;
          color: #fff;
        }
      }
    }
    input[type="tel"], input[type="text"], input[type="number"] {
      width: 100%;
      height: 100%;
      padding-left: 10px;
      color: #333;
      font-size: 14px;
      &::placeholder {
        color: #999;
      }
    }
    .agree-line {
      /*text-align: center;*/
      height: 40px;
      line-height: 40px;
      position: relative;
      margin-top: 4px;
    }
    .agree-line input {
      margin-left: -11px;
      width: 12px;
      height: 12px;
      vertical-align: middle;
      box-shadow: none;
      outline: none;
      appearance: none;
      border-radius: 0;
      visibility: hidden;
      cursor: pointer;
    }
    .agree-line input+label {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 1px solid #777;
      position: relative;
      vertical-align: middle;
      box-sizing: border-box;
      cursor: pointer;
      margin-top: -1px;
    }
    .agree-line input:checked+label {
      background: #B9141A;
      border: 1px solid #B9141A;
    }
    .agree-line input:checked+label::after {
      content: "";
      position: absolute;
      left: 1px;
      top: 2px;
      width: 6px;
      height: 1px;
      border: 2px solid #fff;
      border-top-color: transparent;
      border-right-color: transparent;
      -ms-transform: rotate(-60deg);
      -moz-transform: rotate(-60deg);
      -webkit-transform: rotate(-60deg);
      transform: rotate(-45deg);
    }
    .agree-line .check-box-text {
      vertical-align: middle;
      font-size: 10px;
      color: #777;
      margin-left: 6px;
    }
    .agree-line .to-agree {
      color: #B9141A;
      cursor: pointer;
    }
    .agree-popup {
      position: fixed;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background: rgba(0, 0, 0, .7);
    }
    .agree-padding-top, .agree-padding-bottom {
      height: 20px;
      width: 100%;
      background: #fff;
      position: absolute;
      left: 0;
    }
    .agree-padding-top {
      top: 0;
    }
    .agree-padding-top {
      bottom: 0;
    }
    .agree-penel {
      width: 90%;
      height: 90%;
      position: absolute;
      top: 5%;
      left: 5%;
      background: #fff;
      border-radius: 6px;
    }
    .agree-header {
      height: 20px;
      width: 100%;
    }
    .agree-body {
      width: 100%;
      height: calc(100% - 70px);
      overflow-y: auto;
      padding: 0 15px;
    }
    .agree-footer {
      height: 50px;
      width: 100%;
      border-top: 1px solid #eee;
      position: relative;
      overflow: hidden;
      border-radius: 6px;
    }
    .agree-text {
    }
    .agree-btn {
      width: 50%;
      height: 50px;
      line-height: 50px;
      text-align: center;
      font-size: 16px;
      float: left;
    }
    .agree-btn-cancel {
      background: #fff;
      color: #777;
    }
    .agree-btn-confirm {
      background: #fff;
      color: #2d9cf7;
    }
    .submit-btn {
      width: 100%;
      height: 45px;
      line-height: 45px;
      text-align: center;
      background: #B9141A;
      border-radius: 50px;
      color: #fff;
      font-weight: bold;
      font-size: 17px;
      color: #F6E388;
      letter-spacing: 0;
      margin-top: 30px;
      cursor: pointer;
    }
    .rule-btn {
      border-top: 2px solid rgba(0, 0, 0, 0);
      margin: 30px auto 10px;
      width: 60%;
      text-align: center;
      color: #B9141A;
      position: relative;
      .rule-btn-text {
        position: absolute;
        top: -6px;
        left: 0;
        right: 0;
        margin: 0 auto;
        padding: 0 6px;
        background: #FFF1D1;
        font-size: 12px;
        font-weight: bold;
        height: 12px;
        line-height: 12px;
        width: 50%;
        cursor: pointer;
        .circle-left, .circle-right {
          background: #B9141A;
          width: 7px;
          height: 7px;
          border-radius: 100%;
          position: absolute;
          top: 2px;
        }
        .circle-left {
          left: 0;
        }
        .circle-right {
          right: 0;
        }
      }
    }
    .rule-popup {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0);
      .rule-panel {
        width: 80%;
        height: 50%;
        position: absolute;
        top: 20%;
        left: 10%;
        background: #fff;
        border-radius: 6px;
        box-shadow: 0 5px 10px 0 rgba(104, 60, 43, 0.60);
        .rule-header {
          height: 20px;
          width: 100%;
          position: relative;
        }
        .rule-body {
          width: 100%;
          height: calc(100% - 40px);
          overflow-y: auto;
          padding: 0 15px;
        }
        .rule-footer {
          height: 20px;
          width: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 6px;
        }
        .btn-close {
          position: absolute;
          left: 0;
          right: 0;
          margin: 0 auto;
          bottom: -50px;
          width: 30px;
          height: 30px;
          border-radius: 100%;
          background: #333;
          overflow: hidden;
          img {
            width: 34px;
            height: 34px;
            position: absolute;
            top: -2px;
            left: -2px;
            pointer-events: none;
          }
        }
      }
    }
  }
</style>
