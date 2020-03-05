import mem from 'mem'

import {
  FileFormat,
  Violation,
  ReportItem,
  RuleUtils,
  RunOperation,
  ImageMetadata,
  RuleUtilsCreator,
  GetImageMetadata,
  SketchFile,
  RuleOption,
  Maybe,
  PointerValue,
  NodeArray,
  Node,
  ParentIterator,
  AssistantDefinition,
  RuleDefinition,
  ProcessedSketchFile,
} from '../types'
import { createCacheIterator } from '../file-cache'
import {
  getRuleOption,
  isRuleConfigValid,
  getRuleSeverity,
  getRuleIgnoreClasses,
  getRuleIgnoreNamePathPatterns,
} from '../assistant-config'
import { nodeToObject, objectHash, objectsEqual } from '../object-utils'
import * as pointers from '../pointers'
import { getRuleDefinition } from '../assistant'

class RuleNotFoundError extends Error {
  public assistant: AssistantDefinition
  public ruleName: string

  public constructor(assistant: AssistantDefinition, ruleName: string) {
    super(`Rule "${ruleName}" not found on assistant "${assistant.name}"`)
    this.assistant = assistant
    this.ruleName = ruleName
    this.name = 'RuleNotFoundError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

class InvalidRuleConfigError extends Error {
  public assistant: AssistantDefinition
  public rule: RuleDefinition
  public details: string

  public constructor(assistant: AssistantDefinition, rule: RuleDefinition, details: string) {
    super(
      `Invalid configuration found for rule "${rule.name}" on assistant "${assistant.name}": ${details}`,
    )
    this.assistant = assistant
    this.rule = rule
    this.details = details
    this.name = 'InvalidRuleConfigError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Add one or more report items into a violations array. Reports from rules just contain a message
 * and optionally a Node, whereas violations container richer contextual information therefore this
 * function maps the former to the latter.
 */
const addReportsToViolations = (
  report: ReportItem | ReportItem[],
  violations: Violation[],
  assistant: AssistantDefinition,
  rule: RuleDefinition,
  iterateParents: ParentIterator,
): void => {
  if (Array.isArray(report) && report.length === 0) return
  const { config } = assistant
  const { name: ruleName } = rule

  const severity = getRuleSeverity(config, ruleName)
  const classesToIgnore = getRuleIgnoreClasses(config, ruleName)
  const namesToIgnore = getRuleIgnoreNamePathPatterns(config, ruleName)

  violations.push(
    ...(Array.isArray(report) ? report : [report])
      // Filter out reports involving nodes with ignored `_class` props
      .filter(item => {
        return item.node ? !classesToIgnore.includes(item.node._class) : true
      })
      // Filter out nodes with ignored name paths
      .filter(item => {
        if (!item.node || namesToIgnore.length === 0) return true
        const names: string[] = 'name' in item.node ? [item.node.name] : []
        iterateParents(item.node, parent => {
          if (typeof parent === 'object' && 'name' in parent) {
            names.unshift(parent.name)
          }
        })
        const namePath = `/${names.join('/')}`
        return !namesToIgnore.map(regex => regex.test(namePath)).includes(true)
      })
      .map(
        (item): Violation => {
          return {
            assistant: {
              title: assistant.title,
              name: assistant.name,
              description: assistant.description,
            },
            rule: {
              title: rule.title,
              name: rule.name,
              description: rule.description,
              debug: rule.debug,
            },
            message: item.message,
            severity,
            pointer: item.node?.$pointer || null,
            objectId: item.node
              ? 'do_objectID' in item.node
                ? item.node.do_objectID || null
                : null
              : null,
          }
        },
      ),
  )
}

/**
 * Creates a function that rules can use to get an option value by `name`. All rules need to do is
 * pass the option `name`, all other values are already in scope. A InvalidRuleConfigError is thrown
 * if rules attempt to access missing options, or options that are invalid according to the rule's
 * self-declared option schema.
 */
const createOptionGetter = (assistant: AssistantDefinition, rule: RuleDefinition) => (
  optionKey: string,
): Maybe<RuleOption> => {
  const result = isRuleConfigValid(assistant.config, rule)
  if (result !== true) {
    const details = result
      .map(error => {
        if (error.dataPath === '') {
          return error.message
        } else {
          return `"${error.dataPath}" ${error.message}`
        }
      })
      .join('. ')
    throw new InvalidRuleConfigError(assistant, rule, details)
  }
  const item = getRuleOption(assistant.config, rule.name, optionKey)
  if (!item) {
    throw new InvalidRuleConfigError(
      assistant,
      rule,
      `Option "${optionKey}" not found in assistant configuration`,
    )
  }
  return item
}

/**
 * Create a parent iterator function scoped to a Sketch file.
 */
const createParentIterator = (file: SketchFile): ParentIterator => (node, callback): void => {
  if (!node) return
  if (typeof node !== 'object') return
  let parent = pointers.parent(node.$pointer, file.contents)
  while (parent) {
    callback(parent as Node | NodeArray | Node<FileFormat.Contents['document']>)
    if (typeof parent === 'object' && '$pointer' in parent) {
      parent = pointers.parent(parent.$pointer, file.contents)
    } else {
      parent = null
    }
  }
}

/**
 * Returns a RuleUtilsCreator function, which can be used to build util objects
 * scoped to a specific rule.
 */
const createRuleUtilsCreator = (
  processedFile: ProcessedSketchFile,
  violations: Violation[],
  assistant: AssistantDefinition,
  operation: RunOperation,
  getImageMetadata: GetImageMetadata,
): RuleUtilsCreator => {
  const { file, cache } = processedFile
  const memoizedGetImageMetaData = mem(getImageMetadata)
  const iterateParents = createParentIterator(file)

  const utilsCreator: RuleUtilsCreator = (ruleName: string): RuleUtils => {
    const rule = getRuleDefinition(assistant, ruleName)

    if (!rule) {
      throw new RuleNotFoundError(assistant, ruleName)
    }

    const getOption = createOptionGetter(assistant, rule)

    return {
      get(pointer: string): Maybe<PointerValue> {
        return pointers.get(pointer, file.contents)
      },
      parent(pointer: string): Maybe<PointerValue> {
        return pointers.parent(pointer, file.contents)
      },
      report(items: ReportItem | ReportItem[]): void {
        addReportsToViolations(items, violations, assistant, rule, iterateParents)
      },
      iterateCache: createCacheIterator(cache, operation),
      getImageMetadata: (ref: string): Promise<ImageMetadata> => {
        return memoizedGetImageMetaData(ref, file.filepath || '')
      },
      iterateParents,
      getOption,
      nodeToObject,
      objectHash(obj: {}, excludeKeys: string[] = []): string {
        return objectHash(obj, [...excludeKeys, 'do_objectID', '$pointer'])
      },
      objectsEqual(obj1: {}, obj2: {}, excludeKeys: string[] = []): boolean {
        return objectsEqual(obj1, obj2, [...excludeKeys, 'do_objectID', '$pointer'])
      },
    }
  }

  return utilsCreator
}

export { createRuleUtilsCreator }