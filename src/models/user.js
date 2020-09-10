import _ from 'lodash'
import router from 'umi/router'
import config from '@/config'
import { getPersistor } from '@/utils/configureStore'
import { post, convertLocaleCode } from 'kuu-tools'
import { setLocale, getLocale } from 'umi-plugin-react/locale'
import { isWhiteRoute } from '@/utils/tools'

export default {
  state: {
    loginData: undefined,
    logout: false
  },
  reducers: {
    LOGIN (state, { payload: { loginData } }) {
      if (_.get(loginData, 'Token')) {
        const langCode = convertLocaleCode(loginData.Lang) || getLocale()
        if (langCode) {
          setLocale(langCode, true)
        }
      }
      return { ...state, loginData }
    },
    UPDATE (state, { payload }) {
      return { ...state, ...payload }
    }
  },
  effects: {
    * logout ({ payload }, { put, call }) {
      window.localStorage.setItem('logout', '1')
      yield call(post, '/logout', undefined)
      const persistor = getPersistor()
      if (persistor) {
        yield put({ type: 'RESET' })
        yield put({ type: 'UPDATE', payload: { logout: true } })
        yield persistor.purge()
        yield persistor.flush()
      }
      if (window.location.pathname !== config.loginPathname) {
        yield router.replace(config.loginPathname)
      }
    },
    * valid ({ payload }, { put, call }) {
      const data = yield call(post, '/valid')
      if (data) {
        yield put({ type: 'LOGIN', payload: { loginData: data, logout: false } })
        yield put({ type: 'i18n/getIntlMessages' })
        yield put({ type: 'message/getLatestMessages' })
      }
    }
  },
  subscriptions: {
    setup (ctx) {
      const { dispatch, history } = ctx
      const pathname = _.get(history, 'location.pathname')
      if (isWhiteRoute(pathname) || pathname === config.loginPathname) {
        dispatch({ type: 'UPDATE', payload: { logout: true } })
      }
    }
  }
}
