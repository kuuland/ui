import React from 'react'
import _ from 'lodash'
import { getPersistor } from '@/utils/configureStore'
import { PersistGate } from 'redux-persist/integration/react'
import { connect } from 'dva'
import DocumentTitle from 'react-document-title'
import { getLocaleContext } from 'kuu-tools'
import BlankLayout from './BlankLayout'
import BasicLayout from './BasicLayout'
import Loading from '@/components/sys/loading'
import config from '@/config'

const IndexLayout = props => {
  const isSimple = config.simplePages.indexOf(props.location.pathname) >= 0
  const LocaleContext = getLocaleContext()
  let LayoutContainer = isSimple ? BlankLayout : BasicLayout
  if (props.loading) {
    LayoutContainer = Loading
  }
  return (
    <>
      <PersistGate
        persistor={getPersistor()}
        loading={null}
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
  return {
    localeMessages: _.get(state, 'i18n.localeMessages'),
    loading: _.get(state, 'loading.effects["layout/init"]') || _.get(state, 'loading.models.user') || _.get(state, 'loading.models.i18n')
  }
})(IndexLayout)
