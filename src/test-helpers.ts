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
import { fromFile } from './utils/from-file'
import { createLintOperationContext } from './utils/create-lint-operation-context'
import { getImageMetadata } from './utils/get-image-metadata.node'
import { createRuleInvocationContext } from './utils/create-rule-invocation-context'

const createDummyRuleModule = ({
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

const createDummyRuleSet = ({
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
  createDummyNode,
  invokeRule,
}
