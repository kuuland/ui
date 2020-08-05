import _ from 'lodash'
import { get, config as toolsConfig } from 'kuu-tools'
import { getLocale } from 'umi-plugin-react/locale'

export default {
  state: {
    localeMessages: {}
  },
  reducers: {
    UPDATE (state, { payload }) {
      window[_.get(toolsConfig, 'localeMessagesKey', 'localeMessages')] = payload.localeMessages || {}
      return { ...state, ...payload }
    }
  },
  effects: {
    * getIntlMessages ({ payload }, { put, call }) {
      const langCode = getLocale()
      const msgs = yield call(get, `/intl/messages?simple=true&langs=${langCode}`)
      if (!_.isEmpty(msgs)) {
        yield put({ type: 'UPDATE', payload: { localeMessages: msgs } })
      }
    }
  }
}
