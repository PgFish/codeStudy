<template>
  <div class="bind-wrap" v-if="showBindBox">
    <template v-if="!isZTIntroShow">
      <div class="input-box phone-box" :class="{'input-disabled': disablePhoneInput || isReLogin}">
        <div class="label-img">
          <img src="static/img/login/phone.png">
        </div>
        <div class="phone-input">
          <input type="tel" v-model="phone" placeholder="请输入手机号" maxlength="11" :class="{'input-disabled': disablePhoneInput || isReLogin}" :disabled="disablePhoneInput || isReLogin" :readonly="disablePhoneInput || isReLogin" />
        </div>
      </div>
      <div class="input-box sms-box">
        <div class="label-img">
          <img src="static/img/login/sms.png">
        </div>
        <div class="sms-input">
          <input type="text" v-model="sms" placeholder="请输入手机验证码" maxlength="6" @keyup.enter="preBindCheck" />
        </div>
        <div class="sms-btn" :class="{'btn-disabled': isSending}" @click="getSms">{{smsTip}}</div>
      </div>
      <template v-if="!isReLogin">
        <div class="invite-line" v-if="!isZW">
          <!-- <div class="invite-line-left">
            <input id="inviteCheck" class="invite-check-box" type="checkbox" v-model="ifInvited" :disabled="isQrScanEntering" /><label for="inviteCheck"></label><span class="check-box-text">政企合伙人</span>
          </div> -->
          <div class="input-box" :class="{'input-disabled': isQrScanEntering}">
            <div class="label-img">
              <img src="static/img/login/invite.png">
            </div>
            <div class="phone-input">
              <input type="text" v-model="inviteCode" placeholder="请输入邀请码（选填）" :readonly="isQrScanEntering" :disabled="isQrScanEntering" :class="{'input-disabled': isQrScanEntering}" @blur="checkInviteCode" />
            </div>
          </div>
          <div class="clear-float"></div>
        </div>
        <div class="captain-type-select" :class="{'selected': userType, 'disabled': disableCaptainSelect}" @click="openPicker" v-if="isCaptainCodeShow && !isZW">
          {{userType || '请选择队长类型'}}
          <img class="select-icon" src="static/img/btn_triagle_down.png" />
        </div>
      </template>
      <div class="agree-line">
        <input id="agreeCheck" type="checkbox" v-model="ifAgree" /><label for="agreeCheck"></label><span class="check-box-text">我已阅读并同意<span class="to-agree" @click="getAgree">四川移动合伙人协议</span></span>
      </div>
      <!-- <div class="invite-line" v-if="!isZW">
        <div class="invite-line-left">
          <input id="inviteCheck" class="invite-check-box" type="checkbox" v-model="ifInvited" :disabled="isQrScanEntering" /><label for="inviteCheck"></label><span class="check-box-text">政企合伙人</span>
        </div>
        <div class="input-box" :class="{'input-disabled': isQrScanEntering}" v-if="showInviteInput">
          <div class="label-img">
            <img src="static/img/login/invite.png">
          </div>
          <div class="phone-input">
            <input type="text" v-model="inviteCode" placeholder="请输入邀请码" maxlength="6" :readonly="isQrScanEntering" :disabled="isQrScanEntering" :class="{'input-disabled': isQrScanEntering}" />
          </div>
        </div>
        <div class="clear-float"></div>
      </div> -->
      <!-- <div class="invite-select" @click="openPicker">
        <span>{{userType || '普通合伙人'}}</span>
        <img :class="{'rotate-180': ifInvited}" src="static/img/btn_triagle_down.png" />
      </div> -->
      <div class="clear-float"></div>
      <div class="btn-common btn-bind" @click="preBindCheck">{{submitText}}</div>
      <div class="btn-common btn-cancel" v-if="!isZT" @click="close">取消</div>
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
    </template>
    <!-- 下面是用户类型选择器 -->
    <mt-popup class="picker-popup" position="bottom" v-model="showPicker">
      <mt-picker v-if="pickerSlot.length > 0" value-key="name" :default-index="0" :show-toolbar="true" :slots="pickerSlot" ref="picker" @change="onPickerChange">
        <div name="toolbar" class="tool-bar">
          <mt-button size="small" type="default" class="button picker-btn-cancel" @click.native="closePicker">取消</mt-button>
          <mt-button size="small" type="primary" class="button picker-btn-confirm" @click.native="confirmPicker">确定</mt-button>
        </div>
      </mt-picker>
    </mt-popup>
    <div class="zt-intro" v-if="isZTIntroShow" @click="closeZTIntro($event)" @touchmove="prevDef($event)">
      <img src="static/img/login/zt_introduce.png" />
    </div>
  </div>
