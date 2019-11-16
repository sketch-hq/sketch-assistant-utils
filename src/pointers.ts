import FileFormat from '@sketch-hq/sketch-file-format-ts'
import ptr from 'json-ptr'

type GetReturnType<T> = T | T[] | string | boolean | number | undefined | null

/**
 * Return a value in a FileFormat.Contents object using a JSON Pointer.
 */
const get = <T = FileFormat.AnyObject>(
  contents: FileFormat.Contents,
  pointer: string,
): GetReturnType<T> => ptr.get(contents, pointer) as GetReturnType<T>

export { get }
