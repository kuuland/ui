import _ from 'lodash'

export default {
  state: {
    menuBadgeCount: {}
  },

  effects: {
    * clearMenuCount ({ payload }, { call, put, select }) {
      if (payload) {
        payload = _.isArray(payload) ? payload : [payload]
        const s = {}
        for (const item of payload) {
          s[item] = 0
        }
        yield put({
          type: 'setMenuCount',
          payload: s
        })
      }
    },
    * clearAllMenuCount ({ payload }, { call, put, select }) {
      yield put({
        type: 'save',
        payload: {
          menuBadgeCount: {}
        }
      })
    },
    * setMenuCount ({ payload = {} }, { call, put, select }) {
      if (payload) {
        const badges = yield select(({ badege }) => badege.menuBadgeCount)
        for (const k in payload) {
          const value = payload[k]
          if (_.isNumber(value) && _.isFinite(value) && value > 0) {
            badges[k] = value
          } else {
            delete badges[k]
          }
        }
        yield put({
          type: 'save',
          payload: {
            menuBadgeCount: badges
          }
        })
      }
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }
}
