import { report } from './report'
import { LintViolation, ViolationSeverity } from './types'
import { createDummyRuleSet, createDummyRectNode } from './test-helpers'

test('Maps a single report to violations', (): void => {
  expect.assertions(1)
  const violations: LintViolation[] = []
  report(
    {
      message: 'Foo',
      ruleName: 'foo',
      node: createDummyRectNode(),
    },
    {
      rules: {},
    },
    violations,
    createDummyRuleSet(),
  )
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "context": Object {
          "objectId": undefined,
          "pointer": "/",
        },
        "message": "Foo",
        "ruleName": "foo",
        "ruleSetName": "",
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
        ruleName: 'foo',
        node: createDummyRectNode(),
      },
      {
        message: 'Bar',
        ruleName: 'bar',
        node: createDummyRectNode(),
      },
    ],
    {
      rules: {},
    },
    violations,
    createDummyRuleSet(),
  )
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "context": Object {
          "objectId": undefined,
          "pointer": "/",
        },
        "message": "Foo",
        "ruleName": "foo",
        "ruleSetName": "",
        "severity": 3,
      },
      Object {
        "context": Object {
          "objectId": undefined,
          "pointer": "/",
        },
        "message": "Bar",
        "ruleName": "bar",
        "ruleSetName": "",
        "severity": 3,
      },
    ]
  `)
})

test('Picks up a custom severity option', (): void => {
  expect.assertions(1)
  const violations: LintViolation[] = []
  report(
    {
      message: 'Foo',
      ruleName: 'foo',
      node: createDummyRectNode(),
    },
    {
      rules: {
        'bar/foo': {
          active: true,
          severity: ViolationSeverity.info,
        },
      },
    },
    violations,
    createDummyRuleSet({ name: 'bar' }),
  )
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "context": Object {
          "objectId": undefined,
          "pointer": "/",
        },
        "message": "Foo",
        "ruleName": "foo",
        "ruleSetName": "bar",
        "severity": 1,
      },
    ]
  `)
})
