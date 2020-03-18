import _ from 'lodash'
import { get, config as toolsConfig } from 'kuu-tools'
import { setLocale } from 'umi-plugin-react/locale'

export default {
  state: {
    localeMessages: {}
  },
  reducers: {
    SET_LANGMSGS (state, { payload: msgs }) {
      window[_.get(toolsConfig, 'localeMessagesKey', 'localeMessages')] = msgs
      return { ...state, localeMessages: msgs }
    }
  },
  effects: {
    * langmsgs ({ payload }, { put, call }) {
      const langmsgs = yield call(get, '/langmsgs')
      const lang = _.chain(langmsgs).keys().head().value()
      if (lang) {
        setLocale(lang, false)
        const msgs = _.get(langmsgs, lang)
        if (!_.isEmpty(msgs)) {
          yield put({ type: 'SET_LANGMSGS', payload: msgs })
        }
      }
    }
  }
}
