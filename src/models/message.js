import qs from 'qs'
import { get, post, create } from 'kuu-tools'
import { onSuccessPayload } from '@/utils/tools'

export default {
  state: {
    Messages: [],
    UnreadCount: 0
  },
  reducers: {
    UPDATE (state, { payload }) {
      return { ...state, ...payload }
    }
  },
  effects: {
    * getLatestMessages ({ payload }, { put, call, select }) {
      const [data, onSuccess] = onSuccessPayload(payload)
      const res = yield call(get, `/messages/latest?${qs.stringify(data)}`)
      if (res) {
        if (onSuccess) {
          // @ts-ignore
          onSuccess(res)
        }
        yield put({
          type: 'UPDATE',
          payload: res
        })
      }
    },
    * readMessage ({ payload = { All: true } }, { put, call, select }) {
      const [data, onSuccess] = onSuccessPayload(payload)
      const res = yield call(post, '/messages/read', data, { rawData: true })
      if (res) {
        if (onSuccess) {
          // @ts-ignore
          onSuccess(res)
        }
      }
    },
    * sendMessage ({ payload }, { put, call, select }) {
      const [data, onSuccess] = onSuccessPayload(payload)
      const res = yield call(create, 'Message', data)
      if (res) {
        if (onSuccess) {
          onSuccess(res)
        }
      }
    }
  }
}
