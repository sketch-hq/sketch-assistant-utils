import mem from 'mem'

import {
  WalkerCache,
  LintViolation,
  ReportItem,
  RuleUtils,
  Config,
  LintOperation,
  ImageMetadata,
  RuleUtilsCreator,
  RuleModule,
  GetImageMetadata,
  SketchFile,
  RuleSet,
  ConfigItemOption,
  Maybe,
} from './types'
import { createWalker } from './create-walker'
import { report } from './report'
import {
  getRuleOption,
  getRuleConfigKey,
  isRuleConfigValid,
} from './config-utils'
import { nodeToObject, objectHash, objectsEqual } from './object-utils'

/**
 * Returns a RuleUtilsCreator function, which can be used to build util objects
 * scoped to a specific rule.
 */
const createRuleUtilsCreator = (
  cache: WalkerCache,
  violations: LintViolation[],
  config: Config,
  operation: LintOperation,
  file: SketchFile,
  getImageMetadata: GetImageMetadata,
): RuleUtilsCreator => {
  const memoizedGetImageMetaData = mem(getImageMetadata)
  const utilsCreator: RuleUtilsCreator = (
    ruleSet: RuleSet,
    ruleModule: RuleModule,
  ): RuleUtils => ({
    report(items: ReportItem | ReportItem[]): void {
      report(items, config, violations, ruleSet, ruleModule)
    },
    walk: createWalker(cache, operation),
    getImageMetadata: (ref: string): Promise<ImageMetadata> => {
      return memoizedGetImageMetaData(ref, file.filepath || '')
    },
    getOption: (optionKey: string): Maybe<ConfigItemOption> => {
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
