import _ from 'lodash'
const cache = {}

export function set (data) {
  _.merge(cache, data)
  return cache
}

export function get (keys) {
  return Array.isArray(keys) ? _.pick(cache, keys) : cache
}
