import { resolve } from 'path'

import { fromFile } from './from-file'
import { processFileContents } from './process-file-contents'
import { get } from './pointers'
import { createCache } from './create-cache'

test('Finds and caches layers, groups and objects', async (): Promise<void> => {
  expect.assertions(3)
  const filepath = resolve(__dirname, '../fixtures/empty.sketch')
  const file = await fromFile(filepath)
  const cache = createCache()
  processFileContents(file.contents, cache, { cancelled: false })
  expect(cache.$groups).toHaveLength(1)
  expect(cache.$layers).toHaveLength(1)
  expect(cache['page']).toHaveLength(1)
})

test('Short-circuits when passed a cancelled op', async (): Promise<void> => {
  expect.assertions(3)
  const filepath = resolve(__dirname, '../fixtures/empty.sketch')
  const file = await fromFile(filepath)
  const cache = createCache()
  processFileContents(file.contents, cache, { cancelled: true })
  expect(cache.$groups).toHaveLength(0)
  expect(cache.$layers).toHaveLength(0)
  expect(cache['page']).toBeUndefined()
})

test('Augments objects with valid JSON Pointers', async (): Promise<void> => {
  expect.assertions(1)
  const filepath = resolve(__dirname, '../fixtures/empty.sketch')
  const file = await fromFile(filepath)
  const cache = createCache()
  processFileContents(file.contents, cache, { cancelled: false })
  if (cache['page'] && cache['page'][0]._class === 'page') {
    const page = cache['page'][0]
    expect(page).toBe(get(page.$pointer, file.contents))
  }
})

test('Skips foreign symbols', async (): Promise<void> => {
  expect.assertions(1)
  const filepath = resolve(__dirname, '../fixtures/foreign-symbol.sketch')
  const file = await fromFile(filepath)
  const cache = createCache()
  processFileContents(file.contents, cache, { cancelled: false })
  expect(cache.symbolMaster).toBeUndefined()
})
