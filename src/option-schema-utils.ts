import {
  JSONSchemaProps,
  IntegerOptionCreator,
  NumberOptionCreator,
  StringOptionCreator,
  BoolOptionCreator,
  StringEnumOptionCreator,
  StringArrayOptionCreator,
  RuleOptionSchemaCreator,
  RuleOptionHelpers,
  ObjectArrayOptionCreator,
} from './types'

/**
 * Combine multiple rule option schemas into one. We treat _all_ custom options
 * as required.
 */
const buildRuleOptionSchema: RuleOptionSchemaCreator = ops => ({
  type: 'object',
  properties: ops.reduce<JSONSchemaProps>(
    (acc, props: JSONSchemaProps) => ({
      ...acc,
      ...props,
    }),
    {},
  ),
  required: ops
    .map(props => Object.keys(props))
    .reduce((acc, val) => acc.concat(val), []), // flatten
})

/**
 * Create a floating point number option.
 */
const numberOption: NumberOptionCreator = ops => ({
  [ops.name]: {
    type: 'number',
    title: ops.title,
    description: ops.description,
    default: typeof ops.defaultValue === 'number' ? ops.defaultValue : 0,
    ...(typeof ops.minimum === 'number' ? { minimum: ops.minimum } : {}),
    ...(typeof ops.maximum === 'number' ? { maximum: ops.maximum } : {}),
  },
})

/**
 * Create an integer option.
 */
const integerOption: IntegerOptionCreator = ops => ({
  [ops.name]: {
    type: 'integer',
    title: ops.title,
    description: ops.description,
    default: typeof ops.defaultValue === 'number' ? ops.defaultValue : 0,
    ...(typeof ops.minimum === 'number' ? { minimum: ops.minimum } : {}),
    ...(typeof ops.maximum === 'number' ? { maximum: ops.maximum } : {}),
  },
})

/**
 * Create a string option.
 */
const stringOption: StringOptionCreator = ops => ({
  [ops.name]: {
    type: 'string',
    title: ops.title,
    description: ops.description,
    default: typeof ops.defaultValue === 'string' ? ops.defaultValue : '',
    ...(typeof ops.minLength === 'number' ? { minLength: ops.minLength } : {}),
    ...(typeof ops.maxLength === 'number' ? { maxLength: ops.maxLength } : {}),
    ...(typeof ops.pattern === 'string' ? { pattern: ops.pattern } : {}),
  },
})

/**
 * Create a boolean option.
 */
const booleanOption: BoolOptionCreator = ops => ({
  [ops.name]: {
    type: 'boolean',
    title: ops.title,
    description: ops.description,
    default: typeof ops.defaultValue === 'boolean' ? ops.defaultValue : false,
  },
})

/**
 * Create a string option limited to a set of values.
 */
const stringEnumOption: StringEnumOptionCreator = ops => ({
  [ops.name]: {
    type: 'string',
    title: ops.title,
    description: ops.description,
    default:
      typeof ops.defaultValue === 'string' ? ops.defaultValue : ops.values[0],
    enum: ops.values,
    enumDescriptions: ops.valueTitles,
  },
})

/**
 * Create a string list option.
 */
const stringArrayOption: StringArrayOptionCreator = ops => ({
  [ops.name]: {
    type: 'array',
    title: ops.title,
    description: ops.description,
    default: Array.isArray(ops.defaultValue) ? ops.defaultValue : [''],
    items: {
      type: 'string',
      ...(typeof ops.minLength === 'number'
        ? { minLength: ops.minLength }
        : {}),
      ...(typeof ops.maxLength === 'number'
        ? { maxLength: ops.maxLength }
        : {}),
      ...(typeof ops.pattern === 'string' ? { pattern: ops.pattern } : {}),
    },
  },
})

/**
 * Create an object list option.
 */
const objectArrayOption: ObjectArrayOptionCreator = ops => ({
  [ops.name]: {
    type: 'array',
    title: ops.title,
    description: ops.description,
    items: {
      type: 'object',
      additionalProperties: buildRuleOptionSchema(ops.props),
      ...(typeof ops.minLength === 'number'
        ? { minLength: ops.minLength }
        : {}),
      ...(typeof ops.maxLength === 'number'
        ? { maxLength: ops.maxLength }
        : {}),
    },
  },
})

const helpers: RuleOptionHelpers = {
  numberOption,
  integerOption,
  stringOption,
  booleanOption,
  stringEnumOption,
  stringArrayOption,
  objectArrayOption,
}

export { buildRuleOptionSchema, helpers }
