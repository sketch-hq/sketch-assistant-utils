import { RuleModule, Rule, JSONSchema, RuleSet } from './'

const createRuleModule = ({
  title,
  description,
  rule,
  optionSchema,
  id,
}: {
  title?: string
  description?: string
  rule?: Rule
  id?: string
  optionSchema?: JSONSchema
}): RuleModule => ({
  id: id || '',
  title: title || '',
  description: description || '',
  rule: rule || ((): void => {}),
  optionSchema,
})

const createRuleSet = ({
  title,
  description,
  id,
  rules,
}: {
  title?: string
  id?: string
  description?: string
  rules?: RuleModule[]
}): RuleSet => ({
  id: id || '',
  title: title || '',
  description: description || '',
  rules: rules || [],
})

export { createRuleModule, createRuleSet }
