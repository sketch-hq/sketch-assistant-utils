import { report } from './report'
import { LintViolation } from './types'
import {
  createDummyRuleSet,
  createDummyRectNode,
  createDummyRuleModule,
} from './test-helpers'

const ruleSet = createDummyRuleSet({
  name: 'rule-set',
  rules: [createDummyRuleModule({ name: 'rule-1' })],
})

const ruleModule = ruleSet.rules[0]

test('Maps a single report to violations', (): void => {
  expect.assertions(1)
  const violations: LintViolation[] = []
  report(
    {
      message: 'Foo',
      node: createDummyRectNode(),
    },
    {
      rules: {},
    },
    violations,
    ruleSet,
    ruleModule,
  )
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "context": Object {
          "objectId": undefined,
          "pointer": "/",
        },
        "message": "Foo",
        "ruleName": "rule-1",
        "ruleSetName": "rule-set",
        "severity": 3,
      },
    ]
  `)
})

test('Maps multiple violations', (): void => {
  expect.assertions(1)
  const violations: LintViolation[] = []
  report(
    [
      {
        message: 'Foo',
        node: createDummyRectNode(),
      },
      {
        message: 'Bar',
        node: createDummyRectNode(),
      },
    ],
    {
      rules: {},
    },
    violations,
    ruleSet,
    ruleModule,
  )
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "context": Object {
          "objectId": undefined,
          "pointer": "/",
        },
        "message": "Foo",
        "ruleName": "rule-1",
        "ruleSetName": "rule-set",
        "severity": 3,
      },
      Object {
        "context": Object {
          "objectId": undefined,
          "pointer": "/",
        },
        "message": "Bar",
        "ruleName": "rule-1",
        "ruleSetName": "rule-set",
        "severity": 3,
      },
    ]
  `)
})
