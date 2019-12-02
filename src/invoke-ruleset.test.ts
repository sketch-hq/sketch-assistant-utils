import { resolve } from 'path'

import { invokeRuleSet } from './invoke-ruleset'
import {
  LintOperationContext,
  LintViolation,
  RuleInvocationContext,
} from './types'
import {
  createDummyRectNode,
  createDummyConfig,
  createDummyRuleModule,
  createDummyRuleSet,
} from './test-helpers'
import { getImageMetadata } from './get-image-metadata.node'
import { fromFile } from './from-file'
import { createLintOperationContext } from './create-lint-operation-context'

test('No errors for working rules', async (): Promise<void> => {
  expect.assertions(2)
  const ruleSet = createDummyRuleSet({
    name: 'working-ruleset',
    rules: [
      createDummyRuleModule({
        name: 'working',
        rule: (context: RuleInvocationContext) => {
          context.utils.report({
            message: 'Foo',
            node: createDummyRectNode(),
          })
        },
      }),
    ],
  })
  const file = await fromFile(resolve(__dirname, '../fixtures/empty.sketch'))
  const violations: LintViolation[] = []
  const context: LintOperationContext = createLintOperationContext(
    file,
    createDummyConfig(),
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
        "message": "Foo",
        "objectId": undefined,
        "pointer": "/",
        "ruleModule": Object {
          "description": "",
          "name": "working",
          "title": "",
        },
        "ruleSet": Object {
          "description": "",
          "name": "working-ruleset",
          "title": "",
        },
        "severity": 3,
      },
    ]
  `)
})

test('Produces errors for broken rules', async (): Promise<void> => {
  expect.assertions(2)
  const ruleSet = createDummyRuleSet({
    name: 'broken-ruleset',
    rules: [
      createDummyRuleModule({
        name: 'broken',
        rule: () => {
          throw new Error('Explode!')
        },
      }),
    ],
  })
  const file = await fromFile(resolve(__dirname, '../fixtures/empty.sketch'))
  const violations: LintViolation[] = []
  const context: LintOperationContext = createLintOperationContext(
    file,
    createDummyConfig(),
    violations,
    { cancelled: false },
    getImageMetadata,
  )
  // Expect errors
  expect(await invokeRuleSet(ruleSet, context)).toMatchInlineSnapshot(`
    Array [
      [RuleInvocationError: Error thrown during rule invocation: Explode!],
    ]
  `)
  // Expect no violations
  expect(violations).toMatchInlineSnapshot(`Array []`)
})

test('Produces errors for accessing missing ops', async (): Promise<void> => {
  expect.assertions(2)
  const ruleSet = createDummyRuleSet({
    name: 'broken-ruleset',
    rules: [
      createDummyRuleModule({
        name: 'broken',
        rule: ctx => {
          // eslint-disable-next-line
          // @ts-ignore
          const _option = ctx.utils.getOption('badOption')
        },
      }),
    ],
  })
  const file = await fromFile(resolve(__dirname, '../fixtures/empty.sketch'))
  const violations: LintViolation[] = []
  const context: LintOperationContext = createLintOperationContext(
    file,
    createDummyConfig(),
    violations,
    { cancelled: false },
    getImageMetadata,
  )
  // Expect errors
  expect(await invokeRuleSet(ruleSet, context)).toMatchInlineSnapshot(`
    Array [
      [RuleInvocationError: Error thrown during rule invocation: Option "badOption" for rule "broken-ruleset/broken" not found in config],
    ]
  `)
  // Expect no violations
  expect(violations).toMatchInlineSnapshot(`Array []`)
})
