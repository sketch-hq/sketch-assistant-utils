import Ajv from 'ajv'

import schema from './sketch-lint-config.schema.json'
import { LintConfig } from './types'

/**
 * A lint config is a valid package.json with a `sketchLint` property.
 */
const validateConfig = async (config: LintConfig): Promise<boolean> => {
  const ajv = new Ajv()
  await ajv.validate(schema, config)
  if (ajv.errors) {
    return Promise.reject(ajv.errors)
  } else {
    return true
  }
}

export { validateConfig }
