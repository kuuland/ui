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
  const uid = parseInt(_.get(state, 'user.loginData.UID') || 0)
  return {
    localeMessages: _.get(state, 'i18n.localeMessages'),
    loading: _.get(state, 'loading.effects["user/valid"]') ||
      (_.get(state, 'user.logout') === false && _.isNumber(uid) && _.isFinite(uid) && uid <= 0) ||
      _.get(state, 'loading.effects["layout/loadMenus"]') ||
      _.get(state, 'loading.effects["theme/loadTheme"]') ||
      _.get(state, 'loading.effects["enums/loadAllEnums"]')
  }
})(IndexLayout)
