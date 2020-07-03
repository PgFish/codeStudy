import { Constants, getRequestParams, getLoginInfo } from '../../../assets/utils';
import api from '../../../assets/api/api';
import * as types from '../../mutation-types';

// initial state
const state = {
  dzgModules: {}
};

// getters
const getters = {
  dzgModules: state => state.dzgModules
};

const actions = {
  [types.BASE_DZGMODULES_ACTION] ({ commit, state }, vue) {
    commit(types.BASE_DZGMODULES_REQUEST);
    let url = Constants.apiV2Host + '/CmccBussServer/Dzg/QueryDzgModules';
    let params = {
      'userid': getLoginInfo('storeMasterId')
    };
    let reqParams = getRequestParams(url, params, (payload) => commit(types.BASE_DZGMODULES_SUCCESS, payload), (payload) => commit(types.BASE_DZGMODULES_FAILURE, payload), '');
    api.form(vue, reqParams);
  }
};
// mutations
const mutations = {
  [types.BASE_DZGMODULES_CLEAN] (state) {
    state.dzgModules = {};
  },

  [types.BASE_DZGMODULES_REQUEST] (state) {
    state.dzgModules = {
      ...state.dzgModules,
      loading: true,
      status: 0,
      msg: ''
    };
  },

  [types.BASE_DZGMODULES_SUCCESS] (state, payload) {
    state.dzgModules = {
      ...state.dzgModules,
      ...payload.json,
      loading: false
    };
  },

  [types.BASE_DZGMODULES_FAILURE] (state, payload) {
    state.dzgModules = {
      ...state.dzgModules,
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
