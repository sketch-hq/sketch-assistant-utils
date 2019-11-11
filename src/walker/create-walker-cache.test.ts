import { resolve } from 'path'

import { fromFile } from '../file'
import { createWalkerCache } from './'
import { Class } from '../file-format'
import { LintOperation } from '..'

test('Creates a valid cache object', async (): Promise<void> => {
  expect.assertions(3)
  const contents = await fromFile(
    resolve(__dirname, '../../fixtures/empty.sketch'),
  )
  const op: LintOperation = { cancelled: false }
  const cache = createWalkerCache(contents, op)
  expect(cache.allGroups).toBeDefined()
  expect(cache.allLayers).toBeDefined()
  expect(cache[Class.page]).toHaveLength(1)
})
