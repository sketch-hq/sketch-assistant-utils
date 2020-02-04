import mem from 'mem'

import {
  NodeCache,
  LintViolation,
  ReportItem,
  RuleUtils,
  LintConfig,
  LintOperation,
  ImageMetadata,
  RuleUtilsCreator,
  RuleModule,
  GetImageMetadata,
  SketchFile,
  RuleSet,
  RuleOption,
  Maybe,
  PointerValue,
  NodeArray,
  Node,
  ParentIterator,
} from './types'
import { createCacheIterator } from './create-cache-iterator'
import { report } from './report'
import {
  getRuleOption,
  getRuleConfigKey,
  isRuleConfigValid,
} from './config-utils'
import { nodeToObject, objectHash, objectsEqual } from './object-utils'
import * as pointers from './pointers'
import FileFormat from '@sketch-hq/sketch-file-format-ts'

/**
 * Returns a RuleUtilsCreator function, which can be used to build util objects
 * scoped to a specific rule.
 */
const createRuleUtilsCreator = (
  cache: NodeCache,
  violations: LintViolation[],
  config: LintConfig,
  operation: LintOperation,
  file: SketchFile,
  getImageMetadata: GetImageMetadata,
): RuleUtilsCreator => {
  const memoizedGetImageMetaData = mem(getImageMetadata)

  const iterateParents: ParentIterator = (node, callback) => {
    let parent = pointers.parent(node.$pointer, file.contents)
    while (parent) {
      callback(
        parent as Node | NodeArray | Node<FileFormat.Contents['document']>,
      )
      if (typeof parent === 'object' && '$pointer' in parent) {
        parent = pointers.parent(parent.$pointer, file.contents)
      } else {
        parent = null
      }
    }
  }

  const utilsCreator: RuleUtilsCreator = (
    ruleSet: RuleSet,
    ruleModule: RuleModule,
  ): RuleUtils => ({
    get(pointer: string): Maybe<PointerValue> {
      return pointers.get(pointer, file.contents)
    },
    parent(pointer: string): Maybe<PointerValue> {
      return pointers.parent(pointer, file.contents)
    },
    report(items: ReportItem | ReportItem[]): void {
      report(items, config, violations, ruleSet, ruleModule, iterateParents)
    },
    iterateCache: createCacheIterator(cache, operation),
    getImageMetadata: (ref: string): Promise<ImageMetadata> => {
      return memoizedGetImageMetaData(ref, file.filepath || '')
    },
    iterateParents,
    getOption: (optionKey: string): Maybe<RuleOption> => {
      const result = isRuleConfigValid(config, ruleSet, ruleModule)
      if (result !== true) {
        // Convert Ajv validation errors into a human readable string
        const details = result
          .map(error => {
            if (error.dataPath === '') {
              return error.message
            } else {
              return `"${error.dataPath}" ${error.message}`
            }
          })
          .join('. ')
        throw new Error(
          `Rule "${getRuleConfigKey(
            ruleSet,
            ruleModule,
          )}" attempted to access an invalid config object. ${details}`,
        )
      }
      const item = getRuleOption(config, ruleSet, ruleModule, optionKey)
      if (item) {
        return item
      } else {
        throw new Error(
          `Option "${optionKey}" for rule "${getRuleConfigKey(
            ruleSet,
            ruleModule,
          )}" not found in config`,
        )
      }
    },
    nodeToObject,
    objectHash,
    objectsEqual,
  })
  return utilsCreator
}

export { createRuleUtilsCreator }
