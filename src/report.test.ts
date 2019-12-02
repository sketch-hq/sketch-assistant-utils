import { report } from './report'
import { LintViolation } from './types'
import {
  createDummyRuleSet,
  createDummyRectNode,
  createDummyRuleModule,
  createDummyConfig,
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
    createDummyConfig(),
    violations,
    ruleSet,
    ruleModule,
  )
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Foo",
        "objectId": undefined,
        "pointer": "/",
        "ruleModule": Object {
          "description": "",
          "name": "rule-1",
          "title": "",
        },
        "ruleSet": Object {
          "description": "",
          "name": "rule-set",
          "title": "",
        },
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
    createDummyConfig(),
    violations,
    ruleSet,
    ruleModule,
  )
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "message": "Foo",
        "objectId": undefined,
        "pointer": "/",
        "ruleModule": Object {
          "description": "",
          "name": "rule-1",
          "title": "",
        },
        "ruleSet": Object {
          "description": "",
          "name": "rule-set",
          "title": "",
        },
        "severity": 3,
      },
      Object {
        "message": "Bar",
        "objectId": undefined,
        "pointer": "/",
        "ruleModule": Object {
          "description": "",
          "name": "rule-1",
          "title": "",
        },
        "ruleSet": Object {
          "description": "",
          "name": "rule-set",
          "title": "",
        },
        "severity": 3,
      },
    ]
  `)
})
