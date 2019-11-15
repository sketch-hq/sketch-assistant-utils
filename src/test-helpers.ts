import FileFormat from '@sketch-hq/sketch-file-format-ts'

import { RuleModule, Rule, JSONSchema, RuleSet, Node } from './types'

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

const createDummyNode = (): Node<FileFormat.Rect> => ({
  _class: 'rect',
  constrainProportions: false,
  height: 10,
  width: 10,
  x: 0,
  y: 0,
  $pointer: '/',
})

export { createRuleModule, createRuleSet, createDummyNode }
