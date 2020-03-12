import React from 'react'
import _ from 'lodash'
import { connect } from 'dva'
import DocumentTitle from 'react-document-title'
import { getLocaleContext } from 'kuu-tools'
import BlankLayout from './BlankLayout'
import BasicLayout from './BasicLayout'
import config from '@/config'

const IndexLayout = props => {
  const isSimple = config.simplePages.indexOf(props.location.pathname) >= 0
  const children = isSimple ? (
    <BlankLayout>{props.children}</BlankLayout>
  ) : (
    <BasicLayout>{props.children}</BasicLayout>
  )
  const LocaleContext = getLocaleContext()
  return (
    <LocaleContext.Provider value={props.localeMessages}>
      <DocumentTitle title={config.htmlTitle}>{children}</DocumentTitle>
    </LocaleContext.Provider>
  )
}

export default connect(state => {
  return { localeMessages: _.get(state, 'user.localeMessages') }
})(IndexLayout)
