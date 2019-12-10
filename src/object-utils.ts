import FileFormat from '@sketch-hq/sketch-file-format-ts'
import hash from 'object-hash'

import { Node } from './types'

/**
 * Convert a Sketch file-walking Node to a specific file format object. Use this
 * to hint the TypeScript compiler which object type you're currently working
 * with. Usage,
 *
 *     const artboard = nodeToObj<FileFormat.Artboard>(node)
 */
const nodeToObject = <T extends FileFormat.AnyObject>(node: Node): T => {
  const { $pointer: _$pointer, ...obj } = node
  return (obj as unknown) as T
}

/**
 * Return the md5 hash of an object. Keys are sorted, and the do_objectID key
 * is optionally excluded. Useful for comparing deep similarity of Sketch
 * document objects.
 */
const objectHash = (obj: {}, ignoreObjectId = true): string =>
  hash(obj, {
    unorderedObjects: true,
    algorithm: 'md5',
    excludeKeys: key => (key === 'do_objectID' ? ignoreObjectId : false),
  })

/**
 * Compares two objects for deep equality.
 */
const objectsEqual = (o1: {}, o2: {}): boolean =>
  objectHash(o1) === objectHash(o2)

export { nodeToObject, objectHash, objectsEqual }
