<template>
  <div class="tip-wrap">{{tip}}</div>
</template>
<script>
import { Indicator, MessageBox, Toast } from 'mint-ui';
export default {
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  data() {
    return {
      tip: ''
    };
  },
  created() {
    document.title = 'Error';
    Indicator.close();
    this.tip = this.$route.query.errorInfo || '出错啦！';
  }
};
</script>
<style lang="less">
  .tip-wrap {
    position: absolute;
    top: 20%;
    left: 0;
    right: 0;
    transform: translateY(-20%);
    margin: 0 auto;
    padding: 10px;
    text-align: center;
    min-width: 270px;
    width: 60%;
    padding: 50px 4px;
    line-height: 1.5;
    max-width: 400px;
    border-radius: 4px;
    box-shadow:
      0 -5px 8px -7px rgba(81, 81,81,0.8),
      0 -5px 8px -7px rgba(81, 81,81,0.8),
      5px 0 8px -1px  rgba(81, 81,81,0.4),
      5px 0 8px -1px  rgba(81, 81,81,0.8);
    background: #2d9cf7;
    font: bold 50px/2 "Microsoft YaHei";
    font-size: 16px;
    text-shadow: 0 1px #121212;
    color: #fff;
  }
</style>
