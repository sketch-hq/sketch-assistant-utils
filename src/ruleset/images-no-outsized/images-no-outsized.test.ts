import { resolve } from 'path'

import {
  fromFile,
  LintViolation,
  createLintOperationContext,
  createRuleInvocationContext,
  Config,
  getImageMetadata,
} from '../..'
import { ruleModule } from './'

const { rule, id } = ruleModule

test('Generates violations correctly', async (): Promise<void> => {
  expect.assertions(1)
  const contents = await fromFile(
    resolve(__dirname, '../../../fixtures/outsized-image.sketch'),
  )
  const config: Config = {
    rules: {
      [id]: { active: true, maxRatio: 2 },
    },
  }
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
          "id": "64BBDE2F-D786-4078-B332-97D777E9D07B",
          "path": "pages[0].layers[0]",
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
  const contents = await fromFile(
    resolve(__dirname, '../../../fixtures/empty.sketch'),
  )
  const config: Config = {
    rules: {
      [id]: { active: true, maxRatio: 2 },
    },
  }
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
