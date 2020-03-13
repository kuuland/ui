import React from 'react'
import JSOG from 'jsog'
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { config } from 'kuu-tools'
import { message } from 'antd'
import 'fano-antd/lib/index.less'

message.config({ maxCount: 1 })
config({
  localeContext: React.createContext(),
  messageHandler: (msg, code, json) => (code === 0 ? message.info(msg) : message.error(msg))
})

const JSOGTransform = createTransform(
  (inboundState, key) => JSOG.encode(inboundState),
  (outboundState, key) => JSOG.decode(outboundState)
)

const persistConfig = {
  timeout: 1000,
  key: 'root',
  storage,
  transforms: [JSOGTransform]
}

function persistEnhancer (createStore) {
  return (reducer, initialState, enhancer) => {
    const store = createStore(persistReducer(persistConfig, reducer), initialState, enhancer)
    const persist = persistStore(store, null)
    return {
      persist,
      ...store
    }
  }
}

export const dva = {
  config: {
    extraEnhancers: [persistEnhancer],
    onError (err) {
      err.preventDefault()
      console.error(err.message)
    }
  }
}
