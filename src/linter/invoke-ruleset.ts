import pMap from 'p-map'
import { RuleSet, LintOperationContext, createRuleInvocationContext } from '..'

class RuleInvocationError extends Error {
  public cause: Error
  public ruleId: string
  public ruleSetId: string

  public constructor(cause: Error, ruleId: string, ruleSetId: string) {
    super('Error thrown during rule invocation')
    this.cause = cause
    this.ruleId = ruleId
    this.ruleSetId = ruleSetId
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
          const { rule, id } = ruleModule
          try {
            const invocationContext = createRuleInvocationContext(
              ruleModule,
              context,
            )
            await rule(invocationContext)
          } catch (error) {
            throw new RuleInvocationError(error, id, ruleSet.id)
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
