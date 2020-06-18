/* eslint-disable */
import CryptoJS from 'crypto-js';
import Qs from 'qs';
export var YEK_SED = 'srentrap';
export var sourceType = isWechat() ? 'public' : 'h5';
export var isZTBoolean = false;
export var isDZGBoolean = false;
export var isWechatBoolean = false;
export var apiKey = 'campusptapi';

// DES加密
export var encryptByDES = {
  ECB: function(message, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.ciphertext.toString().toLowerCase();
  },
  CBC: function(message, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
      iv: keyHex,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.ciphertext.toString().toLowerCase();
  }
};

export var decryptByDES = {
  ECB: function(ciphertext, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var decrypted = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Hex.parse(ciphertext.toLowerCase())
    }, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  },
  CBC: function(ciphertext, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var decrypted = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Hex.parse(ciphertext.toLowerCase())
    }, keyHex, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: keyHex
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
};

// md5
export function encryptByMd5(str) {
  return CryptoJS.MD5(str).toString();
};

export function isWechat() {
  return /micromessenger/i.test(window.navigator.userAgent + window.navigator.platform);
}
export function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent + window.navigator.platform);
}
export function isAndroid() {
  return /android|linux/i.test(window.navigator.userAgent + window.navigator.platform);
}
export function isWeibo() {
  return /weibo/i.test(window.navigator.userAgent + window.navigator.platform);
}
export function isQQ() {
  return /qq/i.test(window.navigator.userAgent + window.navigator.platform);
}
export function isZT() { // 是否是四川移动掌厅APP
  return /scmcc.mobile/i.test(window.navigator.userAgent + window.navigator.platform);
}
export function isDZG() {
  let dzgIosEnv = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.exitWeb;
  let dzgAndroidEnv = window.client && window.client.exitWeb;
  return dzgIosEnv || dzgAndroidEnv;
}

// 基础路径baseUrl，自适应预发布pretest_dzg和普通环境
export var baseUrl = /pretest_gpas/.test(window.location.href) ? '/pretest_gpas' : '/gpas';

// 公共变量（依赖baseUrl）
export var Constants = {
  apiPrefix: baseUrl + '/api/v2', // API 接口Host
  // cmccMobileReg: /^1(3[4-9]|4[7]|5[012789]|7[8]|8[23478]|9[8]|064[78])\d{8}$/, // 移动号码段 --- 携号转网后不检测号段
  cmccMobileReg: /^1\d{10}$/, // 号码段
  mobileReg: /^1\d{10}$/, // 号码段
  dzgApiV2Host: '/dzg/api/v2',
  dzgApiV2HostRest: '/dzg/api/v2/business/rpc/esop/rest'
};

// 获取url地址中的参数
export function getParamValue(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return (r[2]); return null;
};

// 获取时间戳
export function getTimeStamp() {
  var now = new Date();
  var year = '' + now.getFullYear();
  var month = now.getMonth() + 1 < 10 ? ('0' + (now.getMonth() + 1)) : ('' + (now.getMonth() + 1));
  var day = now.getDate() < 10 ? ('0' + now.getDate()) : ('' + now.getDate());
  var hour = now.getHours() < 10 ? ('0' + now.getHours()) : ('' + now.getHours());
  var minute = now.getMinutes() < 10 ? ('0' + now.getMinutes()) : ('' + now.getMinutes());
  var second = now.getSeconds() < 10 ? ('0' + now.getSeconds()) : ('' + now.getSeconds());
  return year + month + day + hour + minute + second;
}

/**
* 日期格式化
* 例：dateFormat(new Date(), "YYYY/MM/DD hh:mm:ss S");
* 支持格式YYYY,yyyy; MM; DD,dd; HH,hh; mm; ss, S(毫秒)
*/
export function dateFormat(date, fmt) {
  if (!(date instanceof Date)) date = new Date(date);
  var o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  };
  if (/(y+)/i.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o) {
    if ((['d+', 'h+'].indexOf(k) === -1 ? new RegExp('(' + k + ')') : new RegExp('(' + k + ')', 'i')).test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
  }
  return fmt;
};

/**
 * 封装发送请求所需的参数
 * @param reqParams：请求的参数(requrl, params, sucCb, failCb, originParams)
 * @returns
 */
export function getRequestParams(requrl, params, sucCb, failCb, originParams) {
  var reqParams = {};
  reqParams.requrl = requrl;
  reqParams.params = params;
  reqParams.sucCb = sucCb;
  reqParams.failCb = failCb;
  reqParams.originParams = originParams;
  return reqParams;
};

