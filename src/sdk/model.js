import { get, post, del, put } from '@/utils/request'
import _ from 'lodash'
import qs from 'qs'
import * as cache from './cache'

function getUrl (name) {
  let url = `/${name}`
  let prefix = cache.get()['prefix'] || ''
  if (prefix) {
    prefix = prefix.startsWith('/') ? prefix : `/${prefix}`
    prefix = prefix.endsWith('/') ? prefix.substring(0, prefix.length - 1) : prefix
  }
  url = `${prefix}${url}`.toLowerCase()
  return url
}

export async function create (name, data) {
  if (!name) {
    throw new Error(`name can not be empty: ${name}`)
  }
  const url = getUrl(name)
  if (_.isEmpty(data)) {
    return {}
  }
  try {
    const arr = Array.isArray(data) ? data : [data]
    const json = await post(url, arr)
    if (Array.isArray(data)) {
      return _.get(json, '[0]', json)
    }
    return json
  } catch (error) {
    console.error(error)
    return {}
  }
}

export async function remove (name, cond) {
  if (!name) {
    throw new Error(`name can not be empty: ${name}`)
  }
  const url = getUrl(name)
  if (_.isEmpty(cond)) {
    return {}
  }
  try {
    const json = await del(url, { cond, all: true })
    return json
  } catch (error) {
    console.error(error)
    return {}
  }
}

export async function update (name, cond, doc) {
  if (!name) {
    throw new Error(`name can not be empty: ${name}`)
  }
  const url = getUrl(name)
  if (_.isEmpty(cond) || _.isEmpty(doc)) {
    return {}
  }
  try {
    const json = await put(url, { cond, doc })
    return json
  } catch (error) {
    console.error(error)
    return {}
  }
}

export async function list (name, query = {}) {
  if (!name) {
    throw new Error(`name can not be empty: ${name}`)
  }
  let url = getUrl(name)
  if (_.isPlainObject(query.cond)) {
    query.cond = JSON.stringify(query.cond)
  } else if (!_.isString(query.cond)) {
    query.cond = {}
  }
  try {
    url = `${url}?${qs.stringify(query)}`
    const json = await get(url)
    const data = _.get(json, 'data') || json
    if (_.has(data, 'list') && !Array.isArray(data.list)) {
      data.list = []
    }
    return data
  } catch (error) {
    console.error(error)
    return {}
  }
}

export async function id (name, idVal) {
  const idKey = cache.get()['idKey'] || '_id'
  const json = await list(name, { cond: { [idKey]: idVal } })
  return _.get(json, 'list[0]') || {}
}

export async function one (name, cond) {
  const json = await list(name, { cond })
  return _.get(json, 'list[0]') || {}
}
