import { resolve } from 'path'
import {
  createDummyRuleSet,
  createDummyRuleModule,
  createDummyConfig,
  createDummyRuleUtils,
  createDummyRectNode,
} from './test-helpers'
import { createCache } from './create-cache'
import { LintViolation } from './types'

test('Can get a rule option', async (): Promise<void> => {
  expect.assertions(1)

  const ruleModule = createDummyRuleModule({
    name: 'rule',
    getOptions: helpers => [
      helpers.stringOption({
        name: 'customOption',
        title: '',
        description: '',
      }),
    ],
  })

  const ruleSet = createDummyRuleSet({
    rules: [ruleModule],
    name: 'ruleset',
  })

  const utils = await createDummyRuleUtils(
    [],
    resolve(__dirname, '../fixtures/empty.sketch'),
    createDummyConfig({
      rules: {
        'ruleset/rule': {
          active: true,
          customOption: 'foobar',
        },
      },
    }),
    undefined,
    ruleModule,
    ruleSet,
  )

  expect(utils.getOption('customOption')).toBe('foobar')
})

test('Can throw an error accessing missing option', async (): Promise<void> => {
  expect.assertions(1)

  const ruleModule = createDummyRuleModule({
    name: 'rule',
    getOptions: helpers => [
      helpers.stringOption({
        name: 'customOption',
        title: '',
        description: '',
      }),
    ],
  })

  const ruleSet = createDummyRuleSet({
    rules: [ruleModule],
    name: 'ruleset',
  })

  const utils = await createDummyRuleUtils(
    [],
    resolve(__dirname, '../fixtures/empty.sketch'),
    createDummyConfig({
      rules: {
        'ruleset/rule': {
          active: true,
          customOption: 'foobar',
        },
      },
    }),
    undefined,
    ruleModule,
    ruleSet,
  )

  try {
    utils.getOption('missing')
  } catch (err) {
    expect(err).toMatchInlineSnapshot(
      `[Error: Option "missing" for rule "ruleset/rule" not found in config]`,
    )
  }
})

test('Can throw an error when config does not match rule option schema', async (): Promise<
  void
> => {
  expect.assertions(1)

  const ruleModule = createDummyRuleModule({
    name: 'rule',
    getOptions: helpers => [
      helpers.stringOption({
        name: 'customOption',
        title: '',
        description: '',
      }),
    ],
  })

  const ruleSet = createDummyRuleSet({
    rules: [ruleModule],
    name: 'ruleset',
  })

  const utils = await createDummyRuleUtils(
    [],
    resolve(__dirname, '../fixtures/empty.sketch'),
    createDummyConfig({
      rules: {
        'ruleset/rule': {
          active: true,
          customOption: 1, // should be a string
        },
      },
    }),
    undefined,
    ruleModule,
    ruleSet,
  )

  try {
    utils.getOption('customOption')
  } catch (err) {
    expect(err).toMatchInlineSnapshot(
      `[Error: Rule "ruleset/rule" attempted to access an invalid config object. ".customOption" should be string]`,
    )
  }
})

test('Can get nodes by pointer value', async (): Promise<void> => {
  expect.assertions(1)

  const utils = await createDummyRuleUtils(
    [],
    resolve(__dirname, '../fixtures/empty.sketch'),
  )

  const page = utils.get('/document/pages/0')
  if (page && typeof page === 'object' && '_class' in page) {
    expect(page._class).toBe('page')
  }
})

test('Can get parent nodes by pointer value', async (): Promise<void> => {
  expect.assertions(1)

  const utils = await createDummyRuleUtils(
    [],
    resolve(__dirname, '../fixtures/empty.sketch'),
  )

  const page = utils.get('/document/pages/0')
  if (page && typeof page === 'object' && '_class' in page) {
    const pageParent = utils.parent(page.$pointer)
    expect(pageParent).toHaveLength(1)
  }
})

test('Can iterate parents', async (): Promise<void> => {
  expect.assertions(1)

  const cache = createCache()

  const utils = await createDummyRuleUtils(
    [],
    resolve(__dirname, '../fixtures/deep-tree.sketch'),
    undefined,
    cache,
  )

  const rect = cache.rectangle && cache.rectangle[0]
  const parents: string[] = []

  if (rect) {
    utils.iterateParents(rect, parent => {
      parents.push(parent.$pointer)
    })
  }

  expect(parents).toMatchInlineSnapshot(`
    Array [
      "/document/pages/0/layers/0/layers/0/layers",
      "/document/pages/0/layers/0/layers/0",
      "/document/pages/0/layers/0/layers",
      "/document/pages/0/layers/0",
      "/document/pages/0/layers",
      "/document/pages/0",
      "/document/pages",
      "/document",
      "",
    ]
  `)
})

test('Adds reports to violations', async (): Promise<void> => {
  expect.assertions(1)
  const violations: LintViolation[] = []

  const utils = await createDummyRuleUtils(
    violations,
    resolve(__dirname, '../fixtures/empty.sketch'),
  )

  utils.report({
    node: createDummyRectNode(),
    message: 'Violation encounterd',
  })

  expect(violations.map(violation => violation.message)).toMatchInlineSnapshot(`
    Array [
      "Violation encounterd",
    ]
  `)
})

test('Does not add reports for ignored classes', async (): Promise<void> => {
  expect.assertions(1)
  const violations: LintViolation[] = []

  const utils = await createDummyRuleUtils(
    violations,
    resolve(__dirname, '../fixtures/empty.sketch'),
    createDummyConfig({
      rules: {
        'ruleset/rule': {
          active: true,
          ignoreClasses: ['rect'],
        },
      },
    }),
  )

  utils.report({
    node: createDummyRectNode(),
    message: 'Violation encounterd',
  })

  expect(violations).toHaveLength(0)
})

test('Does not add reports for ignored name paths', async (): Promise<void> => {
  expect.assertions(1)
  const violations: LintViolation[] = []
  const cache = createCache()
  const utils = await createDummyRuleUtils(
    violations,
    resolve(__dirname, '../fixtures/name-paths.sketch'),
    createDummyConfig({
      rules: {
        'ruleset/rule': {
          active: true,
          ignoreNamePathPatterns: ['^/Page 1/UI/Widgets/Thing$'],
        },
      },
    }),
    cache,
  )

  if (cache.symbolInstance) {
    utils.report({
      node: cache.symbolInstance[0],
      message: 'Violation encounterd',
    })
  }

  expect(violations).toHaveLength(0)
})
