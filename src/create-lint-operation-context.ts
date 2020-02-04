import {
  LintOperationContext,
  LintViolation,
  LintConfig,
  LintOperation,
  GetImageMetadata,
  SketchFile,
} from './types'
import { createRuleUtilsCreator } from './create-rule-utils-creator'
import { createCache } from './create-cache'
import { processFileContents } from './process-file-contents'

/**
 * Build a LintOperationContext object.
 */
const createLintOperationContext = (
  file: SketchFile,
  config: LintConfig,
  violations: LintViolation[],
  operation: LintOperation,
  getImageMetadata: GetImageMetadata,
): LintOperationContext => {
  const cache = createCache()
  processFileContents(file.contents, cache, operation)
  const createUtils = createRuleUtilsCreator(
    cache,
    violations,
    config,
    operation,
    file,
    getImageMetadata,
  )
  return {
    file,
    cache,
    config,
    createUtils,
    operation,
    getImageMetadata,
  }
}

export { createLintOperationContext }
