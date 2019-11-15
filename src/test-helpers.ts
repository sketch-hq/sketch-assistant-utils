import FileFormat from '@sketch-hq/sketch-file-format-ts'

import {
  RuleModule,
  Rule,
  JSONSchema,
  RuleSet,
  Node,
  LintViolation,
  Config,
} from './types'
import { fromFile } from './from-file'
import { createLintOperationContext } from './create-lint-operation-context'
import { getImageMetadata } from './get-image-metadata.node'
import { createRuleInvocationContext } from './create-rule-invocation-context'

const createDummyRuleModule = ({
  title,
  description,
  rule,
  optionSchema,
  name,
}: {
  title?: string
  description?: string
  rule?: Rule
  name?: string
  optionSchema?: JSONSchema
}): RuleModule => ({
  name: name || '',
  title: title || '',
  description: description || '',
  rule: rule || ((): void => {}),
  optionSchema,
})

const createDummyRuleSet = ({
  title,
  description,
  name,
  rules,
}: {
  title?: string
  name?: string
  description?: string
  rules?: RuleModule[]
} = {}): RuleSet => ({
  name: name || '',
  title: title || '',
  description: description || '',
  rules: rules || [],
})

const createDummyRectNode = (): Node<FileFormat.Rect> => ({
  _class: 'rect',
  constrainProportions: false,
  height: 10,
  width: 10,
  x: 0,
  y: 0,
  $pointer: '/',
})

const invokeRule = async (
  filepath: string,
  config: Config,
  ruleSet: RuleSet,
  ruleModule: RuleModule,
): Promise<LintViolation[]> => {
  const file = await fromFile(filepath)
  const violations: LintViolation[] = []
  const lintOperationContext = createLintOperationContext(
    file,
    config,
    violations,
    { cancelled: false },
    getImageMetadata,
  )
  const invocationContext = createRuleInvocationContext(
    ruleSet,
    ruleModule,
    lintOperationContext,
  )
  const { rule } = ruleModule
  await rule(invocationContext)
  return violations
}

export {
  createDummyRuleModule,
  createDummyRuleSet,
  createDummyRectNode,
  invokeRule,
}
