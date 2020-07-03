import axios from 'axios';
import Qs from 'qs';
// import { Loading } from 'element-ui';
import { logout, getLoginInfo, getDigest, DZG_APPKEY, getTimeStamp, runtimePlat, VERSION_CODE } from '../utils';

export default {
  get(vue, reqParams) {
    // let loadingInstance = Loading.service({ fullscreen: true });
    let token = getLoginInfo('token');
    let empCode = '';
    let CmccParam = getLoginInfo('CmccParam');
    if (CmccParam) {
      empCode = CmccParam.EmpCode;
    }
    let auth = 'digest=' + getDigest() + '|appkey=' + DZG_APPKEY + '|timestamp=' + getTimeStamp() + '|origin=' + runtimePlat + '|v=' + VERSION_CODE + '|token=' + (token || '');
    axios.get(reqParams.requrl, {
      headers: {
        'Authorization': auth,
        'empCode': empCode,
        'saleType': '5',
        'token': getLoginInfo('token')
        // 'crossDomain': true,
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      withCredentials: true
    }).then(res => {
      if (res.status === 200) {
        return res.data;
      } else {
        if (res.status === 401) {
          logout(vue);
        } else {
          let error = new Error(res.statusText);
          error.response = res;
          throw error;
        }
      }
      // loadingInstance.close();
    }).then(json => {
      if (json.ResultCode === 1009) {
        // loadingInstance.close();
        logout(vue);
        return;
      }
      reqParams.sucCb && reqParams.sucCb({ vue: vue, json: json, originParams: reqParams.originParams });
      // loadingInstance.close();
    }).catch(ex => {
      // loadingInstance.close();
      let res = ex.response;
      if (res.status === 401) {
        logout(vue);
      } else {
        try {
          vue.$message.error(res.data.Message);
        } catch (e) {
          vue.$message.error(res.statusText);
        }
      }
      console.log(ex.response);
      reqParams.failCb && reqParams.failCb({ vue: vue, ex: ex, originParams: reqParams.originParams });
    });
  },
  post(vue, reqParams) {
    // let loadingInstance = Loading.service({ fullscreen: true });
    let token = getLoginInfo('token');
    let empCode = '';
    let CmccParam = getLoginInfo('CmccParam');
    if (CmccParam) {
      empCode = CmccParam.EmpCode;
    }
    let auth = 'digest=' + getDigest() + '|appkey=' + DZG_APPKEY + '|timestamp=' + getTimeStamp() + '|origin=' + runtimePlat + '|v=' + VERSION_CODE + '|token=' + (token || '');
    axios.post(reqParams.requrl, Qs.stringify(reqParams.params), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
        'empCode': empCode,
        'saleType': '5',
        'token': getLoginInfo('token')
        // 'crossDomain': true
      },
      withCredentials: true
    }).then(res => {
      if (res.status === 200) {
        return res.data;
      } else {
        if (res.status === 401) {
          logout(vue);
        } else {
          let error = new Error(res.statusText);
          error.response = res;
          throw error;
        }
      }
      // loadingInstance.close();
    }).then(json => {
      if (json.ResultCode === 1009) {
        // loadingInstance.close();
        logout(vue);
        return;
      }
      reqParams.sucCb && reqParams.sucCb({ vue: vue, json: json, originParams: reqParams.originParams });
      // loadingInstance.close();
    }).catch(ex => {
      // loadingInstance.close();
      let res = ex.response;
      if (res.status === 401) {
        logout(vue);
      } else {
        try {
          vue.$message.error(res.data.Message);
        } catch (e) {
          vue.$message.error(res.statusText);
        }
      }
      reqParams.failCb && reqParams.failCb({ vue: vue, ex: ex, originParams: reqParams.originParams });
    });
  },
  form(vue, reqParams) {
    // let loadingInstance = Loading.service({ fullscreen: true });
    let token = getLoginInfo('token');
    let empCode = '';
    let CmccParam = getLoginInfo('CmccParam');
    if (CmccParam) {
      empCode = CmccParam.EmpCode;
    }
    let auth = 'digest=' + getDigest() + '|appkey=' + DZG_APPKEY + '|timestamp=' + getTimeStamp() + '|origin=' + runtimePlat + '|v=' + VERSION_CODE + '|token=' + (token || '');
    // let params = '';
    // let i = 0;
    // for (let key in reqParams.params) {
    //   if (i === 0) {
    //     params += '';
    //   } else {
    //     params += '&';
    //   }
    //   params += key + '=' + reqParams.params[key];
    //   i++;
    // }
    // let url = reqParams.requrl + '?' + params;
    axios.post(reqParams.requrl, reqParams.params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Authorization': auth,
        'empCode': empCode,
        'saleType': '5',
        'token': getLoginInfo('token')
      },
      withCredentials: true
    }).then(res => {
      if (res.status === 200) {
        return res.data;
      } else {
        if (res.status === 401) {
          logout(vue);
        } else {
          let error = new Error(res.statusText);
          error.response = res;
          throw error;
        }
      }
      // loadingInstance.close();
    }).then(json => {
      if (json.ResultCode === 1009) {
        // loadingInstance.close();
        logout(vue);
        return;
      }
      reqParams.sucCb && reqParams.sucCb({ vue: vue, json: json, originParams: reqParams.originParams });
      // loadingInstance.close();
    }).catch(ex => {
      // loadingInstance.close();
      let res = ex.response;
      if (res.status === 401) {
        logout(vue);
      } else {
        try {
          vue.$message.error(res.data.Message);
        } catch (e) {
          vue.$message.error(res.statusText);
        }
      }
      reqParams.failCb && reqParams.failCb({ vue: vue, ex: ex, originParams: reqParams.originParams });
    });
  },
  jsonp(vue, reqParams) {
    // let loadingInstance = Loading.service({ fullscreen: true });
    vue.$jsonp(reqParams.requrl, {
    }).then(json => {
      if (json.ResultCode === 1009) {
        // loadingInstance.close();
        logout(vue);
        return;
      }
      reqParams.sucCb && reqParams.sucCb({ vue: vue, json: json, originParams: reqParams.originParams });
      // loadingInstance.close();
    }).catch(ex => {
      reqParams.failCb && reqParams.failCb({ vue: vue, ex: ex, originParams: reqParams.originParams });
      // loadingInstance.close();
    });
  }
};
