import { ReportItem, Config, LintViolation, RuleSet, RuleModule } from './types'
import { getRuleSeverity } from './config-utils'

/**
 * Map one or more report items into violations and push them into a violations array.
 */
const report = (
  report: ReportItem | ReportItem[],
  config: Config,
  violations: LintViolation[],
  ruleSet: RuleSet,
  ruleModule: RuleModule,
): void => {
  if (Array.isArray(report) && report.length === 0) return
  const severity = getRuleSeverity(config, ruleSet, ruleModule)
  violations.push(
    ...(Array.isArray(report) ? report : [report]).map(
      (item): LintViolation => ({
        ruleName: ruleModule.name,
        ruleSetName: ruleSet.name,
        message: item.message,
        severity,
        context: {
          pointer: item?.node?.$pointer,
          // eslint-disable-next-line
          // @ts-ignore
          objectId: item?.node?.do_objectID,
        },
      }),
    ),
  )
}

export { report }
