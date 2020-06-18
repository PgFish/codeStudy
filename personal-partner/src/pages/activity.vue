<template>
  <div class="activity-wrap">
    <!-- <div class="activity-item" @click="toGivebackRule">
      <div class="activity">2倍酬金加成</div>
      <img class="activity-img" src="static/img/index/giveback_rule.png?v=1">
    </div> -->
    <!-- <div class="activity-item" @click="toChest">
      <div class="activity">开宝箱活动</div>
      <img class="activity-img" src="static/img/index/box.png?v=1">
    </div> -->
    <template v-if="acts.length > 0">
      <div class="activity-item" :key="i" v-for="(item, i) in acts" @click="goActivity(item)">
    	  <div class="activity-name">{{item.name}}</div>
        <img class="activity-img" :src="item.imgUrl">
      </div>
    </template>
    <div class="no-records" v-else>{{isLoading ? '加载中...' : '活动升级中...'}}</div>
  </div>
</template>
<style>
  body {
    background: #f0f0f0;
  }
  .activity-wrap {
    padding: 15px;
    min-height: 100%;
    width: 100%;
    max-width: 550px;
    min-width: 270px;
    margin: 0 auto;
    position: relative;
    .activity-item {
      width: 100%;
      margin-bottom: 15px;
      cursor: pointer;
    }
    .activity-name {
      width: 100%;
      height: 24px;
      line-height: 24px;
      background: #fff;
      font-size: 12px;
      padding: 0 15px;
    }
    .activity-img {
      width: 100%;
    }
    .no-records {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      left: 0;
      right: 0;
      width: 100%;
      text-align: center;
      font-size: 18px;
      color: #aaa;
    }
  }
</style>
<script type="text/javascript">
import { baseUrl, pageRouter, getJsApiConfig, saveSession, getSession, getRequestParams, sendGetRequest } from 'src/assets/utils.js';
import { Indicator, MessageBox, Toast } from 'mint-ui';
export default {
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  data () {
    return {
      acts: [],
      isLoading: true
    };
  },
  watch: {
  },
  created () {
    getJsApiConfig();
    document.title = '活动';
    var s = document.createElement('script'); s.async = true; s.src = 'static/js/webtrends.load.js';
    var s2 = document.getElementsByTagName('script')[0]; s2.parentNode.insertBefore(s, s2);
    Indicator.close();
    this.getActs();
  },
  methods: {
    getActs: function() {
      if (getSession('shareshop_acts')) {
        this.acts = getSession('shareshop_acts', true);
        return;
      }
      let url = `${baseUrl}/common/getSystemConfig?typeCode=PARTNER_ACTIVITY`;
      let reqParams = getRequestParams(
        url,
        '',
        (vue, json) => {
          console.log(json);
          vue.isLoading = false;
          if (json && json.status === 0 && json.data.length > 0) {
            vue.acts = json.data;
            saveSession('shareshop_ads', vue.acts);
          }
        },
        (vue, ex) => {
          vue.isLoading = false;
          console.log(ex);
        }
      );
      this.isLoading = true;
      sendGetRequest(this, reqParams);
    },
    goActivity: function(item) {
      if (!item.value) return;
      if (item.remark !== 'native') {
        item.value = item.value.replace('/gpas/', baseUrl + '/');
        window.location.href = item.value;
      } else {
        Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_activity_actType', 'WT.event', 'gpas_' + item.value] });
        pageRouter(this, {path: item.value, query: { p: this.$route.query.p, ptid: this.$route.query.ptid }});
      }
    },
    toGivebackRule: function () {
      let prefix = window.location.origin;
      if (/192.168.|localhost|127.0.0.1/.test(prefix) || process.env.NODE_ENV === 'development') {
        prefix = 'https://gptest.palmte.cn';
      }
      let url = prefix + baseUrl + '/home/gpas_giveback_rules.html';
      Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_activity_actType', 'WT.event', 'gpas_doubleReward'] });
      window.location.href = url;
    },
    toGiveback: function () {
      Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_activity_actType', 'WT.event', 'gpas_giveback'] });
      pageRouter(this, { path: '/giveback', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
    },
    toChest: function () {
      saveSession('chestSouce', 'activity');
      Webtrends.multiTrack({ argsa: ['WT.nv', 'gpas_activity_actType', 'WT.event', 'gpas_chest'] });
      pageRouter(this, { path: '/chest', query: { p: this.$route.query.p, ptid: this.$route.query.ptid } });
    }
  }
};
</script>