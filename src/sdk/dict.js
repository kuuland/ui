import _ from 'lodash'
import { list } from './model'

/**
 * 根据编码或条件查询字典
 * @param {*} codeOrObject
 */
export async function getDict (codeOrObject) {
  const obj = _.isPlainObject(codeOrObject) ? codeOrObject : { Code: codeOrObject }
  if (_.isEmpty(obj)) {
    console.error(window.L(`查询条件不能为空`))
    return {}
  }
  const json = await list('dict', {
    cond: obj,
    page: 1,
    size: 1,
    sort: '-UpdatedAt'
  })
  const dict = _.get(json, 'list[0]', {})
  return dict
}

/**
 * 根据编码或条件查询字典
 * @param {*} codeOrObject
 */
export async function getDictByValue (codeOrObject, value) {
  const dict = getDict(codeOrObject)
  if (dict && Array.isArray(dict.Values)) {
    for (const item of dict.Values) {
      if (item.Value === value) {
        return item
      }
    }
  }
  return null
}
