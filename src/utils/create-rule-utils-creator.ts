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
  ConfigItemOption,
  SketchFile,
  RuleSet,
} from '../types'
import { getOption } from './get-option'
import { createWalker } from './create-walker'
import { report } from './report'

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
      report(items, config, violations, ruleSet)
    },
    walk: createWalker(cache, operation),
    getImageMetadata: (ref: string): Promise<ImageMetadata> => {
      return memoizedGetImageMetaData(ref, file.filepath || '')
    },
    getOption<T extends ConfigItemOption>(option: string): T | null {
      return getOption<T>(config, ruleModule.id, option)
    },
  })
  return utilsCreator
}

export { createRuleUtilsCreator }
