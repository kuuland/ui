import _ from 'lodash'
import { get } from 'kuu-tools'

export default {
  state: {
    topBarBgColor: '#4b65a9'
  },
  reducers: {
    SET_THEME (state, { payload }) {
      return { ...state, ...payload }
    }
  },
  effects: {
    * loadTheme (args, { put, call }) {
      const data = yield call(get, '/param?cond={"Code":"theme"}')
      const value = _.get(data, 'list[0].Value')
      let theme = {}
      try {
        theme = JSON.parse(value)
      } catch (e) {}
      if (!_.isEmpty(theme)) {
        yield put({ type: 'SET_THEME', payload: theme })
      }
    }
  }
}
