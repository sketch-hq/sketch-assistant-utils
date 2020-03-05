import pMap from 'p-map'

import {
  AssistantDefinition,
  RuleContext,
  ProcessedSketchFile,
  AssistantEnv,
  Violation,
  RunOperation,
  GetImageMetadata,
  RunResult,
} from '../types'
import { createRuleUtilsCreator } from '../rule-utils'
import { isRuleActive } from '../assistant-config'

class RuleInvocationError extends Error {
  public cause: Error
  public assistantName: string
  public ruleName: string

  public constructor(cause: Error, assistantName: string, ruleName: string) {
    super(
      `Error thrown during invocation of rule "${ruleName}" on assistant "${assistantName}": ${cause.message}`,
    )
    this.cause = cause
    this.assistantName = assistantName
    this.ruleName = ruleName
    this.name = 'RuleInvocationError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Run an assistant, catching and returning any errors encountered during rule invocation.
 */
const runAssistant = async (
  file: ProcessedSketchFile,
  assistant: AssistantDefinition,
  env: AssistantEnv,
  operation: RunOperation,
  getImageMetadata: GetImageMetadata,
): Promise<RunResult> => {
  const violations: Violation[] = []

  const createUtils = createRuleUtilsCreator(
    file,
    violations,
    assistant,
    operation,
    getImageMetadata,
  )

  const context = {
    env,
    file,
    assistant,
    operation,
    getImageMetadata,
  }

  try {
    await pMap(
      assistant.rules.filter(rule => isRuleActive(assistant.config, rule.name)),
      async (rule): Promise<void> => {
        if (operation.cancelled) return
        const { rule: ruleFunction, name: ruleName } = rule
        const ruleContext: RuleContext = {
          ...context,
          utils: createUtils(ruleName),
        }
        try {
          await ruleFunction(ruleContext)
        } catch (error) {
          throw new RuleInvocationError(error, assistant.name, ruleName)
        }
      },
      { concurrency: 1, stopOnError: false },
    )
  } catch (error) {
    return {
      violations,
      errors: Array.from(error),
    }
  }
  return {
    violations,
    errors: [],
  }
}

export { runAssistant, RuleInvocationError }
