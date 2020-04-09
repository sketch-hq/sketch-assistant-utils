import { testRule, createAssistant, createRule } from '..'
import { resolve } from 'path'

describe('testRule', () => {
  test('runs no-op rule without issues', async (): Promise<void> => {
    expect.assertions(2)
    const res = await testRule(
      resolve(__dirname, './empty.sketch'),
      { rule: { active: true } },
      createAssistant({ rules: [createRule({ name: 'rule' })] }),
    )
    expect(res.violations).toHaveLength(0)
    expect(res.errors).toHaveLength(0)
  })

  test('can return violations', async (): Promise<void> => {
    expect.assertions(2)
    const res = await testRule(
      resolve(__dirname, './empty.sketch'),
      { rule: { active: true } },
      createAssistant({
        rules: [
          createRule({
            name: 'rule',
            rule: async (context) => context.utils.report({ message: '' }),
          }),
        ],
      }),
    )
    expect(res.violations).toHaveLength(1)
    expect(res.errors).toHaveLength(0)
  })

  test('can return rule errors', async (): Promise<void> => {
    expect.assertions(2)
    const res = await testRule(
      resolve(__dirname, './empty.sketch'),
      { rule: { active: true } },
      createAssistant({
        rules: [
          createRule({
            name: 'rule',
            rule: async () => {
              throw new Error()
            },
          }),
        ],
      }),
    )
    expect(res.violations).toHaveLength(0)
    expect(res.errors).toHaveLength(1)
  })

  test('throws when an unavailable rule is configured', async (): Promise<void> => {
    expect.assertions(1)
    try {
      await testRule(
        resolve(__dirname, './empty.sketch'),
        { 'reticulating-splines': { active: true } },
        createAssistant({
          rules: [createRule({ name: 'rule' })],
        }),
      )
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
