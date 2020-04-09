# @sketch-hq/sketch-assistant-utils

## 4.0.0

### Major Changes

- 9e4acca: Update to `@sketch-hq/sketch-assistant-types@2.0.0`

### Patch Changes

- 57c7d16: Update dependencies

## 3.0.2

### Patch Changes

- b20482b: Ensure testRule function throws when a rule that isn't available in the Assistant is
  invoked
- 63350f0: Swap to exernal Assistant types package
- f9d64d8: Update dev dependencies

## 3.0.1

### Patch Changes

- 97d2d36: Map rule errors into plain objects with type PlainRuleError
- 97d2d36: Fix `createRule` test helper to create dummy rules with an undefined platform by default

## 3.0.0

### Major Changes

- 0833437: Do not repeat rule and Assistant metadata per violation, instead move the metadata up a
  level to the result object where it only needs including once

### Minor Changes

- 0833437: Rules can now optionally declare their platform compatibility, and this is respected by
  the Assistant runner function

### Patch Changes

- 0833437: Fix `testRule` so that the test config overwrites fully the Assistant's config
- 0833437: Do not strip comments during package compilation, it's useful to retain these so the type
  comments pop up in intellisense when using the utils in other projects

## 2.0.3

### Patch Changes

- ba23962: Support Assistants exported as default exports from an ES Module

## 2.0.2

### Patch Changes

- ccbcfed: include json schema types dep

## 2.0.1

### Patch Changes

- 504d095: add missing json-schema dependency

## 2.0.0

### Major Changes

- b65ee46: rework `runAssistant` function so that it doesn't mutate its inputs

### Minor Changes

- b65ee46: add a testRule test helper function

### Patch Changes

- b65ee46: do not invoke inactive rules when running an assistant
- b65ee46: when merging assistants, do not overwrite values with an empty string

## 1.0.0

### Major Changes

- d472691: Major refactor to support Sketch Assistants architecture.
