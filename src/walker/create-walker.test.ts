import { resolve } from 'path'

import { fromFile, FileFormat, createWalkerCache, createWalker } from '..'

test('Can traverse a basic file', async (): Promise<void> => {
  expect.assertions(1)
  const contents = await fromFile(
    resolve(__dirname, '../../fixtures/empty.sketch'),
  )
  const cache = createWalkerCache(contents, { cancelled: false })
  const walker = createWalker(cache, { cancelled: false })
  const results: (string | undefined)[] = []
  await walker({
    [FileFormat.Class.page]: (data): void => {
      results.push(data.node._class)
    },
    [FileFormat.Class.style]: (data): void => {
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