</template>

<script>
import { Constants, baseUrl, sourceType, getRequestParams, sendGetRequest, sendJsonPostRequest, getJsApiConfig, removeSession, pageRouter, getSession, saveSession, closeIllegalPage, closePage, saveStorage, getStorage, encryptByDES, YEK_SED, isWechat } from 'src/assets/utils.js';
import { Indicator, MessageBox, Toast } from 'mint-ui';
import Qs from 'qs';

export default {
  components: {
  },
  data() {
    return {
      openId: '',
      showBindBox: false,
      phone: '',
      sms: '',
      isSending: false,
      smsTip: '获取验证码',
      ifAgree: false,
      showAgree: false,
      agreement: '',
      disablePhoneInput: false,
      inviteCode: '',
      // ifInvited: false,
      showInviteInput: false,
      isQrScanEntering: false,
      isZW: false,
      isZTIntroShow: false,
      sourceId: '',
      submitText: '绑定',
      isReLogin: false,
      userType: '',
      showPicker: false,
      pickerSlot: [],
      isCaptainCodeShow: false,
      disableCaptainSelect: false
    };
  },
  watch: {
    ifAgree(val) {
      console.log(val);
    },
    // ifInvited(val) {
    //   console.log('是否勾选邀请码：', val);
    //   this.showInviteInput = val;
    //   if (this.isReLogin) {
    //     this.submitText = val ? '绑定' : '登录';
    //   }
    // },
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
    },
    inviteCode(val) {
      this.isCaptainCodeShow = false;
      this.userType = '';
      this.userTypeValue = '';
    }
  },
  created() {
    this.isZT = sourceType === 'zhangting';
    let that = this;
    let shareObj = {
      excuteFn: () => {
        that.checkWhetherBind();
      }
    };
    getJsApiConfig(shareObj);
  },
  methods: {
    checkInviteCode: function() {
      if (!/\d{11}/.test(this.inviteCode)) {
        return;
      }
      let url = `${baseUrl}/regiment/captainType/${this.inviteCode}`;
      let reqParams = getRequestParams(
        url,
        '',
        (vue, json) => {
          Indicator.close();
          console.log(json);
          if (json && json.status === 0) {
            let captainTypeArr = json.data;
            if (captainTypeArr.length > 0) {
              vue.isCaptainCodeShow = true;
              if (captainTypeArr.length === 1) {
                vue.userType = captainTypeArr[0].name;
                vue.userTypeValue = captainTypeArr[0].value;
                vue.disableCaptainSelect = true;
              } else {
                vue.disableCaptainSelect = false;
                vue.pickerSlot = [
                  {
                    flex: 1,
                    values: captainTypeArr,
                    className: 'slot1',
                    textAlign: 'center'
                  }
                ];
              }
            }
          } else {
            MessageBox.alert(json.msg || '邀请码输入错误');
          }
        },
        (vue, ex) => {
          Indicator.close();
          console.log(ex);
        }
      );
      Indicator.open();
      sendGetRequest(this, reqParams);
    },
    openPicker: function() {
      // 如果只有一种队长类型，然后默认选中了，则不能弹出选择器
      if (this.disableCaptainSelect) {
        return;
      }
      this.showPicker = true;
    },
    closePicker: function() {
      this.showPicker = false;
    },
    onPickerChange: function(picker, values) {
      console.log(values);
      this.curUserType = values[0] ? values[0] : values['undefined'];
    },
    confirmPicker: function() {
      this.userType = this.curUserType.name;
      this.userTypeValue = this.curUserType.value;
      this.showPicker = false;
    },
    closeZTIntro: function(e) {
      e.stopPropagation();
      // saveStorage('20181114zt_intro_' + this.sourceId, '1');
      this.isZTIntroShow = false;
    },
    prevDef: function(e) {
      e.stopPropagation();
      e.preventDefault();
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
    close: function() {
      closePage();
    },
    openAgree: function() {
      this.showAgree = true;
    },
    closeAgree: function() {
      this.showAgree = false;
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
    clickDisagree: function() {
      this.ifAgree = false;
      this.closeAgree();
    },
    clickAgree: function() {
      this.closeAgree();
    },
    checkWhetherBind: function() {
      let srcInfo = getSession('ptSourceInfo', true);
      if (srcInfo) {
        this.srcUserInfo = srcInfo.userInfo;
        if (sourceType === 'zhuangwei' || (sourceType === 'dzg' && !isWechat() && this.srcUserInfo.realName)) {
          this.isZW = true;
        }
        let info = srcInfo.info;
        if (info === 'service') { // service表示是直接跳转进在线客服
          this.getOnlineSvc();
          return;
        }
        // 宝箱活动
        if (info && info.split('baoxiang')[0] === 'chest') {
          if (this.srcUserInfo.openid === info.split('baoxiang')[2]) {
            this.routerPath = '/chest';
          } else {
            var phone = info.split('baoxiang')[1];
            pageRouter(this, { path: '/chest', query: { shareP: phone } }, 'replace');
          }
          return;
        }
        if (info) { // 除以上情况外的跳转
          info = info.replace(/listen/ig, '&'); // 由于微信不支持传多个参数，则在参数中用key=valuelistenkey=value的格式，在这里把listen替换为&
          let jsonInfo = Qs.parse(info); // 将info中的key=value&转换成json
          if (jsonInfo.path) { // 如果参数中有path值
            if (!/^\//.test(jsonInfo.path)) { // 兼容path值没有加/的情况
              jsonInfo.path = '/' + jsonInfo.path; // jsonInfo.path值是后面跳转的路径
            }
            // 关注有礼活动
            if (/\/followreward/i.test(jsonInfo.path)) {
              pageRouter(this, { path: '/listener' }, 'replace');
              return;
            }
            // 其他直接进入的页面(注：此逻辑2018-12-29前已经迁移到Listner.vue)
            if (/\/rule|\/introduce|\/giveback/i.test(jsonInfo.path)) {
              pageRouter(this, jsonInfo.path, 'replace');
              return;
            }
            // <---------------------以上路径属于不需要登录则可以跳转的情况--------------------->
            this.routerPath = jsonInfo.path; // 其他情况若配置有路径，则需要登录后跳转到该路径
          } else if (jsonInfo.inviteCode && !this.isZW) { // 如果参数中有inviteCode值，且不是装维
            this.inviteCode = jsonInfo.inviteCode; // 自动填上邀请码
            // this.ifInvited = true; // 勾选上邀请码的选项
            this.showInviteInput = true; // 显示邀请码输入框
            this.isQrScanEntering = true; // 禁止输入框手动输入
            this.checkInviteCode();
          } else if (jsonInfo.fromShareShop && !this.isZW) { // 从分享店铺进入注册页是，要弹窗显示合伙人介绍
            this.fromShareShop = true;
          } else if (info === 'fromShareShop') { // 从分享店铺进入注册页是，要弹窗显示合伙人介绍(兼容旧配置)
            this.fromShareShop = true;
          }
        }
        console.log(sourceType);
        let sourceId = this.srcUserInfo.openid; // 如果是从公众号进入的，则查询用openId
        if (sourceType !== 'public' && sourceType !== 'zhuangwei') { // 如果是从大掌柜或者掌厅进入的，则用手机号查询用户信息
          sourceId = this.phone = this.srcUserInfo.phone;
          this.disablePhoneInput = true; // 并且默认填充手机号不能更改
        }
        let url = `${baseUrl}/register/partner/${sourceId}?sourceType=${sourceType}`; // 通过openid获取用户信息，是否绑定了手机号
        console.log(url);
        let reqParams = getRequestParams(url, '', this.checkWhetherBindSuc, this.checkWhetherBindFail, '');
        this.sourceId = sourceId;
        // 掌厅进入、或者从分享店铺广告链接进入，要显示合伙人介绍弹层
        this.isZTIntroShow = (sourceType === 'zhangting' && ('' + getStorage('20181114zt_intro_' + sourceId) !== '1')) || (this.fromShareShop && ('' + getStorage('shareshop_intro_' + sourceId) !== '1'));
        sendGetRequest(this, reqParams);
      } else {
        closeIllegalPage(this);
      }
    },
    checkWhetherBindSuc: function(vue, json) {
      console.log(json);
      /*
        * 查询用户是否绑定手机号的结果如下
        */
      if (json.status === 0) { // status=0 表示已经绑定了手机号，直接跳转到首页并带上手机号
        vue.showBindBox = false;
        if ('' + json.data.partner.partnerType === '9' && !this.isZW) { // 如果检测出来这个人是装维合伙人，但链接不是装维链接
          if (isWechat()) { // 微信环境跳转到装维登录地址
            window.location.replace(`${window.location.origin + baseUrl}/zwregister/wx/oAuth/userInfo`);
          } else { // 非微信环境提示
            Indicator.close();
            MessageBox.alert('装维合伙人请从“四川移动大掌柜”公众号或“移动大掌柜”APP进入。', '温馨提示');
          }
          return;
        }
        saveSession('partnerticket', json.data.token); // 保存用户的token
        saveSession('ptPublicOpenId', json.data.partner.openId); // 保存用户的openId(此openId可以从下面一行的ptDetailInfo获取)
        saveSession('ptDetailInfo', json.data.partner); // 保存服务器返回的合伙人信息
        let routerPath = vue.routerPath;
        let routeQry = { p: json.data.partner.phone, ptid: json.data.partner.id };
        if ('' + json.data.partner.partnerType === '9') { // 装维合伙人
          routeQry = { p: json.data.partner.phone, ptid: json.data.partner.id };
        }
        // if ('' + json.data.partner.partnerType !== '5' && !json.data.partner.inviteCode && vue.qrInviteCode && '' + json.data.partner.partnerType !== '9') { // partnerType=9是政企客户经理
        //   routerPath = '/bindinviter'; // 如果partnerType不是政企合伙人5，并且合伙人信息中没有inviteCode，且是从分享链接进入的，且不是政企客户经理。则登录后跳转到绑定邀请码页面并带上参数
        // }
        vue.gotoIndex(vue, { path: routerPath || '/index', query: routeQry }, 'replace');
      } else if (json.status === 1) { // status=1 表示还未绑定手机号，无提示显示绑定页面
        Indicator.close();
        if (json.data && json.data.partner && json.data.partner.phone) {
          document.title = '登录';
          vue.phone = json.data.partner.phone;
          vue.submitText = '登录';
          vue.isReLogin = true;
        } else {
          vue.toNew();
          return;
          // document.title = '绑定手机号';
        }
        vue.showBindBox = true;
        removeSession('partnerticket');
      } else if (json.status === 2) { // status=2 表示账号已锁定，不让其进入首页，待用户操作后关闭页面
        Indicator.close();
        MessageBox.alert(json.msg || '账号已被锁定，请联系管理员解锁').then(() => {
          removeSession('partnerticket');
          closePage();
        }).catch(e => {
          removeSession('partnerticket');
          closePage();
        });
      } else if (json.status === 3) { // status=3 表示账号已经注销，需要重新绑定，提示并显示绑定页面
        Indicator.close();
        Toast(json.msg || '账号已经注销，请重新绑定');
        vue.toNew();
        // document.title = '绑定手机号';
        // removeSession('partnerticket');
        // vue.showBindBox = true;
      } else { // 其他情况，待用户操作后，直接关闭页面
        Indicator.close();
        MessageBox.alert('发生异常，请退出后重新进入页面').then(() => {
          removeSession('partnerticket');
          closePage();
        }).catch(e => {
          removeSession('partnerticket');
          closePage();
        });
      }
    },
    toNew: function() {
      let url = `${window.location.origin + baseUrl}/campuspartner/pages/?from=old&noOldAuth=1`;
      if (this.inviteCode) {
        url += `&inviteCode=${this.inviteCode}`;
      }
      window.location.href = url;
    },
    checkWhetherBindFail: function(vue, ex) {
      Indicator.close();
      MessageBox.alert('发生异常，请退出后重新进入页面').then(() => {
        removeSession('partnerticket');
        closePage();
      }).catch(e => {
        removeSession('partnerticket');
        closePage();
      });
      console.info(ex);
    },
    getSms: function() {
      if (!Constants.mobileReg.test(this.phone)) {
        Toast({ message: '请输入正确的手机号码！', duration: 1200 });
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
      let reqParams = getRequestParams(url, params, this.getSmsSuc, this.getSmsFail, '');
      Indicator.open();
      this.isSending = true;
      sendJsonPostRequest(this, reqParams);
    },
    getSmsSuc: function(vue, json) {
      Indicator.close();
      if (json.status === 0) {
        vue.sms = '';
        MessageBox.alert(json.msg || '短信验证码发送成功');
      } else {
        MessageBox.alert(json.msg || '短信验证码发送失败，请重试');
      }
    },
    getSmsFail: function(vue, ex) {
      Indicator.close();
      Toast('网络异常，短信验证码发送失败');
    },
    preBindCheck: function() {
      if (/\d{11}/.test(this.inviteCode) && !this.isCaptainCodeShow) {
        return;
      }
      if (this.isSubmit) {
        return;
      }
      if (!Constants.mobileReg.test(this.phone)) {
        Toast({ message: '请输入正确的手机号码！', duration: 1200 });
        return;
      }
      if (this.sms.length < 6) {
        Toast({ message: '请输入6位数字短信验证码！', duration: 1200 });
        return;
      }
      // if (!this.isReLogin && !this.inviteCode) {
      //   Toast({message: '请输入邀请码', duration: 1200});
      //   return;
      // }
      if (/\d{11}/.test(this.inviteCode) && !this.userType) {
        Toast({ message: '请选择队长类型', duration: 1200 });
        return;
      }
      if (!this.ifAgree) {
        Toast({ message: '请阅读并同意《四川移动合伙人协议》', duration: 1200 });
        return;
      }
      Indicator.open();
      this.isSubmit = true;
      if (this.checkedPhone === this.phone) { // 如果已经校验通过，仅仅是绑定出问题，再次绑定时不需要再预校验
        this.bind();
        return;
      }
      let url = `${baseUrl}/register/partner/preBinding`; // 绑定预校验接口
      let params = {
        'phone': this.phone,
        'openId': this.srcUserInfo.openid,
        'verifyCode': this.sms,
        'sourceType': sourceType
      };
      let reqParams = getRequestParams(url, params, this.preBindCheckSuc, this.preBindCheckFail, '');
      sendJsonPostRequest(this, reqParams);
    },
    preBindCheckSuc: function(vue, json) {
      console.log(json);
      if (json.status === 0) {
        vue.bind();
      } else if (json.status === 1) {
        vue.isSubmit = false;
        Indicator.close();
        MessageBox({
          message: json.msg || '仅支持同一个号码绑定一个微信号。当前您要绑定的号码，已在其他微信上绑定过，若确认绑定，则该号码在其他微信上的绑定关联将自动解除。',
          showCancelButton: true
        }).then(action => {
          console.log('换绑');
          if (action === 'confirm') {
            Indicator.open();
            vue.bind();
          } else {
            console.log('取消换绑');
            vue.phone = vue.sms = '';
            vue.ifAgree = false;
          }
        }).catch(e => {
          console.log('取消换绑');
          vue.phone = vue.sms = '';
          vue.ifAgree = false;
        });
      } else if (json.status === 2) {
        vue.isSubmit = false;
        Toast(json.msg || '您已经绑定了，不需要再绑定');
        saveSession('partnerticket', json.data.token);
        saveSession('ptPublicOpenId', json.data.partner.openId);
        saveSession('ptDetailInfo', json.data.partner);
        let routerPath = vue.routerPath;
        let routeQry = { p: json.data.partner.phone, ptid: json.data.partner.id };
        if ('' + json.data.partner.partnerType === '9') { // 装维合伙人
          routeQry = { p: json.data.partner.phone, ptid: json.data.partner.id };
        }
        // if ('' + json.data.partner.partnerType !== '5' && !json.data.partner.inviteCode && vue.qrInviteCode && '' + json.data.partner.partnerType !== '9') {
        //   routerPath = '/bindinviter';
        // }
        vue.gotoIndex(vue, { path: routerPath || '/index', query: routeQry }, 'replace');
      } else {
        vue.isSubmit = false;
        Indicator.close();
        Toast(json.msg || '校验失败，请重试');
      }
    },
    preBindCheckFail: function(vue, ex) {
      vue.isSubmit = false;
      Indicator.close();
      console.info(ex);
      Toast('校验时发生异常，请重试');
    },
    bind: function() {
      this.checkedPhone = this.phone;
      let url = `${baseUrl}/register/partner/binding`; // 手机号绑定接口
      let params = {
        'nickName': this.srcUserInfo.nickname,
        'phone': this.phone,
        'headImg': this.srcUserInfo.headimgurl,
        'openId': this.srcUserInfo.openid,
        'verifyCode': this.sms,
        'sourceType': sourceType,
        'inviteCode': this.inviteCode || '',
        'captainType': this.userTypeValue || ''
      };
      let reqParams = getRequestParams(url, params, this.bindSuc, this.bindFail, '');
      sendJsonPostRequest(this, reqParams);
    },
    bindSuc: function(vue, json) {
      console.log(json);
      vue.isSubmit = false;
      if (json.status === 0) {
        saveSession('partnerticket', json.data.token);
        saveSession('ptPublicOpenId', json.data.partner.openId);
        saveSession('ptDetailInfo', json.data.partner);
        vue.gotoIndex(vue, { path: vue.routerPath || '/index', query: { p: json.data.partner.phone, ptid: json.data.partner.id } }, 'replace');
      } else if (json.status === 1) {
        Toast(json.msg || `该微信号已经绑定了手机号${json.data.partner.phone}`);
        if (json.data) {
          saveSession('partnerticket', json.data.token);
          saveSession('ptPublicOpenId', json.data.partner.openId);
          saveSession('ptDetailInfo', json.data.partner);
          vue.gotoIndex(vue, { path: vue.routerPath || '/index', query: { p: json.data.partner.phone, ptid: json.data.partner.id } }, 'replace');
        } else {
          Indicator.close();
        }
      } else if (json.status === 3) {
        Indicator.close();
        Toast(json.msg || '验证码错误，请重新获取');
      } else {
        Indicator.close();
        MessageBox.alert('绑定失败，请重试').then(() => {
          vue.sms = vue.phone = '';
          vue.ifAgree = false;
        }).catch(e => {
          vue.sms = vue.phone = '';
          vue.ifAgree = false;
        });
      }
    },
    bindFail: function(vue, ex) {
      vue.isSubmit = false;
      Indicator.close();
      Toast('绑定时发生异常，请重试');
      vue.sms = vue.phone = '';
      vue.ifAgree = false;
    },
    getOnlineSvc: function() { // 在线客服链接获取并跳转
      if (this.isLoading) return;
      let url = `${baseUrl}/custom/service/url/init`;
      let params = {
        'deviceNo': this.srcUserInfo.openid,
        'username': this.srcUserInfo.openid
      };
      let reqParams = getRequestParams(url, params, this.getOnlineSvcSuc, this.getOnlineSvcFail, '');
      Indicator.open();
      this.isLoading = true;
      sendJsonPostRequest(this, reqParams);
    },
    getOnlineSvcSuc: function(vue, json) {
      Indicator.close();
      vue.isLoading = false;
      console.log(json);
      if (json.status !== 0 || !json.data) {
        MessageBox.alert(json.msg || '获取在线客服链接失败！');
        return;
      }
      window.location.replace(json.data);
    },
    getOnlineSvcFail: function(vue, ex) {
      Indicator.close();
      vue.isLoading = false;
      console.log(ex);
      Toast('网络错误，请稍后重试');
    }
  }
};
</script>

<style lang="less">
  body {
    background: #F0F0F0;
    /* padding-top: 10px; */
  }
  .bind-wrap {
    min-height: 100%;
    padding-top: 10px;
    * {
      user-select: none;
    }
    img {
      pointer-events: none;
    }
    .input-box {
      height: 68px;
      padding: 23px 20px;
      background: #fff;
      position: relative;
    }
    .captain-type-select {
      height: 68px;
      padding: 23px 20px;
      background: #fff;
      position: relative;
      border-top: 1px solid #ddd;
      color: #999;
      font-family: "宋体";
      &.selected {
        color: #333;
      }
      &.disabled {
        background: #e6e6e5;
      }
      .select-icon {
        position: absolute;
        right: 30px;
        top: 45%;
        transform: translateY(-45%);
        width: 16px;
      }
    }
    .label-img {
      width: 38px;
      height: 100%;
      padding: 0 17px 0 0;
      float: left;
    }
    .label-img img {
      width: 21px;
      height: 21px;
    }
    .phone-box {
      border-bottom: 1px solid #ddd;
    }
    .phone-input {
      float: left;
      height: 67px;
      margin-top: -23px;
      width: calc(100% - 38px);
    }
    .input-box input {
      height: 100%;
      width: 100%;
      font-size: 16px;
      border: 0;
    }
    .input-disabled {
      background: #e6e6e5;
    }
    .sms-input {
      float: left;
      height: 67px;
      margin-top: -23px;
      width: calc(100% - 38px - 110px);
    }
    .sms-btn {
      width: 110px;
      float: left;
      text-align: center;
      height: 35px;
      line-height: 35px;
      font-size: 15px;
      background: #3D8CF7;
      color: #fff;
      margin-top: -7px;
      border-radius: 4px;
      cursor: pointer;
    }
    ::-webkit-input-placeholder { /* WebKit browsers */
      color: #999;
    }
    :-moz-placeholder { /* Mozilla Firefox 4 to 18 */
      color: #999;
    }
    ::-moz-placeholder { /* Mozilla Firefox 19+ */
      color: #999;
    }
    :-ms-input-placeholder { /* Internet Explorer 10+ */
      color: #999;
    }
    .invite-line {
      border-top: 1px solid #ddd;
    }
    .invite-line-left {
      /*text-align: center;*/
      padding-left: 8px;
      height: 40px;
      line-height: 40px;
      position: relative;
      width: 130px;
    }
    .invite-line-left .invite-check-box {
      width: 16px;
      height: 16px;
      vertical-align: middle;
      box-shadow: none;
      outline: none;
      appearance: none;
      border-radius: 0;
      visibility: hidden;
      cursor: pointer;
    }
    .invite-line-left .invite-check-box+label {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 1px solid #777;
      position: relative;
      vertical-align: middle;
      box-sizing: border-box;
      cursor: pointer;
    }
    .invite-line-left .invite-check-box:checked+label {
      background: #40ace2;
      border: 1px solid #40ace2;
    }
    .invite-line-left .invite-check-box:checked+label::after {
      content: "";
      position: absolute;
      left: 1px;
      top: 1px;
      width: 8px;
      height: 3px;
      border: 2px solid #fff;
      border-top-color: transparent;
      border-right-color: transparent;
      -ms-transform: rotate(-60deg);
      -moz-transform: rotate(-60deg);
      -webkit-transform: rotate(-60deg);
      transform: rotate(-45deg);
    }
    .invite-line-left .check-box-text {
      vertical-align: middle;
      font-size: 14px;
      color: #777;
      margin-left: 6px;
    }
    .invite-line-right {
      width: 100%;
      height: 40px;
      line-height: 40px;
      position: relative;
    }
    .invite-line-right input {
      height: 40px;
      width: 100%;
      font-size: 16px;
      border: 0;
    }
    .agree-line {
      /*text-align: center;*/
      height: 40px;
      line-height: 40px;
      position: relative;
      margin-top: 10px;
      padding-left: 6px;
    }
    .agree-line input {
      width: 16px;
      height: 16px;
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
      width: 16px;
      height: 16px;
      border: 1px solid #777;
      position: relative;
      vertical-align: middle;
      box-sizing: border-box;
      cursor: pointer;
    }
    .agree-line input:checked+label {
      background: #40ace2;
      border: 1px solid #40ace2;
    }
    .agree-line input:checked+label::after {
      content: "";
      position: absolute;
      left: 1px;
      top: 1px;
      width: 8px;
      height: 3px;
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
      font-size: 12px;
      color: #777;
      margin-left: 6px;
    }
    .agree-line .to-agree {
      color: #40ace2;
      cursor: pointer;
    }
    .btn-common {
      width: 90%;
      margin: 16px auto;
      height: 45px;
      line-height: 45px;
      text-align: center;
      font-size: 18px;
      cursor: pointer;
      border-radius: 4px;
    }
    .btn-bind {
      margin-top: 40px;
      color: #fff;
      background: #3D8CF7;
    }
    .btn-cancel {
      color: #3D8CF7;
      background: #fff;
      border: 1px solid #3D8CF7;
    }
    .btn-disabled {
      background: #ccc;
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
    .invite-select {
      position: relative;
      float: right;
      padding-right: 30px;
      height: 30px;
      line-height: 30px;
      font-size: 12px;
      color: #aaa;
      margin-right: 20px;
      img {
        position: absolute;
        top: 2px;
        right: 5px;
        width: 20px;
        height: 20px;
        &.rotate-180 {
          transform: rotateX(180deg);
          top: 6px;
        }
      }
    }
    .zt-intro {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      z-index: 9999999;
    }
    .zt-intro img {
      pointer-events: none;
      width: 100%;
      height: 100%;
      margin-bottom: -100%;
    }
    .picker-popup {
      width: 100%;
    }
    .picker-btn-confirm {
      position: absolute;
      right: 0;
      background: #FFFFFF;
      color: #2D9CF7;
    }
    .picker-btn-cancel {
      position: absolute;
      left: 0;
      background: #FFFFFF;
      color: #2D9CF7;
      box-shadow: none;
    }
  }
</style>