/**
 * 封装发送get请求
 * @param vue：发送请求所在页面的vue实例
 * @param reqParams：请求的参数(vue, reqParams)
 * @returns
 */
export function sendGetRequest(vue, reqParams) {
  var reqUrl = reqParams.requrl;
  if (reqParams.params) {
    var params = '';
    var i = 0;
    for (var key in reqParams.params) {
      if (i === 0) {
        params += '';
      } else {
        params += '&';
      }
      params += key + '=' + reqParams.params[key];
      i++;
    }
    if (/\?/.test(reqUrl)) {
      reqUrl = reqUrl + '&' + params;
    } else {
      reqUrl = reqUrl + '?' + params;
    }
  }
  fetch(reqUrl, {
    method: 'GET',
    headers: {
      'token': getSession('partnerticket'),
      'sourceType': sourceType,
      'saleType': 2,
      'empCode': vue.$route.query.empCode || ''
    }
  }).then(function(res) {
    if (res.ok) {
      return res.json();
    } else {
      if (res.status === 401) {
        logout(vue);
      } else {
        var error = new Error(res.statusText);
        error.response = res;
        throw error;
      }
    }
  }).then(function(json) {
    if (json.status === 1009) {
      logout(vue, json.msg);
      return;
    }
    reqParams.sucCb && reqParams.sucCb(vue, json, reqParams.originParams);
  }).catch(function(ex) {
    reqParams.failCb && reqParams.failCb(vue, ex, reqParams.originParams);
  });
};

/**
 * 封装发送jsonp get请求
 * @param vue：发送请求所在页面的vue实例
 * @param reqParams：请求的参数(vue, reqParams)
 * @returns
 */
export function sendJsonpRequest(vue, reqParams) {
  vue.$jsonp(reqParams.requrl, {
  }).then(function(json) {
    if (json.status === 1009) {
      logout(vue, json.msg);
      return;
    }
    reqParams.sucCb && reqParams.sucCb(vue, json, reqParams.originParams);
  }).catch(function(ex) {
    reqParams.failCb && reqParams.failCb(vue, ex, reqParams.originParams);
  });
};

/**
 * 封装发送post请求
 * @param vue：发送请求所在页面的vue实例
 * @param reqParams：请求的参数(vue, reqParams, contentType)
 * @returns
 */
export function sendPostRequest(vue, reqParams, contentType) {
  var params = '';
  var i = 0;
  for (var key in reqParams.params) {
    if (i === 0) {
      params += '';
    } else {
      params += '&';
    }
    params += key + '=' + reqParams.params[key];
    i++;
  }
  var url = reqParams.requrl + '?' + params;
  var result;
  if (contentType) {
    url = reqParams.requrl;
    result = fetch(url, {
      credentials: 'include',
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': contentType,
        'token': getSession('partnerticket'),
        'sourceType': sourceType
      }
    });
  } else {
    result = fetch(url, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'token': getSession('partnerticket'),
        'sourceType': sourceType
      }
    });
  }
  result.then(function(res) {
    if (res.ok) {
      return res.json();
    } else {
      if (res.status === 401) {
        logout(vue);
      } else {
        var error = new Error(res.statusText);
        error.response = res;
        throw error;
      }
    }
  }).then(function(json) {
    if (json.status === 1009) {
      logout(vue, json.msg);
      return;
    }
    reqParams.sucCb && reqParams.sucCb(vue, json, reqParams.originParams);
  }).catch(function(ex) {
    reqParams.failCb && reqParams.failCb(vue, ex, reqParams.originParams);
  });
};

/**
 * 封装发送json格式的post请求
 * @param vue：发送请求所在页面的vue实例
 * @param reqParams：请求的参数(vue, reqParams)
 * @returns
 */
export function sendJsonPostRequest(vue, reqParams) {
  fetch(reqParams.requrl, {
    method: 'POST',
    body: JSON.stringify(reqParams.params),
    headers: {
      'Content-Type': 'application/json',
      'token': getSession('partnerticket'),
      'sourceType': sourceType,
      'saleType': 2
    }
  }).then(function(res) {
    if (res.ok) {
      return res.json();
    } else {
      if (res.status === 401) {
        logout(vue);
      } else {
        var error = new Error(res.statusText);
        error.response = res;
        throw error;
      }
    }
  }).then(function(json) {
    if (json.status === 1009) {
      logout(vue, json.msg);
      return;
    }
    reqParams.sucCb && reqParams.sucCb(vue, json, reqParams.originParams);
  }).catch(function(ex) {
    reqParams.failCb && reqParams.failCb(vue, ex, reqParams.originParams);
  });
};

