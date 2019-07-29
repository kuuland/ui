import React from 'react'
import { withLocale } from 'kuu-tools'

export default withLocale(props => (
  <div>
    <h3>{props.L('kuu_pages_main', 'Default main')}</h3>
  </div>
))
