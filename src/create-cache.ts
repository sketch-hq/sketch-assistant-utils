import { WalkerCache } from './types'

/**
 * Return a minimal cache object.
 */
const createCache = (): WalkerCache => ({
  $layers: [],
  $groups: [],
})

export { createCache }
