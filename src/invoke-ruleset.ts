import pMap from 'p-map'
import { RuleSet, LintOperationContext } from './types'
import { createRuleInvocationContext } from './create-rule-invocation-context'

class RuleInvocationError extends Error {
  public cause: Error
  public ruleName: string
  public ruleSetName: string

  public constructor(cause: Error, ruleName: string, ruleSetName: string) {
    super('Error thrown during rule invocation')
    this.cause = cause
    this.ruleName = ruleName
    this.ruleSetName = ruleSetName
    this.name = 'RuleInvocationError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Run a ruleset, catching and returning any errors encountered during rule invocation.
 */
const invokeRuleSet = async (
  ruleSet: RuleSet,
  context: LintOperationContext,
): Promise<Error[]> => {
  try {
    await pMap(
      Array(ruleSet.rules.length).fill(context),
      async (context: LintOperationContext, i: number): Promise<void> => {
        if (!context.operation.cancelled) {
          const ruleModule = ruleSet.rules[i]
          const { rule, name } = ruleModule
          try {
            const invocationContext = createRuleInvocationContext(
              ruleSet,
              ruleModule,
              context,
            )
            await rule(invocationContext)
          } catch (error) {
            throw new RuleInvocationError(error, name, ruleSet.name)
          }
        }
      },
      { concurrency: 1, stopOnError: false },
    )
  } catch (error) {
    return Array.from(error)
  }
  return []
}

export { invokeRuleSet, RuleInvocationError }
