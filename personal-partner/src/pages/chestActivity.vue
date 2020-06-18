<template>
<div class="activity" v-if="isJoinIn">
  <div class="activity-logo">
    <img src="static/img/activity/logo.png" alt="">
  </div>
  <div class="activity-chestTile">
    <img src="static/img/activity/chest-title.png" alt="">
    <p>活动时间：即日起至2018.10.31</p>
  </div>
  <div class="activity-chest">
    <div class="open-has" :class="{opened: isShake}">
      <div class="mod-chest">
        <template v-if="isShake || !isOpen">
          <div class="chest-close" :class="{shake: isShake, show: isShow}">
            <div class="gift" @animationend="openStop"></div>
            <div class="chest-back" v-if="!isShake"></div>
            <template v-if="isPartnerOneself">
              <div class="share" @click="openChest" v-if="!isShake && complete">{{mesBtn}}
                <img class="left" src="static/img/activity/btnL.png" />
                <img class="right" src="static/img/activity/btnR.png" />
              </div>
              <div class="fail" v-if="!isShake && !complete && fail">{{mesBtn}}
                <img class="left" src="static/img/activity/btnL.png" />
                <img class="right" src="static/img/activity/btnR.png" />
              </div>
              <div class="share" @click="shareChest($event)" v-if="!isShake && !complete && !fail">{{mesBtn}}
                <img class="left" src="static/img/activity/btnL.png" />
                <img class="right" src="static/img/activity/btnR.png" />
              </div>
            </template>
          </div>
          <div class="chest-open" :class="{show: !isShow, blur: isBlur}">
          </div>
        </template>
        <template v-if="!isShake && isOpen">
          <div class="chest-open" :class="{blur: isOpen, show: isShow}">
          </div>
        </template>
      </div>
    </div>
  </div>
  <div v-if="isOpen" class="activity-done">
    <div v-if="isRulePhone" class="activity-done-introduce">
      恭喜您{{userInfo.nickname}}，2G流量将在24小时内到账，请注意查收。
    </div>
    <div v-if="!isRulePhone && !drawPostage" class="activity-done-give">
      <div class="activity-done-introduce">
        您绑定的手机号码非四川移动号码，请输入四川移动号码进行领取。
      </div>
      <div class="activity-done-givePhone">
        <input v-model="givingPhone" type="tel" placeholder="请输入四川移动手机号码" maxlength="11">
      </div>
      <div class="activity-done-giveBtn">
        <button class="activity-btnStyle" @click="getDrawPostage">领取流量</button>
      </div>
    </div>
    <div v-if="!isRulePhone && drawPostage" class="activity-done-introduce">
      恭喜您{{userInfo.nickname}}已领取2G流量到{{givingPhone}},谢谢您的参与
    </div>
  </div>
  <!-- <div v-if="isOpen" class="activity-done">

  </div> -->
  <div v-if="!isOpen" class="activity-countDown">
    <template v-if="activityStatus != 1 && activityStatus != 4">
    距离结束还有：<span :style="fail ? 'background:#bbb' : ''">{{countDown.hours}}</span>:<span :style="fail ? 'background:#bbb' : ''">{{countDown.minutes}}</span>:<span :style="fail ? 'background:#bbb' : ''">{{countDown.seconds}}</span>
    </template>
    <div v-if="fail && isPartnerOneself" class="activity-failReason">
      <p>很遗憾！</p>
      <p>宝箱未能在24小时以内打开</p>
      <p>它又被放置到了藏宝处</p>
    </div>
    <div v-if="fail && isPartnerOneself" class="activity-failGuide">
      再次参与，请进入四川移动合伙人公众号，
      点击开宝箱再次参加。
    </div>
  </div>
  <!-- 助力团 -->
  <div class="activity-pannel" v-if="isPartnerOneself && !fail">
    <div class="activity-header">
      <p class="activity-header-userImg"><img :src="userInfo.headimgurl || 'static/img/cmcc_logo.png'" alt=""></p>
      <p class="activity-header-nickName">{{userInfo.nickname || (userInfo.phone ? userInfo.phone.substr(0, 3) + '****' + userInfo.phone.substr(7) : '')}}</p>
    </div>
    <div class="activity-introduce" v-if="activityStatus != 4">
      <p>恭喜你收到一个宝箱，<span class="redColor">24</span>小时内，</p>
      <p>只要有<span class="redColor">5</span>个好友帮你点击，即可获得<span class="redColor">2G</span>流量</p>
    </div>
    <div class="activity-introduce" v-if="activityStatus == 4">
      <p style="color: #ef4f4f;">恭喜你助力已满员，请及时开启宝箱</p>
    </div>
    <div class="activity-shareInfo">
      <img :src="assistantUserImgArr[index] ? assistantUserImgArr[index] : assistantUserImg" :key="index" v-for="(item, index) in 5">
    </div>
  </div>

   <div class="activity-pannel-helper" v-if="!isPartnerOneself">
    <div class="activity-shareInfo paddingTop20">
      <img :src="assistantUserImgArr[index] ? assistantUserImgArr[index] : assistantUserImg" :key="index" v-for="(item, index) in 5">
    </div>
    <div class="activity-helperCount" v-if="activityStatus != 4">
      已有{{helpTotalCount}}位好友助力，还差{{5-helpTotalCount > 0 ? 5-helpTotalCount : 0}}位帮忙
    </div>
    <div class="activity-helperCount" v-if="activityStatus == 4">
      已有{{helpTotalCount}}位好友助力，成功开启宝箱
    </div>
    <div class="activity-helperBtn">
      <button v-if="!is_help && activityStatus != 4" class="activity-btnStyle" style="color: #fff;" @click="giveLove">帮他助力</button>
      <div class="activity-helpSuc" v-if="is_help || helpTotalCount == 5">{{helperMes}}</div>
      <button class="activity-btnStyle marginTop15" style="color: ##FB1B1C" @click="actGuide">我也要得免费流量</button>
    </div>
  </div>

  <div class="activity-pannel-fail" v-if="isPartnerOneself && fail">
    <div class="activity-count">
      有{{helpTotalCount}}位好友帮你助力
    </div>
    <div class="activity-shareInfo">
      <img :src="assistantUserImgArr[index] ? assistantUserImgArr[index] : assistantUserImg" :key="index" v-for="(item, index) in 5">
    </div>
  </div>
  <!-- 活动规则 -->
  <div class="activity-pannel activity-rule">
    <div class="activity-rule-title"></div>
    <div v-html="chest_rule.detail"></div>
    <!-- <p class="first">1、本流量仅限四川移动号码领取，其他号码不能参加，数量有限，先到先得。</p>
    <p>2、异地或异网用户可将流量权益赠送给符合参加条件的用户。</p>
    <p>3、赠送流量包资费办理次日内生效，未使用完毕流量2018年11月30日前失效。</p>
    <p>4、凡涉及利用活动奖品（包括但不限于话费、流量、电子券等）进行转卖、有价交易等获利行为的相关账号，四川移动有权对其进行封停、取消所获奖品等处理。</p>
    <p>5、凡通过不正当途径参与活动的用户，我司有权终止其参加本次活动并取消其获奖资格。</p>
    <p>6、凡参加本次活动者，即视为接受活动所有规则，且遵循中国移动四川有限公司法律声明及其他关于营销活动的相关规定，中国移动四川有限公司有权在法律允许的范围内对活动规则做出适当的调整。</p>
    <p style="padding-bottom:15px;">*本活动最终解释权归中国移动四川有限公司所有。</p> -->
  </div>
  <div style="height:20px;width:100%"></div>
  <div class="tip-layer" v-if="tipShow" @touchmove="prevDef($event)">
    <div class="close-btn" @click="closeTipLayer">
      <img src="static/img/btn_close.png">
    </div>
    <div class="top-tip">
      <img src="static/img/activity/shareGuide.png" alt="">
    </div>
    <!-- <img class="connect-string" src="static/img/index/connect_string.png"> -->
    <!-- <img class="pointer-hand" src="static/img/index/hand.png"> -->
  </div>
  <div class="tip-joinActGuide" v-if="guideShow">
    <div class="connect-guide">
      <img class="connect-guide-img" src="static/img/activity/chestGuide.png">
      <div class="connect-guide-toIntroduce" @click="toIntroduce"></div>
      <div class="line"></div>
      <div class="close-btn" @click="closeActLayer">
        <img src="static/img/btn_close.png">
      </div>
    </div>
  </div>
