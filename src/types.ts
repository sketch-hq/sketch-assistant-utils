import { FileFormat3 } from '@sketch-hq/sketch-file-format-ts'
import { JSONSchema7 } from 'json-schema'

//
// Misc
//

/**
 * Re-export the specific version of the file format supported by this package.
 */
export { FileFormat3 as FileFormat }

/**
 * Optional value.
 */
export type Maybe<T> = T | undefined | null

/**
 * All possible string values for the `_class` property in Sketch files.
 */
export type SketchClass = FileFormat3.AnyObject['_class']

/**
 * Utility function for gathering metadata about Sketch file images. Is isomorphic in the sense that
 * its signature shound't change across platforms.
 */
export type GetImageMetadata = (ref: string, filepath: string) => Promise<ImageMetadata>

/**
 * When rules request metadata for a Sketch file image it is returned in this format.
 */
export type ImageMetadata = {
  width: number
  height: number
  ref: string
}

/**
 * Represents a Sketch file that is on disk. Collates the filepath with an object
 * typed as Contents from the file format.
 */
export type SketchFile = {
  filepath: string
  contents: FileFormat3.Contents
}

/**
 * Value or arbitrarily nested array of values.
 */
export type ValueOrArray<T> = T | Array<ValueOrArray<T>>

//
// Sketch file traversal and caching
//

/**
 * Union of all possible objects with a `_class` value that can be found in a Sketch
 * file, injected with a JSON Pointer during file processing.
 */
export type Node<T = FileFormat3.AnyObject> = T & {
  $pointer: string
}

/**
 * Array of Nodes. An concrete example of this in a Sketch file is a group's `layers` array.
 */
export interface NodeArray extends Array<Node> {
  $pointer: string
}

/**
 * All possible Node and primitive values that a JSON Pointer can resolve to in a Sketch file.
 */
export type PointerValue =
  | Node
  | NodeArray
  | Node<FileFormat3.Contents>
  | Node<FileFormat3.Contents['document']>
  | Node<FileFormat3.Contents['meta']>
  | Node<FileFormat3.Contents['user']>
  | string
  | number
  | boolean

/**
 * Rule-supplied function called during cache iteration. Rules will typically use these while
 * scanning a Sketch file for relevant objects and checking the values against their logic.
 */
export type NodeCacheVisitor = (data: Node) => Promise<void>

/**
 * Rules supply a cache iterator config to register vistor functions against the specific object
 * types available in the cache.
 */
export type NodeCacheIteratorConfig = {
  [key in keyof NodeCache]?: NodeCacheVisitor
}

/**
 * A function that iterates a cache using a cache iteration config.
 */
export type NodeCacheIterator = (config: NodeCacheIteratorConfig) => Promise<void>

/**
 * A cache of Sketch file Nodes keyed by `_class` values. The special `$layers` key collates all
 * layer Nodes, and the `$groups` key collates all layer Nodes that are also groups.
 */
export type NodeCache = {
  $layers: Node[]
  $groups: Node[]
} & { [key in SketchClass]?: Node[] }

/**
 * A processed Sketch file is one that has has had its objects cached into a NodeCache, and JSON
 * Pointers injected.
 */
export type ProcessedSketchFile = {
  cache: NodeCache
  file: SketchFile
}

//
// Assistant running
//

/**
 * Contains a flag indicating whether the run operation has been cancelled by
 * the outer environment. All long running processes happening during a run
 * (like cache creation, rule invocation etc.) should exit early as soon as a
 * cancellation is detected.
 */
export type RunOperation =
  | {
      cancelled: boolean
    }
  | { cancelled: 1 | 0 }

/**
 * JavaScript errors encountered during rule invocation normalised into plain objects.
 */
export type PlainRuleError = {
  assistantName: string
  ruleName: string
  message: string
  stack: string
}

