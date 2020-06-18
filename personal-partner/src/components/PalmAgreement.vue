<template>
  <div id="palmAgreement" class="palm-agreement">
    <div class="agree-line">
      <input id="agreeCheck" type="checkbox" v-model="ifAgree" />
      <label for="agreeCheck" :style="tickStyle"></label>
      <span class="check-box-text" :style="textStyle">
        {{textWord || '我已阅读并同意'}}
        <span class="to-agree" :style="linkStyle" @click="getAgree">{{linkWord || '《业务办理协议》'}}</span>
      </span>
    </div>
    <!-- <div class="protocol-popup" v-if="showAgree">
      <div class="agree-body">
        <div class="agree-text" v-html="agreement">
        </div>
        <div class="agree-footer">
          <div class="agree-btn agree-btn-cancel" @click="clickDisagree">不同意</div>
          <div class="agree-btn agree-btn-confirm" @click="clickAgree">同意</div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import { baseUrl, getRequestParams, sendGetRequest } from 'src/assets/utils.js';
import { Indicator, MessageBox, Toast } from 'mint-ui';
export default {
  name: 'palm-agreement',
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  props: {
    value: {
      type: Boolean,
      default: false,
      twoway: true
    },
    tickColor: {
      type: String,
      default: '#F4A11F',
      twoway: true
    },
    textStyle: {
      type: String,
      default: '',
      twoway: true
    },
    linkStyle: {
      type: String,
      default: '',
      twoway: true
    },
    textWord: {
      type: String,
      default: '',
      twoway: true
    },
    linkWord: {
      type: String,
      default: '',
      twoway: true
    }
  },
  model: {
    prop: 'value', // 默认value
    event: 'change' // 默认input，可选值change
  },
  created () {
    this.ifAgree = this.value;
    // this.calcStyle()
  },
  mounted() {
    this.Bus.$on('closeAgree', (val) => {
      if (val) {
        this.clickAgree();
      } else {
        this.clickDisagree();
      }
    });
  },
  watch: {
    ifAgree (val) {
      this.emitChange(val);
    }
  },
  data () {
    return {
      showAgree: false,
      agreement: '',
      ifAgree: false
    };
  },
  computed: {
    tickStyle () {
      if (!this.tickColor) return '';
      if (this.ifAgree) {
        return `background: ${this.tickColor};border: 1px solid ${this.tickColor};`;
      }
      return `border: 1px solid ${this.tickColor}`;
    }
  },
  methods: {
    getAgree () {
      if (this.agreement) {
        this.showAgree = true;
        this.Bus.$emit('openAgree', this.agreement);
        return;
      }
      let url = `${baseUrl}/richText/get?code=BUSINESS_AGREEMENT`;
      let reqParams = getRequestParams(
        url,
        '',
        (vue, json) => {
          Indicator.close();
          console.log(json);
          if (json.status === 0 && json.data && ('' + json.data.enabled === '0')) {
            vue.agreement = json.data.detail.replace(/\s(width|height)(=["']\d+["']|:[^;]+[a-z]+;)/gi, ' ');
            vue.showAgree = true;
            vue.Bus.$emit('openAgree', this.agreement);
          } else {
            MessageBox.alert('获取协议失败');
          }
        },
        (vue, ex) => {
          Indicator.close();
          console.log(ex);
          MessageBox.alert('获取协议异常，请重试');
        }
      );
      Indicator.open();
      sendGetRequest(this, reqParams);
    },
    clickDisagree () {
      this.showAgree = false;
      this.ifAgree = false;
      this.emitChange(false);
    },
    clickAgree () {
      this.showAgree = false;
      this.ifAgree = true;
      this.emitChange(true);
    },
    emitChange (val) {
      console.log(val);
      this.$emit('change', val);
      this.$emit('update:value', val);
    }
  }
};
</script>

<style lang="less">
  .palm-agreement {
    .agree-line {
      /*text-align: center;*/
      height: 30px;
      line-height: 30px;
      position: relative;
      margin-top: 10px;
      margin-left: -22px;
      input {
        width: 16px;
        height: 16px;
        vertical-align: middle;
        box-shadow: none;
        outline: none;
        appearance: none;
        border-radius: 0;
        visibility: hidden;
        cursor: pointer;
        &:checked+label {
          background: #F4A11F;
          border: 1px solid #F4A11F;
        }
        &:checked+label::after {
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
      }
      input+label {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 1px solid #fff;
        position: relative;
        vertical-align: middle;
        box-sizing: border-box;
        cursor: pointer;
        margin-top: -1px;
        background: #fff;
      }
      .check-box-text {
        vertical-align: middle;
        font-size: 13px;
        color: #fff;
        margin-left: 6px;
      }
      .to-agree {
        color: #6ACCE8;
        cursor: pointer;
      }
    }
    .protocol-popup {
      position: fixed;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background: rgba(0, 0, 0, .7);
      z-index: 99999;
      .agree-body {
        width: 90%;
        max-width: 486PX;
        margin: 0 auto;
        right: 5%;
        height: 90%;
        position: absolute;
        top: 5%;
        left: 5%;
        background: #fff;
        border-radius: 6px;
        .agree-text {
          text-align: left;
          // text-indent: 32px;
          padding: 20px 20px 50px 20px;
          overflow: scroll;
          height:100%;
          * {
            max-width: 100%;
          }
        }
        .agree-footer {
          height: 50px;
          width: 100%;
          border-top: 1px solid #eee;
          position: relative;
          overflow: hidden;
          border-radius: 6px;
          background-color: #FFFFFF;
          display: flex;
          top: -50px;
          .agree-btn {
            width: 50%;
            line-height: 50px;
            text-align: center;
            font-size: 16px;
            &.agree-btn-confirm {
              color: #2d9cf7;
            }
          }
        }
      }
    }
  }
</style>
