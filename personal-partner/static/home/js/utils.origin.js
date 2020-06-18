





















































































































































































var YEK_SED = 'srentrap';

// 基础路径baseUrl，自适应预发布pretest_dzg和普通环境
var baseUrl = /pretest_gpas/.test(window.location.href) ? '/pretest_gpas' : '/gpas';

// DES加密
var encryptByDES = {
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

var decryptByDES = {
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
function encryptByMd5(str) {
  return CryptoJS.MD5(str).toString();
};

function isWechat() {
  return /micromessenger/i.test(window.navigator.userAgent + window.navigator.platform);
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent + window.navigator.platform);
}
function isAndroid() {
  return /android|linux/i.test(window.navigator.userAgent + window.navigator.platform);
}
function isWeibo() {
  return /weibo/i.test(window.navigator.userAgent + window.navigator.platform);
}
function isQQ() {
  return /qq/i.test(window.navigator.userAgent + window.navigator.platform);
}
function isZT() { // 是否是四川移动掌厅APP
  return /scmcc.mobile/i.test(window.navigator.userAgent + window.navigator.platform);
}

// 获取url地址中的参数
function getParamValue(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return (r[2]); return null;
};

/**
 * 封装发送请求所需的参数
 * @param reqParams：请求的参数(requrl, params, sucCb, failCb, originParams)
 * @returns
 */
function getRequestParams(requrl, params, sucCb, failCb, originParams) {
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
function sendGetRequest(reqParams) {
  $.ajax({
    type: 'GET',
    url: reqParams.requrl,
    dataType: 'json',
    headers: {
      'token': getSession('partnerticket'),
      'sourceType': 'public'
    },
    success: function(data) {
      reqParams.sucCb && reqParams.sucCb(data, reqParams.originParams);
    },
    error: function(ex) {
      reqParams.failCb && reqParams.failCb(ex, reqParams.originParams);
    }
  })
};

/*
* 用于存储本地信息
*/
function saveStorage(name, value) {
  var encryptValue = encryptByDES.CBC(JSON.stringify(value), 'dzgstorage');
  window.localStorage.setItem(name, encryptValue);
};

/*
* 用于读取本地信息
*/
function getStorage(name) {
  var encryptLoginInfo = window.localStorage.getItem(name);
  if (encryptLoginInfo) {
    encryptLoginInfo = decryptByDES.CBC(encryptLoginInfo, 'dzgstorage');
    return encryptLoginInfo.replace(/^"|"$/g, '').replace(/\\/g, '') || '';
  }
  return '';
};

/*
* 用于删除本地信息
*/
function removeStorage(name) {
  window.localStorage.removeItem(name);
};
/*
* 用于存储session信息
*/
function saveSession(name, value) {
  var encryptValue = encryptByDES.CBC(JSON.stringify(value), 'dzgsession');
  window.sessionStorage.setItem(name, encryptValue);
};

/*
* 用于读取session信息
*/
function getSession(name, ifParse) {
  var encryptLoginInfo = window.sessionStorage.getItem(name);
  if (encryptLoginInfo) {
    encryptLoginInfo = decryptByDES.CBC(encryptLoginInfo, 'dzgsession');
    var result = encryptLoginInfo.replace(/^"|"$/g, '').replace(/\\/g, '') || '';
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
function removeSession(name) {
  window.sessionStorage.removeItem(name);
};
/*
 * 获取wx.config的参数
 */
function getJsApiConfig(shareObj) {
  if (!isWechat()) return;
  var encryptData = getStorage('ptapishare');
  if (encryptData) {
    wxConfig(shareObj);
    return;
  }
  var url = baseUrl + '/register/wx/jsapi/config?url=' + encodeURI(window.location.href.split('#/')[0]);
  var reqParams = getRequestParams(url, '', getConfigSuc, getConfigFail, shareObj);
  sendGetRequest(reqParams);
};
function getConfigSuc(json, shareObj) {
  if (json.status === 0) {
    var encryptData = json.data;
    saveStorage('ptapishare', encryptData);
    wxConfig(shareObj);
  } else {
    console.info(json.msg);
  }
}
function getConfigFail(ex) {
}
/*
 * 微信API初始化
 */
function wxConfig(shareObj) {
  var encryptData = getStorage('ptapishare');
  if (encryptData) {
    var decryptData = JSON.parse(decryptByDES.CBC(encryptData, YEK_SED));
    var CONFIG = {
      appId: decryptData.appId,
      timestamp: decryptData.timestamp,
      nonceStr: decryptData.nonceStr,
      signature: decryptData.signature,
      debug: false,
      jsApiList: [
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'updateAppMessageShareData',
        'updateTimelineShareData',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'onMenuShareQZone',
        'hideMenuItems',
        'showMenuItems'
      ]
    };

    wx.config(CONFIG);
    wx.ready(function() {
      hideMenuItems(shareObj);
    });
    wx.error(function() {
      if (/palmte.cn/i.test(window.location.href)) {
        saveStorage('ptapishare', '');
        getJsApiConfig(shareObj);
      }
    });
  } else {
    if (/palmte.cn/i.test(window.location.href)) {
      saveStorage('ptapishare', '');
      getJsApiConfig(shareObj);
    }
  }
}

function showMenuItems(showList) {
  var list = [
    'menuItem:share:qq',
    'menuItem:share:weiboApp',
    'menuItem:share:appMessage',
    'menuItem:share:timeline',
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

function hideMenuItems(shareObj) {
  var list = [
    'menuItem:share:qq',
    'menuItem:share:weiboApp',
    // 'menuItem:share:appMessage',
    // 'menuItem:share:timeline',
    // 'menuItem:favorite',
    'menuItem:share:facebook',
    'menuItem:share:QZone',
    'menuItem:copyUrl',
    'menuItem:openWithSafari',
    'menuItem:openWithQQBrowser',
    'menuItem:share:email'
  ];
  if (shareObj && shareObj.hideList && shareObj.hideList.length > 0) {
    list = shareObj.hideList;
  }
  wx.hideMenuItems({
    menuList: list, // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
    success: function(res) {
      var obj = {
        title: '四川移动合伙人',
        desc: '猛戳进入立即注册/登录，请搜索关注“四川移动合伙人”公众号了解更多',
        link: window.location.origin + '/gpas/register/wx/oAuth/userInfo',
        imgUrl: window.location.origin + '/gpas/partner/static/img/cmcc_logo.png',
        success: function() {
        },
        cancel: function() {
        }
      };
      if (shareObj) {
        obj = shareObj;
        if (shareObj.excuteFn) shareObj.excuteFn();
        showMenuItems(shareObj.showList);
      }
      // 创建分享到微信的链接
      var sendMessageObj = {
        title: obj.title,
        desc: obj.desc,
        link: obj.outerWechatLink || obj.link,
        imgUrl: obj.imgUrl,
        success: function() {
          obj.success();
        },
        cancel: function() {
          obj.cancel();
        }
      };
      // 监听“发送给好友”按钮点击、自定义分享内容及分享结果接口
      wx.updateAppMessageShareData(sendMessageObj);
      // 创建分享到微信外的链接
      // var sendOuterMessageObj = {
      //   title: obj.title,
      //   desc: obj.desc,
      //   link: obj.outerWechatLink,
      //   imgUrl: obj.imgUrl,
      //   success: function() {
      //     obj.success();
      //   },
      //   cancel: function() {
      //     obj.cancel();
      //   }
      // };
      // 监听“分享到QQ”按钮点击、自定义分享内容及分享结果接口
      // wx.onMenuShareQQ(sendOuterMessageObj);
      // 监听“分享到微博”按钮点击、自定义分享内容及分享结果接口
      // wx.onMenuShareWeibo(sendOuterMessageObj);
      // 创建分享到朋友圈的参数
      var timelineObj = {
        title: obj.timelineTitle || obj.title,
        link: obj.outerWechatLink || obj.link,
        imgUrl: obj.imgUrl,
        success: function() {
          obj.success();
        },
        cancel: function() {
          obj.cancel();
        }
      };
      // 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
      wx.updateTimelineShareData(timelineObj);
      // 创建分享到QQ空间的参数
      // var qzoneObj = {
      //   title: obj.timelineTitle || obj.title,
      //   desc: obj.desc,
      //   link: obj.outerWechatLink,
      //   imgUrl: obj.imgUrl,
      //   success: function() {
      //     obj.success();
      //   },
      //   cancel: function() {
      //     obj.cancel();
      //   }
      // };
      // 监听“分享到QQ空间”按钮点击、自定义分享内容及分享结果接口
      // wx.onMenuShareQZone(qzoneObj);
    },
    fail: function(res) {
      hideMenuItems(shareObj);
    }
  });
}