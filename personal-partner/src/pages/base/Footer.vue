<template>
  <div class="footer flex-row" v-if="!isNoFooter">
    <div class="footer-item" v-for="(item, key) in footerList" :key="key">
      <div class="footer-img-wrap" @click="gotoPage(item.path, key)">
        <div class="footer-red-dot" v-if="item.redDot"></div>
        <img :src="item.icon">
      </div>
    </div>
    <div class="footer-cover" @touchmove="prevDef($event)" v-if="showFooterCover"></div>
  </div>
</template>

<script>
  import { hideMenuItems, pageRouter, getStorage, saveStorage, sourceType, isWechat, getSession } from 'src/assets/utils';
  import Bus from 'src/assets/bus/bus';

  export default {
    props: {
      showFooterCover: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        selectedTab: 'shop',
        isNoFooter: true,
        phoneNumber: this.$route.query.p,
        footerList: {
          shop: {
            icon: 'static/img/common/DP.png',
            path: '/index'
          },
          order: {
            icon: 'static/img/common/DD.png',
            path: '/orderList'
          }
        },
        pathMapping: {
          '/index': 'shop',
          '/withdraw': 'shop',
          '/rule': 'shop',
          '/moneyStrategy': 'shop',
          '/introduce': 'shop',
          '/orderList': 'order',
          '/logistics': 'order',
          '/tradeDetail': 'trade',
          '/statistics': 'statistics'
        },
        isZW: false,
        roleType: 3
      };
    },
    components: {
    },
    watch: {
      '$route'(to, from) {
        hideMenuItems();
        this.tabSelected();
      }
    },
    created() {
      this.isNoFooter = !this.$route.query.p;
      let srcInfo = getSession('ptSourceInfo', true);
      if (srcInfo) {
        this.userInfo = srcInfo.userInfo;
        if (sourceType === 'zhuangwei' || (sourceType === 'dzg' && !isWechat() && this.userInfo.realName)) {
          this.isZW = true;
        }
      }
      let serverUserInfo = getSession('ptDetailInfo', true); // 获取服务器返回的用户信息
      if (serverUserInfo) {
        this.roleType = serverUserInfo.roleType;
      }
      if (this.roleType === 3) {
        delete this.footerList.trade;
        this.footerList.statistics = {
          icon: 'static/img/common/TJ.png',
          path: '/statistics'
        };
      } else {
        this.footerList.trade = {
          icon: 'static/img/common/SY.png',
          path: '/tradeDetail'
        };
      }
      wx.ready(() => {
        hideMenuItems();
      });
      this.tabSelected();
      /*
       *  声明事件，控制红点显示/隐藏
       */
      Bus.$on('on-footer-tab-select', obj => {
        if (obj.preFn) {
          obj.preFn();
        }
        setTimeout(() => {
          this.footerList[obj.tabName].redDot = obj.isShow();
        }, 10);
      });
    },
    methods: {
      prevDef: function (e) {
        e.stopPropagation();
        e.preventDefault();
      },
      tabSelected: function() {
        let selectedTab = this.pathMapping[this.$route.path];
        if (!selectedTab) {
          return;
        }
        this.footerList = {
          shop: {
            icon: 'static/img/common/DP.png',
            path: '/index',
            // redDot: (!this.isZW && getStorage('pt_shop_introduce_red_dot_' + this.$route.query.p, true)) || getStorage('pt_shop_rule_red_dot_' + this.$route.query.p, true) || !getStorage('pt_shop_act_red_dot_clicked_' + this.$route.query.p, true)
            redDot: (!this.isZW && getStorage('pt_shop_introduce_red_dot_' + this.$route.query.p, true)) || getStorage('pt_shop_rule_red_dot_' + this.$route.query.p, true)
          },
          order: {
            icon: 'static/img/common/DD.png',
            path: '/orderList',
            redDot: getStorage('pt_order_0_red_dot_' + this.$route.query.p, true) || getStorage('pt_order_1_red_dot_' + this.$route.query.p, true) || getStorage('pt_order_2_red_dot_' + this.$route.query.p, true) || getStorage('pt_order_3_red_dot_' + this.$route.query.p, true)
          }
        };
        if (this.roleType === 3) {
          this.footerList.statistics = {
            icon: 'static/img/common/TJ.png',
            path: '/statistics'
          };
        } else {
          this.footerList.trade = {
            icon: 'static/img/common/SY.png',
            path: '/tradeDetail',
            redDot: getStorage('pt_trade_red_dot_' + this.$route.query.p, true)
          };
        }
        if (this.footerList[selectedTab]) {
          let iconPath = this.footerList[selectedTab].icon.replace('.png', '');
          this.footerList[selectedTab].icon = iconPath + '_selected.png';
        }
      },
      gotoPage: function(path, key) {
        // console.log(key);
        if (key === 'shop') { // 首页
          Bus.$emit('on-footer-tab-select', {
            tabName: key,
            isShow: () => {
              // return (!this.isZW && getStorage('pt_shop_introduce_red_dot_' + this.$route.query.p, true)) || getStorage('pt_shop_rule_red_dot_' + this.$route.query.p, true) || !getStorage('pt_shop_act_red_dot_clicked_' + this.$route.query.p, true);
              return (!this.isZW && getStorage('pt_shop_introduce_red_dot_' + this.$route.query.p, true)) || getStorage('pt_shop_rule_red_dot_' + this.$route.query.p, true);
            }
          });
        } else if (key === 'order') { // 订单页
          Bus.$emit('on-footer-tab-select', {
            tabName: key,
            isShow: () => {
              return getStorage('pt_order_0_red_dot_' + this.$route.query.p, true) || getStorage('pt_order_1_red_dot_' + this.$route.query.p, true) || getStorage('pt_order_2_red_dot_' + this.$route.query.p, true) || getStorage('pt_order_3_red_dot_' + this.$route.query.p, true);
            }
          });
        } else if (key === 'trade') { // 收益页
          Bus.$emit('on-footer-tab-select', {
            tabName: key,
            isShow: () => {
              return getStorage('pt_trade_red_dot_' + this.$route.query.p, true);
            },
            preFn: () => {
              saveStorage('pt_trade_red_dot_' + this.$route.query.p, false);
            }
          });
        }
        pageRouter(this, {path: path, query: {p: this.$route.query.p, ptid: this.$route.query.ptid}});
      }
    }
  };
</script>
<style>
  .footer {
    height: 50px;
    width: 100%;
    position: fixed;
    bottom: 0;
    background-color: #fff;
    border-top: 1px solid #ddd;
    z-index: 10;
    img {
      pointer-events: none;
    }
    .footer-item {
      height: 100%;
      flex: 1;
      text-align: center;
      padding: 10px 0 5px 0;
    }
    .footer-img-wrap {
      height: 100%;
      display: inline-block;
      cursor: pointer;
      position: relative;
    }
    .footer-item img {
      height: 100%;
    }
    .flex-row {
      display: -webkit-box;
      display: -webkit-flex;
      display: box;
      display: flex;
      display: -ms-flex;
    }
    .footer-red-dot {
      border-radius: 100%;
      border: 1px solid #ff6d6f;
      width: 9px;
      height: 9px;
      background: #ff6d6f;
      position: absolute;
      top: -4px;
      right: -12px;
    }
    .footer-cover {
      position: absolute;
      top: -1px;
      left: 0;
      background: rgba(0, 0, 0, 0.6);
      width: 100%;
      height: calc(100% + 1px);
    }
  }
</style>
