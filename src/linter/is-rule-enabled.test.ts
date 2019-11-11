import { isRuleEnabled, Config } from '..'

test('Returns false for an unconfigured rule', (): void => {
  const config: Config = {
    rules: {},
  }
  expect(isRuleEnabled(config, 'foo')).toBeFalsy()
})

test('Returns false for a null rule', (): void => {
  const config: Config = {
    rules: {
      foo: null,
    },
  }
  expect(isRuleEnabled(config, 'foo')).toBeFalsy()
})

test('Returns true for an active rule', (): void => {
  const config: Config = {
    rules: {
      foo: { active: true },
    },
  }
  expect(isRuleEnabled(config, 'foo')).toBeTruthy()
})

test('Returns true for a rule with secondary options', (): void => {
  const config: Config = {
    rules: {
      foo: { active: true, bar: 'baz' },
    },
  }
  expect(isRuleEnabled(config, 'foo')).toBeTruthy()
})

test('Returns false for an inactive rule with secondary options rule', (): void => {
  const config: Config = {
    rules: {
      foo: { active: false, bar: 'baz' },
    },
  }
  expect(isRuleEnabled(config, 'foo')).toBeFalsy()
})
