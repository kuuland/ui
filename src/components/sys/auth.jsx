import React from 'react'
import _ from 'lodash'
import { connect } from 'dva'

function mapStateToProps (state) {
  return {
    permissions: _.get(state, 'user.loginData.Permissions') || [],
    rolesCode: _.get(state, 'user.loginData.RolesCode') || []
  }
}

export default connect(mapStateToProps)(props => {
  const permissions = _.get(props, 'permissions')
  let input = _.get(props, 'code')
  if (_.isString(input)) {
    input = input.trim()
    // 例外：满足任一权限即可
    if (_.includes(input, '|')) {
      for (const item of input.split('|')) {
        if (_.includes(permissions, item)) {
          return props.children
        }
      }
      return null
    } else {
      input = input.split(',')
    }
  }
  const sample = _.intersection(permissions, input)
  return _.size(input) === _.size(sample) ? props.children : null
})
