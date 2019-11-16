import {
  Config,
  RuleSet,
  Maybe,
  ConfigItem,
  RuleModule,
  ViolationSeverity,
} from './types'

const getRuleConfigKey = (ruleSet: RuleSet, ruleModule: RuleModule): string =>
  `${ruleSet.name}/${ruleModule.name}`

const getRuleConfig = (
  config: Config,
  ruleSet: RuleSet,
  ruleModule: RuleModule,
): Maybe<ConfigItem> => config.rules[getRuleConfigKey(ruleSet, ruleModule)]

const isRuleConfigured = (
  config: Config,
  ruleSet: RuleSet,
  ruleModule: RuleModule,
): boolean => {
  const item = getRuleConfig(config, ruleSet, ruleModule)
  return !!item
}

const getRuleOption = (
  config: Config,
  ruleSet: RuleSet,
  ruleModule: RuleModule,
  optionKey: string,
): ConfigItem[keyof ConfigItem] => {
  const item = getRuleConfig(config, ruleSet, ruleModule)
  return item ? (optionKey in item ? item[optionKey] : null) : null
}

const isRuleActive = (
  config: Config,
  ruleSet: RuleSet,
  ruleModule: RuleModule,
): boolean => {
  const active = getRuleOption(config, ruleSet, ruleModule, 'active')
  return typeof active === 'boolean' ? active : false
}

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
      return config.defaultSeverity || ViolationSeverity.error
  }
}

export {
  getRuleConfigKey,
  getRuleConfig,
  getRuleOption,
  isRuleConfigured,
  isRuleActive,
  getRuleSeverity,
}
