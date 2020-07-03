<template>
  <input
      :id="id"
      :name="name"
      class="palm-input"
      :type="type"
      :value="value"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :minlength="minlength"
      :readonly="readonly"
      :disabled="disabled"
      @blur="blurInput"
      @focus="focusInput"
      @input="inputChange" />
</template>

<script>
export default {
  name: 'palm-input',
  // 外层传值v-model
  model: {
    prop: 'value', // 默认value
    event: 'change' // 默认input，可选值change
  },
  props: {
    id: {
      type: [String, Number],
      default: 'palmInput_' + (new Date().getTime())
    },
    name: {
      type: [String, Number],
      default: ''
    },
    value: {
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    maxlength: [String, Number],
    minlength: [String, Number],
    readonly: [String, Number, Boolean],
    disabled: [String, Number, Boolean],
    placeholder: [String, Number]
  },
  mounted() {
  },
  watch: {
  },
  data () {
    return {
    };
  },
  methods: {
    isIOS () {
      return /iphone|ipad|ipod/i.test(window.navigator.userAgent + window.navigator.platform);
    },
    inputChange (e) {
      // 触发model定义的事件
      this.$emit('change', e.target.value);
    },
    focusInput (e) {
      if (this.isIOS()) {
        let elTop = e.target.getBoundingClientRect().top / 2;
        document.body.scrollTop = elTop;
      }
      this.$emit('focus');
    },
    blurInput (e) {
      if (this.isIOS()) {
        let resetTop = 5;
        document.body.scrollTop = ++resetTop;
      }
      this.$emit('blur');
    }
  }
};
</script>

<style lang="less">
  .palm-input {
  }
</style>
