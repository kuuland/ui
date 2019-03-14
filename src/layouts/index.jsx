import SimpleLayout from './simple-layout'
import BasicLayout from './basic-layout'
import config from '@/config'
import DocumentTitle from 'react-document-title'

export default props => {
  const isSimple = config.simplePages.indexOf(props.location.pathname) >= 0
  const children = isSimple ? <SimpleLayout>{props.children}</SimpleLayout> : <BasicLayout>{props.children}</BasicLayout>
  return <DocumentTitle title={config.title}>{children}</DocumentTitle>
}
