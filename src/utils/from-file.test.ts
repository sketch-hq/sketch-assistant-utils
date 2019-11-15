import { resolve } from 'path'

import { fromFile } from './from-file'
import { SketchFile } from '../types'

test('Unzips and parses a zip file', async (): Promise<void> => {
  expect.assertions(1)
  const file: SketchFile = await fromFile(
    resolve(__dirname, '../../fixtures/empty.sketch'),
  )
  expect(file.contents).toMatchSnapshot()
})
