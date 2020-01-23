import { NodeCache } from './types'

/**
 * Return the minimal/empty cache object.
 */
const createCache = (): NodeCache => ({
  $layers: [],
  $groups: [],
})

export { createCache }
