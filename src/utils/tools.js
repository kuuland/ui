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

export function translateAmount (data) {
  if (!data) {
    data = 0
  }
  return data.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const normFile = (e) => {
  console.log('Upload event:', e)
  if (Array.isArray(e)) {
    return e
  }

  return e && [_.get(e.file, 'response.data', e.file)]
}

export const normMultipleFiles = (e) => {
  console.log('Upload event:', e)
  if (Array.isArray(e)) {
    return e
  }
  const list = []
  for (let i = 0; i < e.fileList.length; i++) {
    let item = e.fileList[i]
    item = _.get(item, 'response.data', item)
    list.push(item)
  }

  return list
}

export function onSuccessPayload (payload) {
  const onSuccess = _.get(payload, 'onSuccess')
  return [_.omit(payload, ['onSuccess']), _.isFunction(onSuccess) ? onSuccess : undefined]
}
