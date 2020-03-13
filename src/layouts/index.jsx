import React from 'react'
import _ from 'lodash'
import { Spin } from 'antd'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import { connect } from 'dva'
import DocumentTitle from 'react-document-title'
import { getLocaleContext } from 'kuu-tools'
import BlankLayout from './BlankLayout'
import BasicLayout from './BasicLayout'
import config from '@/config'

const IndexLayout = props => {
  const isSimple = config.simplePages.indexOf(props.location.pathname) >= 0
  const LayoutContainer = isSimple ? BlankLayout : BasicLayout
  const LocaleContext = getLocaleContext()
  const loadingStyle = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
  return (
    <>
      <PersistGate
        persistor={persistStore(window.g_app._store)}
        loading={<Spin style={loadingStyle} size='large' />}
      >
        <DocumentTitle title={config.htmlTitle}>
          <LocaleContext.Provider value={props.localeMessages}>
            <LayoutContainer>
              {props.children}
            </LayoutContainer>
          </LocaleContext.Provider>
        </DocumentTitle>
      </PersistGate>
    </>
  )
}

export default connect(state => {
  return { localeMessages: _.get(state, 'user.localeMessages') }
})(IndexLayout)
