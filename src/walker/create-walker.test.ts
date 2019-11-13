import { resolve } from 'path'

import { fromFile, createWalkerCache, createWalker } from '..'

test('Can traverse a basic file', async (): Promise<void> => {
  expect.assertions(1)
  const file = await fromFile(resolve(__dirname, '../../fixtures/empty.sketch'))
  const cache = createWalkerCache(file, { cancelled: false })
  const walker = createWalker(cache, { cancelled: false })
  const results: (string | undefined)[] = []
  await walker({
    page: (data): void => {
      results.push(data.node._class)
    },
    style: (data): void => {
      results.push(data.node._class)
    },
  })
  expect(results).toMatchInlineSnapshot(`
    Array [
      "page",
      "style",
    ]
  `)
})
