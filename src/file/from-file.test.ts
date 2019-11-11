import { resolve } from 'path'

import { Contents, fromFile } from '..'

test('Unzips and parses a zip file', async (): Promise<void> => {
  expect.assertions(1)
  const contents: Contents = await fromFile(
    resolve(__dirname, '../../fixtures/empty.sketch'),
  )
  expect(contents.data).toMatchSnapshot()
})
