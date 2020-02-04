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

export enum Constants {
  CORE_RULESET_NAME = '@sketch-hq/sketch-lint-ruleset-core',
}

// Isomorphic linter utility functions

export type GetImageMetadata = (
  ref: string,
  filepath: string,
) => Promise<ImageMetadata>

// Document traversal and caching

export type Node<T = FileFormat.AnyObject> = T & {
  $pointer: string
}

export interface NodeArray extends Array<Node> {
  $pointer: string
}

export type PointerValue =
  | Node
  | NodeArray
  | Node<FileFormat.Contents>
  | Node<FileFormat.Contents['document']>
  | Node<FileFormat.Contents['meta']>
  | Node<FileFormat.Contents['user']>
  | string
  | number
  | boolean

export type NodeCacheVisitor =
  | ((data: Node) => Promise<void>)
  | ((data: Node) => void)

export type NodeCacheIteratorConfig = {
  [key in keyof NodeCache]?: NodeCacheVisitor
}

export type NodeCacheIterator = (
  config: NodeCacheIteratorConfig,
) => Promise<void>

export type NodeCache = {
  $layers: Node[]
  $groups: Node[]
} & { [key in SketchClass]?: Node[] }

// Lint configurations

export enum ViolationSeverity {
  info = 1,
  warn = 2,
  error = 3,
}

export type PackageJSON = {
  name: string
  title: string
  description: string
  dependencies: {
    [key: string]: string
  }
}

export type LintConfig = PackageJSON & {
  sketchLint: {
    defaultSeverity?: ViolationSeverity
    rules: {
      [key: string]: Maybe<RuleConfig>
    }
  }
}

export type RuleConfig = {
  active: boolean
  severity?: ViolationSeverity
  ignoreClasses?: string[]
  ignoreNames?: string[]
  [key: string]: Maybe<RuleOption>
}

export type RuleOption =
  | string
  | number
  | boolean
  | string[]
  | { [key: string]: Maybe<string | number | boolean | string[]> }[]

// Lint runs

export type LintOperation =
  | {
      cancelled: boolean
    }
  | { cancelled: 1 | 0 }

export type LintOperationContext = {
  file: SketchFile
  cache: NodeCache
  createUtils: RuleUtilsCreator
  config: LintConfig
  operation: LintOperation
  getImageMetadata: GetImageMetadata
}

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

export type LintViolation = {
  message: string
  ruleSet: RuleSetDefinition
  ruleModule: RuleModuleDefinition
  severity: ViolationSeverity
  pointer?: string
  objectId?: string
}

export type RuleUtilsCreator = (
  ruleSet: RuleSet,
  ruleModule: RuleModule,
) => RuleUtils

export type ParentIterator = (
  node: Node | NodeArray,
  callback: (
    target: Node | NodeArray | Node<FileFormat.Contents['document']>,
  ) => void,
) => void

export type RuleUtils = {
  report: (report: ReportItem | ReportItem[]) => void
  iterateCache: (config: NodeCacheIteratorConfig) => Promise<void>
  iterateParents: ParentIterator
  getOption: (option: string) => Maybe<RuleOption>
  getImageMetadata: (ref: string) => Promise<ImageMetadata>
  nodeToObject: <T extends FileFormat.AnyObject>(node: Node) => T
  objectHash: (o: {}, excludeKeys?: string[]) => string
  objectsEqual: (o1: {}, o2: {}) => boolean
  get: (pointer: string) => Maybe<PointerValue>
  parent: (pointer: string) => Maybe<PointerValue>
}

// Rulesets and rules

export type Rule =
  | ((context: RuleInvocationContext) => Promise<void>)
  | ((context: RuleInvocationContext) => void)

export type RuleSet = {
  title: string
  description: string
  name: string
  rules: RuleModule[]
}

export type RuleSetDefinition = Omit<RuleSet, 'rules' | 'init'>

export type RuleModule = {
  rule: Rule
  name: string
  title: string
  description: string
  getOptions?: RuleOptionsCreator
  debug?: boolean
}

export type RuleModuleDefinition = Omit<RuleModule, 'rule' | 'getOptions'>

export type RuleSetDropzone = {
  [key: string]: Maybe<RuleSet>
}

// Option schemas

export type NumberOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: number
  minimum?: number
  maximum?: number
}) => JSONSchemaProps

export type IntegerOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: number
  minimum?: number
  maximum?: number
}) => JSONSchemaProps

export type StringOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: string
  minLength?: number
  maxLength?: number
  pattern?: string
}) => JSONSchemaProps

export type BoolOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: boolean
}) => JSONSchemaProps

export type StringEnumOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: string
  values: string[]
  valueTitles: string[]
}) => JSONSchemaProps

export type StringArrayOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: string[]
  minLength?: number
  maxLength?: number
  pattern?: string
}) => JSONSchemaProps

export type ObjectArrayOptionCreator = (ops: {
  name: string
  title: string
  description: string
  props: JSONSchemaProps[]
  minLength?: number
  maxLength?: number
}) => JSONSchemaProps

export type RuleOptionSchemaCreator = (ops: JSONSchemaProps[]) => JSONSchema

export type RuleOptionHelpers = {
  numberOption: NumberOptionCreator
  integerOption: IntegerOptionCreator
  stringOption: StringOptionCreator
  booleanOption: BoolOptionCreator
  stringArrayOption: StringArrayOptionCreator
  stringEnumOption: StringEnumOptionCreator
  objectArrayOption: ObjectArrayOptionCreator
}

export type RuleOptionsCreator = (
  helpers: RuleOptionHelpers,
) => JSONSchemaProps[]

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
  additionalProperties?: boolean | JSONSchema
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
