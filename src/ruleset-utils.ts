import humps from 'humps'

import { RuleSet, Config, Constants, RuleSetDropzone } from './types'

/**
 * Return the set of ruleset names in use by a given config. A ruleset is deemed
 * to be in use when one or more of its rules are configured.
 */
const getActiveRuleSetsForConfig = (config: Config): string[] => {
  const ruleSetNames = Object.keys(config.sketchLint.rules).map(key => {
    if (key.includes('/')) {
      const parts = key.split('/')
      parts.pop()
      return parts.join('/')
    } else {
      return Constants.CORE_RULESET_NAME
    }
  })
  return [...new Set(ruleSetNames)]
}

/**
 * Converts a ruleset's package name into the corresponding library name used
 * to export a ruleset into a global scope.
 */
const getRuleSetLibName = (name: string): string =>
  humps.pascalize(name.replace('@', '-').replace('/', '-'))

class RuleSetNotFoundError extends Error {
  public ruleSetName: string

  public constructor(ruleSetName: string) {
    super(`Ruleset "${name}" not found at "${getRuleSetLibName(name)}"`)
    this.ruleSetName = ruleSetName
    this.name = 'RuleSetNotFoundError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Return a list of ruleset references for a given config, by searching for them
 * in a dropzone. A dropzone is defined as a scope where ruleSet references
 * have been stored. If a ruleset referenced in the config can't be located, an
 * error is thrown.
 */
const resolveRuleSets = (
  config: Config,
  dropzone: RuleSetDropzone,
  coreRuleSet: RuleSet,
): RuleSet[] => {
  return getActiveRuleSetsForConfig(config).map(ruleSetName => {
    const ruleSet = dropzone[getRuleSetLibName(ruleSetName)]
    if (!ruleSet) {
      if (ruleSetName === Constants.CORE_RULESET_NAME) {
        return coreRuleSet
      } else {
        throw new RuleSetNotFoundError(ruleSetName)
      }
    } else {
      return ruleSet
    }
  })
}

export { getRuleSetLibName, getActiveRuleSetsForConfig, resolveRuleSets }
