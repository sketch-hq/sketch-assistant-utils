import { Config, ConfigItem, Maybe, ConfigItemOption } from '..'

/**
 * Extracts a named rule config option from the config.
 */
const getOption = <T extends ConfigItemOption>(
  config: Config,
  ruleName: string,
  option: string,
): T | null => {
  const item: Maybe<ConfigItem> = config.rules[ruleName]
  if (!item) return null
  return option in item ? (item[option] as T) : null
}

export { getOption }
