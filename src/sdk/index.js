import * as cache from './cache'
export * from './model'
export * from './dict'
export * from './param'

export function config (opts) {
  cache.set(opts)
}
