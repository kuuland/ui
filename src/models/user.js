import _ from 'lodash'
import router from 'umi/router'
import config from '@/config'
import { getPersistor } from '@/utils/configureStore'
import { post } from 'kuu-tools'
import { setLocale } from 'umi-plugin-react/locale'

export default {
  state: {
    loginData: undefined
  },
  reducers: {
    LOGIN (state, { payload: { loginData } }) {
      if (_.get(loginData, 'Token')) {
        if (loginData.Lang) {
          setLocale(loginData.Lang, false)
        }
      }
      return { ...state, loginData }
    }
  },
  effects: {
    * logout ({ payload }, { put, call }) {
      window.localStorage.setItem('logout', '1')
      yield call(post, '/logout', undefined)
      const persistor = getPersistor()
      if (persistor) {
        yield put({ type: 'RESET' })
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
        yield put({ type: 'LOGIN', payload: { loginData: data } })
        yield put({ type: 'i18n/langmsgs' })
      }
    }
  },
  subscriptions: {}
}
