import { resolve } from 'path'

import {
  fromFile,
  LintViolation,
  createLintOperationContext,
  getImageMetadata,
  Config,
} from '../..'
import { ruleModule } from './'
import { createRuleInvocationContext } from '../../linter'

const { rule, id } = ruleModule

const config: Config = {
  rules: {
    [id]: { active: true },
  },
}

test('Generates violations correctly', async (): Promise<void> => {
  expect.assertions(1)
  const file = await fromFile(
    resolve(__dirname, '../../../fixtures/hidden-layer.sketch'),
  )
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
        "message": "Unexpected hidden layer",
        "ruleId": "layers-no-hidden",
        "ruleSetId": "sketch",
        "severity": 3,
      },
    ]
  `)
})

test('Does not generate false negatives', async (): Promise<void> => {
  expect.assertions(1)
  const file = await fromFile(
    resolve(__dirname, '../../../fixtures/empty.sketch'),
  )
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
