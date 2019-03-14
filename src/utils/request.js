import fetch from 'isomorphic-fetch'
import { message } from 'antd'
import _ from 'lodash'

/**
 * 底层请求封装
 * @param url
 * @param body
 * @param [opts]
 * @return {Promise}
 */
async function request (url, opts) {
  // 配置加工
  opts = _.merge({
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-cache',
    credentials: 'include'
  }, opts)
  const onError = _.result(opts, 'onError', null)
  delete opts.onError

  // 定义异常处理器
  const errorHandler = async (json) => {
    const msg = _.get(json, 'msg') || window.L('网络异常')
    if (onError !== null) {
      if (_.isFunction(onError)) {
        onError(msg)
      }
    } else {
      message.error(msg)
    }
  }

  // 执行请求
  const res = await fetch(url, opts)
  let data = null
  if (res.status >= 200 && res.status < 300) {
    const json = await res.json()
    if (opts.rawData) {
      data = json
    } else {
      if (json.code === 555) {
        if (url !== '/api/logout') {
          window.g_app._store.dispatch({
            type: 'user/logout'
          })
        }
      } else if (json.code !== 0) {
        console.error(json)
        await errorHandler(json)
      } else {
        data = _.get(json, 'data', json)
      }
    }
  } else {
    await errorHandler()
  }
  return data
}

/**
 * 文件下载
 * @param {string} url
 * @param {object} options
 */
export async function donwloadFile (url, options) {
  const res = await fetch(url, _.merge({
    cache: 'no-cache',
    credentials: 'include'
  }, options))
  const blob = await res.blob()
  const a = window.document.createElement('a')
  const href = window.URL.createObjectURL(blob)
  const filename = new RegExp('filename="(.*)"').exec(res.headers.get('Content-Disposition'))[1]
  a.href = href
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

/**
 * 常规GET请求
 * @param url
 * @param [opts]
 * @return {Promise}
 */
export function get (url, opts) {
  return request(url, opts)
}

/**
 * 常规POST请求
 * @param url
 * @param body
 * @param [opts]
 * @return {Promise}
 */
export function post (url, body, opts) {
  return request(url, _.merge({
    method: 'POST',
    body: JSON.stringify(body)
  }, opts))
}

/**
 * 常规PUT请求
 * @param url
 * @param body
 * @param [opts]
 * @return {Promise}
 */
export function put (url, body, opts) {
  return request(url, _.merge({
    method: 'PUT',
    body: JSON.stringify(body)
  }, opts))
}

/**
 * 常规DELETE请求
 * @param url
 * @param body
 * @param [opts]
 * @return {Promise}
 */
export function del (url, body, opts) {
  return request(url, _.merge({
    method: 'DELETE',
    body: JSON.stringify(body)
  }, opts))
}

export default request
