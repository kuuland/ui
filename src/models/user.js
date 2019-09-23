import _ from 'lodash'
import router from 'umi/router'
import config from '@/config'
import { get, post, config as toolsConfig } from 'kuu-tools'
import { setLocale } from 'umi-plugin-locale'

const {
  storageLocaleKey = 'kuu_locale',
  storageLocaleMessagesKey = 'kuu_locale_messages',
  storageTokenKey = 'token',
  loginPathname = '/login'
} = config

let cacheLocaleMessages = window.localStorage.getItem(storageLocaleMessagesKey)
if (cacheLocaleMessages === 'undefined') {
  window.localStorage.removeItem(storageLocaleMessagesKey)
  cacheLocaleMessages = undefined
}
const localeMessages = JSON.parse(cacheLocaleMessages || '{}')
const cacheLocale = window.localStorage.getItem(storageLocaleKey)

if (cacheLocale) {
  setLocale(cacheLocale, false)
}

export default {
  state: {
    loginData: undefined,
    localeMessages: localeMessages
  },
  reducers: {
    LOGIN (state, { payload: { loginData } }) {
      if (_.get(loginData, 'Token')) {
        window.localStorage.setItem(storageTokenKey, loginData.Token)
        if (loginData.Lang) {
          setLocale(loginData.Lang, false)
          window.localStorage.setItem(storageLocaleKey, loginData.Lang)
        }
      } else {
        window.localStorage.removeItem(storageTokenKey)
      }
      return { ...state, loginData }
    },
    SET_LANGMSGS (state, { payload: msgs }) {
      window[_.get(toolsConfig, 'localeMessagesKey', 'localeMessages')] = msgs
      window.localStorage.setItem(storageLocaleMessagesKey, JSON.stringify(msgs))
      return { ...state, localeMessages: msgs }
    }
  },
  effects: {
    * langmsgs ({ payload }, { put, call }) {
      const langmsgs = yield call(get, '/langmsgs')
      const lang = _.chain(langmsgs).keys().head().value()
      const msgs = _.get(langmsgs, lang)
      if (!_.isEmpty(msgs)) {
        yield put({ type: 'SET_LANGMSGS', payload: msgs })
      }
    },
    * logout ({ payload }, { put, call }) {
      yield call(post, '/logout', undefined)
      yield put({ type: 'LOGIN', payload: { loginData: undefined } })
      yield put({ type: 'layout/CLEAR' })
      window.localStorage.removeItem('panes:data')
      if (window.location.pathname !== loginPathname) {
        yield router.replace(loginPathname)
      }
    },
    * valid ({ payload }, { put, call }) {
      const data = yield call(post, '/valid')
      if (data) {
        yield put({ type: 'LOGIN', payload: { loginData: data } })
        yield put({ type: 'langmsgs' })
      }
    }
  },
  subscriptions: {}
}
