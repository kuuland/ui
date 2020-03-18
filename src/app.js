import React from 'react'
import _ from 'lodash'
import { persistEnhancer } from '@/utils/configureStore'
import { config } from 'kuu-tools'
import { message } from 'antd'
import 'fano-antd/lib/index.less'

message.config({ maxCount: 1 })
config({
  localeContext: React.createContext(),
  messageHandler: (msg, code, json) => (code === 0 ? message.info(msg) : message.error(msg))
})

function resetEnhancer (next) {
  return (reducer, initialState, enhancer) => {
    const resetType = 'RESET'
    const whitelist = ['router', 'i18n', 'theme']

    const enhanceReducer = (state, action) => {
      if (action.type === resetType) {
        state = { ..._.pick(state, whitelist) }
      }
      return reducer(state, action)
    }

    return next(enhanceReducer, initialState, enhancer)
  }
}

export const dva = {
  config: {
    extraEnhancers: [persistEnhancer, resetEnhancer],
    onError (err) {
      err.preventDefault()
      console.error(err.message)
    }
  }
}
