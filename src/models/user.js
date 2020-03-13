import _ from 'lodash'
import router from 'umi/router'
import config from '@/config'
import { get, post, config as toolsConfig } from 'kuu-tools'
import { setLocale } from 'umi-plugin-locale'

const {
  loginPathname = '/login'
} = config

export default {
  state: {
    loginData: undefined,
    localeMessages: {}
  },
  reducers: {
    LOGIN (state, { payload: { loginData } }) {
      if (_.get(loginData, 'Token')) {
        if (loginData.Lang) {
          setLocale(loginData.Lang, false)
        }
      }
      return { ...state, loginData }
    },
    SET_LANGMSGS (state, { payload: msgs }) {
      window[_.get(toolsConfig, 'localeMessagesKey', 'localeMessages')] = msgs
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
