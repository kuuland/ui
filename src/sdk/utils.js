import _ from 'lodash'

/**
 * 国际化函数
 * @param {*} key 字符串键
 * @param {*} defaultMessage 默认值
 * @param {*} context 参数
 */
export function L (key, defaultMessage, context) {
  const language = _.result(window, 'g_app._store.getState.user.language') || _.result(window, 'i18n_messages', {})
  const template = _.get(language, key, defaultMessage) || key
  if (context && !_.isEmpty(context)) {
    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g
    const compiled = _.template(template)
    const value = compiled(context)
    return value
  }
  return template
}
