import {
  WalkerCache,
  Walker,
  WalkerConfig,
  LintOperation,
  SketchClass,
} from '../types'

/**
 * Create a Sketch file walker - a function that iterates over a cache
 * and for each entry calls any defined visitors.
 */
const createWalker = (
  cache: WalkerCache,
  operation: LintOperation,
): Walker => async (walkerConf: WalkerConfig): Promise<void> => {
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

export { createWalker }