/**
 * 封装发送json格式的post请求, 请求参数DES加密
 * @param vue：发送请求所在页面的vue实例
 * @param reqParams：请求的参数(vue, reqParams)
 * @returns
 */
export function sendJsonPostRequestWithDES(vue, reqParams) {
  var desStr = encryptByDES.CBC(JSON.stringify(reqParams.params), YEK_SED);
  fetch(reqParams.requrl, {
    method: 'POST',
    body: desStr,
    headers: {
      'Content-Type': 'application/json',
      'token': getSession('partnerticket'),
      'sourceType': sourceType
    }
  }).then(function(res) {
    if (res.ok) {
      return res.json();
    } else {
      if (res.status === 401) {
        logout(vue);
      } else {
        var error = new Error(res.statusText);
        error.response = res;
        throw error;
      }
    }
  }).then(function(json) {
    if (json.status === 1009) {
      logout(vue, json.msg);
      return;
    }
    reqParams.sucCb && reqParams.sucCb(vue, json, reqParams.originParams);
  }).catch(function(ex) {
    reqParams.failCb && reqParams.failCb(vue, ex, reqParams.originParams);
  });
};

/**
 * 设置cookie值
 * @param c_name
 * @param value
 * @param expiredays
 * @returns
 */
export var setCookie = function(c_name, value, expiredays) {
  var expires = '';
  if (expiredays && expiredays > 0) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    expires = exdate.toGMTString();
  }
  var encryptValue = encryptByDES.CBC(JSON.stringify(value), 'dzgcookie')
  if (expires) {
    document.cookie = c_name + '=' + encryptValue + ';expires=' + expires;
  } else {
    document.cookie = c_name + '=' + encryptValue;
  }
};
/**
 * 从cookie取值
 * @param c_name
 * @returns
 */
export var getCookie = function(c_name) {
  var mycookie = document.cookie;
  if (c_name && mycookie && mycookie.length > 0) {
    var c_start = mycookie.indexOf(c_name + '=');
    if (c_start !== -1) {
      c_start = c_start + c_name.length + 1;
      var c_end = mycookie.indexOf(';', c_start);
      if (c_end === -1) {
        c_end = mycookie.length;
      }
      var decryptStr = decryptByDES.CBC(mycookie.substring(c_start, c_end), 'dzgcookie');
      var result = decryptStr.replace(/^"|"$/g, '').replace(/\\/g, '') || '';
      try {
        result = JSON.parse(result);
      } catch (e) {
        return result;
      }
      return result;
    }
  }
  return '';
};
/*
* 用于存储本地信息
*/
export function saveStorage(name, value) {
  var encryptValue = encryptByDES.CBC(JSON.stringify(value), 'dzgstorage');
  window.localStorage.setItem(name, encryptValue);
};

/*
* 用于读取本地信息
*/
export function getStorage(name) {
  var encryptStr = window.localStorage.getItem(name);
  if (encryptStr) {
    encryptStr = decryptByDES.CBC(encryptStr, 'dzgstorage');
    var result = encryptStr.replace(/^"|"$/g, '').replace(/\\/g, '') || '';
    try {
      result = JSON.parse(result);
    } catch (e) {
      return result;
    }
    return result;
  }
  return '';
};

/*
* 用于删除本地信息
*/
export function removeStorage(name) {
  window.localStorage.removeItem(name);
};

/*
* 用于存储session信息
*/
export function saveSession(name, value) {
  var encryptValue = encryptByDES.CBC(JSON.stringify(value), 'dzgsession');
  window.sessionStorage.setItem(name, encryptValue);
};

/*
* 用于读取session信息
*/
export function getSession(name) {
  var encryptStr = window.sessionStorage.getItem(name);
  if (encryptStr) {
    encryptStr = decryptByDES.CBC(encryptStr, 'dzgsession');
    var result = encryptStr.replace(/^"|"$/g, '').replace(/\\/g, '') || '';
    try {
      result = JSON.parse(result);
    } catch (e) {
      return result;
    }
    return result;
  }
  return '';
};

