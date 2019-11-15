import {
  RuleModule,
  LintOperationContext,
  RuleInvocationContext,
  RuleSet,
} from './types'

/**
 * The RuleInvocationContext is a version of LintOperationContext customised for
 * passing to a specific rule.
 */
const createRuleInvocationContext = (
  ruleSet: RuleSet,
  ruleModule: RuleModule,
  lintOperationContext: LintOperationContext,
): RuleInvocationContext => {
  const { createUtils, ...rest } = lintOperationContext
  return {
    ...rest,
    utils: createUtils(ruleSet, ruleModule),
  }
}

export { createRuleInvocationContext }
