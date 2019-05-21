
import { L } from './sdk/utils'
import * as sdk from './sdk/index'
import Fano from 'fano-react'
import moment from 'moment'
import { message } from 'antd'
import types from 'fano-antd'
import 'fano-antd/lib/index.less'
import 'swagger-ui-react/swagger-ui.css'

window.L = L
sdk.config({ prefix: '/api' })
Fano.injectTypes(types)

moment.locale('zh-cn')
message.config({
  maxCount: 1
})

export const dva = {
  config: {
    onError (err) {
      err.preventDefault()
      console.error(err.message)
    }
  }
}
