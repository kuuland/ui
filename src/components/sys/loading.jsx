import React from 'react'
import _ from 'lodash'
import { Spin, Icon } from 'antd'

const indicatorStyle = {
  fontSize: 30
}
const loadingStyle = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const loadingIndicator = (
  <Icon
    spin
    type='loading'
    style={indicatorStyle}
  />
)

export default props => {
  const loading = _.has(props, 'loading') ? props.loading : true
  return (
    <Spin
      style={loadingStyle}
      indicator={loadingIndicator}
      spinning={loading}
    />
  )
}
