import _ from 'lodash'
import router from 'umi/router'
import config from '@/config'
import { get, post } from '@/utils/request'

export default {
  state: {
    loginData: undefined,
    loginOrg: undefined
  },
  reducers: {
    LOGIN (state, { payload: { loginData, loginOrg } }) {
      if (_.get(loginData, 'Token')) {
        window.localStorage.setItem(config.storageTokenKey, loginData.Token)
      } else {
        window.localStorage.removeItem(config.storageTokenKey)
      }
      return { ...state, loginData, loginOrg }
    },
    LOGIN_ORG (state, { payload: loginOrg }) {
      return { ...state, loginOrg }
    }
  },
  effects: {
    * logout ({ payload }, { put, call }) {
      const json = yield call(post, '/api/logout', undefined, { rawData: true })
      if (json.data || json.code === 555) {
        yield put({ type: 'LOGIN', payload: { loginData: undefined, loginOrg: undefined } })
        yield put({ type: 'layout/CLEAR' })
        window.localStorage.removeItem('panes:data')
      }
      if (window.location.pathname !== config.loginPathname) {
        yield router.replace(config.loginPathname)
      }
    },
    * valid ({ payload }, { put, call }) {
      const data = yield call(post, '/api/valid')
      const org = yield call(get, '/api/org/current')
      if (data) {
        yield put({ type: 'LOGIN', payload: { loginData: data, loginOrg: org } })
      }
    }
  },
  subscriptions: {}
}
