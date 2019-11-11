import { JSONSchemaProps, JSONSchema } from '..'

/**
 * Create a floating point number option, rendered as a number input in Sketch.
 */
const numberOption = ({
  name,
  title,
  description,
  defaultValue,
  minimum,
  maximum,
}: {
  name: string
  title: string
  description: string
  defaultValue?: number
  minimum?: number
  maximum?: number
}): JSONSchemaProps => ({
  [name]: {
    type: 'number',
    title,
    description,
    default: typeof defaultValue === 'number' ? defaultValue : 0,
    ...(typeof minimum === 'number' ? { minimum } : {}),
    ...(typeof maximum === 'number' ? { maximum } : {}),
  },
})

/**
 * Create an integer optionm, rendered as a number input in Sketch.
 */
const integerOption = ({
  name,
  title,
  description,
  defaultValue,
  minimum,
  maximum,
}: {
  name: string
  title: string
  description: string
  defaultValue?: number
  minimum?: number
  maximum?: number
}): JSONSchemaProps => ({
  [name]: {
    type: 'integer',
    title,
    description,
    default: typeof defaultValue === 'number' ? defaultValue : 0,
    ...(typeof minimum === 'number' ? { minimum } : {}),
    ...(typeof maximum === 'number' ? { maximum } : {}),
  },
})

/**
 * Create a string option, rendered as a text input in Sketch.
 */
const stringOption = ({
  name,
  title,
  description,
  defaultValue,
  minLength,
  maxLength,
  pattern,
}: {
  name: string
  title: string
  description: string
  defaultValue?: string
  minLength?: number
  maxLength?: number
  pattern?: string
}): JSONSchemaProps => ({
  [name]: {
    type: 'string',
    title,
    description,
    default: typeof defaultValue === 'string' ? defaultValue : '',
    ...(typeof minLength === 'number' ? { minLength } : {}),
    ...(typeof maxLength === 'number' ? { maxLength } : {}),
    ...(typeof pattern === 'string' ? { pattern } : {}),
  },
})

/**
 * Create a boolean option, rendered as a checkbox in Sketch.
 */
const booleanOption = ({
  name,
  title,
  description,
  defaultValue,
}: {
  name: string
  title: string
  description: string
  defaultValue?: boolean
}): JSONSchemaProps => ({
  [name]: {
    type: 'boolean',
    title,
    description,
    default: typeof defaultValue === 'boolean' ? defaultValue : false,
  },
})

/**
 * Create a string option limited to a set of values, rendered as a dropdown
 * in Sketch.
 */
const stringEnumOption = ({
  name,
  title,
  description,
  defaultValue,
  values,
  valueTitles,
}: {
  name: string
  title: string
  description: string
  defaultValue?: string
  values: string[]
  valueTitles: string[]
}): JSONSchemaProps => ({
  [name]: {
    type: 'string',
    title,
    description,
    default: typeof defaultValue === 'string' ? defaultValue : values[0],
    enum: values,
    enumDescriptions: valueTitles,
  },
})

/**
 * Create a string list option, rendered as a text input in Sketch with a control
 * to add more entries.
 */
const stringArrayOption = ({
  name,
  title,
  description,
  defaultValue,
  minLength,
  maxLength,
  pattern,
}: {
  name: string
  title: string
  description: string
  defaultValue?: string[]
  minLength?: number
  maxLength?: number
  pattern?: string
}): JSONSchemaProps => ({
  [name]: {
    type: 'array',
    title,
    description,
    default: Array.isArray(defaultValue) ? defaultValue : [''],
    items: {
      type: 'string',
      ...(typeof minLength === 'number' ? { minLength } : {}),
      ...(typeof maxLength === 'number' ? { maxLength } : {}),
      ...(typeof pattern === 'string' ? { pattern } : {}),
    },
  },
})

/**
 * Combine multiple rule option schemas into one. We treat _all_ custom options
 * as required.
 */
const buildRuleOptionSchema = (...options: JSONSchemaProps[]): JSONSchema => ({
  type: 'object',
  properties: options.reduce<JSONSchemaProps>(
    (acc, props: JSONSchemaProps) => ({
      ...acc,
      ...props,
    }),
    {},
  ),
  required: options
    .map(props => Object.keys(props))
    .reduce((acc, val) => acc.concat(val), []), // flatten
})

export {
  buildRuleOptionSchema,
  numberOption,
  integerOption,
  stringOption,
  booleanOption,
  stringEnumOption,
  stringArrayOption,
}
