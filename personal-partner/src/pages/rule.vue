<template>
	<div class="rule-all" :class="{'rule-all-no-footer': isNoFooter}">
    <!-- <div class="rule-itemall"> -->
      <div class="rule-banner">
        <img class="rule-banner" src="static/img/rule/rule.png">
      </div>
      <div class="rule-contain" v-infinite-scroll="loadMore"
      :infinite-scroll-disabled="lastPage"
      infinite-scroll-distance="10">
        <div class="rule-activity" v-if="showTopRule" v-html="topRule"></div>
        <div :key="index" v-for="(item, index) in list" class="rule-item">
          <div class="rule-name">{{item.packageName}}</div>
          <div class="rule-xian"></div>
          <div class="rule-detail" v-html="item.salaryRule"></div>
        </div>
        <!-- <div class="rule-jiange"></div> -->
        <template v-if="list.length > 0"> 
          <div class="record-loading" v-if="!lastPage"><mt-spinner type="triple-bounce"></mt-spinner></div>
          <!-- <div class="record-loading" v-if="lastPage">底线在此</div> -->
        </template>
        <template v-if="isNoRecord">
          <div class="no-record">暂无数据</div>
        </template>
      </div>
    <!-- </div> -->
  </div>
</template>
<style type="text/css">
   body {
    background: #f0f0f0;
   }
  .rule-contain {
    height: calc(100% - 100px);
    overflow: auto;
  }
  .rule-all {
    height: calc(100% - 50px);
    background: #f0f0f0;
    /* position: absolute; */
    /* margin-bottom: 50px; */
  }
  .rule-all-no-footer {
    height: 100%;
  }
  .rule-itemall {
    margin-bottom: 50px;
  }
  .rule-banner {
    width: 100%;
    height: 100px;
  }
  .rule-activity {
    width: 100%;
    padding: 16px;
    background: #fff;
    margin-bottom: 10px;
    overflow: hidden;
  }
  .rule-activity img, .rule-activity p, .rule-activity table {
    max-width: 100% !important;
  }
  .element.style {
    font-size: 10px;
  }
  .rule-item {
    background: #FFFFFF;
    width: 100%;
    padding: 10px 20px;
    margin-bottom: 10px;
  }
  .rule-name {
    /*height: 46px;*/
    /*line-height: 46px;*/
    padding: 0 0 10px; 
    font-family: .PingFangSC-Regular;
    font-size: 16px;
    width: 100%;
  }
  .rule-xian {
    background: #ddd;
    height: 1px;
    width: 100%;
  }
  .rule-detail {
    font-size: 12px!important;
    color: #777777;
    width: 100%;
    margin: 15px auto;
    margin-top: 15px;
    word-break: break-all;
  }
  .rule-detail * {
    font-size: 12px!important;
  }
  .record-loading {
    text-align: center;
    color: #AAAAAA;
    background: #EEEEEE;
    font-size: 12px;
  }
  .rule-all .no-record {
    font-weight: bold;
    font-size: 20px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    -ms-transform:translate(-50%, -50%);
    -moz-transform:translate(-50%, -50%);
    -webkit-transform:translate(-50%, -50%);
    -o-transform:translate(-50%, -50%);
    color: #bbb;
  }
  .rule-jiange {
    height: 10px;
    width: 100%;
    background: #eeeeee;
  }
</style>
<script type="text/javascript">
  import { baseUrl, getRequestParams, sendGetRequest } from 'src/assets/utils.js';
  import { Indicator, MessageBox, Toast } from 'mint-ui';

  export default {
    components: {
      Indicator,
      MessageBox,
      Toast
    },
    data() {
      return {
        isNoFooter: true,
        pageNumber: 1,
        lastPage: true,
        isNoRecord: false,
        isLoading: false,
        list: [],
        topRule: '',
        showTopRule: false
      };
    },
    watch: {
    },
    created() {
      Indicator.close();
      this.isNoFooter = !this.$route.query.p;
      this.list = [];
      // this.getTopRule();
      this.getList();
      document.title = '返利规则';
    },
    methods: {
      // getTopRule: function() {
      //   if (this.topRule) {
      //     this.showTopRule = true;
      //     return;
      //   }
      //   let url = `${baseUrl}/richText/get?code=RULL_ACTIVITY`;
      //   let reqParams = getRequestParams(url, '', this.getTopRuleSuc, this.getTopRuleFail);
      //   Indicator.open();
      //   sendGetRequest(this, reqParams);
      // },
      // getTopRuleSuc: function(vue, json) {
      //   Indicator.close();
      //   console.log(json);
      //   if (json.status === 0 && json.data && ('' + json.data.enabled === '0')) {
      //     vue.topRule = json.data.detail;
      //     vue.showTopRule = true;
      //   } else {
      //     vue.showTopRule = false;
      //   }
      // },
      // getTopRuleFail: function(ex) {
      //   Indicator.close();
      //   console.log(ex);
      //   MessageBox.alert('获取协议异常，请重试');
      // },
      getList: function() {
        let url = baseUrl + `/packageSalary/getRebateRuleList?pageNumber=${this.pageNumber}&pageSize=10`;
        if (this.$route.query.p) {
          url += `&phone=${this.$route.query.p}`;
        }
        let reqParams = getRequestParams(url, '', this.getListSuccess, this.getListError, '');
        sendGetRequest(this, reqParams);
      },
      getListSuccess (vue, json) {
        if (json.status !== 0) {
          console.log('获取接口返回失败！code:' + json.msg);
          return;
        }
        if (json.data.ruleConfig && ('' + json.data.ruleConfig.enabled === '0')) {
          vue.topRule = json.data.ruleConfig.detail;
          vue.showTopRule = true;
        } else {
          vue.showTopRule = false;
        }
        if (json.data.list instanceof Array) {
          for (let i = 0; json.data.list.length > i; i++) {
            this.list.push(json.data.list[i]);
          }
        } else if (json.data.list instanceof Object) {
          this.list.push(json.data.list);
        }
        this.lastPage = json.data.lastPage;
        this.isLoading = false;
        this.isNoRecord = json.data.totalRow === 0;
      },
      getListError: function() {
        Toast('获取信息失败');
      },
      loadMore: function() {
        if (this.lastPage || this.isLoading || this.isNoRecord) return; // 当最后一页时或者当页面正在加载下一页时，阻止访问接口
        this.isLoading = true;
        this.pageNumber++;
        this.getList();
      }
    }
  };
</script>