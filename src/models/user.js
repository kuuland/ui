import _ from 'lodash'
import router from 'umi/router'
import config from '@/config'
import { get, post, config as toolsConfig } from 'kuu-tools'
import { setLocale } from 'umi-plugin-locale'

const cacheLocaleMessages = window.localStorage.getItem(config.storageLocaleMessagesKey)
const localeMessages = JSON.parse(cacheLocaleMessages || '{}')
const cacheLocale = window.localStorage.getItem(config.storageLocaleKey)
if (cacheLocale) {
  setLocale(cacheLocale, false)
}

export default {
  state: {
    loginData: undefined,
    loginOrg: undefined,
    localeMessages: localeMessages
  },
  reducers: {
    LOGIN (state, { payload: { loginData, loginOrg } }) {
      if (_.get(loginData, 'Token')) {
        window.localStorage.setItem(config.storageTokenKey, loginData.Token)
        if (loginData.Lang) {
          setLocale(loginData.Lang, false)
          window.localStorage.setItem(config.storageLocaleKey, loginData.Lang)
        }
      } else {
        window.localStorage.removeItem(config.storageTokenKey)
      }
      return { ...state, loginData, loginOrg }
    },
    LOGIN_ORG (state, { payload: loginOrg }) {
      return { ...state, loginOrg }
    },
    SET_LANGMSGS (state, { payload: msgs }) {
      window[_.get(toolsConfig, 'localeMessagesKey', 'localeMessages')] = msgs
      window.localStorage.setItem(config.storageLocaleMessagesKey, JSON.stringify(msgs))
      return { ...state, localeMessages: msgs }
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
        const langmsgs = yield call(get, '/api/langmsgs')
        yield put({ type: 'LOGIN', payload: { loginData: data, loginOrg: org } })
        yield put({ type: 'SET_LANGMSGS', payload: _.get(langmsgs, data.Lang) })
      }
    }
  },
  subscriptions: {}
}