/**
 * The result of running an assistant. One or more `violations` implies the assistant's rules found
 * issues with the Sketch document. One or more `errors` implies that some rules didn't run because
 * they encountered errors. Metadata (`title`, `description` etc) relating to the Assistant that
 * produced the result, and the rules that were invoked is also provided
 */
export type RunResult = {
  violations: Violation[]
  errors: PlainRuleError[]
  metadata: {
    assistant: Omit<AssistantDefinition, 'rules'>
    rules: {
      [ruleName: string]: Omit<RuleDefinition, 'rule' | 'getOptions' | 'name'>
    }
  }
}

/**
 * Contains all the values and utils exposed to individual rule functions. The
 * values are scoped to the rule itself, to simplify the API surface.
 */
export type RuleContext = {
  utils: RuleUtils
  file: ProcessedSketchFile
  assistant: AssistantDefinition
  operation: RunOperation
  getImageMetadata: GetImageMetadata
  env: AssistantEnv
}

/**
 * Function for creating a rule utilties object scoped to a specific assistant rule.
 */
export type RuleUtilsCreator = (ruleName: string) => RuleUtils

/**
 * A function that when invoked repeatedly calls its callback for each of a Node's parents
 * until it reaches the document root, at wich point it stops.
 */
export type ParentIterator = (
  node: Maybe<PointerValue>,
  callback: (target: Node | NodeArray | Node<FileFormat3.Contents['document']>) => void,
) => void

/**
 * Object contain utilties to be used within rule functions.
 */
export type RuleUtils = {
  /**
   * Report one or more violations.
   */
  report: (report: ReportItem | ReportItem[]) => void
  /**
   * Iterate the Sketch file object cache.
   */
  iterateCache: (config: NodeCacheIteratorConfig) => Promise<void>
  /**
   * Iterate back through the Node's parents to the Sketch file root.
   */
  iterateParents: ParentIterator
  /**
   * Get a rule option value by name. Throws if the rule hasn't been configured in the assistant.
   * It's essential that every rule activated in an assistant is properly configured.
   */
  getOption: (option: string) => Maybe<RuleOption>
  /**
   * Returns metadata for a given Sketch file image.
   */
  getImageMetadata: (ref: string) => Promise<ImageMetadata>
  /**
   * Converts a Node to the original file format type.
   */
  nodeToObject: <T extends FileFormat3.AnyObject>(node: Node) => T
  /**
   * Return the md5 hash of an object. Keys are deeply sorted for a stable hash.
   * Useful for comparing deep similarity of Sketch document objects. By default
   * the keys `do_objectID` and `$pointer` are excluded since they will always
   * be different.
   */
  objectHash: (o: {}, excludeKeys?: string[]) => string
  /**
   * Compare two document objects for deep equality.
   */
  objectsEqual: (o1: {}, o2: {}, excludeKeys?: string[]) => boolean
  /**
   * Resolve a JSON Pointer to a document object.
   */
  get: (pointer: string) => Maybe<PointerValue>
  /**
   * Resolve a JSON Pointer to a document object's parent.
   */
  parent: (pointer: string) => Maybe<PointerValue>
}

/**
 * Information a rule needs to supply when reporting a violation.
 */
export type ReportItem = {
  message: string
  node?: Node
}

/**
 * A violation collates all the information about a problem, and is the fundamental way an assistant
 * communicates results to the outer environment.
 */
export type Violation = {
  message: string
  assistantName: string
  ruleName: string
  severity: ViolationSeverity
  pointer: string | null
  objectId: string | null
}

/**
 * Define the possible violation severity levels.
 */
export enum ViolationSeverity {
  info = 1,
  warn = 2,
  error = 3,
}

//
// Assistants
//

/**
 * Platforms that can run Assistants.
 */
export type Platform = 'sketch' | 'node'

/**
 * Ambient environmental information for assistants, typically provided by an outer assistant runner.
 */
