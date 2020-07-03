import CryptoJS from 'crypto-js';
import { Indicator } from 'mint-ui';
import Qs from 'qs';
export var YEK_SED = 'srentrap';
export var sourceType = '';
export var isZTBoolean = false;
export var isDZGBoolean = false;
export var isWechatBoolean = false;
export var apiKey = 'ptapi';

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
      'empCode': 'ob0086'
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
export function getStorage(name, ifParse = true) {
  var encryptStr = window.localStorage.getItem(name);
  if (encryptStr) {
    encryptStr = decryptByDES.CBC(encryptStr, 'dzgstorage');
    var result = encryptStr.replace(/^"|"$/g, '').replace(/\\/g, '') || '';
    if (ifParse) {
      try {
        result = JSON.parse(result);
      } catch (e) {
        return result;
      }
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
export function getSession(name, ifParse = true) {
  var encryptStr = window.sessionStorage.getItem(name);
  if (encryptStr) {
    encryptStr = decryptByDES.CBC(encryptStr, 'dzgsession');
    var result = encryptStr.replace(/^"|"$/g, '').replace(/\\/g, '') || '';
    if (ifParse) {
      try {
        result = JSON.parse(result);
      } catch (e) {
        return result;
      }
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
 * 初始化系统参数，如果参数中没有sourceType，则默认为公众号页面public
 */
export function initSystem() {
  var srcInfo = getSourceInfo(false);
  if (srcInfo) {
    saveSession('ptSourceInfo', srcInfo);
    sourceType = srcInfo.sourceType || 'public';
    if (sourceType === 'zhuangwei') {
      apiKey = 'zwapi';
    }
    isWechatBoolean = (sourceType === 'public' || sourceType === 'zhuangwei') && isWechat(); // 是微信链接，并且是微信浏览器
    isZTBoolean = sourceType === 'zhangting' && isZT(); // 是掌厅链接，并且是掌厅浏览器
    isDZGBoolean = sourceType === 'dzg' && isDZG(); // 是大掌柜链接，并且是大掌柜浏览器
  } else {
    removeSession('ptSourceInfo');
    sourceType = '';
    isZTBoolean = false;
    isDZGBoolean = false;
    isWechatBoolean = false;
  }
};

// 初始化系统必要参数
if (getParamValue('params')) {
  initSystem();
} else {
  console.log(getParamValue('to'));
  if (/(\/)?emp/i.test(getParamValue('to'))) {
    sourceType = 'employee';
  } else {
    sourceType = '';
  }
}

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
  Indicator.close();
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

/*
 * 获取wx.config的参数
 */
export function getJsApiConfig(shareObj) {
  if (!isWechat() || (isWechat() && !/palmte.cn/.test(window.location.href))) {
    if (shareObj && shareObj.excuteFn) shareObj.excuteFn();
    return;
  }
  let encryptData = getStorage(apiKey);
  if (encryptData) {
    wxConfig(shareObj);
    return;
  }
  let url = `${baseUrl}/register/wx/jsapi/config?url=${encodeURI(window.location.href.split('#')[0])}`;
  if (sourceType === 'zhuangwei') {
    url = `${baseUrl}/zwregister/wx/jsapi/config?url=${encodeURI(window.location.href.split('#')[0])}`;
  }
  let reqParams = getRequestParams(url, '', getConfigSuc, getConfigFail, shareObj);
  sendGetRequest('', reqParams);
};
function getConfigSuc(vue, json, shareObj) {
  if (json.status === 0) {
    let encryptData = json.data;
    saveStorage(apiKey, encryptData);
    wxConfig(shareObj);
    // shareObj.flag = true;
  } else {
    console.info(json.msg);
  }
}
function getConfigFail(vue, ex) {

}
/*
 * 微信API初始化
 */
export function wxConfig(shareObj) {
  var encryptData = getStorage(apiKey);
  if (encryptData) {
    let decryptData = decryptByDES.CBC(encryptData, YEK_SED);
    wx.config({
      ...JSON.parse(decryptData),
      // debug: !/palmte.cn/i.test(window.location.href), // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      jsApiList: [
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'onMenuShareQZone',
        // 'updateAppMessageShareData',
        // 'updateTimelineShareData',
        'hideMenuItems',
        'showMenuItems'
      ]
    });
    wx.ready(() => {
      hideMenuItems(shareObj);
    });
    wx.error((res) => {
      if (/palmte.cn/i.test(window.location.href)) {
        saveStorage(apiKey, '');
        getJsApiConfig(shareObj);
      }
    });
  } else {
    if (/palmte.cn/i.test(window.location.href)) {
      saveStorage(apiKey, '');
      getJsApiConfig(shareObj);
    }
  }
}
export function showMenuItems(showList) {
  var list = [
    'menuItem:share:appMessage',
    'menuItem:share:timeline',
    'menuItem:share:qq',
    'menuItem:share:weiboApp',
    'menuItem:favorite',
    'menuItem:share:QZone'
  ];
  if (showList && showList.length > 0) {
    list = showList;
  }
  wx.showMenuItems({
    menuList: list
  });
}

export function hideMenuItems(shareObj) {
  var list = [
    // 'menuItem:share:appMessage',
    // 'menuItem:share:timeline',
    'menuItem:share:qq',
    'menuItem:share:weiboApp',
    // 'menuItem:favorite',
    'menuItem:share:facebook',
    'menuItem:share:QZone',
    'menuItem:editTag',
    'menuItem:delete',
    'menuItem:copyUrl',
    'menuItem:originPage',
    'menuItem:readMode',
    'menuItem:openWithQQBrowser',
    'menuItem:openWithSafari',
    'menuItem:share:email'
  ];
  if (shareObj && shareObj.hideList && shareObj.hideList.length > 0) {
    list = shareObj.hideList;
  }
  wx.hideMenuItems({
    menuList: list, // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
    success: function(res) {
      let obj = {
        title: '四川移动合伙人',
        desc: '猛戳进入立即注册/登录，请搜索关注“四川移动合伙人”公众号了解更多',
        link: `${window.location.origin + baseUrl}/register/wx/oAuth/userInfo`,
        imgUrl: `${window.location.origin + baseUrl}/partner/static/img/cmcc_logo.png`
      };
      let serverUserInfo = getSession('ptDetailInfo', true);
      if (serverUserInfo && sourceType !== 'zhuangwei') { // 处理分享店铺首页的参数
        obj.title = '欢迎进入我的移动营业厅';
        obj.desc = '移动业务一键办理，号卡免费领，流量特惠办，更有超多福利等你来，点击立即进入>>';
        let partnerId = serverUserInfo.id;
        let phoneNumber = encryptByDES.CBC('' + serverUserInfo.phone, YEK_SED);
        obj.link = `${window.location.origin + baseUrl}/common/redirect?info=path=shareshoplistenp=${phoneNumber}listenptid=${partnerId}`;
        if (sourceType === 'employee') {
          obj.title = '为你推荐一款超值业务，点击可享更多流量和套餐优惠哟';
          obj.desc = '更多精彩超值业务，等你来办！';
          obj.link = `${window.location.origin + baseUrl}/common/new/redirect?to=emp/shareshop&p=${phoneNumber}&ptid=${partnerId}`;
          obj.imgUrl = `${window.location.origin + baseUrl}/partner/static/img/employee/cmcc.png`;
        }
      }
      if (shareObj) {
        obj = {
          title: shareObj.title || obj.title,
          desc: shareObj.desc || obj.desc,
          link: shareObj.link || obj.link,
          imgUrl: shareObj.imgUrl || obj.imgUrl,
          timelineTitle: shareObj.timelineTitle
        };
        if (shareObj.excuteFn) shareObj.excuteFn();
        // if (shareObj.showList && shareObj.showList.length > 0) showMenuItems(shareObj.showList);
        if (shareObj.showList && shareObj.showList.length > 0) {
          showMenuItems(shareObj.showList); // 如果传了就用传的List
        } else {
          showMenuItems();
        }
      }

      if (sourceType === 'zhuangwei') {
        obj.title = obj.title.replace('四川移动合伙人', '装维合伙人');
        obj.desc = obj.desc.replace('四川移动合伙人', '四川移动大掌柜');
        if (obj.timelineTitle) obj.timelineTitle = obj.timelineTitle.replace('四川移动合伙人', '装维合伙人');
        obj.link = obj.link.replace('/register/wx/oAuth/userInfo', '/zwregister/wx/oAuth/userInfo');
      }

      // 监听“发送给好友”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareAppMessage(obj);
      // wx.updateAppMessageShareData(obj, res => {
      //   console.log(res);
      // });
      // 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
      let timelineObj = {
        title: obj.timelineTitle || obj.title,
        desc: obj.desc,
        link: obj.link,
        imgUrl: obj.imgUrl
      };
      wx.onMenuShareTimeline(timelineObj);
      // wx.updateTimelineShareData(timelineObj, res => {
      //   console.log(res);
      // });
      // 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareQQ(obj);
      // 监听“分享到微博”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareWeibo(obj);
      // 监听“分享到QQ空间”按钮点击、自定义分享内容及分享结果接口
      wx.onMenuShareQZone(obj);
    },
    fail: res => {
      hideMenuItems(shareObj);
    }
  });
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
  removeSession('ptDetailInfo');
  removeStorage('partnerticket');
  removeStorage('ptDetailInfo');
  if (sourceType === 'employee') {
    vue.$toast(msg || '登录超时，请重新登录');
    pageRouter(vue, { path: '/emp' });
    return;
  }
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
