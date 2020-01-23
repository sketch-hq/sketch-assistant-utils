import { resolve } from 'path'

import { createCacheIterator } from './create-cache-iterator'
import { fromFile } from './from-file'
import { createCache } from './create-cache'
import { processFileContents } from './process-file-contents'

test('Calls visitors for nodes', async (): Promise<void> => {
  expect.assertions(1)
  const file = await fromFile(resolve(__dirname, '../fixtures/empty.sketch'))
  const op = { cancelled: false }
  const cache = createCache()
  processFileContents(file.contents, cache, op)
  const walker = createCacheIterator(cache, op)
  const results: string[] = []
  await walker({
    style: (node): void => {
      results.push(node.$pointer)
    },
  })
  expect(results).toMatchInlineSnapshot(`
    Array [
      "/document/pages/0/style",
    ]
  `)
})

test('Short-circuits when cancelled', async (): Promise<void> => {
  expect.assertions(1)
  const file = await fromFile(resolve(__dirname, '../fixtures/empty.sketch'))
  const op = { cancelled: true }
  const cache = createCache()
  processFileContents(file.contents, cache, op)
  const walker = createCacheIterator(cache, op)
  const results: string[] = []
  await walker({
    style: (node): void => {
      results.push(node.$pointer)
    },
  })
  expect(results).toMatchInlineSnapshot(`Array []`)
})