export type AssistantEnv = {
  /**
   * Language tag indicating the current user's locale. Use this to optionally internationalize your
   * assistant's content. Its exact value is not guaranteed, so an appropriate fallback locale should
   * always be used for unrecognised values. For assistants running in Sketch it's value is likely
   * to be either `en` or `zh-Hans`.
   */
  locale: string | undefined
  /**
   * Indicates whether the assistant is running in either a Node or Sketch (JavaScriptCore) environment
   */
  platform: Platform
}

/**
 * Canonical definition of an assistant, that is, an async function that given an AssistantEnv
 * will resolve with a concrete AssistantDefinition. Assistants therefore are able to defer final
 * creation until invoked by a runner, and which point critical contextual information such as the
 * locale are available.
 */
export type Assistant = (env: AssistantEnv) => Promise<AssistantDefinition>

/**
 * The shape of an ES Module with a default export built with TypeScript or Babel with ES Module
 * interoperability.
 */
export type ESModuleInterop<DefaultExport> = {
  __esModule: true
  default: DefaultExport
}

/**
 * Defines the expected type definition for the export from a 1st or 3rd party assistant package. It
 * allows an assistant to be expressed as either a single assistant or an array of assistants that
 * should be merged before a run operation. Via type recursion arbitrarily nested arrays of
 * assistant functions are supported to allow for incorporation of other assistant packages into
 * the final export.
 */
export type AssistantPackageExport = ValueOrArray<Assistant | ESModuleInterop<Assistant>>

/**
 * Concrete assistant definition that can be invoked against a Sketch file during a lint run.
 * Fundamentally assistants collate a list of rules with configuration for those rules, alongside
 * metadata about the assistant.
 */
export type AssistantDefinition = {
  /**
   * List of rules owned by the assistant.
   */
  rules: RuleDefinition[]
  /**
   * Assistant configuration activates and configures one or more rules present in its rule list.
   */
  config: AssistantConfig
  /**
   * Human readable assistant name, e.g. "Grid of 8"
   */
  title: string
  /**
   * Longer human readable description for the assistant.
   */
  description: string
  /**
   * Assistant name is the same as its package name, i.e. the `name` property in its `package.json`.
   */
  name: string
}

/**
 * Canonical rule defintion combining the rule function, its option schema creator with other
 * basic metadata.
 */
export type RuleDefinition = {
  rule: RuleFunction
  /**
   * The rule name acts as its id and should combine an identifier for the rule with the parent
   * assistant's name separated by a slash, e.g.
   * "@sketch-hq/sketch-assistant-recommended/groups-max-layers"
   */
  name: string
  /**
   * Human readable title for the rule, e.g. "Groups Max Layers".
   */
  title: string
  /**
   * Longer human readable description for the rule.
   */
  description: string
  /**
   * Rules that require options (i.e. are not just simply "on" or "off") need to describe the schema
   * for those options by implementing this function
   */
  getOptions?: RuleOptionsCreator
  /**
   * Flags a rule as for internal/development purposes only
   */
  debug?: boolean
  /**
   * Indicates rule platform compatibility. For cross-platform rules this property can be omitted.
   */
  platform?: Platform
}

/**
 * A map of rule configs, keyed by the rule's name.
 */
export type RuleConfigGroup = {
  [ruleName: string]: Maybe<RuleConfig>
}

/**
 * Contains the assistant configuration.
 */
export type AssistantConfig = {
  /**
   * Default severity to be used for violations raised by rules that haven't been configured with
   * their own explicit severity level.
   */
  defaultSeverity?: Maybe<ViolationSeverity>
  /**
   * Configuration to be applied to the rules available to the assistant.
   */
  rules: RuleConfigGroup
}

/**
 * Custom rule options with these names are forbidden.
 */
export enum ReservedRuleOptionNames {
  active = 'active',
  severity = 'severity',
  ignoreClasses = 'ignoreClasses',
  ignoreNames = 'ignoreNames',
}

