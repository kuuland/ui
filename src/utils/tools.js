import _ from 'lodash'
import config from '@/config'

export function isWhiteRoute (pathname) {
  const whiteRoutes = _.get(config, 'whiteRoutes', [])
  const name = _.filter(whiteRoutes, item => pathname === item)
  return _.size(name) > 0
}
