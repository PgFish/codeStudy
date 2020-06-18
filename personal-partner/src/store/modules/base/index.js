import banner from './Banner';
import dzgModules from './DzgModules';
import { saveSession, getSession, removeSession } from 'assets/utils'

// initial state
const state = {
  ...banner.state,
  ...dzgModules.state,
  tabIndex: ''
};

// getters
const getters = {
  ...banner.getters,
  ...dzgModules.getters,
  getTabIndexId: state => {
    return state.tabIndex || getSession('tabIndexId')
  }
};

const actions = {
  ...banner.actions,
  ...dzgModules.actions
};

// mutations
const mutations = {
  ...banner.mutations,
  ...dzgModules.mutations,
  SET_TABINDEX: (state, id) => {
    state.tabIndex = id
    saveSession('tabIndexId', id)
    if (!id) {
      removeSession('tabIndexId')
    }
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
