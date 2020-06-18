// eslint-disable-next-line
import Bus from 'assets/utils/bus'
import * as Dialog from './dialog'

import axios from 'axios'
import { VueAxios } from './axios'

// 创建 axios 实例
const service = axios.create()

const err = error => {
  Bus.loading && Bus.loading.hide()
  if (error.response) {
    const data = error.response.data
    if (data && error.response.status === 403) {
      Dialog.wrong('拒绝访问，请先获取权限!')
    } else if (data && error.response.status === 401) {
      Dialog.wrong('未授权，请重新登录!')
    } else {
      Dialog.wrong('服务器出错了!')
    }
  }
  return Promise.reject(error)
}

// request interceptor
service.interceptors.request.use(config => {
  const token = Bus.utils.getSession('partnerticket')
  config.headers['sourceType'] = Bus.utils.sourceType
  if (token) {
    config.headers['token'] = Bus.utils.getSession('partnerticket')
  }

  if (config.method === 'get') {
    config.headers['empCode'] = 'ob0086'
  }
  if (config.method === 'post') {
    config.data = JSON.stringify(config.data)
    config.headers['Content-Type'] = 'application/json'
  }
  return config
}, err)

// response interceptor
service.interceptors.response.use(response => {
  return response.data
}, err)

export const doRequest = async (
  url,
  method = 'GET',
  params,
  showLoading = true,
  showErrorToast = true
) => {
  if (showLoading) {
    Bus.loading.show()
  }
  let res = ''
  if (/get/i.test(method)) {
    res = doGet(url, params)
  } else if (/form/i.test(method)) {
    res = doForm(url, params)
  } else if (/jsonp/i.test(method)) {
    res = doJsonp(url, params)
  } else {
    res = doPost(url, params)
  }
  let result = await res
  Bus.loading && Bus.loading.hide()
  return result
}
const doGet = async (url, params) => {
  if (params) {
    var str = ''
    var i = 0
    for (var key in params) {
      if (i === 0) {
        str += ''
      } else {
        str += '&'
      }
      str += key + '=' + params[key]
      i++
    }
    if (/\?/.test(url)) {
      url = url + '&' + str
    } else {
      url = url + '?' + str
    }
  }
  return service.get(url, params)
}
const doPost = async (url, params) => {
  return service.post(url, params)
}
const doJsonp = async (url, params) => {
  console.log(url)
}
const doForm = async (url, params) => {
  console.log(url)
}

const installer = {
  vm: {},
  install(Vue) {
    Vue.use(VueAxios, service)
  }
}

export { installer as VueAxios, service as axios }
