import { eachDeep } from 'deepdash/standalone'
import FileFormat from '@sketch-hq/sketch-file-format-ts'

import {
  WalkerCache,
  VisitorData,
  LintOperation,
  ObjectClass,
  SketchFile,
} from '..'

/**
 * Generate a cache object to facilitate efficient traversal of the data
 * structure in rules. The cache shape is roughly,
 *
 *   {
 *     [key: string]: Node[]
 *   }
 *
 * where the key is a `_class` value from the the file format, or a custom
 * grouping like `allLayers`, `allGroups` etc.
 */
const createWalkerCache = (
  file: SketchFile,
  operation: LintOperation,
): WalkerCache => {
  const cache: WalkerCache = {
    allLayers: [],
    allGroups: [],
  }
  eachDeep<FileFormat.Contents['document']>(
    file.contents.document,
    (value, _key, parentValue, context): void | false => {
      // Bail if the operation should cancel or the current value is falsey
      if (operation.cancelled || !value) return false
      const node = value as FileFormat.AnyObject
      const nodeClass: ObjectClass = (node._class as unknown) as ObjectClass
      const parent = parentValue as FileFormat.AnyObject
      // We're only interested in grouping nodes with a `_class` in the cache
      if (typeof nodeClass === 'string') {
        // Initialise the cache array for this class type if it hasn't been defined yet
        if (!cache[nodeClass]) {
          cache[nodeClass] = []
        }
        const classCache: VisitorData[] = cache[nodeClass] as []
        const data: VisitorData = {
          node,
          parent,
          path: context.path,
        }
        classCache.push(data)
        // Group all layers under the `allLayers` cache key. Layers are defined
        // as any object with a parent named `layers` or `pages`.
        const immediateParent = context.parents[context.parents.length - 1]
        if (immediateParent) {
          if (
            immediateParent.key === 'layers' ||
            immediateParent.key === 'pages'
          ) {
            cache.allLayers.push(data)
          }
        }
        // Group all groups under the `allGroups` cache key. Groups are defined
        // as any object with a `layers` property.
        if ('layers' in node) {
          cache.allGroups.push(data)
        }
      }
    },
  )
  return cache
}

export { createWalkerCache }
