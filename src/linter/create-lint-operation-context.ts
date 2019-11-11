import {
  Contents,
  LintOperationContext,
  LintViolation,
  Config,
  LintOperation,
  createWalkerCache,
  createRuleUtilsCreator,
  GetImageMetadata,
} from '..'

/**
 * Build a LintOperationContext object.
 */
const createLintOperationContext = (
  contents: Contents,
  config: Config,
  violations: LintViolation[],
  operation: LintOperation,
  getImageMetadata: GetImageMetadata,
): LintOperationContext => {
  const cache = createWalkerCache(contents, operation)
  const createUtils = createRuleUtilsCreator(
    cache,
    violations,
    config,
    operation,
    contents,
    getImageMetadata,
  )
  return {
    contents,
    cache,
    config,
    createUtils,
    operation,
    getImageMetadata,
  }
}

export { createLintOperationContext }