/**
 * Contains the configuration for an individual rule.
 */
export type RuleConfig = {
  /**
   * Whether the rule is active or not. Alternatively omitting the rule from the assistant config is
   * the same as setting this flag to `false`.
   */
  [ReservedRuleOptionNames.active]: boolean
  /**
   * The severity of any violations reported by the rule.
   */
  [ReservedRuleOptionNames.severity]?: ViolationSeverity
  /**
   * Violations associated with Nodes with `_class` values listed here will be filtered out of the
   * final result set.
   */
  [ReservedRuleOptionNames.ignoreClasses]?: SketchClass[]
  /**
   * Violations associated with Nodes with name paths that match the regexes listed here will be
   * filtered out of the final result set.
   */
  [ReservedRuleOptionNames.ignoreNames]?: string[]
  /**
   * Rule custom options will also appear mixed into this object.
   */
  [key: string]: Maybe<RuleOption>
}

/**
 * The valid set of types available for individual rule options.
 */
export type RuleOption =
  | string
  | number
  | boolean
  | string[]
  | { [key: string]: Maybe<string | number | boolean | string[]> }[]

/**
 * Async function that is expected to perform the core rule logic using the values and helper
 * functions provided by the passed in RuleInvocationContext object.
 */
export type RuleFunction = (context: RuleContext) => Promise<void>

//
// Rule Options
//
// This section deals with rule option schemas. Rules declare the options they can be configured
// with as JSON Schema. These schemas fulfil a number of roles - a data source for rule documentation
// generation, a way to validate user supplied configuration data and a way to dynamically create
// configuration editor user interfaces.
//

/**
 * JSONSchema `properties` value.
 */
export type JSONSchemaProps = {
  [key: string]: JSONSchema7
}

/**
 * Creates rule option schema properties for a number option.
 */
export type NumberOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: number
  minimum?: number
  maximum?: number
}) => JSONSchemaProps

/**
 * Creates rule option schema properties for an integer option.
 */
export type IntegerOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: number
  minimum?: number
  maximum?: number
}) => JSONSchemaProps

/**
 * Creates rule option schema properties for a string option.
 */
export type StringOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: string
  minLength?: number
  maxLength?: number
  pattern?: string
}) => JSONSchemaProps

/**
 * Creates rule option schema properties for a boolean option.
 */
export type BoolOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: boolean
}) => JSONSchemaProps

/**
 * Creates rule option schema properties for a string enum option.
 */
export type StringEnumOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: string
  values: string[]
  valueTitles: string[]
}) => JSONSchemaProps

/**
 * Creates rule option schema properties for a string array option.
 */
export type StringArrayOptionCreator = (ops: {
  name: string
  title: string
  description: string
  defaultValue?: string[]
  minLength?: number
  maxLength?: number
  pattern?: string
}) => JSONSchemaProps

/**
 * Creates rule option schema properties for an object array option.
 */
export type ObjectArrayOptionCreator = (ops: {
  name: string
  title: string
  description: string
  props: JSONSchemaProps[]
  minLength?: number
  maxLength?: number
}) => JSONSchemaProps

/**
 * A function that should be implemented on rule definitions if they need to define custom options.
 */
export type RuleOptionsCreator = (helpers: RuleOptionHelpers) => JSONSchemaProps[]

/**
 * An object of helper functions for creating the different types of option schemas.
 */
export type RuleOptionHelpers = {
  numberOption: NumberOptionCreator
  integerOption: IntegerOptionCreator
  stringOption: StringOptionCreator
  booleanOption: BoolOptionCreator
  stringArrayOption: StringArrayOptionCreator
  stringEnumOption: StringEnumOptionCreator
  objectArrayOption: ObjectArrayOptionCreator
}

/**
 * Combines a set of JSON Schema `properties` objects into a single valid JSON Schema.
 */
export type RuleOptionSchemaCreator = (ops: JSONSchemaProps[]) => JSONSchema7
