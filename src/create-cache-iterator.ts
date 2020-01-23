import {
  NodeCache,
  NodeCacheIterator,
  NodeCacheIteratorConfig,
  LintOperation,
  SketchClass,
} from './types'

/**
 * Create a Sketch file cache iterator, a function that iterators across objects
 * in the cache, and calls visitor callback functions for them if defined.
 */
const createCacheIterator = (
  cache: NodeCache,
  operation: LintOperation,
): NodeCacheIterator => async (
  walkerConf: NodeCacheIteratorConfig,
): Promise<void> => {
  for (const key of Object.keys(walkerConf)) {
    if (operation.cancelled) break
    const cacheItem = cache[key as SketchClass]
    const visitor = walkerConf[key as SketchClass]
    if (cacheItem && visitor) {
      for (const node of cacheItem) {
        if (operation.cancelled) break
        await visitor(node)
      }
    }
  }
}

export { createCacheIterator }
