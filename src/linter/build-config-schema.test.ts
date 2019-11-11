import Ajv from 'ajv'

import { buildConfigSchema, Config } from '../'
import { createRuleModule, createRuleSet } from '../test-helpers'

test('Validates a valid simple config', (): void => {
  const ruleSet = createRuleSet({ rules: [createRuleModule({ id: 'foo' })] })
  const schema = buildConfigSchema(ruleSet)
  const ajv = new Ajv()
  const config: Config = {
    rules: {
      foo: { active: true },
    },
  }
  expect(ajv.validate(schema, config)).toBe(true)
})

test('Validates a custom severity value', (): void => {
  const ruleSet = createRuleSet({ rules: [createRuleModule({ id: 'foo' })] })
  const schema = buildConfigSchema(ruleSet)
  const ajv = new Ajv()
  const config: Config = {
    rules: {
      foo: { active: true, severity: 2 },
    },
  }
  expect(ajv.validate(schema, config)).toBe(true)
})

test('Fails for unrecognised rules', (): void => {
  const ruleSet = createRuleSet({ rules: [createRuleModule({ id: 'foo' })] })
  const schema = buildConfigSchema(ruleSet)
  const ajv = new Ajv()
  const config: Config = {
    rules: {
      'i-dont-exist': { active: true },
    },
  }
  expect(ajv.validate(schema, config)).toBe(false)
})

test('Fails for malformed rule options', (): void => {
  const ruleSet = createRuleSet({ rules: [createRuleModule({ id: 'foo' })] })
  const schema = buildConfigSchema(ruleSet)
  const ajv = new Ajv()
  const config: Config = {
    rules: {
      // eslint-disable-next-line
      // @ts-ignore
      foo: { 'bad-option': true },
    },
  }
  expect(ajv.validate(schema, config)).toBe(false)
})
