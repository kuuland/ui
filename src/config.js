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
  copyright: <div><Icon type='copyright' /> {new Date().getFullYear()} <a rel='noopener noreferrer' target='_blank' href='https://www.hofo.co' style={{ color: 'rgba(0, 0, 0, 0.5)' }}>蚁群科技</a> 提供技术支持 | Powered by <a rel='noopener noreferrer' target='_blank' href='https://github.com/kuuland/kuu'><Icon type='github' /> Kuu</a>. All Rights Reserved</div>,
  loginBg: ''
}
