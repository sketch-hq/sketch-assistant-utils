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
  AssistantEnv,
  RunResult,
  Platform,
} from '../types'
import { fromFile } from '../from-file'
import { process } from '../process'
import { prepare } from '../assistant'
import { runAssistant } from '../run-assistant'
import { getImageMetadata } from '../get-image-metadata'

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
  platform,
}: {
  title?: string
  description?: string
  rule?: RuleFunction
  name?: string
  getOptions?: RuleOptionsCreator
  debug?: boolean
  platform?: Platform
} = {}): RuleDefinition => ({
  name: name ?? 'dummy-assistant/dummy-rule',
  title: title ?? 'Dummy Rule',
  description: description ?? 'Dummy rule created in a test helper',
  rule: rule || (async (): Promise<void> => {}),
  getOptions,
  debug,
  platform,
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
  title: title ?? 'Dummy Assistant',
  description: description ?? 'Dummy assistant created as a test helper',
  name: name ?? 'dummy-assistant',
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

/**
 * Test an individual rule within the context of a specific assistant. The assistant has its config
 * overwritten by the passed in value to enable testing rules in isolation.
 */
export const testRule = async (
  filepath: string,
  ruleConfig: RuleConfigGroup,
  assistant: Assistant,
  env: AssistantEnv = { locale: 'en', platform: 'node' },
): Promise<RunResult> => {
  const file = await fromFile(filepath)
  const op = { cancelled: false }
  const processedFile = await process(file, op)

  const assistantDefinition = await prepare(assistant, env)
  assistantDefinition.config = {
    rules: ruleConfig,
  }

  return await runAssistant(processedFile, assistantDefinition, env, op, getImageMetadata)
}

export {
  createRule,
  createDummyRectNode,
  createAssistantConfig,
  createAssistant,
  createAssistantDefinition,
}
