import React from 'react'
import { config } from 'kuu-tools'
import { message } from 'antd'
import 'fano-antd/lib/index.less'

message.config({ maxCount: 1 })
config({
  localeContext: React.createContext(),
  messageHandler: (msg, code, json) => (code === 0 ? message.info(msg) : message.error(msg))
})

export const dva = {
  config: {
    onError (err) {
      err.preventDefault()
      console.error(err.message)
    }
  }
}
