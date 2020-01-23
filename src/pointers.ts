import FileFormat from '@sketch-hq/sketch-file-format-ts'
import Ptr from '@json-schema-spec/json-pointer'
import { Maybe, ProcessedContentsValue } from './types'

const get = (
  pointer: string,
  instance: FileFormat.Contents,
): Maybe<ProcessedContentsValue> => {
  try {
    const ptr = Ptr.parse(pointer)
    return ptr.eval(instance)
  } catch (err) {
    return undefined
  }
}

const parent = (
  pointer: string,
  instance: FileFormat.Contents,
): Maybe<ProcessedContentsValue> => {
  try {
    const ptr = Ptr.parse(pointer)
    if (ptr.tokens.length === 0) {
      return undefined
    } else {
      try {
        const parentPtr = new Ptr(
          ptr.tokens.splice(0, ptr.tokens.length - 1),
        ).toString()
        return get(parentPtr, instance)
      } catch (err) {
        return undefined
      }
    }
  } catch (err) {
    return undefined
  }
}

export { get, parent }
