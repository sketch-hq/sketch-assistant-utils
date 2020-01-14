import FileFormat from '@sketch-hq/sketch-file-format-ts'
import { WalkerCache, LintOperation } from './types'

/**
 * Recursively prepare Sketch document data in preparation for performing a lint
 * run. In practice this means performing two things:
 *
 *   1. Augmenting each object in the document data with an RFC 6901 compliant
 *      JSON Pointer string on the `$pointer` key, unlikely to clash with other
 *      object keys. The pointer values enable objects to indicate their location
 *      in the document structure, even when observed in isolation, for example
 *      in a lint rule.
 *   2. Populating a minimal cache of Sketch document objects keyed by their
 *      `_class` prop values, for efficient access and iteration in rule logic.
 *
 * TODO: Can we use ts-ignore less here?
 */

const DO_NOT_CACHE_KEYS = [
  'foreignLayerStyles',
  'foreignSymbols',
  'foreignTextStyles',
]

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
      if (!DO_NOT_CACHE_KEYS.includes(key)) {
        // eslint-disable-next-line
        // @ts-ignore
        processFileContents(object[key], cache, op, `${pointer}/${key}`)
      }
    }
  }
}

export { processFileContents }
