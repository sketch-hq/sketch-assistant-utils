import { Config, ConfigItem, Maybe, ConfigItemOption } from '../types'

/**
 * Extracts a config option from the config. Rule options must be keyed in the
 * config via a string in the format,
 *
 *     {ruleSetName}/{ruleName}
 */
const getOption = <T extends ConfigItemOption>(
  config: Config,
  ruleSetName: string,
  ruleName: string,
  option: string,
): T | null => {
  const item: Maybe<ConfigItem> = config.rules[`${ruleSetName}/${ruleName}`]
  if (!item) return null
  return option in item ? (item[option] as T) : null
}

export { getOption }
