import { WalkerCache } from './types'

/**
 * Return the minimal/empty cache object.
 */
const createCache = (): WalkerCache => ({
  $layers: [],
  $groups: [],
})

export { createCache }
