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
import { getRuleOption } from './config-utils'

/**
 * Returns a RuleUtilsCreator function, which can be used to build util objects
 * for rules.
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
    getOption: (option: string): Maybe<ConfigItemOption> =>
      getRuleOption(config, ruleSet, ruleModule, option),
  })
  return utilsCreator
}

export { createRuleUtilsCreator }
