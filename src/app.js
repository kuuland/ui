import { config } from 'kuu-tools'
import { message } from 'antd'
import 'fano-antd/lib/index.less'

message.config({ maxCount: 1 })
config({
  messageHandlers: {
    error: msg => message.error(msg)
  }
})

export const dva = {
  config: {
    onError (err) {
      err.preventDefault()
      console.error(err.message)
    }
  }
}
