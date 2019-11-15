import {
  ReportItem,
  ViolationSeverity,
  Config,
  LintViolation,
  RuleSet,
} from '../types'
import { getOption } from './get-option'

/**
 * Map one or more report items into violations and push them into a violations array.
 */
const report = (
  report: ReportItem | ReportItem[],
  config: Config,
  violations: LintViolation[],
  ruleSet: RuleSet,
): void => {
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
        ruleSetId: ruleSet.id,
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
