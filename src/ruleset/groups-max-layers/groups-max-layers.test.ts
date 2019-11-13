import { resolve } from 'path'

import { ruleModule } from '.'
import {
  createLintOperationContext,
  createRuleInvocationContext,
  LintViolation,
  Config,
  fromFile,
  getImageMetadata,
} from '../..'

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
    ruleModule,
    lintOperationContext,
  )
  await rule(invocationContext)
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "context": Object {
          "path": "",
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
    ruleModule,
    lintOperationContext,
  )
  await rule(invocationContext)
  expect(violations).toMatchInlineSnapshot(`Array []`)
})
