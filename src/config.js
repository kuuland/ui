import { Icon } from 'antd'

export default {
  shortName: <img src={require('@/assets/logo_white.png')} width='100%' />,
  fullName: <img src={require('@/assets/logo_black.png')} width='100%' />,
  htmlTitle: 'Kuu',
  simplePages: ['/login', '/test'],
  whiteRoutes: [],
  noBreadcrumbsRoutes: [],
  loginPathname: '/login',
  storageTokenKey: 'token',
  storageLocaleKey: 'kuu_locale',
  storageLocaleMessagesKey: 'kuu_locale_messages',
  copyright: <div>Copyright <Icon type='copyright' /> 2019 蚁群出品</div>,
  loginBg: ''
}
