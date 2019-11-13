import { resolve } from 'path'

import { invokeRuleSet } from './invoke-ruleset'
import {
  RuleModule,
  Config,
  RuleSet,
  LintOperationContext,
  createLintOperationContext,
  fromFile,
  LintViolation,
  RuleInvocationContext,
  getImageMetadata,
} from '..'

const working: RuleModule = {
  rule: (context: RuleInvocationContext) => {
    context.utils.report({
      message: 'Foo',
      ruleId: 'working',
      ruleSetId: 'working-set',
      path: '/',
    })
  },
  id: 'working',
  title: 'Working rule',
  description: 'A working rule',
}

const broken: RuleModule = {
  rule: () => {
    throw new Error('Explode!')
  },
  id: 'broken',
  title: 'Broken rule',
  description: 'A broken rule',
}

const config: Config = { rules: {} }

test('No errors for working rules', async (): Promise<void> => {
  expect.assertions(2)
  const ruleSet: RuleSet = {
    id: '',
    title: '',
    description: '',
    rules: [working, working],
  }
  const file = await fromFile(resolve(__dirname, '../../fixtures/empty.sketch'))
  const violations: LintViolation[] = []
  const context: LintOperationContext = createLintOperationContext(
    file,
    config,
    violations,
    { cancelled: false },
    getImageMetadata,
  )
  // Expect no errors
  expect(await invokeRuleSet(ruleSet, context)).toMatchInlineSnapshot(
    `Array []`,
  )
  // Expect two violations
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "context": Object {
          "path": "/",
        },
        "message": "Foo",
        "ruleId": "working",
        "ruleSetId": "working-set",
        "severity": 3,
      },
      Object {
        "context": Object {
          "path": "/",
        },
        "message": "Foo",
        "ruleId": "working",
        "ruleSetId": "working-set",
        "severity": 3,
      },
    ]
  `)
})

test('Produces errors for broken rules', async (): Promise<void> => {
  expect.assertions(2)
  const ruleSet: RuleSet = {
    id: '',
    title: '',
    description: '',
    rules: [broken, working],
  }
  const file = await fromFile(resolve(__dirname, '../../fixtures/empty.sketch'))
  const violations: LintViolation[] = []
  const context: LintOperationContext = createLintOperationContext(
    file,
    config,
    violations,
    { cancelled: false },
    getImageMetadata,
  )
  // Expect one error
  expect(await invokeRuleSet(ruleSet, context)).toMatchInlineSnapshot(`
    Array [
      [RuleInvocationError: Error thrown during rule invocation],
    ]
  `)
  // Still expect a violation from the working rule invoked after the broken one
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "context": Object {
          "path": "/",
        },
        "message": "Foo",
        "ruleId": "working",
        "ruleSetId": "working-set",
        "severity": 3,
      },
    ]
  `)
})
