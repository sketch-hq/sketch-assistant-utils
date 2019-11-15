import {
  RuleSet,
  ViolationSeverity,
  JSONSchema,
  JSONSchemaProps,
} from './types'

const severitySchema: JSONSchema = {
  type: 'number',
  enum: [
    1 as ViolationSeverity.info,
    2 as ViolationSeverity.warn,
    3 as ViolationSeverity.error,
  ],
  enumDescriptions: ['info', 'warning', 'error'],
}

/**
 * Create a dynamic configuration object JSON Schema for a given ruleset.
 */
const buildConfigSchema = (ruleSet: RuleSet): JSONSchema => ({
  type: 'object',
  additionalProperties: false,
  required: ['rules'],
  properties: {
    defaultSeverity: severitySchema,
    rules: {
      type: 'object',
      additionalProperties: false,
      properties: ruleSet.rules.reduce<JSONSchemaProps>(
        (acc, ruleModule): JSONSchemaProps => {
          const { name, optionSchema } = ruleModule
          return {
            ...acc,
            [name]: {
              type: 'object',
              additionalProperties: false,
              properties: {
                ...((optionSchema && optionSchema.properties) || {}),
                active: { type: 'boolean' },
                severity: severitySchema,
              },
              required: [
                'active',
                ...((optionSchema && optionSchema.required) || []),
              ],
            },
          }
        },
        {},
      ),
    },
  },
})

export { buildConfigSchema }
