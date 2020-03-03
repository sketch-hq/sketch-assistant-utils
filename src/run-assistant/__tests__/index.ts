import { resolve } from 'path'

import { RunContext, AssistantEnv, Violation, RuleDefinition } from '../../types'
import { createRunContext, runAssistant } from '..'
import { fromFile } from '../../from-file'
import { process } from '../../process'
import { createAssistantDefinition, createRule } from '../../test-helpers'
import { getImageMetadata } from '../../get-image-metadata'

const setupTest = async (
  rule: RuleDefinition = createRule(),
): Promise<{ context: RunContext; violations: Violation[] }> => {
  const op = { cancelled: false }
  const file = await fromFile(resolve(__dirname, './empty.sketch'))
  const processedFile = await process(file, op)
  const assistant = createAssistantDefinition({ rules: [rule] })
  const env: AssistantEnv = { locale: '', platform: 'node' }
  const violations: Violation[] = []
  return {
    context: createRunContext(processedFile, assistant, env, violations, op, getImageMetadata),
    violations,
  }
}

describe('runAssistant', () => {
  test('does not error or produce violations normally', async (): Promise<void> => {
    const { context, violations } = await setupTest()
    await runAssistant(context)
    expect(violations).toHaveLength(0)
  })

  test('can produce violations', async (): Promise<void> => {
    const { context, violations } = await setupTest(
      createRule({
        rule: async ruleContext => {
          ruleContext.utils.report({ message: 'Something went wrong' })
        },
      }),
    )
    await runAssistant(context)
    expect(violations.map(violation => violation.message)).toMatchInlineSnapshot(`
      Array [
        "Something went wrong",
      ]
    `)
  })

  test('can produce rule errors', async (): Promise<void> => {
    const { context } = await setupTest(
      createRule({
        rule: async () => {
          throw new Error('Bang!')
        },
      }),
    )
    const errors = await runAssistant(context)
    expect(errors).toMatchInlineSnapshot(`
      Array [
        [RuleInvocationError: Error thrown during invocation of rule "dummy-assistant/dummy-rule" on assistant "dummy-assistant": Bang!],
      ]
    `)
  })

  test('can produce rule errors for bad config', async (): Promise<void> => {
    const { context } = await setupTest(
      createRule({
        rule: async ruleContext => {
          ruleContext.utils.getOption('warpFieldIntegrity')
        },
      }),
    )
    const errors = await runAssistant(context)
    expect(errors).toMatchInlineSnapshot(`
      Array [
        [RuleInvocationError: Error thrown during invocation of rule "dummy-assistant/dummy-rule" on assistant "dummy-assistant": Invalid configuration found for rule "dummy-assistant/dummy-rule" on assistant "dummy-assistant": Option "warpFieldIntegrity" not found in assistant configuration],
      ]
    `)
  })
})
