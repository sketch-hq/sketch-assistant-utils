import Ajv, { ErrorObject as AjvError } from 'ajv'

import {
  Config,
  RuleSet,
  Maybe,
  ConfigItem,
  RuleModule,
  ViolationSeverity,
  Constants,
} from './types'
import { helpers, buildRuleOptionSchema } from './option-schema-utils'

/**
 * Return the key for a given rule and ruleSet combination in the config. The
 * key is a composite of the ruleSet name and the ruleModule name separated by
 * a slash `/`.
 */
const getRuleConfigKey = (ruleSet: RuleSet, ruleModule: RuleModule): string =>
  `${ruleSet.name}/${ruleModule.name}`

/**
 * Get the actual config item for a given rule and ruleSet combination. If we're
 * dealing with the core ruleSet then allow bare rule names to be used as key.
 */
const getRuleConfig = (
  config: Config,
  ruleSet: RuleSet,
  ruleModule: RuleModule,
): Maybe<ConfigItem> => {
  const rulesConfig = config.sketchLint.rules
  const compositeKey = getRuleConfigKey(ruleSet, ruleModule)
  const simpleKey = ruleModule.name
  if (ruleSet.name === Constants.CORE_RULESET_NAME) {
    return rulesConfig[compositeKey] || rulesConfig[simpleKey] || null
  } else {
    return rulesConfig[compositeKey] || null
  }
}

/**
 * Determine is a rule has been mentioned in a given config.
 */
const isRuleConfigured = (
  config: Config,
  ruleSet: RuleSet,
  ruleModule: RuleModule,
): boolean => {
  const item = getRuleConfig(config, ruleSet, ruleModule)
  return !!item
}

/**
 * Get the value of a specific rule option.
 */
const getRuleOption = (
  config: Config,
  ruleSet: RuleSet,
  ruleModule: RuleModule,
  optionKey: string,
): ConfigItem[keyof ConfigItem] => {
  const item = getRuleConfig(config, ruleSet, ruleModule)
  return item ? (optionKey in item ? item[optionKey] : null) : null
}

/**
 * Validate a rule's options in a config object according to the schema defined
 * on the rule module.
 */
const isRuleConfigValid = (
  config: Config,
  ruleSet: RuleSet,
  ruleModule: RuleModule,
): true | AjvError[] => {
  if (typeof ruleModule.getOptions === 'undefined') {
    // If the rule hasn't defined an options schema we can't validate it
    return true
  }
  const schema = buildRuleOptionSchema(ruleModule.getOptions(helpers))
  const ruleConfig = getRuleConfig(config, ruleSet, ruleModule)
  const ajv = new Ajv()
  ajv.validate(schema, ruleConfig)
  return ajv.errors || true
}

/**
 * Determine if a rule is active. An active rule must both be mentioned in the
 * config and have its `active` option set to `true`.
 */
const isRuleActive = (
  config: Config,
  ruleSet: RuleSet,
  ruleModule: RuleModule,
): boolean => {
  const active = getRuleOption(config, ruleSet, ruleModule, 'active')
  return typeof active === 'boolean' ? active : false
}

/**
 * Determine a rule's severity, falling back to default values if not specified.
 */
const getRuleSeverity = (
  config: Config,
  ruleSet: RuleSet,
  ruleModule: RuleModule,
): ViolationSeverity => {
  const severity = getRuleOption(config, ruleSet, ruleModule, 'severity')
  switch (severity) {
    case ViolationSeverity.info:
    case ViolationSeverity.warn:
    case ViolationSeverity.error:
      return severity
    default:
      return config.sketchLint.defaultSeverity || ViolationSeverity.error
  }
}

/**
 * An active ruleset is defined as a ruleset that has at least one
 * active rule.
 */
const isRuleSetActive = (config: Config, ruleSet: RuleSet): boolean =>
  ruleSet.rules.filter(ruleModule =>
    isRuleConfigured(config, ruleSet, ruleModule),
  ).length > 0

export {
  getRuleConfigKey,
  getRuleConfig,
  getRuleOption,
  isRuleConfigured,
  isRuleActive,
  getRuleSeverity,
  isRuleSetActive,
  isRuleConfigValid,
}
