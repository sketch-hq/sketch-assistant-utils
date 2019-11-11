import { Config, ConfigItem, Maybe } from '..'

/**
 * Determine if a rule is enabled according to its configuration.
 */
const isRuleEnabled = (config: Config, id: string): boolean => {
  const item: Maybe<ConfigItem> = config.rules[id]
  if (!item) return false
  return item.active
}

export { isRuleEnabled }
