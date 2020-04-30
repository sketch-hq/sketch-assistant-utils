import { resolve } from 'path'

import { cacheGenerator, createCacheIterator } from '..'
import { fromFile } from '../../from-file'
import { process } from '../../process'
import { Node, FileFormat } from '@sketch-hq/sketch-assistant-types'

describe('createCacheIterator', () => {
  test('calls visitors for nodes', async (): Promise<void> => {
    expect.assertions(1)
    const file = await fromFile(resolve(__dirname, './empty.sketch'))
    const op = { cancelled: false }
    const res = await process(file, op)
    const cacheIterator = createCacheIterator(res.cache, op)
    const results: string[] = []
    await cacheIterator({
      style: async (node): Promise<void> => {
        results.push(node.$pointer)
      },
    })
    expect(results).toMatchInlineSnapshot(`
      Array [
        "/document/pages/0/style",
      ]
    `)
  })

  test('short-circuits when cancelled', async (): Promise<void> => {
    expect.assertions(1)
    const file = await fromFile(resolve(__dirname, './empty.sketch'))
    const op = { cancelled: true }
    const res = await process(file, op)
    const walker = createCacheIterator(res.cache, op)
    const results: string[] = []
    await walker({
      style: async (node): Promise<void> => {
        results.push(node.$pointer)
      },
    })
    expect(results).toMatchInlineSnapshot(`Array []`)
  })
})

describe('cacheGenerator', () => {
  test('can iterate through $layers', async (): Promise<void> => {
    expect.assertions(1)
    const file = await fromFile(resolve(__dirname, './empty.sketch'))
    const op = { cancelled: false }
    const res = await process(file, op)
    for (const page of cacheGenerator(res.cache, '$layers')) {
      expect((page as Node<FileFormat.AnyLayer>).name).toBe('Page 1')
    }
  })

  test('can iterate through sharedStyles', async (): Promise<void> => {
    expect.assertions(1)
    const file = await fromFile(resolve(__dirname, './simple-layer.sketch'))
    const op = { cancelled: false }
    const res = await process(file, op)
    for (const style of cacheGenerator(res.cache, 'sharedStyle')) {
      expect((style as Node<FileFormat.AnyLayer>).name).toBe('Rectangle Style')
    }
  })
})