/*
* 用于删除session信息
*/
export function removeSession(name) {
  window.sessionStorage.removeItem(name);
};

/*
 * 解密参数params，获取用户信息
 */
export function getSourceInfo(ifConsole = true) {
  let params = decryptByDES.CBC(getParamValue('params'), YEK_SED);
  if (params) {
    try {
      let srcInfo = JSON.parse(params);
      if (ifConsole) console.log('srcInfo', srcInfo);
      return srcInfo;
    } catch (e) {
      console.info(e);
      return null;
    }
  } else {
    return null;
  }
};

/*
 * 临时解决IOS Webview不能动态识别title的问题 ------ 已有更优解决方案pageRouter
 */
export function reload4Ios() {
  if (isZTBoolean && isIOS() && location.href.indexOf('&reloaded=1') === -1) {
    location.replace(location.href + '&reloaded=1');
    location.reload();
  }
};

/*
 * 为兼容掌厅的跳转方法
 */
export function pageRouter(vue, routeObj, routeType = 'push') {
  if (routeObj.path === vue.$route.path) {
    return;
  }
  if ((isZTBoolean || isQQ()) && isIOS()) {
    let url = window.location.href.split('#/')[0];
    if (/\?/.test(url)) {
      url += '&';
    } else {
      url += '?';
    }
    url = url.replace(/&ts=[0-9]+/ig, '');
    url += 'ts=' + (new Date().getTime()) + '#' + routeObj.path;
    let query = Qs.stringify(routeObj.query);
    if (query) {
      url += '?' + query;
    }
    if (routeType === 'replace') {
      window.location.replace(url);
      return;
    }
    window.location.href = url;
  } else {
    vue.$router[routeType](routeObj);
  }
}

/*
 * 去掉location.search的跳转中间件
*/
export function jumpPage(vue, routeObj, routeType = 'push') {
  if (window.location.search) {
    let urlPrefix = window.location.origin + window.location.pathname
    let path = routeObj.path
    let query = routeObj.query
    let queryStr = Qs.stringify(query)
    let url = `${urlPrefix}#${path}`
    if (queryStr) {
      url += `?${queryStr}`
    }
    if (routeType === 'replace') {
      window.location.replace(url)
      return
    }
    window.location.href = url
  } else {
    pageRouter(vue, routeObj, routeType)
  }
}
/*
 * 初始化系统参数，如果参数中没有sourceType，则默认为公众号页面public
 */
export function initSystem() {
  var srcInfo = getSourceInfo(false);
  if (srcInfo) {
    saveSession('ptSourceInfo', srcInfo);
  } else {
    removeSession('ptSourceInfo');
    sourceType = '';
  }
};
// 初始化系统必要参数
if (getParamValue('params')) initSystem();

/*
 * 通用关闭方法
 */
export function closePage() {
  if (isWechat()) { // 微信关闭webview
    wx.closeWindow();
  } else if (isDZG()) { // 大掌柜关闭webview
    dzgExitWeb();
  } else if (isZT()) { // 掌厅关闭webview
    console.info('掌厅未提供关闭方法');
  } else { // 其他情况关闭页面
    console.info('无法关闭');
  }
};

/*
 * 统一处理关闭异常页面
 */
export function closeIllegalPage(vue, msg) {
  vue.$messagebox.alert(msg || '未获取到您的信息，请退出后重新进入页面').then(() => {
    closePage();
  }).catch(e => {
    closePage();
  });
};

/*
 * 大掌柜关闭页面方法
 */
export function dzgExitWeb() {
  if (isIOS()) {
    window.webkit.messageHandlers.exitWeb.postMessage(null);
  } else if (getParamValue('runtimePlat') === 'pc') {
    window.parent.pc.exitWeb();
  } else {
    window.client.exitWeb();
  }
};

export function handleShare(vue, shareObj) {
  if (isZT()) {
    ZTShare(vue, shareObj);
  } else if (isDZG()) {
    DZGShare(vue, shareObj);
  }
};

/*
 *  掌厅分享
 */
export function ZTShare(vue, shareObj) {
  if (!isZT()) {
    vue.$messagebox.alert('请在四川移动掌厅分享');
    return;
  }
  var sharePic = shareObj.sharePic || `${window.location.origin + baseUrl}/partner/static/img/cmcc_logo.png`;
  if (isIOS()) {
    getShareInfoShowShareBtnWithType(shareObj.shareDesc, shareObj.shareLink, sharePic, shareObj.shareTitle);
  } else {
    jumpShare.jumpToShare(shareObj.shareTitle, '', shareObj.shareLink, shareObj.shareDesc, '', 'UNKNOWN_FOR_H5', sharePic);
  }
};

