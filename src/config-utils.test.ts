import {
  getRuleConfigKey,
  getRuleConfig,
  isRuleConfigured,
  getRuleOption,
  isRuleActive,
  getRuleSeverity,
  isRuleSetActive,
  isRuleConfigValid,
} from './config-utils'
import {
  createDummyRuleSet,
  createDummyRuleModule,
  createDummyConfig,
} from './test-helpers'
import { RuleSet, ViolationSeverity, Constants } from './types'

const coreRuleSet: RuleSet = createDummyRuleSet({
  name: Constants.CORE_RULESET_NAME,
  rules: [
    createDummyRuleModule({
      name: 'rule',
    }),
  ],
})

const genericRuleSet: RuleSet = createDummyRuleSet({
  name: 'rule-set',
  rules: [
    createDummyRuleModule({
      name: 'rule',
    }),
  ],
})

test('getRuleConfigKey', () => {
  // Uses slash notation to generate a composite key from the ruleset name
  // and rule name
  expect(getRuleConfigKey(genericRuleSet, genericRuleSet.rules[0])).toBe(
    `${genericRuleSet.name}/${genericRuleSet.rules[0].name}`,
  )
})

test('getRuleConfig', () => {
  // Get the config item for `rule-set/rule`
  expect(
    getRuleConfig(
      createDummyConfig({
        rules: {
          'rule-set/rule': {
            active: true,
          },
        },
      }),
      genericRuleSet,
      genericRuleSet.rules[0],
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "active": true,
    }
  `)

  // Get the config item for a core rule
  expect(
    getRuleConfig(
      createDummyConfig({
        rules: {
          [`${Constants.CORE_RULESET_NAME}/rule`]: {
            active: true,
          },
        },
      }),
      coreRuleSet,
      coreRuleSet.rules[0],
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "active": true,
    }
  `)

  // Core rules can omit the ruleset name
  expect(
    getRuleConfig(
      createDummyConfig({
        rules: {
          rule: {
            active: true,
          },
        },
      }),
      coreRuleSet,
      coreRuleSet.rules[0],
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "active": true,
    }
  `)

  // Non-core rules may not omit the ruleSet name
  expect(
    getRuleConfig(
      createDummyConfig({
        rules: {
          rule: {
            active: true,
          },
        },
      }),
      genericRuleSet,
      genericRuleSet.rules[0],
    ),
  ).toBe(null)
})

test('isRuleConfigured', () => {
  // Should return `true` for a configured rule
  expect(
    isRuleConfigured(
      createDummyConfig({
        rules: {
          'rule-set/rule': {
            active: true,
            option: 1,
          },
        },
      }),
      genericRuleSet,
      genericRuleSet.rules[0],
    ),
  ).toBe(true)

  // And `false` for an unconfigured rule
  expect(
    isRuleConfigured(
      createDummyConfig({
        rules: {},
      }),
      genericRuleSet,
      genericRuleSet.rules[0],
    ),
  ).toBe(false)
})

test('getRuleOption', () => {
  // Return a specific rule option
  expect(
    getRuleOption(
      createDummyConfig({
        rules: {
          'rule-set/rule': {
            active: true,
            option: 1,
          },
        },
      }),
      genericRuleSet,
      genericRuleSet.rules[0],
      'option',
    ),
  ).toBe(1)

  // Returns null for a non-existant option
  expect(
    getRuleOption(
      createDummyConfig({
        rules: {
          'rule-set/rule': {
            active: true,
            option: 1,
          },
        },
      }),
      genericRuleSet,
      genericRuleSet.rules[0],
      'foo',
    ),
  ).toBe(null)
})

test('isRuleActive', () => {
  // Returns `true` for an active rule
  expect(
    isRuleActive(
      createDummyConfig({
        rules: {
          'rule-set/rule': {
            active: true,
          },
        },
      }),
      genericRuleSet,
      genericRuleSet.rules[0],
    ),
  ).toBe(true)

  // Returns `false` for a de-activated rule
  expect(
    isRuleActive(
      createDummyConfig({
        rules: {
          'rule-set/rule': {
            active: false,
          },
        },
      }),
      genericRuleSet,
      genericRuleSet.rules[0],
    ),
  ).toBe(false)
})

test('getRuleSeverity', () => {
  // Defaults to `error` when not specified
  expect(
    getRuleSeverity(
      createDummyConfig({
        rules: {
          'rule-set/rule': {
            active: true,
          },
        },
      }),
      genericRuleSet,
      genericRuleSet.rules[0],
    ),
  ).toBe(ViolationSeverity.error)

  // Fallbacks to defaultSeverity if present only in config
  expect(
    getRuleSeverity(
      createDummyConfig({
        defaultSeverity: ViolationSeverity.info,
        rules: {
          'rule-set/rule': {
            active: true,
          },
        },
      }),
      genericRuleSet,
      genericRuleSet.rules[0],
    ),
  ).toBe(ViolationSeverity.info)

  // Can be set in the rule itself
  expect(
    getRuleSeverity(
      createDummyConfig({
        defaultSeverity: ViolationSeverity.info,
        rules: {
          'rule-set/rule': {
            active: true,
            severity: ViolationSeverity.warn,
          },
        },
      }),
      genericRuleSet,
      genericRuleSet.rules[0],
    ),
  ).toBe(ViolationSeverity.warn)
})

test('isRuleSetAcitve', () => {
  // Rulesets are active when they have configured rules
  expect(
    isRuleSetActive(
      createDummyConfig({
        rules: {
          'rule-set/rule': {
            active: true,
          },
        },
      }),
      genericRuleSet,
    ),
  ).toBe(true)

  // The core ruleset is active when using the abbreviated config key format
  expect(
    isRuleSetActive(
      createDummyConfig({
        rules: {
          rule: {
            active: true,
          },
        },
      }),
      coreRuleSet,
    ),
  ).toBe(true)

  // Ruleset is inactive when none if its rules have been configured
  expect(
    isRuleSetActive(
      createDummyConfig({
        rules: {},
      }),
      genericRuleSet,
    ),
  ).toBe(false)
})

test('isRuleConfigValid', () => {
  // Rule module declares one string option named `foo`
  const ruleModule = createDummyRuleModule({
    name: 'rule',
    getOptions: helpers => [
      helpers.stringOption({
        name: 'foo',
        title: '',
        description: '',
      }),
    ],
  })
  const ruleSet = createDummyRuleSet({ name: 'rule-set' })

  // Returns true for valid config
  expect(
    isRuleConfigValid(
      createDummyConfig({
        rules: {
          'rule-set/rule': {
            active: true,
            foo: 'foo',
          },
        },
      }),
      ruleSet,
      ruleModule,
    ),
  ).toBe(true)

  // Returns AjvError array for invalid config
  expect(
    isRuleConfigValid(
      createDummyConfig({
        rules: {
          'rule-set/rule': {
            active: true,
            foo: 1,
          },
        },
      }),
      ruleSet,
      ruleModule,
    ),
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "dataPath": ".foo",
        "keyword": "type",
        "message": "should be string",
        "params": Object {
          "type": "string",
        },
        "schemaPath": "#/properties/foo/type",
      },
    ]
  `)
})
