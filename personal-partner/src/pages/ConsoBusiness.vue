<!-- 聚合业务 -->
<template>
  <div class="conso-business">
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
    <div class="fee-list flex-row">
      <div v-for="(item, index) in feeList" :key="index" class="fee-item-container">
        <div class="fee-item" :class="{'last-one': index % 3 === 2}" @click="jump(item)">
          <div class="fee-item-block-wrap">
            <img class="fee-item-bg-1" src="static/img/consobusiness/item_bg_1.png" />
            <div class="fee-item-top">
              <div class="top-block">{{item.packageName || item.productName}}</div>
            </div>
            <div class="line"></div>
            <div class="fee-item-bottom">
              <div class="bottom-block">{{item.packageBrief || item.typeIntroduce}}</div>
            </div>
            <!-- <div class="fee-item-block">
              <div class="fee-name">{{item.feeName}}</div>
              <div class="fee-intro">{{item.feeDetail}}</div>
            </div> -->
            <img class="fee-item-bg-2" src="static/img/consobusiness/item_bg_2.png" />
          </div>
          <!-- <img class="fee-item-active-icon" src="img/commonbusiness/selected_icon.png" /> -->
        </div>
      </div>
      <div class="clear-float"></div>
    </div>
    <div class="busi-detail" v-html="mergeDetail"></div>
  </div>
