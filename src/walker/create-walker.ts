import {
  WalkerCache,
  Walker,
  WalkerConfig,
  LintOperation,
  ObjectClass,
} from '..'

/**
 * Create a Sketch file walker - a function that iterates over a file cache
 * and for each entry calls visitor functions.
 */
const createWalker = (cache: WalkerCache, operation: LintOperation): Walker => {
  return async (config: WalkerConfig): Promise<void> => {
    for (const key of Object.keys(config)) {
      if (operation.cancelled) break
      const entry = cache[key as ObjectClass]
      const visitor = config[key as ObjectClass]
      if (entry && visitor) {
        for (const data of entry) {
          if (operation.cancelled) break
          await visitor(data)
        }
      }
    }
  }
}

export { createWalker }
