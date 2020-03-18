import JSOG from 'jsog'
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

let persistor

const JSOGTransform = createTransform(
  (inboundState, key) => JSOG.encode(inboundState),
  (outboundState, key) => JSOG.decode(outboundState)
)

const persistConfig = {
  timeout: 1000,
  key: 'root',
  storage,
  transforms: [JSOGTransform],
  blacklist: ['router']
}

export function persistEnhancer (createStore) {
  return (reducer, initialState, enhancer) => {
    const store = createStore(persistReducer(persistConfig, reducer), initialState, enhancer)
    const persist = persistStore(store, null)
    persistor = persist
    return {
      persist,
      ...store
    }
  }
}

export function getPersistor () {
  return persistor
}
