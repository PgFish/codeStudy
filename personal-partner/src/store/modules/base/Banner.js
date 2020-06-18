import { Constants, getRequestParams, getLoginInfo } from '../../../assets/utils';
import api from '../../../assets/api/api';
import * as types from '../../mutation-types';

// initial state
const state = {
  banners: {}
};

// getters
const getters = {
  banners: state => state.banners
};

const actions = {
  [types.BASE_BANNERS_ACTION] ({commit, state}, vue) {
    commit(types.BASE_BANNERS_REQUEST);
    let url = Constants.apiV2Host + '/StoreServer/NewsInfo/GainAdvertisementList?token=' + getLoginInfo('token') + '&serverType=1';
    let reqParams = getRequestParams(url, '', (payload) => commit(types.BASE_BANNERS_SUCCESS, payload), (payload) => commit(types.BASE_BANNERS_FAILURE, payload), '');
    api.get(vue, reqParams);
  }
};
// mutations
const mutations = {
  [types.BASE_BANNERS_CLEAN] (state) {
    state.banners = {};
  },

  [types.BASE_BANNERS_REQUEST] (state) {
    state.banners = {
      ...state.banners,
      loading: true,
      status: 0,
      msg: ''
    };
  },

  [types.BASE_BANNERS_SUCCESS] (state, payload) {
    state.banners = {
      ...state.banners,
      ...payload.json,
      loading: false
    };
  },

  [types.BASE_BANNERS_FAILURE] (state, payload) {
    state.banners = {
      ...state.banners,
      loading: false,
      ...payload.ex
    };
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
