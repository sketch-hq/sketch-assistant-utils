import {
  ReportItem,
  LintConfig,
  LintViolation,
  RuleSet,
  RuleModule,
  ParentIterator,
} from './types'
import {
  getRuleSeverity,
  getRuleIgnoreClasses,
  getRuleIgnoreNamePathPatterns,
} from './config-utils'

/**
 * Map one or more report items into violations and push them into a violations array.
 */
const report = (
  report: ReportItem | ReportItem[],
  config: LintConfig,
  violations: LintViolation[],
  ruleSet: RuleSet,
  ruleModule: RuleModule,
  iterateParents: ParentIterator,
): void => {
  if (Array.isArray(report) && report.length === 0) return
  const severity = getRuleSeverity(config, ruleSet, ruleModule)
  const classesToIgnore = getRuleIgnoreClasses(config, ruleSet, ruleModule)
  const namesToIgnore = getRuleIgnoreNamePathPatterns(
    config,
    ruleSet,
    ruleModule,
  )
  violations.push(
    ...(Array.isArray(report) ? report : [report])
      // Filter out reports involving nodes with ignored `_class` props
      .filter(item => {
        return item.node ? !classesToIgnore.includes(item.node._class) : true
      })
      // Filter out nodes with ignored name paths
      .filter(item => {
        if (!item.node || namesToIgnore.length === 0) return true
        const names: string[] = 'name' in item.node ? [item.node.name] : []
        iterateParents(item.node, parent => {
          if (typeof parent === 'object' && 'name' in parent) {
            names.unshift(parent.name)
          }
        })
        const namePath = `/${names.join('/')}`
        return !namesToIgnore.map(regex => regex.test(namePath)).includes(true)
      })
      .map(
        (item): LintViolation => {
          const { rules: _rules, ...ruleSetDefinition } = ruleSet
          const {
            getOptions: _getOptions,
            rule: _rule,
            ...ruleModuleDefinitiuon
          } = ruleModule
          return {
            ruleSet: ruleSetDefinition,
            ruleModule: ruleModuleDefinitiuon,
            message: item.message,
            severity,
            pointer: item?.node?.$pointer,
            // eslint-disable-next-line
            // @ts-ignore
            objectId: item?.node?.do_objectID,
          }
        },
      ),
  )
}

export { report }
