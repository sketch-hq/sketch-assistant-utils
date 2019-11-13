import { resolve } from 'path'

import { fromFile } from '../file'
import { createWalkerCache } from './'
import { LintOperation } from '..'

test('Creates a valid cache object', async (): Promise<void> => {
  expect.assertions(3)
  const filepath = resolve(__dirname, '../../fixtures/empty.sketch')
  const file = await fromFile(filepath)
  const op: LintOperation = { cancelled: false }
  const cache = createWalkerCache(file, op)
  expect(cache.allGroups).toBeDefined()
  expect(cache.allLayers).toBeDefined()
  expect(cache['page']).toHaveLength(1)
})
