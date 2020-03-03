import {
  FileFormat,
  Node,
  Assistant,
  RuleOptionsCreator,
  RuleFunction,
  RuleDefinition,
  AssistantDefinition,
  AssistantConfig,
  ViolationSeverity,
  RuleConfigGroup,
} from '../types'

/**
 * Create a dummy rule definition.
 */
const createRule = ({
  title,
  description,
  rule,
  getOptions,
  name,
  debug,
}: {
  title?: string
  description?: string
  rule?: RuleFunction
  name?: string
  getOptions?: RuleOptionsCreator
  debug?: boolean
} = {}): RuleDefinition => ({
  name: name || 'dummy-assistant/dummy-rule',
  title: title || 'Dummy Rule',
  description: description || 'Dummy rule created in a test helper',
  rule: rule || (async (): Promise<void> => {}),
  getOptions,
  debug,
})

/**
 * Create a dummy assistant configuration.
 */
const createAssistantConfig = ({
  rules,
  defaultSeverity,
}: {
  rules?: RuleConfigGroup
  defaultSeverity?: ViolationSeverity
} = {}): AssistantConfig => ({
  ...(typeof defaultSeverity === 'undefined' ? {} : { defaultSeverity }),
  rules: rules || {},
})

/**
 * Create a dummy assistant definition.
 */
const createAssistantDefinition = ({
  title,
  description,
  name,
  config,
  rules,
}: {
  title?: string
  description?: string
  name?: string
  config?: AssistantConfig
  rules?: RuleDefinition[]
} = {}): AssistantDefinition => ({
  title: title || 'Dummy Assistant',
  description: description || 'Dummy assistant created as a test helper',
  name: name || 'dummy-assistant',
  config: config || createAssistantConfig(),
  rules: rules || [],
})

/**
 * Create a dummy assistant function.
 */
const createAssistant = ({
  title,
  description,
  name,
  config,
  rules,
}: {
  title?: string
  description?: string
  name?: string
  config?: AssistantConfig
  rules?: RuleDefinition[]
} = {}): Assistant => async (): Promise<AssistantDefinition> =>
  createAssistantDefinition({ title, description, name, config, rules })

const createDummyRectNode = (): Node<FileFormat.Rect> => ({
  _class: 'rect',
  constrainProportions: false,
  height: 10,
  width: 10,
  x: 0,
  y: 0,
  $pointer: '/document/pages/0/layers/0',
})

export {
  createRule,
  createDummyRectNode,
  createAssistantConfig,
  createAssistant,
  createAssistantDefinition,
}
