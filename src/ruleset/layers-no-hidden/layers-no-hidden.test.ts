import { resolve } from 'path'

import { LintViolation, Config } from '../../types'
import { ruleModule } from './'
import { ruleSet } from '../'
import { createRuleInvocationContext } from '../../utils/create-rule-invocation-context'
import { getImageMetadata } from '../../utils/get-image-metadata.node'
import { createLintOperationContext } from '../../utils/create-lint-operation-context'
import { fromFile } from '../../utils/from-file'

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
    ruleSet,
    ruleModule,
    lintOperationContext,
  )
  await rule(invocationContext)
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "context": Object {
          "objectId": "D1BE0048-A6FC-4A8F-8BC7-A46BE3925F18",
          "pointer": "/document/pages/0/layers/0",
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
    ruleSet,
    ruleModule,
    lintOperationContext,
  )
  await rule(invocationContext)
  expect(violations).toMatchInlineSnapshot(`Array []`)
})
