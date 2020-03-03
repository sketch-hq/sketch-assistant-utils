import pMap from 'p-map'

import {
  RunContext,
  AssistantDefinition,
  RuleContext,
  ProcessedSketchFile,
  AssistantEnv,
  Violation,
  RunOperation,
  GetImageMetadata,
} from '../types'
import { createRuleUtilsCreator } from '../rule-utils'

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
 * Create a RunContext object.
 */
const createRunContext = (
  file: ProcessedSketchFile,
  assistant: AssistantDefinition,
  env: AssistantEnv,
  violations: Violation[],
  operation: RunOperation,
  getImageMetadata: GetImageMetadata,
): RunContext => {
  const createUtils = createRuleUtilsCreator(
    file,
    violations,
    assistant,
    operation,
    getImageMetadata,
  )

  return {
    file,
    createUtils,
    operation,
    getImageMetadata,
    assistant,
    env,
  }
}

/**
 * Create a RuleContext object.
 */
const createRuleContext = (runContext: RunContext, ruleName: string): RuleContext => {
  const { createUtils, ...rest } = runContext
  return {
    ...rest,
    utils: createUtils(ruleName),
  }
}

/**
 * Run an assistant, catching and returning any errors encountered during rule invocation.
 */
const runAssistant = async (runContext: RunContext): Promise<Error[]> => {
  const { assistant } = runContext
  try {
    await pMap(
      Array(assistant.rules.length).fill(runContext),
      async (context: RunContext, i: number): Promise<void> => {
        if (!context.operation.cancelled) {
          const rule = assistant.rules[i]
          const { rule: ruleFunction, name: ruleName } = rule
          try {
            await ruleFunction(createRuleContext(runContext, ruleName))
          } catch (error) {
            throw new RuleInvocationError(error, assistant.name, ruleName)
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

export { runAssistant, createRunContext, createRuleContext }
