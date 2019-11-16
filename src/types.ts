import FileFormat from '@sketch-hq/sketch-file-format-ts'

// Utils

export type Maybe<T> = T | undefined | null

export type SketchClass = FileFormat.AnyObject['_class']

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

// Document walking

export type Node<T = FileFormat.AnyObject> = T & {
  $pointer: string
}

export type Visitor = ((data: Node) => Promise<void>) | ((data: Node) => void)

export type WalkerConfig = {
  [key in keyof WalkerCache]?: Visitor
}

export type Walker = (config: WalkerConfig) => Promise<void>

export type WalkerCache = {
  $layers: Node[]
  $groups: Node[]
} & { [key in SketchClass]?: Node[] }

// Lint results

export type LintViolation = {
  message: string
  ruleName: string
  ruleSetName: string
  severity: ViolationSeverity
  context: {
    pointer?: string
    objectId?: string
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
  node?: Node
}

export type RuleUtilsCreator = (
  ruleSet: RuleSet,
  ruleModule: RuleModule,
) => RuleUtils

export type RuleUtils = {
  report: (report: ReportItem | ReportItem[]) => void
  walk: (config: WalkerConfig) => Promise<void>
  getOption: (option: string) => Maybe<ConfigItemOption>
  getImageMetadata: (ref: string) => Promise<ImageMetadata>
}

export type Rule =
  | ((context: RuleInvocationContext) => Promise<void>)
  | ((context: RuleInvocationContext) => void)

export type RuleSet = {
  title: string
  description: string
  name: string
  rules: RuleModule[]
}

export type RuleModule = {
  rule: Rule
  name: string
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