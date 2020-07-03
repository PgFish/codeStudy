<template>
  <div class="money-strategy">
    <div class="rich-text" v-html="moneyStrategy"></div>
  </div>
</template>
<style lang="less">
.money-strategy {
  min-height: 100%;
  padding-bottom: 60px;
  background: #fff;
  .rich-text {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #777;
    letter-spacing: 0;
    padding-top: 20px;
    margin: 0 22px;
    overflow: hidden;
    * {
      max-width: 100% !important;
    }
  }
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
      moneyStrategy: ''
    }
  },
  watch: {},
  created() {
    document.title = '操作指南';
    Indicator.open();
    this.getMoneyStrategy()
  },
  methods: {
    getMoneyStrategy() {
      let url = baseUrl + `/companion/moneyStrategy`;
      let reqParams = getRequestParams(url, '', (vue, json) => {
        Indicator.close();
        this.moneyStrategy = json.data;
        console.log('test', json);
      }, () => {
        Indicator.close();
        Toast('获取信息失败');
      }, '');
      sendGetRequest(this, reqParams);
    }
  }
}
</script>
