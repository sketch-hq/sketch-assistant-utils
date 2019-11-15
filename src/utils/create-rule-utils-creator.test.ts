import { resolve } from 'path'

import { fromFile } from './from-file'
import { LintViolation } from '../types'
import { getImageMetadata } from './get-image-metadata.node'
import { createRuleUtilsCreator } from './create-rule-utils-creator'
import { createCache } from './create-cache'

test('Reports violations by pushing to the passed in array', async (): Promise<
  void
> => {
  expect.assertions(1)
  const violations: LintViolation[] = []
  const filepath = resolve(__dirname, '../../fixtures/empty.sketch')
  const file = await fromFile(filepath)
  const op = { cancelled: false }
  const config = {
    rules: {},
  }
  const createRuleUtils = createRuleUtilsCreator(
    createCache(),
    violations,
    config,
    op,
    file,
    getImageMetadata,
  )
  expect(createRuleUtils).toBeInstanceOf(Function)
})
