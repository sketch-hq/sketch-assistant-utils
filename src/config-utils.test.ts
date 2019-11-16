import {
  getRuleConfigKey,
  getRuleConfig,
  isRuleConfigured,
  getRuleOption,
  isRuleActive,
  getRuleSeverity,
} from './config-utils'
import { createDummyRuleSet, createDummyRuleModule } from './test-helpers'
import { buildRuleOptionSchema, numberOption } from './build-rule-option-schema'
import { RuleSet, ViolationSeverity } from './types'

const ruleSet: RuleSet = createDummyRuleSet({
  name: 'rule-set',
  rules: [
    createDummyRuleModule({
      name: 'rule',
      optionSchema: buildRuleOptionSchema(
        numberOption({
          name: 'option',
          title: 'Option',
          defaultValue: 1,
          description: 'A number option',
          minimum: 1,
        }),
      ),
    }),
  ],
})

const ruleModule = ruleSet.rules[0]

test('getRuleConfigKey', () => {
  expect(getRuleConfigKey(ruleSet, ruleModule)).toBe(`rule-set/rule`)
})

test('getRuleConfig', () => {
  expect(
    getRuleConfig(
      {
        rules: {
          'rule-set/rule': {
            active: true,
            option: 1,
          },
        },
      },
      ruleSet,
      ruleModule,
    ),
  ).toMatchInlineSnapshot(`
    Object {
      "active": true,
      "option": 1,
    }
  `)
})

test('isRuleConfigured', () => {
  expect(
    isRuleConfigured(
      {
        rules: {
          'rule-set/rule': {
            active: true,
            option: 1,
          },
        },
      },
      ruleSet,
      ruleModule,
    ),
  ).toBe(true)

  expect(
    isRuleConfigured(
      {
        rules: {},
      },
      ruleSet,
      ruleModule,
    ),
  ).toBe(false)
})

test('getRuleOption', () => {
  expect(
    getRuleOption(
      {
        rules: {
          'rule-set/rule': {
            active: true,
            option: 1,
          },
        },
      },
      ruleSet,
      ruleModule,
      'option',
    ),
  ).toBe(1)

  expect(
    getRuleOption(
      {
        rules: {
          'rule-set/rule': {
            active: true,
            option: 1,
          },
        },
      },
      ruleSet,
      ruleModule,
      'foo',
    ),
  ).toBe(null)
})

test('isRuleActive', () => {
  expect(
    isRuleActive(
      {
        rules: {
          'rule-set/rule': {
            active: true,
          },
        },
      },
      ruleSet,
      ruleModule,
    ),
  ).toBe(true)
})

test('getRuleSeverity', () => {
  // Defaults to error when not specified
  expect(
    getRuleSeverity(
      {
        rules: {
          'rule-set/rule': {
            active: true,
          },
        },
      },
      ruleSet,
      ruleModule,
    ),
  ).toBe(ViolationSeverity.error)

  // Fallbacks to defaultSeverity if present only in config
  expect(
    getRuleSeverity(
      {
        defaultSeverity: ViolationSeverity.info,
        rules: {
          'rule-set/rule': {
            active: true,
          },
        },
      },
      ruleSet,
      ruleModule,
    ),
  ).toBe(ViolationSeverity.info)

  // Can be set in the rule itself
  expect(
    getRuleSeverity(
      {
        defaultSeverity: ViolationSeverity.info,
        rules: {
          'rule-set/rule': {
            active: true,
            severity: ViolationSeverity.warn,
          },
        },
      },
      ruleSet,
      ruleModule,
    ),
  ).toBe(ViolationSeverity.warn)
})
