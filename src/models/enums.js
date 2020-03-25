import _ from 'lodash'
import { get } from 'kuu-tools'

export default {
  state: {
    enumMap: {}
  },
  reducers: {
    SET_ENUM_MAP (state, { payload: enumMap }) {
      return { ...state, enumMap }
    }
  },
  effects: {
    * loadAllEnums ({ payload }, { put, call }) {
      const data = yield call(get, '/enum?json=1')
      if (data) {
        const enumMap = {}
        for (const item of data) {
          const values = _.get(item, 'Values') || []
          const valuesMap = {}
          for (const v of values) {
            valuesMap[v.Value] = v
          }
          item.ValueMap = valuesMap
          enumMap[item.ClassCode] = item
        }
        yield put({ type: 'SET_ENUM_MAP', payload: enumMap })
      }
    }
  }
}
