import { getImageMetadata } from './get-image-metadata.node'
import { resolve } from 'path'
import { fromFile } from '../file'

test('Can extract image metadata from a Sketch document', async (): Promise<
  void
> => {
  expect.assertions(1)
  const filepath = resolve(__dirname, '../../fixtures/outsized-image.sketch')
  const file = await fromFile(filepath)
  // eslint-disable-next-line
  // @ts-ignore
  const ref: string = file.contents.document.pages[0].layers[0].image._ref
  expect(await getImageMetadata(ref, filepath)).toMatchInlineSnapshot(`
    Object {
      "height": 749,
      "ref": "images/ec8a987e6eacad3884b6b78293f19cd0f5ec7490.png",
      "width": 500,
    }
  `)
})
