<template>
  <div class="family-member">
    <div class="family-member-roulette" ref="roulette">
      <!--
          speed: 动画持续时间（毫秒），默认300
          auto: 自动播放切换的时间间隔（毫秒），默认3000
          defaultIndex: 初始显示的轮播图的索引，默认0
          continuous: 是否可以循环播放，默认true
          showIndicators: 是否显示页码小圆点，默认true
          prevent: 是否在 touchstart 事件触发时阻止事件的默认行为。设为 true 可提高运行在低版本安卓浏览器时的性能，默认false
          stopPropagation: 是否在 touchstart 事件触发时阻止冒泡，默认false
      -->
      <mt-swipe
        class="img-wrap"
        :auto="4000"
        :speed="300"
        :defaultIndex="0"
        :continuous="true"
        :showIndicators="true"
        :prevent="false"
        :stopPropagation="false"
      >
        <mt-swipe-item v-if="banners.length === 0">
          <div class="no-img" v-if="isLoading">图片加载中</div>
          <div class="no-img" v-else>没有图片</div>
          <!-- <img v-else src="../../../assets/campuszone/1.png" class="no-img-img"> -->
        </mt-swipe-item>
        <mt-swipe-item
          :key="index"
          v-for="(item, index) in banners"
          @click.native="go($event, item.linkUrl)"
        >
          <img class="img" :src="item.picUrl" :alt="item.id" />
        </mt-swipe-item>
        <div class="clear-float"></div>
      </mt-swipe>
    </div>
    <div class="memberlist-section">
      <div class="memberlist-new-tip" v-if="pageType === 'new'">
        恭喜！您已成功开通合家欢业务，
        <br />请添加合家欢群组成员。
      </div>
      <div class="memberlist-title">
        群组成员
        <span class="red-color">（最多可添加9人含召集人）</span>
      </div>
      <div class="memberlist-add-row flex-row" v-if="mainPhone === selfPhone">
        <input type="text" class="memberlist-add-input" v-model="childPhone" maxlength="11" />
        <div class="memberlist-add-btn" @click="addMember">添加</div>
      </div>
      <div class="memberlist-content">
        <div class="memberlist-content-row flex-row">
          <div class="memberlist-content-row-phone">
            {{mainPhone}}
            <span class v-if="mainPhone === selfPhone">（我）</span>
          </div>
          <div class="memberlist-content-row-maintext">召集人</div>
        </div>
        <div v-for="(item, index) in memberList" class="memberlist-content-row flex-row">
          <div class="memberlist-content-row-phone">
            {{item}}
            <span class v-if="item === selfPhone">(我)</span>
          </div>
          <div class="memberlist-content-row-childtext">成员</div>
          <div
            class="memberlist-content-delete-btn"
            @click="deleteMember(item)"
            v-if="mainPhone === selfPhone"
          >
            <img src="static/img/family/familyMember_delete.png" alt />
          </div>
          <div
            class="memberlist-content-quit-btn"
            @click="quitMember(item)"
            v-if="mainPhone !== selfPhone"
          >退出</div>
        </div>
      </div>
    </div>
    <div class="tab-wrap">
      <div class="tab-items">
        <div
          class="tab-item"
          :class="{'tab-active': tabIndex === 0}"
          @click="tabSwitch($event, 0)"
        >活动详情</div>
        <div class="tab-item-line"></div>
        <div
          class="tab-item"
          :class="{'tab-active': tabIndex === 1}"
          @click="tabSwitch($event, 1)"
        >办理须知</div>
        <div class="clear-float"></div>
      </div>
      <div class="tab-content">
        <div
          class="tab-content-item content-left"
          v-if="tabIndex === 0 && /http/ig.test(result.detailUrl)"
        >
          <img :src="result.detailUrl" />
        </div>
        <div
          class="tab-content-item content-right"
          v-if="tabIndex === 0 && !/http/ig.test(result.detailUrl)"
        >
          <div style="color: #aaa;">（无）</div>
        </div>
        <div
          class="tab-content-item content-right"
          v-if="tabIndex === 1 && result.businessRule"
          v-html="result.businessRule"
        ></div>
        <div class="tab-content-item content-right" v-if="tabIndex === 1 && !result.businessRule">
          <div style="color: #aaa;">（无）</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  baseUrl,
  getRequestParams,
  sendGetRequest,
  Constants,
  sendJsonPostRequest,
  getJsApiConfig,
  isQQ,
  getSession,
  pageRouter
} from 'src/assets/utils.js';
import { Indicator, MessageBox, Toast } from 'mint-ui';
// import QRCode from 'qrcode';
// import Bus from 'src/assets/bus/bus';
export default {
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  data() {
    return {
      result: '',
      banners: [],
      isLoading: false,
      screenWidth: document.body.clientWidth,
      tabIndex: 0,
      inputPanelShow: false,
      inputMemberPanelShow: false,
      phone: '',
      sms: '',
      smsTip: '获取',
      isSending: false,
      partnerId: '',
      pageType: '',
      mainPhone: '',
      childPhone: '',
      selfPhone: '',
      memberList: []
    };
  },
  watch: {
    screenWidth(val) {
      this.$refs.roulette.style.height =
        this.$refs.roulette.offsetWidth * 0.48 + 'px';
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
        this.smsTip = '获取';
      }
    }
  },
  created() {
    if (isQQ()) {
      document.title = '成员管理';
    }
    if (this.$route.query.partnerId || this.$route.query.partnerId === 0) {
      this.partnerId = this.$route.query.partnerId;
    } else {
      let serverUserInfo = getSession('ptDetailInfo', true);
      if (serverUserInfo) {
        this.partnerId = serverUserInfo.id;
      }
    }
    let that = this;
    let shareObj = {
      excuteFn: () => {
        that.getDetail();
      }
    };
    getJsApiConfig(shareObj);
    let validated = getSession('familyValidateSuccess');
    if (!validated) {
      pageRouter(this, {
        path: '/familyDetail',
        query: { id: this.$route.query.id }
      });
    }
    this.selfPhone = this.$route.query.selfPhone;
    this.mainPhone = this.$route.query.mainPhone;
    this.pageType = this.$route.query.type;
  },
  mounted() {
    this.$refs.roulette.style.height =
      this.$refs.roulette.offsetWidth * 0.48 + 'px';
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth;
        this.screenWidth = window.screenWidth;
      })();
    };
  },
  methods: {
    prevDef: function(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    getMemberList: function() {
      let url = `${baseUrl}/vfamily/manage`;
      let params = {
        phone: this.selfPhone,
        // smsCode: this.sms,
        partnerId: this.partnerId,
        isCheck: ''
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          Indicator.close();
          if (json && '' + json.status === '0') {
            vue.mainPhone = json.data.mainPhone;
            vue.memberList = json.data.memberList;
          } else {
            // MessageBox.alert(json.msg).then(action => {
            //   pageRouter(this, {path: '/familyDetail', query: {id: this.$route.query.id}});
            // }).catch(ex => {
            //   pageRouter(this, {path: '/familyDetail', query: {id: this.$route.query.id}});
            // });
          }
        },
        (vue, ex) => {
          Indicator.close();
          Toast('异常: ' + ex);
        },
        ''
      );
      Indicator.open('获取成员中');
      sendJsonPostRequest(this, reqParams);
    },
    getDetail: function() {
      if (this.$route.query.id === undefined) {
        return;
      }
      let url = `${baseUrl}/packageSalary/query?id=${this.$route.query.id}`;
      let reqParams = getRequestParams(
        url,
        '',
        (vue, json) => {
          vue.isLoading = false;
          Indicator.close();
          console.log(json);
          if (json.status !== 0) {
            Toast('查询资费失败。' + json.msg);
            return;
          }
          this.getMemberList();
          vue.banners = json.data.bannerList;
          vue.result = json.data;
          document.title =
            vue.mainPhone === vue.selfPhone ? '成员管理' : '成员列表';
          let shareObj = {
            title: json.data.shareTitle,
            desc: json.data.shareBrief,
            link: `${window.location.origin +
              baseUrl}/common/redirect?info=path=familyDetaillistenid=${
              json.data.id
            }listenpartnerId=${this.partnerId}`,
            imgUrl: /^http/i.test(json.data.icon)
              ? json.data.icon
              : `${window.location.origin +
                  baseUrl}/partner/static/img/cmcc_logo.png`,
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
        },
        (vue, ex) => {
          vue.isLoading = false;
          document.title =
            vue.mainPhone === vue.selfPhone ? '成员管理' : '成员列表';
          Indicator.close();
          console.info(ex);
          Toast('网络异常');
        }
      );
      Indicator.open();
      this.isLoading = true;
      sendGetRequest(this, reqParams);
    },
    go: function(e, url) {
      e.stopPropagation();
      if (url) {
        window.location.href = url;
      }
    },
    tabSwitch: function(e, index) {
      e.stopPropagation();
      this.tabIndex = index;
    },
    addMember: function() {
      if (!Constants.cmccMobileReg.test(this.childPhone)) {
        Toast({ message: '请输入正确的移动手机号码！', duration: 1200 });
        return;
      }
      MessageBox.confirm(`您正在添加${this.childPhone}进入合家欢群组！`)
        .then(action => {
          console.log(action);
          if (action === 'confirm') {
            this.addMemberToServer();
          }
        })
        .catch(ex => {
          console.log(ex);
        });
    },
    addMemberToServer: function() {
      let url = `${baseUrl}/vfamily/memberHandle`;
      let params = {
        phone: this.mainPhone,
        childPhone: this.childPhone,
        type: 1,
        partnerId: this.partnerId
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          Indicator.close();
          if (json && '' + json.status === '0') {
            MessageBox.alert(`处理成功！对方回复短信同意后即可成功添加！`);
            vue.childPhone = '';
          } else {
            MessageBox.alert(json.msg);
          }
        },
        (vue, ex) => {
          Indicator.close();
          Toast('异常: ' + ex);
        },
        ''
      );
      Indicator.open('添加中');
      sendJsonPostRequest(this, reqParams);
    },
    quitMember: function(item) {
      MessageBox.confirm(`确认退出当前合家欢群组吗？`)
        .then(action => {
          console.log(action);
          if (action === 'confirm') {
            this.quitMemberToServer(item);
          }
        })
        .catch(ex => {
          console.log(ex);
        });
    },
    quitMemberToServer: function(item) {
      let url = `${baseUrl}/vfamily/memberHandle`;
      let params = {
        phone: this.mainPhone,
        childPhone: item,
        type: 2,
        partnerId: this.partnerId
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          Indicator.close();
          if (json && '' + json.status === '0') {
            MessageBox.alert(`您已退出合家欢群组！`)
              .then(action => {
                pageRouter(this, {
                  path: '/familyDetail',
                  query: { id: this.$route.query.id }
                });
              })
              .catch(ex => {
                pageRouter(this, {
                  path: '/familyDetail',
                  query: { id: this.$route.query.id }
                });
              });
          } else {
            MessageBox.alert(json.msg);
          }
        },
        (vue, ex) => {
          Indicator.close();
          Toast('异常: ' + ex);
        },
        ''
      );
      Indicator.open('退出中');
      sendJsonPostRequest(this, reqParams);
    },
    deleteMember: function(item) {
      MessageBox.confirm(`您正在从合家欢群组删除${item}！`)
        .then(action => {
          console.log(action);
          if (action === 'confirm') {
            this.deleteMemberToServer(item);
          }
        })
        .catch(ex => {
          console.log(ex);
        });
    },
    deleteMemberToServer: function(item) {
      let url = `${baseUrl}/vfamily/memberHandle`;
      let params = {
        phone: this.mainPhone,
        childPhone: item,
        type: 2,
        partnerId: this.partnerId
      };
      let reqParams = getRequestParams(
        url,
        params,
        (vue, json) => {
          Indicator.close();
          if (json && '' + json.status === '0') {
            MessageBox.alert(`您已成功删除成员${item}！`);
            window.location.reload();
          } else {
            MessageBox.alert(json.msg);
          }
        },
        (vue, ex) => {
          Indicator.close();
          Toast('异常: ' + ex);
        },
        ''
      );
      Indicator.open('删除中');
      sendJsonPostRequest(this, reqParams);
    }
  }
};
</script>

