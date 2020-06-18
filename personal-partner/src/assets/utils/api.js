// eslint-disable-next-line
import Bus from 'assets/utils/bus'
import * as Dialog from './dialog'
import {
  doRequest
} from './doRequest'
const baseUrl = /pretest_gpas/.test(window.location.href) ? '/pretest_gpas' : '/gpas'
const authLink = `${baseUrl}/school/partner/wx/oAuth/userInfo`

const getWxConfig = async () => {
  let res = await doRequest(`${baseUrl}/register/wx/jsapi/config?url=${encodeURI(window.location.href.split('#')[0])}`, `GET`, ``, false, false)
  if (res) {
    if (res.status === 0) {
      let encryptData = res.data
      let decryptData = Bus.utils.decryptByDES.CBC(encryptData, Bus.utils.YEK_SED)
      decryptData = JSON.parse(decryptData)
      return decryptData
    } else {
      // Bus.$dialog({
      //   title: '提示',
      //   content: `获取验证码失败。${res.msg}`,
      //   noCancelBtn: true,
      //   onOkBtn: function() {
      //     this.close()
      //   }
      // })
    }
  }
}
const oldPartner = {
  getUserInfoByOpenId: (urlParam) => doRequest(`${baseUrl}/register/partner/${urlParam}`, `GET`), // 通过openId或手机号查询用户信息
  preBinding: (params) => doRequest(`${baseUrl}/register/partner/preBinding`, `POST`, params), // 预绑定校验接口
  binding: (params) => doRequest(`${baseUrl}/register/partner/binding`, `POST`, params) // 绑定接口
}
const getUserInfo = (urlParam) => doRequest(`${baseUrl}/school/partner/info/${urlParam}`, `GET`)
const checkIdExist = (id) => doRequest(`${baseUrl}/school/partner/exist/${id}`, `GET`, ``, true, false)
const getRichText = (code) => doRequest(`${baseUrl}/richText/get?code=${code}`, `GET`)

// 验证码接口
const getSms = async (phone) => {
  let res = await doRequest(
    `${baseUrl}/verifyCode/send`,
    `POST`,
    {
      'phone': Bus.utils.encryptByDES.CBC('' + phone, Bus.utils.YEK_SED)
    }
  )
  console.log(res)
  if (res) {
    if (res.status === 0) {
      Dialog.success('获取验证码成功')
      return true
    } else {
      Dialog.wrong(`获取验证码失败。${res.msg}`)
    }
  }
}
const getBusinessSms = async (params) => {
  let res = await doRequest(
    `${baseUrl}/school/business/sendMsg`,
    'POST',
    params
  )
  console.log(res)
  if (res) {
    if (res.ResultCode === 1000) {
      Dialog.success('获取验证码成功')
      return true
    } else {
      Dialog.wrong(`获取验证码失败。${res.Message}`)
    }
  }
}

// register 注册
const checkInviteCodeType = (phone) => doRequest(`${baseUrl}/regiment/captainType/${phone}`, `GET`) // 校验邀请码类型：老(个人)合伙人、新(渠道)合伙人
const checkLength3InviteCodeType = (inviteCode) => doRequest(`${baseUrl}/regiment/businessType/${inviteCode}`, `GET`) // 校验3位渠道合伙人邀请码类型。3:泛渠道队长
const preRegister = (params) => doRequest(`${baseUrl}/school/partner/preRegister`, `POST`, params)
const register = (params) => doRequest(`${baseUrl}/school/partner/register`, `POST`, params)
const getIndustry = (urlParam) => doRequest(`${baseUrl}/school/industry/parentId/${urlParam}`, `GET`)

