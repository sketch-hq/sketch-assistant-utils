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
  const contents = await fromFile(
    resolve(__dirname, '../../../fixtures/hidden-layer.sketch'),
  )
  const violations: LintViolation[] = []
  const lintOperationContext = createLintOperationContext(
    contents,
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
          "id": "D1BE0048-A6FC-4A8F-8BC7-A46BE3925F18",
          "path": "pages[0].layers[0]",
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
  const contents = await fromFile(
    resolve(__dirname, '../../../fixtures/empty.sketch'),
  )
  const violations: LintViolation[] = []
  const lintOperationContext = createLintOperationContext(
    contents,
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
