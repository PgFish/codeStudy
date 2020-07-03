<template>
  <div class="check-in-root">
    <div class="check-in-item" :class="{'checked': i < checkedDays}" v-for="(name, i) in dotsName" :key="i">
      <div class="check-in-line" :class="{'check-in-line-hide': i === 0}" :style="{'background': userLineColor}"></div>
      <div class="check-in-dot" :style="{ 'background': dotComputedStyle(i), 'color': fontComputedStyle(i) }">
        <span :style="nameComputedPosition">{{name}}</span>
        <img class="last-day-img" v-if="userLastDayImg && i === dotsName.length - 1" :src="userLastDayImg" />
      </div>
      <!-- <div class="check-in-name" :style="fontComputedStyle(i)">{{name}}</div> -->
    </div>
  </div>
</template>
<script>
import { Indicator, MessageBox, Toast } from 'mint-ui';

export default {
  props: {
    dots: {
      type: Array
    },
    days: {
      type: [Number, String]
    },
    activeDotColor: {
      type: String,
      default: '#3d8cf7'
    },
    inactiveDotColor: {
      type: String,
      default: '#e1eff5'
    },
    activeFontColor: {
      type: String,
      default: '#fff'
    },
    inactiveFontColor: {
      type: String,
      default: '#728082'
    },
    lineColor: String,
    namePosition: {
      type: String,
      default: 'middle'
    },
    lastDayImg: {
      type: String,
      default: ''
    }
  },
  components: {
    Indicator,
    MessageBox,
    Toast
  },
  data() {
    return {
      dotsName: [],
      checkedDays: 0,
      userActiveDotColor: '',
      userInactiveDotColor: '',
      userActiveFontColor: '',
      userInactiveFontColor: '',
      userLineColor: '',
      userLastDayImg: this.lastDayImg
    };
  },
  computed: {
    nameComputedPosition: function() {
      if (this.namePosition === 'bottom') {
        return 'position: absolute; left: 0; right: 0; margin: 0 auto; bottom: -34px; color: #333;';
      }
    }
  },
  watch: {
    dots(val) {
      this.dotsName = val;
    },
    days(val) {
      this.checkedDays = val;
    }
  },
  created() {
    console.log(this.dots);
    this.dotsName = this.dots;
    this.checkedDays = this.days;
    this.userActiveDotColor = this.activeDotColor;
    this.userInactiveDotColor = this.inactiveDotColor;
    this.userActiveFontColor = this.activeFontColor;
    this.userInactiveFontColor = this.inactiveFontColor;
    this.userLineColor = this.lineColor || this.userActiveDotColor;
  },
  mounted() {

  },
  methods: {
    dotComputedStyle: function (i) {
      return i < this.checkedDays ? this.userActiveDotColor : this.userInactiveDotColor;
    },
    fontComputedStyle: function (i) {
      return i < this.checkedDays ? this.userActiveFontColor : this.userInactiveFontColor;
    }
  }
};
</script>
<style lang="less">
  .check-in-root {
    width: 100%;
    position: relative;
    height: 62px;
    padding: 28px 0;
    display: flex;
    .check-in-item {
      flex: 1 1 100%;
      position: relative;
      margin-bottom: 50px;
      .check-in-line {
        transform: translateX(-50%);
        width: 100%;
        height: 6px;
        background: #ccc;
        z-index: 0;
        position: relative;
        &.check-in-line-hide {
          visibility: hidden;
        }
      }
      .check-in-dot {
        position: absolute;
        left: 0;
        right: 0;
        margin: 0 auto;
        top: -16px;
        background: #fff;
        width: 40px;
        height: 40px;
        border-radius: 100%;
        border: 0;
        z-index: 1;
        text-align: center;
        line-height: 40px;
        font-size: 14px;
        letter-spacing: 1px;
        .last-day-img {
          pointer-events: none;
          width: 24px;
          position: absolute;
          top: -28px;
          left: 0;
          right: 0;
          margin: 0 auto;
        }
      }
      .check-in-name {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: 0;
        bottom: 0;
        margin: 0 auto;
        margin-top: -5px;
        font-size: 12px;
        z-index: 1;
      }
      &.checked {
        .check-in-dot {
          background: #3d8cf7;
        }
        .check-in-line {
          background: #3d8cf7;
        }
      }
    }
  }
</style>
