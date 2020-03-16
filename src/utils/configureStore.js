import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

let persistor

const persistConfig = {
  key: 'root',
  storage
}

export function persistEnhancer (createStore) {
  return (reducer, initialState, enhancer) => {
    console.log('persistEnhancer...')
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
