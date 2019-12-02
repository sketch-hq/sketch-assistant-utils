import { getRuleSetLibName, getActiveRuleSetsForConfig } from './ruleset-utils'
import { createDummyConfig } from './test-helpers'
import { Constants } from './types'

test('getActiveRuleSetsForConfig', () => {
  expect(
    getActiveRuleSetsForConfig(
      createDummyConfig({
        rules: {
          '@foo/sketch-lint-ruleset-foo/rule-1': { active: true },
          '@foo/sketch-lint-ruleset-foo/rule-2': { active: true },
          'sketch-lint-ruleset-bar/rule-1': { active: true },
          'sketch-lint-ruleset-bar/rule-2': { active: true },
          'core-rule-1': { active: true },
          'core-rule-2': { active: true },
          '@sketch-hq/sketch-lint-ruleset-core/core-rule-3': { active: true },
        },
      }),
    ),
  ).toMatchInlineSnapshot(`
    Array [
      "@foo/sketch-lint-ruleset-foo",
      "sketch-lint-ruleset-bar",
      "@sketch-hq/sketch-lint-ruleset-core",
    ]
  `)
})

test('getRuleSetLibName', () => {
  expect(getRuleSetLibName(Constants.CORE_RULESET_NAME)).toMatchInlineSnapshot(
    `"SketchHqSketchLintRulesetCore"`,
  )

  expect(getRuleSetLibName('sketch-lint-ruleset-foo')).toMatchInlineSnapshot(
    `"SketchLintRulesetFoo"`,
  )
})
