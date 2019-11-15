import { resolve } from 'path'

import { ruleModule } from '.'
import { ruleSet } from '..'
import { LintViolation, Config } from '../../types'
import { getImageMetadata } from '../../utils/get-image-metadata.node'
import { fromFile } from '../../utils/from-file'
import { createRuleInvocationContext } from '../../utils/create-rule-invocation-context'
import { createLintOperationContext } from '../../utils/create-lint-operation-context'

const { rule, id } = ruleModule

test('Generates violations correctly', async (): Promise<void> => {
  expect.assertions(1)
  const file = await fromFile(
    resolve(__dirname, '../../../fixtures/10-layers.sketch'),
  )
  const config: Config = {
    rules: {
      [id]: { active: true, maxLayers: 9 },
    },
  }
  const violations: LintViolation[] = []
  const lintOperationContext = createLintOperationContext(
    file,
    config,
    violations,
    { cancelled: false },
    getImageMetadata,
  )
  const invocationContext = createRuleInvocationContext(
    ruleSet,
    ruleModule,
    lintOperationContext,
  )
  await rule(invocationContext)
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "context": Object {
          "objectId": "9C2047B4-71D5-48C9-9DEE-34C0009FF5A9",
          "pointer": "/document/pages/0",
        },
        "message": "Expected 9 or less layers, found 10",
        "ruleId": "groups-max-layers",
        "ruleSetId": "sketch",
        "severity": 3,
      },
    ]
  `)
})

test('Does not generate false negatives', async (): Promise<void> => {
  expect.assertions(1)
  const file = await fromFile(
    resolve(__dirname, '../../../fixtures/10-layers.sketch'),
  )
  const config: Config = {
    rules: {
      [id]: { active: true, maxLayers: 10 },
    },
  }
  const violations: LintViolation[] = []
  const lintOperationContext = createLintOperationContext(
    file,
    config,
    violations,
    { cancelled: false },
    getImageMetadata,
  )
  const invocationContext = createRuleInvocationContext(
    ruleSet,
    ruleModule,
    lintOperationContext,
  )
  await rule(invocationContext)
  expect(violations).toMatchInlineSnapshot(`Array []`)
})