/*
 * 大掌柜分享
 */
export function DZGShare(vue, shareObj) {
  if (!isDZG()) {
    vue.$messagebox.alert('请在四川移动大掌柜分享');
    return;
  }
  var sharePic = shareObj.sharePic || `${window.location.origin + baseUrl}/partner/static/img/cmcc_logo.png`;
  if (isIOS()) {
    window.webkit.messageHandlers.handleShare.postMessage([shareObj.shareTitle, shareObj.shareDesc, sharePic, shareObj.shareLink]);
  } else {
    window.client.handleShare(shareObj.shareTitle, shareObj.shareDesc, sharePic, shareObj.shareLink);
  }
};

export function setWxShare(shareObj) {
  wx.ready(() => {
    let obj = {
      title: shareObj.title || document.title,
      timelineTitle: shareObj.timelineTitle || shareObj.title || document.title,
      desc: shareObj.desc || shareObj.link,
      link: shareObj.link,
      imgUrl: shareObj.imgUrl || `${window.location.origin + baseUrl}/campuspartner/pages/img/cmcc_logo.png`
    }
    // 监听“发送给好友”按钮点击、自定义分享内容及分享结果接口
    wx.onMenuShareAppMessage(obj)
    // wx.updateAppMessageShareData(obj, res => {
    //   console.log(res)
    // })
    // 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
    let timelineObj = {
      title: obj.timelineTitle || obj.title,
      desc: obj.desc,
      link: obj.link,
      imgUrl: obj.imgUrl
    }
    wx.onMenuShareTimeline(timelineObj)
    // wx.updateTimelineShareData(timelineObj, res => {
    //   console.log(res)
    // })
    // 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
    wx.onMenuShareQQ(obj)
    // 监听“分享到微博”按钮点击、自定义分享内容及分享结果接口
    wx.onMenuShareWeibo(obj)
    // 监听“分享到QQ空间”按钮点击、自定义分享内容及分享结果接口
    wx.onMenuShareQZone(obj)
  })
}
export function hideMenuItems () {
  wx.ready(() => {
    let list = [
      // 'menuItem:share:appMessage',
      // 'menuItem:share:timeline',
      // 'menuItem:share:qq',
      // 'menuItem:share:weiboApp',
      // 'menuItem:favorite',
      // 'menuItem:share:facebook',
      // 'menuItem:share:QZone',
      // 'menuItem:editTag',
      // 'menuItem:delete',
      'menuItem:copyUrl'
      // 'menuItem:originPage',
      // 'menuItem:readMode',
      // 'menuItem:openWithQQBrowser',
      // 'menuItem:openWithSafari',
      // 'menuItem:share:email'
    ]
    wx.hideMenuItems({
      menuList: list, // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
      success: (res) => {},
      fail: (res) => {
        hideMenuItems()
      }
    })
  })
}
function reMakeParams () {
  let oldParamsJson = getSession('ptSourceInfo', true);
  if (/path=followreward/.test(oldParamsJson.info)) {
    delete oldParamsJson.info;
  }
  let decryptedParams = encryptByDES.CBC(JSON.stringify(oldParamsJson), YEK_SED);
  return decryptedParams;
}
/*
* 注销方法
*/
export function logout(vue, msg) {
  // console.log('退出');
  removeSession('partnerticket');
  vue.$messagebox.alert('登录超时，点击确定重新登录').then(() => {
    // pageRouter(vue, '/', 'replace');
    let params = reMakeParams();
    let url = window.location.origin + baseUrl + '/partner/?params=' + params;
    if (process.env.NODE_ENV === 'development' || /192.168.|localhost/i.test(window.location.origin)) {
      url = window.location.origin + '/?params=' + params;
    }
    window.location.replace(url);
  });
};

export function getFeeType (type) {
  const TYPE_MODE_MAP = {
    0: 'MAIN_MODE',
    1: 'ADD_MODE',
    2: 'BUSINESS_MODE',
    3: 'BUSINESS_SMS_MODE'
  };
  return TYPE_MODE_MAP[type];
};

export function getSmsFeeType (type) {
  if ('' + type === '0' || '' + type === '1') {
    return 'PRC';
  }
  return 'MARK';
};
