import React from 'react'
import DocumentTitle from 'react-document-title'
import SimpleLayout from './BlankLayout'
import BasicLayout from './BasicLayout'
import config from '@/config'

export default props => {
  const isSimple = config.simplePages.indexOf(props.location.pathname) >= 0
  const children = isSimple ? (
    <SimpleLayout>{props.children}</SimpleLayout>
  ) : (
    <BasicLayout>{props.children}</BasicLayout>
  )
  return <DocumentTitle title={config.htmlTitle}>{children}</DocumentTitle>
}