</template>
<script>
// import * as Dialog from '@/assets/utils/dialog'
import Qs from 'qs'
import { Indicator, MessageBox, Toast } from 'mint-ui'
export default {
  name: 'ConsoBusiness',
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  data() {
    return {
      partnerId: '',
      businessId: this.$route.query.id,
      phone: this.$route.query.phone,
      feeList: [],
      bannerList: [],
      mergeDetail: ''
    }
  },
  watch: {

  },
  created() {
    Indicator.close()
    let serverUserInfo = this.utils.getSession('ptDetailInfo')
    if (this.$route.query.partnerId) {
      this.partnerId = this.$route.query.partnerId
    } else if (serverUserInfo) {
      this.partnerId = serverUserInfo.id
    }
  },
  mounted() {
    this.getFeeList()
  },
  methods: {
    bannerJump (item) {
      if (/^http/i.test(item.linkUrl)) {
        window.location.href = item.linkUrl
      } else {
        console.log('配置的URL不正确')
      }
    },
    jump: function (fee) {
      if ('' + fee.categoryId !== '1' || fee.remark) { // 非号卡业务
        // if (/^2|7|8$/.test(fee.categoryId)) { // 2:特惠流量;7:玩出无穷新意;8:智慧生活，跳转本地页面
        //   this.utils.pageRouter(this, { path: '/handlesuperflow', query: { id: fee.id } });
        // } else
        if ('' + fee.categoryId === '5') { // 合家欢，跳转本地页面
          this.utils.pageRouter(this, { path: '/familyDetail', query: { id: fee.id } });
        } else {
          if ('' + fee.deployMethod === '0') { // 自定义跳转
            if ('' + fee.remark === '1') { // 权益新升级
              this.utils.pageRouter(this, { path: '/promisefee', query: { id: fee.id, partnerId: this.partnerId } });
            } else if ('' + fee.remark === '8') { // 电视业务
              this.utils.pageRouter(this, { path: '/tvaddfee', query: { id: fee.id, partnerId: this.partnerId } });
            } else if ('' + fee.remark === '10') { // 聚合业务
              this.utils.pageRouter(this, { path: '/consobusiness', query: { id: fee.id, partnerId: this.partnerId } });
            } else { // 未配置跳转方式，默认跳转通用资费模板（原特惠流量页面）
              this.utils.pageRouter(this, { path: '/handlesuperflow', query: { id: fee.id, partnerId: this.partnerId } });
            }
          } else { // 后台配置，默认跳转通用资费模板（原特惠流量页面）
            this.utils.pageRouter(this, { path: '/handlesuperflow', query: { id: fee.id } });
          }
        }
        return
      }
      if ('' + fee.categoryId === '1') { // 0元号卡资费，跳转本地页面
        let jumpUrl = this.buildUrl(fee.publicUrl);
        window.location.href = jumpUrl;
      }
    },
    // jump (item) {
    //   this.buildUrlOrGoByType(item, 'jump')
    // },
    // buildUrlOrGoByType (fee, type) { // 跳转和分享资费，只需要在这里修改或增加case就行
    //   let url = ''
    //   let query = ''
    //   if ('' + fee.deployMethod === '0') {
    //     switch ('' + fee.remark) {
    //       case '1': // 权益新升级
    //         query = {
    //           partnerId: this.partnerId,
    //           businessId: fee.id
    //         }
    //         url = this.getUrlOrGoByType('/promisefee', query, type)
    //         break
    //       case '2': // 爱看视频包/视频会员任选包
    //         query = {
    //           partnerId: this.partnerId,
    //           businessId: fee.id
    //         }
    //         url = this.getUrlOrGoByType('/spakb', query, type)
    //         break
    //       case '3': // 咪咕音乐VIP
    //       case '4': // 咪咕阅读VIP
    //         query = {
    //           partnerId: this.partnerId,
    //           businessId: fee.id,
    //           remark: fee.remark
    //         }
    //         url = this.getUrlOrGoByType('/miguvip', query, type)
    //         break
    //       case '5': // 首充加享5%
    //         query = {
    //           partnerId: this.partnerId,
    //           businessId: fee.id
    //         }
    //         url = this.getUrlOrGoByType('/scjx5', query, type)
    //         break
    //       case '6': // 宽带预约
    //         query = {
    //           businessId: fee.id,
    //           broadType: fee.broadType,
    //           phone: this.phone
    //         }
    //         url = this.getUrlOrGoByType('/broadbandReservation/reservation', query, type)
    //         break
    //       case '7': // 咪咕视频彩铃
    //         query = {
    //           partnerId: this.partnerId,
    //           businessId: fee.id
    //         }
    //         url = this.getUrlOrGoByType('/videoring', query, type)
    //         break
    //       case '8': // 电视增值业务
    //         query = {
    //           partnerId: this.partnerId,
    //           businessId: fee.id,
    //           title: fee.packageTitle
    //         }
    //         url = this.getUrlOrGoByType('/tvaddfee', query, type)
    //         break
    //       case '9': // 终端信息采集
    //         query = {
    //           phone: this.phone
    //         }
    //         url = this.getUrlOrGoByType('/infoStream', query, type)
    //         break
    //       case '10': // 业务聚合页面
    //         query = {
    //           partnerId: this.partnerId,
    //           businessId: fee.id,
    //           phone: this.phone
    //         }
    //         url = this.getUrlOrGoByType('/consobusiness', query, type)
    //         break
    //       default:
    //         url = this.buildOutterLinkUrlOrGo(fee.publicUrl, type)
    //         break
    //     }
    //   } else {
    //     query = {
    //       partnerId: this.partnerId,
    //       businessId: fee.id
    //     }
    //     url = this.getUrlOrGoByType('commonbusiness', query, type)
    //   }
    //   return url
    // },
    // getUrlOrGoByType (path, query, type) {
    //   query.empCode = this.$route.query.empCode
    //   switch ('' + type) {
    //     case 'jump':
    //       this.utils.jumpPage(this, { path: path, query: query })
    //       break
    //     case 'share':
    //       let shareUrl = this.buildInnerUrl(path, query)
    //       return shareUrl
    //     default:
    //       let outterLink = this.buildOutterLinkUrlOrGo(path, type)
    //       return outterLink
    //   }
    // },
    // buildOutterLinkUrlOrGo (url, type) {
    //   if (type === 'share') {
    //     return `${window.location.origin + this.api.baseUrl}/campuspartner/pages/?outterLink=${encodeURIComponent(encodeURIComponent(url))}`
    //   }
    //   window.location.href = url
    // },
    // buildInnerUrl: function(path, query) {
    //   // 跳转本地
    //   let redirectUrl = `${path}&${Qs.stringify(query)}`
    //   return `${window.location.origin + this.api.baseUrl}/campuspartner/pages/?pageName=${redirectUrl}`
    // },
    async getFeeList () {
      let params = {
        mergeId: this.businessId
      }
      let res = await this.api.getConsoFeeList(params)
      if (!res) return
      if (res.status !== 0) {
        this.$createDialog({
          type: 'alert',
          title: '提示',
          content: res.msg
        }).show()
        return
      }
      if (res.data) {
        if (res.data.packageSalaryList.length <= 0) {
          this.$createDialog({
            type: 'alert',
            title: '提示',
            content: '没有资费信息，请联系管理员',
            icon: 'cubeic-alert'
          }).show()
          return
        }
        if (res.data.mergePackage) {
          document.title = res.data.mergePackage.productName || '聚合业务'
          this.mergeDetail = res.data.mergePackage.detailUrl
          let link = `${window.location.origin + this.api.baseUrl}/common/new/redirect?pageName=consobusiness`;
          if (this.$route.query) {
            link += `&${Qs.stringify(this.$route.query)}`
          }
          let shareTitle = res.data.mergePackage.shareTitle || res.data.mergePackage.productName
          let shareDesc = res.data.mergePackage.shareBrief || res.data.mergePackage.typeIntroduce
          let shareObj = {
            title: shareTitle,
            desc: shareDesc,
            link: link,
            imgUrl: `${window.location.origin + this.api.baseUrl}/partner/static/img/cmcc_logo.png`
          }
          console.info(shareObj)
          this.utils.getJsApiConfig(shareObj)
        }
        this.feeList = res.data.packageSalaryList
        if (res.data.bannerList && res.data.bannerList.length > 0) {
          this.bannerList = res.data.bannerList
        } else {
          this.bannerList = []
        }
      } else {
        this.$createDialog({
          type: 'alert',
          title: '提示',
          content: '没有资费信息，请联系管理员',
          icon: 'cubeic-alert'
        }).show()
      }
    }
  }
}
</script>
<style lang="less">
  .conso-business {
    position: relative;
    width: 100%;
    min-height: 100%;
    max-width: 540PX;
    margin: 0 auto;
    background: #efefef;
    .banner {
      position: relative;
      width: 100%;
      min-height: 175px;
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
      height: 175px;
      padding: 65px 0;
      border-bottom: 1px solid #eee;
    }
    .music-bg {
      width: 100%;
      max-width: 540PX;
      margin: 0 auto;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      z-index: 0;
    }
    .img {
      width: 100%;
      display: block;
      position: relative;
      z-index: 1;
    }
    .fee-list {
      position: relative;
      width: 100%;
      flex-wrap: wrap;
      padding: 5px 15px;
      background-color: #fff;
      .fee-item-container {
        flex: 0 1 33%;
        .fee-item {
          width: 88px;
          // float: left;
          height: 115px;
          // margin: 10px 0;
          margin: 10px auto;
          // margin-right: 2%;
          text-align: center;
          position: relative;
          // left: 50%;
          // transform: translateX(-50%);
          // overflow: hidden;
          color: #333;
          font-size: 10PX;
          background: #fff;
          cursor: pointer;
          // &.last-one {
          //   margin-right: 0;
          // }
          .fee-item-block-wrap {
            width: 100%;
            height: 81px;
            position: relative;
            padding-top: 6px;
            .fee-item-top, .fee-item-bottom {
              width: 65%;
              // width: 60px;
              height: 50%;
              margin: 0 auto;
              position: relative;
              z-index: 1;
              overflow: hidden;
              color: #333;
              .top-block, .bottom-block {
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                transform: translateY(-50%);
                width: 100%;
                margin: 0 auto;
              }
              .top-block {
                max-height: 32px;
                overflow: hidden;
                font-size: 10px;
                line-height: 12PX;
                height: 24px;
              }
              .bottom-block {
                max-height: 39px;
                overflow: hidden;
                font-size: 8PX;
                // line-height: 1.1;
              }
            }
            .fee-item-top {
              width: 60px;
            }
            .fee-item-bottom {
              width: 65px;
              height: calc(50% - 4px);
            }
            .line {
              width: 60%;
              height: 1px;
              background: #27BAF8;
              margin: 1px auto 3px;
              position: relative;
              z-index: 1;
            }
            .fee-item-bg-1 {
              width: 100%;
              display: block;
              position: absolute;
              top: 0;
              left: 0;
              z-index: 0;
              height: 100%;
            }
            .fee-item-bg-2 {
              width: 100%;
              display: block;
              position: absolute;
              top: 100%;
              left: 0;
              z-index: 0;
            }
          }
          .fee-item-active-icon {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 20px;
            display: none;
            transform: translateX(0px);
          }
          &.selected {
            border: 1px solid #47A9E2;
            .fee-item-active-icon {
              display: block;
            }
          }
          .fee-item-block {
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            transform: translateY(-50%);
            .fee-name {
              padding: 0 6px;
              font-size: 14px;
              line-height: 1.5;
            }
            .fee-intro {
              padding: 0 6px;
              font-size: 12px;
              line-height: 1.3;
              color: #999;
            }
            .fee-intro {
              color: #999;
            }
            * {
              word-break: break-all;
            }
          }
        }
      }
    }
    .busi-detail {
      position: relative;
      padding: 10px 15px;
      background: #efefef;
      // min-height: 148px;
      * {
        max-width: 100%!important;
      }
    }
  }
</style>
