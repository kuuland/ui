import _ from 'lodash'
import { list } from './model'

/**
 * 根据编码或条件查询参数
 * @param {*} codeOrObject
 */
export async function getParam (codeOrObject) {
  const obj = _.isPlainObject(codeOrObject) ? codeOrObject : { Code: codeOrObject }
  if (_.isEmpty(obj)) {
    console.error(window.L(`查询条件不能为空`))
    return {}
  }
  const json = await list('param', {
    cond: obj,
    page: 1,
    size: 1,
    sort: '-UpdatedAt'
  })
  const dict = _.get(json, 'list[0]', {})
  return dict
}
