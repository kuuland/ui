import { Icon } from 'antd'

export default {
  shortName: <img src={require('@/assets/logo_white.png')} width={'100%'} />,
  fullName: <img src={require('@/assets/logo_black.png')} width={'100%'} />,
  htmlTitle: 'Kuu',
  simplePages: ['/login'],
  whiteRoutes: [],
  loginPathname: '/login',
  storageTokenKey: 'token',
  copyright: <div>Copyright <Icon type='copyright' /> 2019 蚁群出品</div>
}
