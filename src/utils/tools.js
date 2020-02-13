import _ from 'lodash'
import config from '@/config'

/**
 * 是否白名单路由
 * @param pathname
 * @returns {boolean}
 */
export function isWhiteRoute (pathname) {
  const whiteRoutes = _.get(config, 'whiteRoutes', [])
  const name = _.filter(whiteRoutes, item => pathname === item)
  return _.size(name) > 0
}

function authCheck (target, type) {
  const dataIndex = { permission: 'Permissions', role: 'RolesCode' }[type]
  const total = _.result(window, `g_app._store.getState.user.loginData.${dataIndex}`)

  if (_.isString(target)) {
    target = target.trim()
    if (_.includes(target, '|')) {
      for (const item of target.split('|')) {
        if (_.includes(total, item)) {
          return true
        }
      }
      return false
    } else {
      target = target.split(',')
    }
  }

  if (!_.isArray(target)) {
    return false
  }
  const sample = _.intersection(total, target)
  return _.size(target) === _.size(sample)
}

/**
 * 是否包含权限
 * @param permissions
 * @returns {boolean}
 */
export function hasPermission (permissions) {
  return authCheck(permissions, 'permission')
}

/**
 * 是否包含角色
 * @param rolesCode
 * @returns {boolean}
 */
export function hasRole (rolesCode) {
  return authCheck(rolesCode, 'role')
}
