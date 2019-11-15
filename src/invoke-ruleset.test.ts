import { resolve } from 'path'

import { invokeRuleSet } from './invoke-ruleset'
import {
  RuleModule,
  Config,
  RuleSet,
  LintOperationContext,
  LintViolation,
  RuleInvocationContext,
} from './types'
import { createDummyRectNode } from './test-helpers'
import { getImageMetadata } from './get-image-metadata.node'
import { fromFile } from './from-file'
import { createLintOperationContext } from './create-lint-operation-context'

const working: RuleModule = {
  rule: (context: RuleInvocationContext) => {
    context.utils.report({
      message: 'Foo',
      ruleName: 'working',
      node: createDummyRectNode(),
    })
  },
  name: 'working',
  title: 'Working rule',
  description: 'A working rule',
}

const broken: RuleModule = {
  rule: () => {
    throw new Error('Explode!')
  },
  name: 'broken',
  title: 'Broken rule',
  description: 'A broken rule',
}

const config: Config = { rules: {} }

test('No errors for working rules', async (): Promise<void> => {
  expect.assertions(2)
  const ruleSet: RuleSet = {
    name: 'foo',
    title: 'Foo',
    description: 'Foo ruleset',
    rules: [working],
  }
  const file = await fromFile(resolve(__dirname, '../fixtures/empty.sketch'))
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
  // Expect violations
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "context": Object {
          "objectId": undefined,
          "pointer": "/",
        },
        "message": "Foo",
        "ruleName": "working",
        "ruleSetName": "foo",
        "severity": 3,
      },
    ]
  `)
})

test('Produces errors for broken rules', async (): Promise<void> => {
  expect.assertions(2)
  const ruleSet: RuleSet = {
    name: 'foo',
    title: 'Foo',
    description: 'Foo ruleset',
    rules: [broken],
  }
  const file = await fromFile(resolve(__dirname, '../fixtures/empty.sketch'))
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
  // Expect no violations
  expect(violations).toMatchInlineSnapshot(`Array []`)
})