</div>
</template>
<script>
import { closeIllegalPage, sendJsonPostRequest, getRequestParams, sendGetRequest, baseUrl, getJsApiConfig, isWechatBoolean, getSession, handleShare, closePage, pageRouter } from 'src/assets/utils.js';
import { Indicator, MessageBox, Toast } from 'mint-ui';
import Qs from 'qs';
export default {
  data () {
    return {
      isShake: false, // 开宝箱动画显示
      isBlur: false, // 宝箱的状态（打开）
      isShow: true, // 开宝箱动画显示
      isOpen: false, // 控制开关宝箱
      // fail: false, // 助力失败
      // openShare: true, // 控制分享
      // complete: false, // 控制活动完成状态
      isRulePhone: true, // 是否是四川移动手机号
      drawPostage: false, // 是否领取了奖励
      assistantUserImg: 'static/img/activity/userImg.png', // 助力者头像
      assistantUserImgArr: [],
      countDown: {
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      tipShow: false,
      userInfo: {},
      activityStatus: 0, // 活动状态
      isPartnerOneself: true,
      helpTotalCount: 0,
      surplusTime: '', // 剩余时间
      is_help: false,
      guideShow: false,
      // givingPhone: '13558763340',
      givingPhone: '',
      isJoinActivity: false,
      shareObj: {},
      chest_rule: {},
      isJoinIn: false,
      isBanned: true
    };
  },
  computed: {
    mesBtn () {
      if (this.complete) {
        return '开启宝箱';
      } else if (!this.complete) {
        if (this.fail) {
          return '任务失败';
        } else {
          return '邀请好友助力';
        }
      }
    },
    complete () {
      if (this.helpTotalCount >= 5 && this.activityStatus === 4) {
        return true;
      } else {
        return false;
      }
    },
    fail () {
      if (this.activityStatus === 3) {
        return true;
      } else {
        return false;
      }
    },
    helperMes () {
      if (this.helpTotalCount === 5) {
        return '助力已满员';
      } else {
        // return '我已帮好友助力成功';
        return '友谊+1';
      }
    }
  },
  watch: {
  },
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  created () {
    if (this.isBanned) {
      MessageBox.alert('开宝箱活动已下线');
      return;
    }
    var s = document.createElement('script'); s.async = true; s.src = 'static/js/webtrends.load.js';
    var s2 = document.getElementsByTagName('script')[0]; s2.parentNode.insertBefore(s, s2);
    document.title = '[移动“合伙人”] 帮好友开宝箱';
    Indicator.close();
    // 活动说明富文本接口
    this.getChestRule();
    let srcInfo = getSession('ptSourceInfo', true);
    if (srcInfo) {
      this.userInfo = srcInfo.userInfo;
      if (!this.userInfo) {
        this.userInfo = {};
      }
      console.log('userInfo', this.userInfo);
    } else {
      console.log('没有获取到用户信息');
      closeIllegalPage(this);
      return;
    }
    // 掌厅进入页面获取openId
    if (!this.userInfo.openid) {
      this.userInfo.openid = getSession('ptPublicOpenId');
    }
    // 默认进入页面隐藏分享菜单
    let that = this;
    this.shareObj = {
      title: '2G免费流量向您飞来！',
      desc: '对于四川移动“合伙人”，2G不多，5人太少',
      link: `${window.location.origin + baseUrl}/register/wx/oAuth/userInfo?info=chestbaoxiang${this.$route.query.p}baoxiang${this.userInfo.openid}`,
      imgUrl: `${window.location.origin + baseUrl}/partner/static/img/activity/chest_share.png`,
      timelineTitle: '移动合伙人向您砸来2G免费流量',
      hideList: [
        'menuItem:share:qq',
        'menuItem:share:weiboApp',
        'menuItem:share:appMessage',
        'menuItem:share:timeline',
        'menuItem:favorite',
        'menuItem:share:facebook',
        'menuItem:share:QZone',
        'menuItem:copyUrl',
        'menuItem:openWithSafari',
        'menuItem:openWithQQBrowser',
        'menuItem:share:email'
      ],
      excuteFn: () => {
        that.joinActivity();
      },
      success: () => {
        this.tipShow = false;
        Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_chestActivity_share', 'WT.si_n', 'gpas_share', 'WT.si_x', '99'] });
        that.shareSuc();
      },
      cancel: () => {
        that.shareFail();
      }
    };
    getJsApiConfig(this.shareObj);
    // 从掌厅进入默认加载页面
    if (!isWechatBoolean) that.joinActivity();
  },
  mounted () {
    if (this.$route.query.shareP) {
      let timer = setInterval(() => {
        if (typeof Webtrends !== 'undefined') {
          clearInterval(timer);
          Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_chestActivity_sharePage', 'WT.event', 'gpas_share_page'] });
        }
      }, 100);
    }
  },
  methods: {
    // 活动说明富文本
    getChestRule () {
      let url = baseUrl + '/richText/get';
      let params = Qs.stringify({
        code: 'CHEST_RULE'
      });
      url = url + '?' + params;
      let rtnObj = {};
      let reqParams = getRequestParams(url, '', (vue, json) => {
        Indicator.close();
        if (json && '' + json.status === '0' && '' + json.data.enabled === '0') {
          rtnObj.name = json.data.name;
          rtnObj.code = json.data.remark;
          rtnObj.detail = json.data.detail;
        } else {
        }
        vue.chest_rule = rtnObj;
      }, (vue, ex) => {
        Indicator.close();
      }, '');
      Indicator.open();
      sendGetRequest(this, reqParams);
    },
    // 进入活动页面接口
    joinActivity () {
      let url = '';
      if (this.$route.query.shareP) {
        url = `${baseUrl}/treasureBox/helperIndex`; // 合伙人开宝箱进入活动页面
      } else {
        url = `${baseUrl}/treasureBox/partnerIndex`; // 助力人开宝箱进入活动页面
      }
      let params = {
        'partner_phone': this.$route.query.shareP || this.$route.query.p,
        'helper_open_id': this.userInfo.openid
      };
      let reqParams = getRequestParams(url, params, this.getActStateSuc, this.failRequest, '');
      Indicator.open();
      sendJsonPostRequest(this, reqParams);
    },
    getActStateSuc (vue, json) {
      Indicator.close();
      this.isJoinIn = true;
      if (json.status === 0) {
        this.activityStatus = json.data.activityStatus;
        this.isPartnerOneself = json.data.is_partner_oneself;

        this.helpTotalCount = json.data.helpTotalCount;
        // 判断是否达到上限
        if (json.data.is_partner_oneself) {
          this.isJoinActivity = json.data.isJoinActivity;
        }
        // 倒计时
        if (json.data.surplusTime !== '') {
          this.surplusTime = json.data.surplusTime;
          // 判断倒计时
          this.getCountDown();
        }
        // 是否助力过
        if (json.data.is_help) {
          this.is_help = json.data.is_help;
        }
        // 助力的好友
        if (json.data.helperList && json.data.helperList.length > 0) {
          let arr = [];
          for (const item in json.data.helperList) {
            if (json.data.helperList.hasOwnProperty(item)) {
              arr.push(json.data.helperList[item].helperHeadImg);
            }
          }
          this.assistantUserImgArr = arr;
        }
        // 5人助力完成后
        if (json.data.activityStatus === 4) {
          this.drawPostage = json.data.drawPostage;
          if (this.drawPostage) {
            this.isOpen = true;
            this.givingPhone = json.data.givingPhone;
          }
          this.isRulePhone = json.data.isSichuanMobile;
        }
        // 判断显示菜单的情况
        if (this.isPartnerOneself) {
          if (this.isJoinActivity || this.activityStatus !== 1) {
            console.log(333);
            wx.showMenuItems({
              menuList: [
                'menuItem:share:appMessage',
                'menuItem:share:timeline',
                'menuItem:favorite'
              ]
            });
          }
        }
      } else {
        // 处理异常情况
        if (json.msg.indexOf('系统不存在该合伙人') >= 0) {
          this.activityStatus = 1;
        } else {
          // 活动下线或者参加其他活动，退出活动
          if (json.msg.indexOf('活动已下线') >= 0 || json.msg.indexOf('您已在其他渠道参与该活动') >= 0) {
            if (getSession('chestSouce') && getSession('chestSouce') === 'activity') {
              let that = this;
              MessageBox.alert(json.msg).then(() => {
                pageRouter(that, { path: '/activity', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } }, 'replace');
              });
            } else {
              MessageBox.alert(json.msg).then(() => {
                closePage();
              });
            }
          } else {
            MessageBox.alert(json.msg);
          }
        }
      }
    },
    openChest () {
      // 如果四川移动手机号直接领取流量，如果异网先打开宝箱
      if (this.isRulePhone) {
        this.getDrawPostage();
      } else {
        this.isShake = true;
      };
    },
    // 点击分享按钮
    shareChest () {
      // 判断非微信链接登录的有没有绑定openId
      if (!this.isJoinActivity && this.activityStatus === 1) {
        MessageBox.alert('亲~开宝箱领流量活动今天已达上限，敬请期待下一波');
        return;
      }
      if (!isWechatBoolean) {
        if (!this.userInfo.openid || this.userInfo.openid === 'null') {
          this.guideShow = true;
        } else {
          let shareObj = {
            shareTitle: '2G免费流量向您飞来！',
            shareDesc: '对于四川移动“合伙人”，2G不多，5人太少',
            shareLink: `${window.location.origin + baseUrl}/register/wx/oAuth/userInfo?info=chestbaoxiang${this.$route.query.p}baoxiang${this.userInfo.openid}`,
            sharePic: `${window.location.origin + baseUrl}/partner/static/img/activity/chest_share.png`
          };
          handleShare(this, shareObj);
          this.shareSuc();
        }
      } else {
        this.tipShow = true;
      }
    },
    closeTipLayer () {
      this.tipShow = false;
    },
    shareSuc () {
      if (this.activityStatus === 1) {
        let url = `${baseUrl}/treasureBox/share`; // 开宝箱进入活动页面
        let params = {
          'partner_phone': this.$route.query.p
        };
        let reqParams = getRequestParams(url, params, this.saveShareSuc, this.failRequest, '');
        Indicator.open();
        sendJsonPostRequest(this, reqParams);
      }
    },
    saveShareSuc (vue, json) {
      Indicator.close();
      if (json.status === 0) {
        this.activityStatus = 2;
        this.surplusTime = 86400000;
        this.getCountDown();
        // 判断如果非掌厅分享成功后不用toast提示，避免和掌厅冲突闪退
        if (isWechatBoolean) {
          Toast({ message: '分享成功', position: 'bottom', duration: 1500 });
        }
      } else {
        Toast({ message: json.msg, position: 'bottom', duration: 1500 });
      }
    },
    shareFail () {
      Toast({ message: '取消分享', position: 'bottom', duration: 1500 });
    },
    // 倒计时
    getCountDown () {
      let leftTime = Math.floor(this.surplusTime / 1000);
      this.countDown.hours = Math.floor(leftTime / 60 / 60 % 24) < 10 ? '0' + Math.floor(leftTime / 60 / 60 % 24) : Math.floor(leftTime / 60 / 60 % 24);
      this.countDown.minutes = Math.floor(leftTime / 60 % 60) < 10 ? '0' + Math.floor(leftTime / 60 % 60) : Math.floor(leftTime / 60 % 60);
      this.countDown.seconds = Math.floor(leftTime % 60) < 10 ? '0' + Math.floor(leftTime % 60) : Math.floor(leftTime % 60);
      this.doCount(leftTime);
    },
    doCount (leftTime) {
      let that = this;
      let timer = setInterval(() => {
        if (leftTime === 0) {
          clearInterval(timer);
        }
        that.countDown.hours = Math.floor(leftTime / 60 / 60 % 24) < 10 ? '0' + Math.floor(leftTime / 60 / 60 % 24) : Math.floor(leftTime / 60 / 60 % 24);
        that.countDown.minutes = Math.floor(leftTime / 60 % 60) < 10 ? '0' + Math.floor(leftTime / 60 % 60) : Math.floor(leftTime / 60 % 60);
        that.countDown.seconds = Math.floor(leftTime % 60) < 10 ? '0' + Math.floor(leftTime % 60) : Math.floor(leftTime % 60);
        leftTime--;
      }, 1000);
    },
    // 助力
    giveLove () {
      if (this.activityStatus === 1) {
        MessageBox.alert('该页面已失效，需要合伙人分享新的链接');
        return;
      }
      let url = `${baseUrl}/treasureBox/help`; // 开宝箱进入活动页面
      let params = {
        'partner_phone': this.$route.query.shareP,
        'helper_open_id': this.userInfo.openid,
        'helper_nick_name': this.userInfo.nickname,
        'helper_head_img': this.userInfo.headimgurl
      };
      let reqParams = getRequestParams(url, params, this.helpSuc, this.failRequest, '');
      Indicator.open();
      sendJsonPostRequest(this, reqParams);
    },
    helpSuc (vue, json) {
      Indicator.close();
      if (json.status === 0) {
        if (json.data.helpStatus === 0) {
          let arr = [];
          for (const item in json.data.helperList) {
            if (json.data.helperList.hasOwnProperty(item)) {
              arr.push(json.data.helperList[item].helperHeadImg);
            }
          }
          this.assistantUserImgArr = arr;
          this.is_help = true;
          this.helpTotalCount = json.data.helpTotalCount;
        } else {
          MessageBox.alert('助力失败，请刷新页面重新助力');
        }
      } else {
        MessageBox.alert(json.msg);
      }
    },
    // 领取流量
    getDrawPostage () {
      if (!this.isRulePhone) {
        if (this.drawPostage) {
          Toast({ message: '您已赠送过号码流量，不能重复赠送', position: 'bottom', duration: 1500 });
          return;
        }
        if (this.givingPhone === '') {
          Toast({ message: '请输入赠送的四川移动手机号码', position: 'bottom', duration: 1500 });
          return;
        }
        if (this.givingPhone.length !== 11) {
          Toast({ message: '赠送的手机号码必须为11位号码', position: 'bottom', duration: 1500 });
          return;
        }
        let myreg = /^1(3[4-9]|4[7]|5[012789]|7[8]|8[23478]|9[8]|064[78])\d{8}$/;
        if (!myreg.test(this.givingPhone)) {
          Toast({ message: '请输入正确的四川移动手机号', position: 'bottom', duration: 1500 });
          return;
        }
      }
      let url = `${baseUrl}/treasureBox/drawPostage`; // 开宝箱进入活动页面
      let params = {
        'partner_phone': this.$route.query.p,
        'giving_phone': this.givingPhone || this.$route.query.p,
        'route_phone': '13880451171'
      };
      let reqParams = getRequestParams(url, params, this.drawPostageSuc, this.failRequest, '');
      Indicator.open();
      sendJsonPostRequest(this, reqParams);
    },
    drawPostageSuc (vue, json) {
      Indicator.close();
      if (json.status === 0) {
        if (json.data.ROOT.RETURN_CODE !== 0) {
          Toast({ message: json.data.ROOT.USER_MSG, position: 'bottom', duration: 1500 });
        } else {
          this.isShake = true;
          this.drawPostage = true;
          // Toast({ message: '恭喜你，领取流量成功！', position: 'bottom', duration: 1500 });
        }
      } else {
        MessageBox.alert(json.msg);
      }
    },
    failRequest (vue, json) {
      Indicator.close();
      Toast({ message: '网络故障', position: 'bottom', duration: 1500 });
    },
    // 开宝箱动画停止情况
    openStop () {
      let that = this;
      this.isOpen = true;
      setTimeout(() => {
        that.isShow = false;
        that.isBlur = true;
      }, 200);
    },
    actGuide () {
      this.guideShow = true;
    },
    closeActLayer () {
      this.guideShow = false;
    },
    toIntroduce () {
      location.href = `https://gp.palmte.cn${baseUrl}/home/gpas_introduction.html`;
    },
    hideMenuItems () {
      wx.hideMenuItems({
        menuList: [
          'menuItem:share:qq',
          'menuItem:share:weiboApp',
          'menuItem:share:appMessage',
          'menuItem:share:timeline',
          'menuItem:favorite',
          'menuItem:share:facebook',
          'menuItem:share:QZone',
          'menuItem:copyUrl',
          'menuItem:openWithSafari',
          'menuItem:openWithQQBrowser',
          'menuItem:share:email'
        ]
      });
    },
    prevDef: function (e) {
      e.stopPropagation();
      e.preventDefault();
    }
  }
};
</script>
<style>
.marginTop15 {
  margin-top: 15px;
}
.marginTop20 {
  margin-top: 20px;
}
.paddingTop15 {
  padding-top: 15px;
}
.paddingTop20 {
  padding-top: 20px;
}
.mod-chest {
  position: relative;
  width: 100%;
}
.mod-chest .chest-close {
  width: 300px;
  height: 182px;
  opacity: 0;
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 0px;
  margin-left: -150px;
}

