import FileFormat from '@sketch-hq/sketch-file-format-ts'
import { WalkerCache, LintOperation } from '../types'

/**
 * Recursively prepare Sketch document data in preparation for performing a lint
 * run. The objective of this documen traversal is to be as performant as
 * possible in terms of run time and memory usage. In practice this means
 * performing two things:
 *
 *   1. Augmenting each object in the document data with an RFC 6901 compliant
 *      JSON Pointer string
 *   2. Populating a minimal cache of Sketch document objects keyed by their
 *      _class prop values, for efficient access and iteration in rules
 *
 * TODO: Can we use ts-ignore less here?
 */
const processFileContents = (
  contents: FileFormat.Contents | null,
  cache: WalkerCache,
  op: LintOperation,
  pointer = '',
): void => {
  const object = contents as {} | null
  if (!object || op.cancelled) return
  if (object.constructor === Array) {
    for (let index = 0; index < (object as {}[]).length; index++) {
      // eslint-disable-next-line
      // @ts-ignore
      processFileContents(object[index], cache, op, `${pointer}/${index}`)
    }
    return
  }
  if (typeof object === 'object') {
    // eslint-disable-next-line
    // @ts-ignore
    object.$pointer = pointer
    for (const key in object) {
      if (key === '_class') {
        // eslint-disable-next-line
        // @ts-ignore
        if (!cache[object._class]) cache[object._class] = []
        // eslint-disable-next-line
        // @ts-ignore
        cache[object._class].push(object)
        if ('layers' in object) cache.$groups.push(object)
        if ('frame' in object) cache.$layers.push(object)
      }
      // eslint-disable-next-line
      // @ts-ignore
      processFileContents(object[key], cache, op, `${pointer}/${key}`)
    }
  }
}

export { processFileContents }
