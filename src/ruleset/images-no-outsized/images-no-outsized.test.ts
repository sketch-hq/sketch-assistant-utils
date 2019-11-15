import { resolve } from 'path'

import { LintViolation, Config } from '../../types'
import { ruleModule } from './'
import { ruleSet } from '../'
import { getImageMetadata } from '../../utils/get-image-metadata.node'
import { createRuleInvocationContext } from '../../utils/create-rule-invocation-context'
import { createLintOperationContext } from '../../utils/create-lint-operation-context'
import { fromFile } from '../../utils/from-file'

const { rule, id } = ruleModule

test('Generates violations correctly', async (): Promise<void> => {
  expect.assertions(1)
  const file = await fromFile(
    resolve(__dirname, '../../../fixtures/outsized-image.sketch'),
  )
  const config: Config = {
    rules: {
      [id]: { active: true, maxRatio: 2 },
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
          "objectId": "64BBDE2F-D786-4078-B332-97D777E9D07B",
          "pointer": "/document/pages/0/layers/0",
        },
        "message": "Unexpected x2 oversized image",
        "ruleId": "images-no-outsized",
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
  const config: Config = {
    rules: {
      [id]: { active: true, maxRatio: 2 },
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
