module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  globals: {
    'WeixinJSBridge': true,
    'EXIF': true,
    'AMap': true,
    'echarts': true,
    'Vue': true,
    'VueRouter': true,
    'wx': true,
    'getShareInfoShowShareBtnWithType': true,
    'jumpShare': true,
    'Webtrends': true
  },
  // add your custom rules here
  'rules': {
    // "semi": [2, "always"], // 强制语句分号结尾
    'semi': 0, // 关闭末尾分号提示/报错
    'space-before-function-paren': 0, // 函数定义时括号前的空格
    'arrow-parens': 0, // 允许箭头函数
    'generator-star-spacing': 0, // 允许es6 function*之间有空格
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0 // 允许
  }
}
