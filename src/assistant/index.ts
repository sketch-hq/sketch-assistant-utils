import {
  AssistantDefinition,
  AssistantPackageExport,
  Assistant,
  AssistantEnv,
  Maybe,
  RuleDefinition,
} from '../types'

/**
 * Merge assistant definitions together to form a single assistant definition, with a syntax similar
 * to Object.assign(). Assistants are merged from the right-most argument to the left into
 * preceeding arguments, according to the following algorithm:
 *
 *   1. Primitive metadata values like `title` and `description` from the right-most assistant
 *      override the values from the next assistant to the left
 *   2. Rule configuration objects are merged together, with values from right-most assistants
 *      overriding those from the next assistant to the left
 *   3. Assistant rule function arrays are concatenated
 *
 * @param sources Assistant definitions to merge
 */
const assign = (...sources: AssistantDefinition[]): AssistantDefinition => {
  return sources.reduceRight((acc, curr) => {
    return {
      title: acc.title || curr.title || '',
      description: acc.description || curr.description || '',
      name: acc.name || curr.name || '',
      config: {
        ...(typeof acc.config.defaultSeverity === 'undefined'
          ? {}
          : { defaultSeverity: acc.config.defaultSeverity }),
        rules: {
          ...curr.config.rules,
          ...acc.config.rules,
        },
      },
      rules: [...curr.rules, ...acc.rules],
    }
  })
}

/**
 * Prepare an assistant. That is, un-roll its exported value into a flat list of assistant functions,
 * invoke and await them to obtain a flat list of concrete assistant definitions which is then merged
 * to form a final/single assistant definition.
 *
 * Assistant preparation is performed at runtime by an assistant runner.
 *
 * @param source The assistant package to prepare
 * @param context The env within which the assistant package is being prepared
 */
const prepare = async (
  source: AssistantPackageExport,
  env: AssistantEnv,
): Promise<AssistantDefinition> => {
  const functions: Assistant[] = Array.isArray(source) ? source.flat(Infinity) : [source]
  const assistants: AssistantDefinition[] = await Promise.all(functions.map(f => f(env)))
  return assign(...assistants)
}

/**
 * Lookup a rule definition by rule name.
 */
const getRuleDefinition = (
  assistant: AssistantDefinition,
  ruleName: string,
): Maybe<RuleDefinition> => assistant.rules.find(rule => rule.name === ruleName)

export { prepare, assign, getRuleDefinition }
