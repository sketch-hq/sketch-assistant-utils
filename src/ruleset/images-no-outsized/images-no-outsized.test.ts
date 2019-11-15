import { resolve } from 'path'

import { Config } from '../../types'
import { ruleModule } from './'
import { ruleSet } from '../'
import { invokeRule } from '../../test-helpers'

const { id } = ruleModule

const config: Config = {
  rules: {
    [id]: { active: true, maxRatio: 2 },
  },
}

test('Generates violations correctly', async (): Promise<void> => {
  expect.assertions(1)
  const violations = await invokeRule(
    resolve(__dirname, '../../../fixtures/outsized-image.sketch'),
    config,
    ruleSet,
    ruleModule,
  )
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
  const violations = await invokeRule(
    resolve(__dirname, '../../../fixtures/empty.sketch'),
    config,
    ruleSet,
    ruleModule,
  )
  expect(violations).toMatchInlineSnapshot(`Array []`)
})