.mod-chest .chest-open {
  width: 300px;
  height: 182px;
  background: url(../assets/activity/chest.png) no-repeat 0 -180px;
  background-size: 300px auto;
  opacity: 0;
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 0px;
  margin-left: -150px;
}

.mod-chest .show {
  z-index: 2;
  opacity: 1;
}

.activity {
  width: 100%;
  min-height: 100%;
  background: linear-gradient(to bottom, #ef4a44 100%, #f64955 100%);
  box-sizing: border-box;
}
.activity .activity-logo {
  padding: 15px 0 0 15px;
}
.activity .activity-logo img {
  width: 92px;
  height: 30px;
}
.activity .activity-chestTile {
  margin-top: 20px;
  text-align: center;
}
.activity .activity-chestTile img {
  width: 300px;
}
.activity .activity-chestTile p {
  padding-top: 12px;
  color: #fff;
  font-size: 10px;
}
.activity-chest {
  width: 100%;
  padding-top: 15px;
  box-sizing: border-box;
}

.open-has {
  position: relative;
  z-index: 2;
  height: 204px;
  width: 100%;
  margin: 0px auto;
}

.mod-chest .chest-close .gift {
  width: 300px;
  height: 182px;
  background: url(../assets/activity/chest.png) no-repeat 0px 0px;
  background-size: 300px auto;
  position: absolute;
  left: 0;
  top: 0px;
  z-index: 1;
}
.mod-chest .chest-close .chest-back {
  width: 300px;
  height: 120px;
  background: url(../assets/activity/chest_back.png) no-repeat 0px 0px;
  background-size: 300px auto;
  position: absolute;
  left: 0px;
  top: 48px;
}

.mod-chest .chest-close.shake .gift {
  animation: shake 1.2s linear;
  animation-fill-mode: forwards;
}

.mod-chest .chest-close .share {
  width: 250px;
  height: 45px;
  text-align: center;
  line-height: 45px;
  color: #fb1b1c;
  font-size: 20px;
  background: #ffbd3e;
  border-radius: 100px;
  box-shadow: 0 8px 0 0 #ff813a;
  position: absolute;
  left: 25px;
  top: 150px;
  z-index: 2;
}
.mod-chest .chest-close .share:active {
  background: #d39d3a;
}
.mod-chest .chest-close .share .left {
  position: absolute;
  width: 60px;
  top: 4px;
  left: 4px;
}
.mod-chest .chest-close .share .right {
  position: absolute;
  width: 60px;
  bottom: 4px;
  right: 4px;
}
/* 助力失败时 */
.activity .chest-close .fail {
  width: 250px;
  height: 45px;
  text-align: center;
  line-height: 45px;
  color: #fff;
  font-size: 20px;
  border-radius: 100px;
  box-shadow: 0 8px 0 0 #999;
  position: absolute;
  left: 25px;
  top: 150px;
  z-index: 2;
  background: #bbb;
}
.activity .chest-close .fail .left {
  position: absolute;
  width: 60px;
  top: 4px;
  left: 4px;
}
.activity .chest-close .fail .right {
  position: absolute;
  width: 60px;
  bottom: 4px;
  right: 4px;
}
.open-has.opened .mod-chest .chest-open {
  transform: translate(0px, 0);
}
.mod-chest .chest-open.blur {
  width: 300px;
  height: 182px;
  background: url(../assets/activity/chest-open-blur.png) no-repeat 0px 0px;
  background-size: 300px auto;
  /* position: relative; */
  z-index: 1;
  position: absolute;
  left: 50%;
  top: 0px;
  margin-left: -150px;
}
/* 助力时倒计时 */
.activity .activity-countDown {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #fff;
}
/* 助力失败 */
.activity .activity-failReason {
  width: 246px;
  height: 80px;
  margin: 0 auto;
  margin-top: 15px;
}
.activity .activity-failReason p {
  width: 100%;
  text-align: center;
  color: #fff;
  font-size: 20px;
}
.activity .activity-failGuide {
  margin: 0 auto;
  margin-top: 15px;
  width: 84%;
  height: 75px;
  text-align: center;
  padding: 15px 10px;
  /* display: inline-block; */
  border: 2px dashed #fff;
  font-size: 15px;
}
.activity .activity-countDown span {
  display: inline-block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  background: #ffbd3e;
  color: #fff;
  font-size: 14px;
  margin: 0 10px;
  border-radius: 5px;
}

/* 助力成功时开宝箱 */
.activity .activity-done-introduce {
  margin: 0 auto;
  text-align: center;
  width: 84%;
  height: 50px;
  line-height: 25px;
  font-size: 13px;
  color: #fff;
  font-family: monospace;
}
.activity .activity-done-givePhone {
  width: 80%;
  height: 45px;
  margin: 12px auto;
  border-radius: 10px;
  color: #999;
}
.activity .activity-done-givePhone input {
  width: 100%;
  height: 45px;
  border-radius: 10px;
  padding-left: 8px;
  font-size: 14px;
}
.activity .activity-done-givePhone input::placeholder {
  color: #999;
  padding-left: 8px;
  font-size: 14px;
}
.activity .activity-done-giveBtn {
  width: 80%;
  height: 45px;
  margin: 12px auto;
  border-radius: 10px;
}
.activity .activity-btnStyle {
  width: 100%;
  height: 45px;
  border-radius: 10px;
  background: #ffbd3e;
  border: 0;
  font-size: 18px;
  color: #fb1b1c;
}

/*助力信息*/
.activity .activity-pannel {
  background: #fff;
  margin: 20px auto 0;
  width: 84%;
  min-height: 200px;
  border-radius: 5px;
}
.activity .activity-pannel-fail {
  background: #fff;
  margin: 20px auto 0;
  width: 84%;
  height: 110px;
  border-radius: 5px;
}
.activity .activity-pannel-fail .activity-count {
  padding-top: 20px;
  color: #333;
  text-align: center;
  font-size: 12px;
}

.activity .activity-pannel-helper {
  background: #fff;
  margin: 20px auto 0;
  width: 84%;
  height: 265px;
  border-radius: 5px;
}
.activity .activity-helperCount {
  margin: 0 auto;
  margin-top: 20px;
  margin-bottom: 25px;
  color: #333;
  font-size: 14px;
  text-align: center;
}
.activity .activity-header {
  width: 100%;
  text-align: center;
}
.activity .activity-header .activity-header-userImg {
  padding-top: 15px;
}
.activity .activity-header .activity-header-nickName {
  color: #333;
  font-size: 12px;
}
.activity .activity-header p img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
.activity .activity-introduce {
  margin-top: 10px;
}
.activity .activity-introduce p {
  text-align: center;
  color: #333;
  font-size: 12px;
}
.activity .activity-shareInfo {
  margin-top: 15px;
  text-align: center;
}
.activity .activity-shareInfo img {
  width: 40px;
  height: 40px;
  margin: 0 5px;
  border-radius: 50%;
}

.activity .activity-helperBtn {
  width: 80%;
  margin: 15px auto;
}
.activity .activity-helpSuc {
  text-align: center;
  font-size: 18px;
  color: #333;
  font-weight: bold;
}
/* 活动规则 */
.activity .activity-rule-title {
  width: 90px;
  height: 40px;
  background: url(../assets/activity/rule.png) no-repeat 0px 10px;
  background-size: 90px auto;
  margin: 0 auto;
  margin-top: 10px;
  padding-bottom: 10px;
  overflow-y: auto;
  word-break: break-all;
  overflow-x: hidden;
}
.activity .activity-rule p {
  padding: 5px 10px;
  font-size: 12px;
  color: #333;
}
.activity .activity-rule p:first-child {
  padding-top: 15px;
}
.redColor {
  color: #fb1b1c;
}
/* 助力人参加活动导航 */
.tip-joinActGuide {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding-top: 60px;
  z-index: 999999;
  overflow: hidden;
}
.tip-joinActGuide * {
  user-select: none;
}
.tip-joinActGuide .connect-guide {
  width: 260px;
  height: 392px;
  position: relative;
  left: 50%;
  top: calc(50% - 60px);
  margin-left: -130px;
  margin-top: -196px;
}
.tip-joinActGuide .connect-guide .connect-guide-toIntroduce {
  width: 130px;
  height: 30px;
  position: absolute;
  bottom: 3px;
  right: 5px;
  background: transparent;
}
.tip-joinActGuide .connect-guide .connect-guide-img {
  width: 100%;
  height: 392px;
}
.line {
  position: absolute;
  bottom: -10px;
  left: calc(50% - 1px);
  width: 2px;
  height: 10px;
  background: #fff;
}
.tip-joinActGuide .close-btn {
  position: absolute;
  left: calc(50% - 25px);
  bottom: -60px;
  width: 50px;
  height: 50px;
  text-align: center;
  cursor: pointer;
}
.tip-joinActGuide .close-btn img {
  width: 30px;
  height: 30px;
}
/* 分享蒙层 */
.tip-layer {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding-top: 60px;
  z-index: 999999;
  overflow: hidden;
}
.tip-layer * {
  user-select: none;
}
.tip-layer .close-btn {
  position: absolute;
  left: 0;
  top: 0;
  width: 50px;
  height: 50px;
  padding: 13px;
  cursor: pointer;
}
.tip-layer .close-btn img {
  width: 24px;
  height: 24px;
}
.tip-layer .top-tip {
  width: 80%;
  position: absolute;
  right: 0;
  top: 0;
  left: 0;
  bottom: 0;
  margin: auto;
}
.tip-layer .top-tip img {
  width: 100%;
}
/* .tip-layer .connect-string {
  width: 55px;
  height: 55px;
  position: absolute;
  right: 66px;
  transform: rotate(17deg);
  top: 40px;
}
.tip-layer .pointer-hand {
  width: 30px;
  height: 40px;
  position: absolute;
  right: 20px;
  top: 10px;
  animation: jump 0.5s linear infinite;
} */
.hengxian {
  display: inline-block;
  width: 15px;
  height: 1px;
  background: #fff;
  vertical-align: middle;
}

@keyframes move {
  0% {
    -webkit-transform: translate(0px, 0px);
  }
  100% {
    -webkit-transform: translate(0px, -5px);
  }
}

@keyframes shake {
  0% {
    transform: scale(1);
    -webkit-transform: scale3d(1, 1, 1);
  }
  6% {
    -webkit-transform: scale(0.9) rotate(-8deg);
    -webkit-transform: scale3d(1, 1, 1) rotate(0, 0, 1, -8deg);
  }
  18%,
  30%,
  42% {
    -webkit-transform: scale(1.1) rotate(8deg);
    -webkit-transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 8deg);
  }
  12%,
  24%,
  36%,
  48% {
    -webkit-transform: scale(1.1) rotate(-8deg);
    -webkit-transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -8deg);
  }
  54% {
    -webkit-transform: scale(1);
    -webkit-transform: scale3d(1, 1, 1);
  }
  60% {
    -webkit-transform: scale(1);
    -webkit-transform: scale3d(1, 1, 1);
  }
  100% {
    -webkit-transform: scale(1) translate(0px, 0);
    -webkit-transform: scale3d(1, 1, 1) translate3d(0px, 0, 0);
  }
}

.mint-indicator-wrapper {
  z-index: 999 !important;
}
</style>



