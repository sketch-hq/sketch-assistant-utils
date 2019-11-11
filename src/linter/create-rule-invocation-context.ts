import { RuleModule, LintOperationContext, RuleInvocationContext } from '..'

/**
 * The RuleInvocationContext is a version of LintOperationContext customised for
 * passing to a specific rule.
 */
const createRuleInvocationContext = (
  ruleModule: RuleModule,
  lintOperationContext: LintOperationContext,
): RuleInvocationContext => {
  const { createUtils: utilsCreator, ...rest } = lintOperationContext
  return {
    ...rest,
    utils: utilsCreator(ruleModule),
  }
}

export { createRuleInvocationContext }
