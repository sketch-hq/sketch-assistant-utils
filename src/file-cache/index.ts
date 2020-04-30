import {
  Node,
  NodeCache,
  NodeCacheIterator,
  NodeCacheIteratorConfig,
  RunOperation,
  SketchClass,
} from '@sketch-hq/sketch-assistant-types'

/**
 * Create a Sketch file cache iterator, a function that iterators across objects
 * in the cache, and calls visitor callback functions for them if defined.
 */
const createCacheIterator = (
  cache: NodeCache,
  operation: RunOperation,
): NodeCacheIterator => async (config: NodeCacheIteratorConfig): Promise<void> => {
  for (const key of Object.keys(config)) {
    if (operation.cancelled) break
    const cacheItem = cache[key as SketchClass]
    const visitor = config[key as SketchClass]
    if (!cacheItem || !visitor) continue
    for (const node of cacheItem) {
      if (operation.cancelled) break
      await visitor(node)
    }
  }
}

/**
 * Return the minimal/empty cache object.
 */
const createCache = (): NodeCache => ({
  $layers: [],
  $groups: [],
})

function* cacheGenerator(cache: NodeCache, key: keyof NodeCache): Generator<Node> {
  const cacheItem = cache[key as SketchClass]
  if (!cacheItem) {
    // don't yield anything if the cacheItem could not be found
    return
  }
  for (const node of cacheItem) {
    yield node
  }
}

export { createCacheIterator, createCache, cacheGenerator }
