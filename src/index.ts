import FileFormat from '@sketch-hq/sketch-file-format-ts'

export * from './linter'
export * from './file'
export * from './walker'
export * from './ruleset'

// Utils

export type Maybe<T> = T | undefined | null

// Sketch files

export type ObjectClass = FileFormat.AnyObject['_class']

export type ImageMetadata = {
  width: number
  height: number
  ref: string
}

export type SketchFile = {
  filepath: string
  contents: FileFormat.Contents
}

// Isomorphic linter utility functions

export type GetImageMetadata = (
  ref: string,
  filepath: string,
) => Promise<ImageMetadata>

// Operation

export type LintOperation =
  | {
      cancelled: boolean
    }
  | { cancelled: 1 | 0 }

export type LintOperationContext = {
  file: SketchFile
  cache: WalkerCache
  createUtils: RuleUtilsCreator
  config: Config
  operation: LintOperation
  getImageMetadata: GetImageMetadata
}

// File walking

export type VisitorData<T = FileFormat.AnyObject> = {
  node: T
  parent?: T
  path: string // lodash path (pointer)
}

export type Visitor =
  | ((data: VisitorData) => Promise<void>)
  | ((data: VisitorData) => void)

export type Walker = (config: WalkerConfig) => Promise<void>

export type WalkerConfig = {
  [key in ObjectClass | 'allLayers' | 'allGroups']?: Visitor
}

export type WalkerCache = {
  allLayers: VisitorData[]
  allGroups: VisitorData[]
} & { [key in ObjectClass]?: VisitorData[] }

// Lint results

export type LintViolation = {
  message: string
  ruleId: string
  ruleSetId: string
  severity: ViolationSeverity
  context: {
    path: string
  }
}

// Configuration

export enum ViolationSeverity {
  info = 1,
  warn = 2,
  error = 3,
}

export type Config = {
  defaultSeverity?: ViolationSeverity
  rules: {
    [key: string]: Maybe<ConfigItem>
  }
}

export type ConfigItemOption =
  | boolean
  | ViolationSeverity
  | string
  | string[]
  | number

export type ConfigItem = {
  active: boolean
  severity?: ViolationSeverity
  [key: string]: Maybe<ConfigItemOption>
}

// Rules

export type RuleInvocationContext = Omit<
  LintOperationContext,
  'createUtils'
> & {
  utils: RuleUtils
}

export type ReportItem = {
  message: string
  ruleId: string
  ruleSetId: string
  path: string
}

export type RuleUtilsCreator = (ruleModule: RuleModule) => RuleUtils

export type RuleUtils = {
  report: (report: ReportItem | ReportItem[]) => void
  walk: (config: WalkerConfig) => Promise<void>
  getOption: <T extends ConfigItemOption>(option: string) => T | null
  getImageMetadata: (ref: string) => Promise<ImageMetadata>
}

export type Rule =
  | ((context: RuleInvocationContext) => Promise<void>)
  | ((context: RuleInvocationContext) => void)

export type RuleSet = {
  title: string
  description: string
  id: string
  rules: RuleModule[]
}

export type RuleModule = {
  rule: Rule
  id: string
  title: string
  description: string
  optionSchema?: JSONSchema
  debug?: boolean
}

// JSON Schema

export type JSONSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null'

export type JSONSchemaProps = {
  [key: string]: JSONSchema
}

export type JSONSchema = {
  $id?: string
  $ref?: string
  $schema?: string
  $comment?: string
  type?: JSONSchemaType | JSONSchemaType[]
  enum?: boolean[] | string[] | number[]
  enumDescriptions?: string[]
  multipleOf?: number
  maximum?: number
  exclusiveMaximum?: number
  minimum?: number
  exclusiveMinimum?: number
  maxLength?: number
  minLength?: number
  pattern?: string
  items?: JSONSchema | JSONSchema[]
  additionalItems?: JSONSchema
  maxItems?: number
  minItems?: number
  uniqueItems?: boolean
  contains?: JSONSchema
  maxProperties?: number
  minProperties?: number
  required?: string[]
  properties?: JSONSchemaProps
  patternProperties?: {
    [key: string]: JSONSchema
  }
  additionalProperties?: boolean
  dependencies?: {
    [key: string]: JSONSchema | string[]
  }
  propertyNames?: JSONSchema
  if?: JSONSchema
  then?: JSONSchema
  else?: JSONSchema
  allOf?: JSONSchema[]
  anyOf?: JSONSchema[]
  oneOf?: JSONSchema[]
  not?: JSONSchema
  format?: string
  contentMediaType?: string
  contentEncoding?: string
  definitions?: {
    [key: string]: JSONSchema
  }
  title?: string
  description?: string
  default?: boolean | number | null | object | string
  readOnly?: boolean
  writeOnly?: boolean
  examples?: (boolean | number | null | object | string)[]
}
