<template>
  <div class="introduce-all" :class="{'introduce-all-no-footer': isNoFooter}">
    <div class="introduce-title">什么是四川移动“合伙人”</div>
    <!-- <div class="introduce-xian"></div> -->
    <div class="introduce-detail" v-html="detail"></div>
  </div>
</template>
<style type="text/css">
.introduce-all {
  height: 100%;
  padding-bottom: 60px;
  overflow: auto;
  background: #fff;
}
.introduce-all-no-footer {
  padding-bottom: 0;
}
.introduce-title {
  font-family: PingFangSC-Regular;
  font-size: 16px;
  color: #333;
  letter-spacing: 0;
  height: 65px;
  line-height: 65px;
  text-align: center;
  border-bottom: 1px solid #979797;
  margin: 0 20px;
}
.introduce-detail {
  font-family: .PingFangSC-Regular;
  font-size: 14px;
  color: #777;
  letter-spacing: 0;
  padding-top: 20px;
  margin: 0 22px;
  overflow: hidden;
  /* text-align: center; */
  /* height: calc(100% - 65px); */
}
.introduce-detail img,
.introduce-detail p,
.introduce-detail table {
  max-width: 100% !important;
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
      detail: ''
    };
  },
  watch: {},
  created() {
    Indicator.close();
    this.isNoFooter = !this.$route.query.p;
    this.getList();
    document.title = '什么是四川移动“合伙人”';
  },
  methods: {
    getList: function() {
      let url = baseUrl + '/companion/introduce';
      let reqParams = getRequestParams(
        url,
        '',
        this.getListSuccess,
        this.getListError,
        ''
      );
      sendGetRequest(this, reqParams);
    },
    getListSuccess: function(vue, json) {
      if (json.status !== 0) {
        console.log('获取接口返回失败！code:' + json.msg);
        return;
      }
      this.detail = json.data;
    },
    getListError: function() {
      Toast('获取信息失败');
    }
  }
};
</script>
