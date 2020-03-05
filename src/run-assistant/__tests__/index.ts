import { resolve } from 'path'

import { AssistantEnv, RuleDefinition, RunResult, AssistantConfig } from '../../types'
import { runAssistant, RuleInvocationError } from '..'
import { fromFile } from '../../from-file'
import { process } from '../../process'
import { createAssistantDefinition, createRule, createAssistantConfig } from '../../test-helpers'
import { getImageMetadata } from '../../get-image-metadata'

const testRunAssistant = async (
  config: AssistantConfig,
  rule: RuleDefinition,
): Promise<RunResult> => {
  const op = { cancelled: false }
  const file = await fromFile(resolve(__dirname, './empty.sketch'))
  const processedFile = await process(file, op)
  const assistant = createAssistantDefinition({ rules: rule ? [rule] : [], config })
  const env: AssistantEnv = { locale: '', platform: 'node' }
  return await runAssistant(processedFile, assistant, env, op, getImageMetadata)
}

describe('runAssistant', () => {
  test('skips unconfigured rules', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, violations } = await testRunAssistant(createAssistantConfig(), createRule())
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('can produce violations', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, violations } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: true },
        },
      }),
      createRule({
        name: 'rule',
        rule: async ruleContext => {
          ruleContext.utils.report({ message: 'Something went wrong' })
        },
      }),
    )
    expect(violations).toHaveLength(1)
    expect(errors).toHaveLength(0)
  })

  test('skips inactive rules', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, violations } = await testRunAssistant(
      createAssistantConfig({
        rules: {
          rule: { active: false },
        },
      }),
      createRule({
        name: 'rule',
        rule: async ruleContext => {
          ruleContext.utils.report({ message: 'Something went wrong' })
        },
      }),
    )
    expect(violations).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('can produce rule errors', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, violations } = await testRunAssistant(
      createAssistantConfig({ rules: { rule: { active: true } } }),
      createRule({
        name: 'rule',
        rule: async () => {
          throw new Error('Bang!')
        },
      }),
    )
    expect(violations).toHaveLength(0)
    expect(errors[0]).toBeInstanceOf(RuleInvocationError)
  })

  test('can produce rule errors for bad config', async (): Promise<void> => {
    expect.assertions(2)
    const { errors, violations } = await testRunAssistant(
      createAssistantConfig({ rules: { rule: { active: true } } }),
      createRule({
        name: 'rule',
        rule: async ruleContext => {
          ruleContext.utils.getOption('warpFieldIntegrity')
        },
      }),
    )
    expect(violations).toHaveLength(0)
    expect(errors[0]).toBeInstanceOf(RuleInvocationError)
  })
})