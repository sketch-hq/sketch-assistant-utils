import {
  LintOperationContext,
  LintViolation,
  Config,
  LintOperation,
  createWalkerCache,
  createRuleUtilsCreator,
  GetImageMetadata,
  SketchFile,
} from '..'

/**
 * Build a LintOperationContext object.
 */
const createLintOperationContext = (
  file: SketchFile,
  config: Config,
  violations: LintViolation[],
  operation: LintOperation,
  getImageMetadata: GetImageMetadata,
): LintOperationContext => {
  const cache = createWalkerCache(file, operation)
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
