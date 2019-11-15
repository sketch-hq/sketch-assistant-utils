import { getOption } from './get-option'
import { Config } from '../types'

const ruleSetName = `@sketch-hq/foo-ruleset`

test('Returns null for a missing rule', (): void => {
  const config: Config = {
    rules: {},
  }
  expect(
    getOption(config, ruleSetName, 'myRuleName', 'myOptionName'),
  ).toMatchInlineSnapshot(`null`)
})

test('Returns null for a missing option name', (): void => {
  const config: Config = {
    rules: {
      [`${ruleSetName}/myRuleName`]: { active: true },
    },
  }
  expect(
    getOption(config, ruleSetName, 'myRuleName', 'myOptionName'),
  ).toMatchInlineSnapshot(`null`)
})

test('Returns option values when present', (): void => {
  const config: Config = {
    rules: {
      [`${ruleSetName}/myRuleName`]: { active: true },
    },
  }
  expect(
    getOption(config, ruleSetName, 'myRuleName', 'active'),
  ).toMatchInlineSnapshot(`true`)
})
