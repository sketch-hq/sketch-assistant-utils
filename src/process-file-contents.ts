import FileFormat from '@sketch-hq/sketch-file-format-ts'
import {
  NodeCache,
  LintOperation,
  PointerValue,
  Maybe,
  Node,
  NodeArray,
} from './types'

/**
 * Recursively prepare Sketch document data in preparation for performing a lint
 * run. In practice this means performing two things:
 *
 *   1. Augmenting each object in the document data with an RFC 6901 compliant
 *      JSON Pointer string on the `$pointer` key, unlikely to clash with other
 *      object keys. The pointer values enable objects to indicate their location
 *      in the document structure, even when observed in isolation, for example
 *      in a lint rule.
 *   3. Populating a minimal cache of Sketch document objects keyed by their
 *      `_class` prop values, for efficient access and iteration in rule logic.
 */

const DO_NOT_PROCESS_KEYS = [
  'foreignLayerStyles',
  'foreignSymbols',
  'foreignTextStyles',
]

const process = (
  input: Maybe<PointerValue>,
  cache: NodeCache,
  op: LintOperation,
  pointer: string,
): void => {
  // Bail early if we've been passed a falsey value or the operation is cancelled
  if (!input || op.cancelled) return

  // Bail early if input is not an object
  if (typeof input !== 'object') return

  // Inject the current pointer value
  input.$pointer = pointer

  // Test to see if we've been passed an array and if so process each element
  // recursively and return
  if (input.constructor === Array) {
    const array = input as NodeArray
    for (let index = 0; index < array.length; index++) {
      process(array[index], cache, op, `${pointer}/${index}`)
    }
    return
  }

  const obj = input as Node

  for (const key in input) {
    // Bail out of this loop iteration early if the key has been excluded
    // from processing
    if (DO_NOT_PROCESS_KEYS.includes(key)) continue

    // If the current object has a `_class` prop it means the object should
    // be cached in the NodeCache
    if (key === '_class') {
      if (!cache[obj._class]) cache[obj._class] = []
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      cache[obj._class]!.push(obj)

      // Use presence of `layers` and `frame` props as heuristics to identify
      // objects with group and layer traits respectively
      if ('layers' in obj) cache.$groups.push(obj)
      if ('frame' in obj) cache.$layers.push(obj)
    }

    // Recurse into the input's sub values
    process(
      obj[key as keyof FileFormat.AnyObject],
      cache,
      op,
      `${pointer}/${key}`,
    )
  }
}

const processFileContents = (
  contents: FileFormat.Contents,
  cache: NodeCache,
  op: LintOperation,
): void => process(contents as PointerValue, cache, op, '')

export { processFileContents }