<style lang="less">
body {
  background: #f0f0f0;
}
.family-member {
  background: #ffffff;
  min-height: 100%;
  max-width: 550px;
  min-width: 270px;
  margin: 0 auto;
  .family-member-roulette {
    position: relative;
    width: 100%;
  }
  .img-wrap {
    height: 100%;
    width: 100%;
  }
  .img-wrap .img {
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .no-img {
    width: 100%;
    position: absolute;
    top: 40%;
    color: #dfdfdf;
    font-size: 22px;
    font-family: "幼圆";
    font-weight: bold;
    text-align: center;
  }
  .no-img-img {
    height: 100%;
    position: absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
  }
  .memberlist-section {
    margin: 5px 0;
    .memberlist-new-tip {
      font-size: 14px;
      margin-top: 10px;
      text-align: center;
    }
    .memberlist-title {
      margin: 15px 20px;
      font-size: 12px;
    }
    .red-color {
      color: #dc2513;
    }
    .memberlist-add-row {
      height: 35px;
      line-height: 35px;
      margin: 0 20px;
      .memberlist-add-input {
        flex: 1 1 auto;
        margin-right: 20px;
        line-height: 1.5;
        padding: 0 10px;
      }
      .memberlist-add-btn {
        width: 60px;
        background-color: #3d8cf7;
        color: #fff;
        font-size: 13px;
        text-align: center;
      }
    }
    .memberlist-content {
      margin: 10px 20px;
      font-size: 14px;
      .memberlist-content-row {
        margin-top: 10px;
      }
      .memberlist-content-row-phone {
        flex: 1 1 auto;
        line-height: 25px;
      }
      .memberlist-content-row-maintext {
        margin-right: 80px;
        color: #3d8cf7;
        line-height: 25px;
      }
      .memberlist-content-row-childtext {
        line-height: 25px;
        /* margin-right: 40px; */
      }
      .memberlist-content-delete-btn {
        height: 21px;
        margin: 2px 0 2px 65px;
        img {
          height: 100%;
        }
      }
      .memberlist-content-quit-btn {
        width: 50px;
        height: 25px;
        margin-left: 40px;
        line-height: 25px;
        font-size: 13px;
        text-align: center;
        color: #fff;
        background: #fc7063;
        border-radius: 8px;
      }
    }
  }

  .tab-wrap,
  .tab-items {
    position: relative;
  }
  .tab-items {
    display: flex;
    border-top: 1px solid #ccc;
  }
  .tab-item-line {
    width: 1px;
    height: 26px;
    background-color: #ccc;
    margin: 7px 0;
  }
  .tab-wrap .tab-items .tab-item {
    flex: 1 1 50%;
    text-align: center;
    height: 40px;
    line-height: 40px;
    margin: 0 5%;
    color: #333;
    border-bottom: 2px solid rgba(0, 0, 0, 0);
  }
  .tab-wrap .tab-items .tab-item.tab-active {
    border-bottom: 2px solid #3d8cf7;
    color: #3d8cf7;
  }
  .tab-wrap .tab-content {
    position: relative;
    width: 100%;
  }
  .tab-wrap .tab-content .tab-content-item {
    width: 100%;
    position: relative;
  }
  .tab-wrap .tab-content .tab-content-item.content-right {
    padding: 10px;
  }
  .tab-wrap .tab-content .tab-content-item img,
  .tab-wrap .tab-content .tab-content-item p,
  .tab-wrap .tab-content .tab-content-item table,
  .tab-wrap .tab-content .tab-content-item div {
    max-width: 100% !important;
  }
  .tab-wrap .tab-content .tab-content-item img {
    margin-bottom: -10%;
    padding: 0;
    pointer-events: none;
  }
}
</style>
