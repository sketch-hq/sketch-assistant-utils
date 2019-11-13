import mem from 'mem'

import {
  WalkerCache,
  LintViolation,
  ReportItem,
  RuleUtils,
  Config,
  ViolationSeverity,
  createWalker,
  LintOperation,
  ImageMetadata,
  RuleUtilsCreator,
  RuleModule,
  GetImageMetadata,
  getOption,
  ConfigItemOption,
  SketchFile,
} from '..'

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
  const utils = {
    report(report: ReportItem | ReportItem[]): void {
      if (Array.isArray(report) && report.length === 0) return
      const severity =
        getOption<ViolationSeverity>(
          config,
          Array.isArray(report) ? report[0].ruleId : report.ruleId,
          'severity',
        ) ||
        config.defaultSeverity ||
        ViolationSeverity.error
      violations.push(
        ...(Array.isArray(report) ? report : [report]).map(
          (item): LintViolation => ({
            ruleId: item.ruleId,
            ruleSetId: item.ruleSetId,
            message: item.message,
            severity,
            context: {
              path: item.path,
            },
          }),
        ),
      )
    },
    walk: createWalker(cache, operation),
    getImageMetadata: (ref: string): Promise<ImageMetadata> => {
      return memoizedGetImageMetaData(ref, file.filepath || '')
    },
  }
  const utilsCreator: RuleUtilsCreator = (
    ruleModule: RuleModule,
  ): RuleUtils => ({
    ...utils,
    getOption<T extends ConfigItemOption>(option: string): T | null {
      return getOption<T>(config, ruleModule.id, option)
    },
  })
  return utilsCreator
}

export { createRuleUtilsCreator }
