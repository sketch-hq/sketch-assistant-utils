import { resolve } from 'path'
import {
  createDummyRuleSet,
  createDummyRuleModule,
  createDummyConfig,
} from './test-helpers'
import { createCache } from './create-cache'
import { processFileContents } from './process-file-contents'
import { createRuleUtilsCreator } from './create-rule-utils-creator'
import { SketchFile } from './types'
import { fromFile } from './from-file'
import { getImageMetadata } from './get-image-metadata.node'

test('getOption', async (): Promise<void> => {
  expect.assertions(3)

  const operation = { cancelled: false }
  const cache = createCache()
  const file: SketchFile = await fromFile(
    resolve(__dirname, '../fixtures/empty.sketch'),
  )
  processFileContents(file.contents, cache, operation)

  const createUtils = createRuleUtilsCreator(
    cache,
    [],
    createDummyConfig({
      rules: {
        'rule-set/rule-1': {
          active: true,
          foo: 'foo',
        },
        'rule-set/rule-2': {
          active: true,
          foo: 'foo', // This is wrong, rule option schema wants an array here
        },
      },
    }),
    operation,
    file,
    getImageMetadata,
  )

  const ruleModule1 = createDummyRuleModule({
    name: 'rule-1',
    getOptions: helpers => [
      helpers.stringOption({
        name: 'foo',
        title: '',
        description: '',
      }),
    ],
  })

  const ruleModule2 = createDummyRuleModule({
    name: 'rule-2',
    getOptions: helpers => [
      helpers.objectArrayOption({
        name: 'foo',
        title: '',
        description: '',
        props: [
          helpers.stringOption({
            name: 'bar',
            title: '',
            description: '',
          }),
        ],
      }),
    ],
  })

  const ruleSet = createDummyRuleSet({
    name: 'rule-set',
    rules: [ruleModule1, ruleModule2],
  })

  const utils1 = createUtils(ruleSet, ruleModule1)
  const utils2 = createUtils(ruleSet, ruleModule2)

  // Getting an existing option works
  expect(utils1.getOption('foo')).toMatchInlineSnapshot(`"foo"`)

  // Getting a non-existant option throws an error
  try {
    utils1.getOption('bar')
  } catch (err) {
    expect(err).toMatchInlineSnapshot(
      `[Error: Option "bar" for rule "rule-set/rule-1" not found in config]`,
    )
  }

  // Trying to access an option from a malformed config throws an error
  try {
    utils2.getOption('foo')
  } catch (err) {
    expect(err).toMatchInlineSnapshot(
      `[Error: Rule "rule-set/rule-2" attempted to access an invalid config object. ".foo" should be array]`,
    )
  }
})