// login 登录
const userLogin = (params) => doRequest(`${baseUrl}/school/partner/login`, `POST`, params)
// logout
const userLogout = (params) => doRequest(`${baseUrl}/school/partner/logout`, `POST`, params)
// statistics
const getPartnerSum = (params) => doRequest(`${baseUrl}/school/stat/partnerSum`, `GET`, params)
const getPartnerList = (params) => doRequest(`${baseUrl}/school/stat/partnerList`, `GET`, params, false)
// index 首页
const getPackageSalaryList = (params) => doRequest(`${baseUrl}/school/packageSalary/list`, 'GET', params)
const getMerchantPartnerSUm = (params) => doRequest(`${baseUrl}/school/stat/merchant/partnerSum`, `GET`, params)
const getMerchantPartnerList = (params) => doRequest(`${baseUrl}/school/stat/merchantList`, `GET`, params, false)
const getFeeInfo = (params) => doRequest(`${baseUrl}/school/business/getPackageSalaryInfo`, `GET`, params, false) // 获取资费列表，没有详情和banner
const getBusinessList = (params) => doRequest(`${baseUrl}/school/business/getPackageSalaryInfoTwo`, `GET`, params, false) // 获取资费列表，有详情和banner
// shareshop 分享办理
const getListForShare = (params) => doRequest(`${baseUrl}/school/packageSalary/listForShare`, 'GET', params) // 分享办理页面获取资费列表和个人信息
// order
const getOrderList = (params) => doRequest(`${baseUrl}/school/business/getOrderList`, `GET`, params, false)
// introduce
const getIntroduce = (params) => doRequest(`${baseUrl}/school/partner/introduce`, `GET`, params)
// rule
const getRule = (params) => doRequest(`${baseUrl}/school/packageSalary/salaryRules`, `GET`, params)
// promisefee
const submitPromisefee = (params) => doRequest(`${baseUrl}/school/business/submit`, 'POST', params)
// broadbandReservation
const getAreas = (params) => doRequest(`${baseUrl}/school/bd/areas`, 'POST', params)
const searchAddress = (params) => doRequest(`${baseUrl}/school/bd/searchAddress`, 'POST', params)
const checkBlPhone = (params) => doRequest(`${baseUrl}/school/bd/sChkBlPhone`, 'POST', params)
const reservationSave = (params) => doRequest(`${baseUrl}/school/bd/reservation`, 'POST', params)
// 透传
const queryBandReorder = (params) => doRequest(`${baseUrl}/common/forwardRpc/esop/rest/sDynSvc?direct=0`, 'POST', params)
const tvBusiness = {
  search209: (params) => doRequest(`${baseUrl}/school/tv/getBroadbandNo`, 'POST', params),
  queryTvInfo: (params) => doRequest(`${baseUrl}/school/tv/queryTvInfo`, 'GET', params),
  submit: (params) => doRequest(`${baseUrl}/school/tv/submitTv`, 'POST', params)
}
// infoStream
const search5gDevice = (params) => doRequest(`${baseUrl}/school/5gDevice/find/${params.type}/${params.name}`, `GET`)
const save5gDevice = (params) => doRequest(`${baseUrl}/school/5gDevice/save`, `POST`, params)
// 聚合页面
const getConsoFeeList = (params) => doRequest(`${baseUrl}/packageSalary/getMergePackage`, 'GET', params)
export default {
  oldPartner,
  getWxConfig,
  baseUrl,
  authLink,
  getUserInfo,
  checkIdExist,
  getRichText,
  // sms
  getSms,
  getBusinessSms,
  // register
  getIndustry,
  checkInviteCodeType,
  checkLength3InviteCodeType,
  preRegister,
  register,
  // statistics
  getPartnerSum,
  getPartnerList,
  // login
  userLogin,
  // order
  getOrderList,
  // logout
  userLogout,
  // index
  getPackageSalaryList,
  getMerchantPartnerSUm,
  getMerchantPartnerList,
  getFeeInfo,
  getBusinessList,
  // shareShop
  getListForShare,
  // introduce
  getIntroduce,
  getRule,
  // promisefee
  submitPromisefee,
  // broadbandReservation
  getAreas,
  searchAddress,
  checkBlPhone,
  reservationSave,
  queryBandReorder,
  tvBusiness,
  // infoStream
  search5gDevice,
  save5gDevice,
  // 聚合页面
  getConsoFeeList
}
